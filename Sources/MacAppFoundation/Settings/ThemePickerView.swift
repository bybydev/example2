import SwiftUI

/// Reusable theme picker that can be embedded anywhere in an app.
///
/// `ThemePickerView` owns theme-selection behavior, scrolling, Pro locking, and
/// temporary Pro-theme previews, but deliberately owns no container styling. The
/// host app decides the surrounding background, padding, section/card treatment,
/// and whether the picker fills a whole Settings destination or only part of one.
@MainActor
public struct ThemePickerView: View {
    public enum Variant: Sendable, Equatable {
        case standard
        case compact
    }

    private let themeStore: MacAppThemeStore
    private let purchaseManager: PurchaseManager?
    private let variant: Variant
    private let onUpgrade: (() -> Void)?

    @Environment(\.macAppTheme) private var theme
    @State private var systemAppearance = MacAppSystemColorSchemeObserver()

    /// Creates a reusable theme picker.
    ///
    /// Free-only configurations need no commerce dependencies. When Pro themes
    /// are configured, both `purchaseManager` and `onUpgrade` must be supplied
    /// so the picker can distinguish previewable/locked themes and route upgrades.
    public init(
        themeStore: MacAppThemeStore,
        purchaseManager: PurchaseManager? = nil,
        variant: Variant = .standard,
        onUpgrade: (() -> Void)? = nil
    ) {
        self.themeStore = themeStore
        self.purchaseManager = purchaseManager
        self.variant = variant
        self.onUpgrade = onUpgrade
    }

    public var body: some View {
        Group {
            if let configurationErrorMessage {
                configurationErrorView(configurationErrorMessage)
            } else {
                picker
            }
        }
        .onAppear {
            systemAppearance.start()
        }
        .onDisappear {
            systemAppearance.stop()
        }
        .task {
            synchronizeEntitlementIfNeeded()
        }
        .onChange(of: purchaseManager?.hasPro) { _, _ in
            synchronizeEntitlementIfNeeded()
        }
    }

