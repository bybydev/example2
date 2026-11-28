import SwiftUI

/// Built-in Theme pane backed directly by the app's shared MacAppThemeStore.
///
/// Free users may temporarily preview configured Pro themes before upgrading.
/// The preview countdown and expiry are owned by the shared theme store, so every
/// themed scene follows the same effective theme.
@MainActor
public struct MacAppThemeSettingsPane: View {
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

    /// Creates MAF's Theme pane.
    ///
    /// Free-only configurations need no commerce dependencies. When Pro themes are
    /// configured, both PurchaseManager and onUpgrade must be supplied; otherwise
    /// the pane renders a configuration error instead of the theme list.
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
                themeList
            }
        }
        .background(theme.canvas)
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

    private var themeList: some View {
        let hasPro = purchaseManager?.hasPro ?? false
        let isPreviewTimerActive = !hasPro && themeStore.isPreviewActive

        return TimelineView(
            .animation(minimumInterval: 1, paused: !isPreviewTimerActive)
        ) { _ in
            let state = MacAppThemePickerState(
                themeStore: themeStore,
                purchaseManager: purchaseManager
            )

            ScrollView {
                MacAppThemePicker(
                    themes: MacAppThemePickerState.resolvedThemes(
                        from: themeStore.configuration,
                        systemColorScheme: systemAppearance.colorScheme
                    ),
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
                .padding(22)
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .safeAreaInset(edge: .bottom, spacing: 0) {
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
                    .padding(.horizontal, 22)
                    .padding(.top, 8)
                    .padding(.bottom, 12)
                }
            }
        }
    }

    var previewProgress: Double {
        MacAppThemePickerState.previewProgress(
            for: themeStore,
            hasPro: purchaseManager?.hasPro ?? false
        )
    }

    var configurationErrorMessage: String? {
        guard !themeStore.configuration.proThemeIDs.isEmpty else { return nil }
        guard purchaseManager != nil, onUpgrade != nil else {
            return "This Theme pane includes Pro themes but is missing PurchaseManager or onUpgrade. Pass both dependencies to enable Pro theme access and upgrades."
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
        VStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 28))
                .foregroundStyle(theme.warning)

            Text("Theme configuration error")
                .font(.headline)
                .foregroundStyle(theme.textPrimary)

            Text(message)
                .font(.subheadline)
                .foregroundStyle(theme.textSecondary)
                .multilineTextAlignment(.center)
                .frame(maxWidth: 460)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(32)
        .accessibilityElement(children: .combine)
    }
}