    private var picker: some View {
        let hasPro = purchaseManager?.hasPro ?? false
        let isPreviewTimerActive = !hasPro && themeStore.isPreviewActive

        return TimelineView(
            .animation(minimumInterval: 1, paused: !isPreviewTimerActive)
        ) { _ in
            let state = pickerState

            ScrollView {
                MacAppThemePicker(
                    themes: pickerThemes(for: systemAppearance.colorScheme),
                    selectedThemeID: state.selectedThemeID,
                    previewingThemeID: state.previewingThemeID,
                    previewProgress: state.previewProgress,
                    previewableThemeIDs: state.previewableThemeIDs,
                    lockedThemeIDs: state.lockedThemeIDs,
                    compact: variant == .compact,
                    onSelect: { themeID in
                        themeStore.select(themeID, hasPro: state.hasPro)
                    },
                    onPreviewSelect: { themeID in
                        let result = themeStore.choose(themeID, hasPro: state.hasPro)
                        if case .requiresPro = result {
                            onUpgrade?()
                        }
                    },
                    onLockedSelect: { _ in
                        onUpgrade?()
                    }
                )
                .padding(2)
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .safeAreaInset(edge: .bottom, spacing: 12) {
                if state.showsPreviewStatus {
                    MacAppThemePreviewStatusBar(
                        previewThemeName: themeStore.previewTheme?.name ?? "Pro theme",
                        fallbackThemeName: themeStore.themeAfterPreview(hasPro: state.hasPro).name,
                        countdown: MacAppThemePickerState.formattedCountdown(
                            seconds: themeStore.previewRemainingSeconds
                        ),
                        onUpgrade: onUpgrade,
                        onEnd: {
                            themeStore.endPreview()
                        }
                    )
                    .frame(maxWidth: .infinity)
                }
            }
        }
    }

    var pickerState: MacAppThemePickerState {
        MacAppThemePickerState(
            themeStore: themeStore,
            purchaseManager: purchaseManager
        )
    }

    func pickerThemes(for systemColorScheme: ColorScheme) -> [MacAppTheme] {
        MacAppThemePickerState.resolvedThemes(
            from: themeStore.configuration,
            systemColorScheme: systemColorScheme
        )
    }

    var previewProgress: Double {
        MacAppThemePickerState.previewProgress(
            for: themeStore,
            hasPro: purchaseManager?.hasPro ?? false
        )
    }

    var configurationErrorMessage: String? {
        let configuration = themeStore.configuration
        if configuration.theme(for: .system) != nil,
           !configuration.hasRequiredFreeAppearanceThemes {
            return "Theme configuration requires at least one Free Light theme and one Free Dark theme. System uses those themes to follow macOS appearance."
        }

        guard !configuration.proThemeIDs.isEmpty else { return nil }
        guard purchaseManager != nil, onUpgrade != nil else {
            return "This theme picker includes Pro themes but is missing PurchaseManager or onUpgrade. Pass both dependencies to enable Pro theme access and upgrades."
        }
        return nil
    }

    private func synchronizeEntitlementIfNeeded() {
        if let hasPro = purchaseManager?.hasPro {
            themeStore.synchronizeProAccess(hasPro)
        }
        themeStore.refreshPreviewState()
    }

    private func configurationErrorView(_ message: String) -> some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(theme.warning)

            VStack(alignment: .leading, spacing: 4) {
                Text("Theme configuration error")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(theme.textPrimary)

                Text(message)
                    .font(.caption)
                    .foregroundStyle(theme.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .accessibilityElement(children: .combine)
    }
}

@MainActor
struct MacAppThemePickerState {
    let hasPro: Bool
    let selectedThemeID: MacAppThemeID
    let previewingThemeID: MacAppThemeID?
    let previewProgress: Double
    let previewableThemeIDs: Set<MacAppThemeID>
    let lockedThemeIDs: Set<MacAppThemeID>
    let showsPreviewStatus: Bool

    init(
        themeStore: MacAppThemeStore,
        purchaseManager: PurchaseManager?
    ) {
        self.init(
            themeStore: themeStore,
            entitlementState: purchaseManager?.entitlementState,
            hasPro: purchaseManager?.hasPro ?? false
        )
    }

    init(
        themeStore: MacAppThemeStore,
        entitlementState: EntitlementState?,
        hasPro: Bool
    ) {
        let isCheckingEntitlement: Bool = {
            if case .checking = entitlementState {
                return true
            }
            return false
        }()

        let selectedThemeID: MacAppThemeID
        if let entitlementState {
            selectedThemeID = themeStore.effectiveThemeID(
                entitlementState: entitlementState,
                hasPro: hasPro
            )
        } else {
            selectedThemeID = themeStore.effectiveThemeID(hasPro: hasPro)
        }

        let isPreviewActive = !hasPro && themeStore.isPreviewActive
        let previewingThemeID = isPreviewActive ? themeStore.previewThemeID : nil
        let proThemeIDs = themeStore.configuration.proThemeIDs

        var previewableThemeIDs = hasPro
            ? Set<MacAppThemeID>()
            : Set(proThemeIDs.filter { themeStore.canPreview($0, hasPro: false) })
        var lockedThemeIDs = hasPro
            ? Set<MacAppThemeID>()
            : proThemeIDs.subtracting(previewableThemeIDs)

        if isCheckingEntitlement,
           previewingThemeID == nil,
           proThemeIDs.contains(selectedThemeID) {
            previewableThemeIDs.remove(selectedThemeID)
            lockedThemeIDs.remove(selectedThemeID)
        }

        self.hasPro = hasPro
        self.selectedThemeID = selectedThemeID
        self.previewingThemeID = previewingThemeID
        self.previewProgress = Self.previewProgress(for: themeStore, hasPro: hasPro)
        self.previewableThemeIDs = previewableThemeIDs
        self.lockedThemeIDs = lockedThemeIDs
        self.showsPreviewStatus = isPreviewActive
    }

    static func previewProgress(
        for themeStore: MacAppThemeStore,
        hasPro: Bool
    ) -> Double {
        guard !hasPro, themeStore.isPreviewActive else { return 0 }
        let duration = themeStore.configuration.previewBehavior.defaultDuration
        guard duration > 0 else { return 0 }

        return min(
            1,
            max(0, Double(themeStore.previewRemainingSeconds) / duration)
        )
    }

    static func formattedCountdown(seconds: Int) -> String {
        let clamped = max(0, seconds)
        return String(format: "%d:%02d", clamped / 60, clamped % 60)
    }

    static func resolvedThemes(
        from configuration: MacAppThemeConfiguration,
        systemColorScheme: ColorScheme
    ) -> [MacAppTheme] {
        configuration.themes.map { candidate in
            guard candidate.id == .system else { return candidate }

            let backingTheme: MacAppTheme?
            switch systemColorScheme {
            case .dark:
                backingTheme = configuration.systemDarkTheme
            case .light:
                backingTheme = configuration.systemLightTheme
            @unknown default:
                backingTheme = configuration.systemLightTheme
                    ?? configuration.systemDarkTheme
            }

            guard let backingTheme else { return candidate }
            return MacAppTheme(
                id: .system,
                name: candidate.name,
                caption: candidate.caption,
                preferredColorScheme: nil,
                palette: backingTheme.palette
            )
        }
    }
}

@MainActor
struct MacAppThemePreviewStatusBar: View {
    let previewThemeName: String
    let fallbackThemeName: String
    let countdown: String
    let onUpgrade: (() -> Void)?
    let onEnd: () -> Void

    @Environment(\.macAppTheme) private var theme

    var body: some View {
        ViewThatFits(in: .horizontal) {
            HStack(spacing: 12) {
                statusSummary
                Spacer(minLength: 8)
                actionButtons
            }

            VStack(alignment: .leading, spacing: 10) {
                statusSummary
                HStack(spacing: 8) {
                    Spacer(minLength: 0)
                    actionButtons
                }
            }
        }
        .padding(12)
        .background(
            theme.surfaceRaised,
            in: RoundedRectangle(cornerRadius: 12, style: .continuous)
        )
        .overlay {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(theme.border, lineWidth: 1)
        }
        .shadow(color: theme.shadow, radius: 8, y: 3)
        .accessibilityElement(children: .contain)
    }

    private var statusSummary: some View {
        HStack(spacing: 12) {
            Image(systemName: "timer")
                .font(.headline)
                .foregroundStyle(theme.accent)
                .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 2) {
                Text("Previewing \(previewThemeName)")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(theme.textPrimary)
                    .fixedSize(horizontal: false, vertical: true)

                Text("Returns to \(fallbackThemeName) in \(countdown)")
                    .font(.caption)
                    .foregroundStyle(theme.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel(
            "Previewing \(previewThemeName). Returns to \(fallbackThemeName) in \(countdown)."
        )
    }

    private var actionButtons: some View {
        HStack(spacing: 8) {
            if let onUpgrade {
                Button("Unlock Pro", action: onUpgrade)
                    .buttonStyle(.borderedProminent)
                    .controlSize(.small)
                    .fixedSize()
            }

            Button("End", action: onEnd)
                .buttonStyle(.bordered)
                .controlSize(.small)
                .fixedSize()
        }
    }
}
