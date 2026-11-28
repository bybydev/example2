import Foundation
import SwiftUI

/// A reusable macOS Plan pane backed by ``PurchaseManager``.
///
/// The consuming app owns its `Settings` scene, tab selection, General/About
/// panes, and paywall presentation. MacAppFoundation owns only this reusable
/// commerce-backed Plan content.
@MainActor
public struct ProPlanPane: View {
    @Environment(\.macAppTheme) private var theme
    @Environment(\.openURL) private var openURL

    private let purchaseManager: PurchaseManager
    private let configuration: ProPlanPaneConfiguration
    private let onUpgrade: () -> Void

    @State private var restoreStatus: ProPlanPaneRestoreStatus?

    public init(
        purchaseManager: PurchaseManager,
        configuration: ProPlanPaneConfiguration,
        onUpgrade: @escaping () -> Void
    ) {
        self.purchaseManager = purchaseManager
        self.configuration = configuration
        self.onUpgrade = onUpgrade
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            headerCard

            if !resolvedFeatures.isEmpty {
                ProPlanFeatureSection(
                    features: resolvedFeatures,
                    freeTitle: configuration.freeTitle,
                    proTitle: configuration.proTitle,
                    presentationState: presentationState
                )
                .background(
                    theme.surface,
                    in: RoundedRectangle(cornerRadius: 12, style: .continuous)
                )
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay {
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .strokeBorder(theme.border, lineWidth: 1)
                }
            }
        }
        .task(id: ObjectIdentifier(purchaseManager)) {
            await purchaseManager.prepare()
        }
        .onChange(of: purchaseManager.hasPro) { _, hasPro in
            if hasPro, case .restored = restoreStatus {
                return
            }
            restoreStatus = nil
        }
    }

    private var headerCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top, spacing: 12) {
                VStack(alignment: .leading, spacing: 6) {
                    HStack(alignment: .center, spacing: 10) {
                        Text(planTitle)
                            .font(.system(size: 28, weight: .bold))
                            .foregroundStyle(theme.textPrimary)
                            .accessibilityAddTraits(.isHeader)

                        if let planBadgeLabel {
                            Text(planBadgeLabel)
                                .font(.system(size: 11, weight: .bold))
                                .padding(.horizontal, 9)
                                .padding(.vertical, 4)
                                .background(theme.surfaceRaised, in: Capsule())
                                .overlay {
                                    Capsule()
                                        .strokeBorder(theme.border, lineWidth: 0.75)
                                }
                                .foregroundStyle(theme.accent)
                        }
                    }

                    Text(planDescription)
                        .font(.system(size: 13))
                        .foregroundStyle(theme.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                }

                Spacer(minLength: 8)

                headerStatusIcon
            }

            actionRow

            if let activeStatusBanner {
                statusBannerView(activeStatusBanner)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background {
            LinearGradient(
                colors: headerGradientColors,
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .strokeBorder(theme.border, lineWidth: 1)
        }
    }

    private var headerStatusIcon: some View {
        Image(systemName: presentationState == .pro ? "checkmark.seal.fill" : "sparkles")
            .font(.system(size: 26))
            .foregroundStyle(presentationState == .pro ? theme.accent : theme.textSecondary)
            .accessibilityHidden(true)
    }

    private var actionRow: some View {
        HStack(spacing: 8) {
            if actionState.showsUpgrade {
                Button(configuration.upgradeButtonTitle, action: onUpgrade)
                    .buttonStyle(MacAppButtonStyle(actionState.upgradeButtonKind))
            }

            if actionState.showsViewPlans {
                Button(configuration.viewPlansButtonTitle, action: onUpgrade)
                    .buttonStyle(MacAppButtonStyle(actionState.viewPlansButtonKind))
            }

            if actionState.showsManageSubscription {
                Button {
                    openURL(configuration.manageSubscriptionURL)
                } label: {
                    HStack(spacing: 5) {
                        Text(configuration.manageSubscriptionTitle)
                        Image(systemName: "arrow.up.right")
                            .font(.system(size: 10, weight: .semibold))
                            .accessibilityHidden(true)
                    }
                }
                .buttonStyle(MacAppButtonStyle(actionState.manageSubscriptionButtonKind))
                .accessibilityAddTraits(.isLink)
            }

            Button {
                restorePurchases()
            } label: {
                if purchaseManager.isRestoring {
                    HStack(spacing: 6) {
                        ProgressView()
                            .controlSize(.small)
                        Text("Restoring…")
                    }
                } else {
                    Text(configuration.restorePurchasesTitle)
                }
            }
            .buttonStyle(MacAppButtonStyle(actionState.restoreButtonKind))
            .disabled(purchaseManager.isBusy || purchaseManager.isPurchasePending)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func statusBannerView(_ banner: ProPlanPaneStatusBanner) -> some View {
        HStack(alignment: .firstTextBaseline, spacing: 6) {
            Image(systemName: banner.systemImage)
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(statusIconColor(for: banner.tone))
                .accessibilityHidden(true)

            Text(banner.message)
                .font(.system(size: 12))
                .foregroundStyle(statusTextColor(for: banner.tone))
                .fixedSize(horizontal: false, vertical: true)
        }
        .accessibilityElement(children: .combine)
    }

    private func statusIconColor(for tone: ProPlanPaneStatusBanner.Tone) -> Color {
        switch tone {
        case .success:
            theme.success
        case .info:
            theme.textSecondary
        case .warning:
            theme.warning
        case .error:
            theme.destructive
        }
    }

    private func statusTextColor(for tone: ProPlanPaneStatusBanner.Tone) -> Color {
        switch tone {
        case .success, .info, .warning:
            theme.textSecondary
        case .error:
            theme.destructive
        }
    }

    private func restorePurchases() {
        guard !purchaseManager.isBusy, !purchaseManager.isPurchasePending else {
            return
        }

        restoreStatus = nil

        Task {
            switch await purchaseManager.restorePurchases() {
            case .restored:
                restoreStatus = .restored("Purchases restored.")
            case .nothingToRestore:
                restoreStatus = .info("No previous purchases were found.")
            case .failed(let failure):
                if failure.code != .userCancelled {
                    restoreStatus = .error(failure.message)
                }
                purchaseManager.clearActivity()
            }
        }
    }

    private var presentationState: ProPlanPanePresentationState {
        ProPlanPanePresentationState(hasPro: purchaseManager.hasPro)
    }

    private var headerGradientColors: [Color] {
        switch presentationState {
        case .free:
            return [theme.surfaceRaised, theme.surface]
        case .pro:
            return [theme.accentSoft, theme.surface]
        }
    }

    private var actionState: ProPlanPaneActionState {
        ProPlanPaneActionState(
            hasPro: purchaseManager.hasPro,
            activeProduct: purchaseManager.activeProduct,
            activeSubscriptionProduct: purchaseManager.activeSubscriptionProduct
        )
    }

    private var activeStatusBanner: ProPlanPaneStatusBanner? {
        if purchaseManager.isPurchasePending {
            return ProPlanPaneStatusBanner(
                tone: .warning,
                systemImage: "clock.fill",
                message: "A purchase is pending approval."
            )
        }

        guard let restoreStatus else {
            return nil
        }

        switch restoreStatus {
        case .restored(let message):
            return ProPlanPaneStatusBanner(
                tone: .success,
                systemImage: "checkmark.circle.fill",
                message: message
            )
        case .info(let message):
            return ProPlanPaneStatusBanner(
                tone: .info,
                systemImage: "info.circle",
                message: message
            )
        case .error(let message):
            return ProPlanPaneStatusBanner(
                tone: .error,
                systemImage: "exclamationmark.triangle.fill",
                message: message
            )
        }
    }

    private var resolvedFeatures: [PurchaseFeature] {
        configuration.features ?? purchaseManager.features
    }

    private var planTitle: String {
        switch presentationState {
        case .free:
            return configuration.freeTitle
        case .pro:
            return configuration.proTitle
        }
    }

    private var planDescription: String {
        switch presentationState {
        case .free:
            return configuration.freeDescription
        case .pro:
            return configuration.proDescription
        }
    }

    private var planBadgeLabel: String? {
        ProPlanPanePresentationState.planBadgeLabel(
            hasPro: purchaseManager.hasPro,
            activeProduct: purchaseManager.activeProduct,
            proTitle: configuration.proTitle
        )
    }
}

private enum ProPlanPaneRestoreStatus: Equatable {
    case restored(String)
    case info(String)
    case error(String)
}

private struct ProPlanPaneStatusBanner: Equatable {
    enum Tone: Equatable {
        case success
        case info
        case warning
        case error
    }

    let tone: Tone
    let systemImage: String
    let message: String
}

@MainActor
private struct ProPlanFeatureSection: View {
    @Environment(\.macAppTheme) private var theme

    let features: [PurchaseFeature]
    let freeTitle: String
    let proTitle: String
    let presentationState: ProPlanPanePresentationState

    private let freeColumnWidth: CGFloat = 128
    private let proColumnWidth: CGFloat = 140

    var body: some View {
        if ProPlanPanePresentationState.showsComparisonTable(for: features) {
            comparisonTable
        } else {
            fallbackFeatureList
        }
    }

    private var comparisonTable: some View {
        VStack(spacing: 0) {
            HStack(alignment: .center, spacing: 0) {
                Text("FEATURE")
                    .font(.system(size: 11, weight: .semibold))
                    .tracking(0.4)
                    .foregroundStyle(theme.textMuted)
                    .padding(.leading, 16)
                    .padding(.trailing, 12)
                    .frame(maxWidth: .infinity, alignment: .leading)

                Text(freeTitle.uppercased())
                    .font(.system(size: 11, weight: .semibold))
                    .tracking(0.4)
                    .foregroundStyle(theme.textSecondary)
                    .lineLimit(1)
                    .padding(.horizontal, 12)
                    .frame(width: freeColumnWidth, alignment: .leading)

                HStack(spacing: 4) {
                    if presentationState == .pro {
                        Image(systemName: "checkmark")
                            .font(.system(size: 10, weight: .bold))
                            .accessibilityHidden(true)
                    }

                    Text(proTitle.uppercased())
                        .font(.system(size: 11, weight: .semibold))
                        .tracking(0.4)
                        .lineLimit(1)
                }
                .foregroundStyle(theme.accent)
                .padding(.leading, 12)
                .padding(.trailing, 16)
                .frame(width: proColumnWidth, alignment: .leading)
            }
            .padding(.vertical, 10)
            .accessibilityHidden(true)

            ForEach(features) { feature in
                Rectangle()
                    .fill(theme.separator.opacity(0.72))
                    .frame(height: 1)

                HStack(alignment: .center, spacing: 0) {
                    HStack(alignment: .center, spacing: 10) {
                        featureIcon(feature.systemImage, size: 26, cornerRadius: 7, glyphSize: 12)

                        Text(feature.title)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundStyle(theme.textPrimary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(.leading, 16)
                    .padding(.trailing, 12)
                    .frame(maxWidth: .infinity, alignment: .leading)

                    Text(displayValue(feature.freeValue))
                        .font(.system(size: 12))
                        .foregroundStyle(theme.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                        .padding(.horizontal, 12)
                        .frame(width: freeColumnWidth, alignment: .leading)

                    Text(displayValue(feature.proValue))
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(presentationState == .pro ? theme.accent : theme.textPrimary)
                        .fixedSize(horizontal: false, vertical: true)
                        .padding(.leading, 12)
                        .padding(.trailing, 16)
                        .frame(width: proColumnWidth, alignment: .leading)
                }
                .padding(.vertical, 10)
                .accessibilityElement(children: .ignore)
                .accessibilityLabel(feature.title)
                .accessibilityValue(
                    "\(freeTitle): \(displayValue(feature.freeValue)), \(proTitle): \(displayValue(feature.proValue))"
                )
            }
        }
        .background(alignment: .trailing) {
            theme.accentSoft.opacity(0.35)
                .frame(width: proColumnWidth)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var fallbackFeatureList: some View {
        VStack(alignment: .leading, spacing: 12) {
            ForEach(features) { feature in
                HStack(alignment: .top, spacing: 12) {
                    featureIcon(feature.systemImage, size: 28, cornerRadius: 8, glyphSize: 13)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(feature.title)
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundStyle(theme.textPrimary)

                        Text(feature.message)
                            .font(.system(size: 12))
                            .foregroundStyle(theme.textSecondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }

                    Spacer(minLength: 0)
                }
                .accessibilityElement(children: .combine)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func featureIcon(
        _ systemImage: String,
        size: CGFloat,
        cornerRadius: CGFloat,
        glyphSize: CGFloat
    ) -> some View {
        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
            .fill(featureIconBackground)
            .frame(width: size, height: size)
            .overlay {
                Image(systemName: systemImage)
                    .font(.system(size: glyphSize, weight: .semibold))
                    .foregroundStyle(featureIconForeground)
            }
            .overlay {
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .strokeBorder(theme.border, lineWidth: 0.5)
            }
            .accessibilityHidden(true)
    }

    private func displayValue(_ rawValue: String) -> String {
        let trimmed = rawValue.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? "—" : trimmed
    }

    private var featureIconBackground: Color {
        switch presentationState {
        case .free:
            return theme.surfaceRaised
        case .pro:
            return theme.accentSoft
        }
    }

    private var featureIconForeground: Color {
        presentationState == .pro ? theme.accent : theme.textSecondary
    }
}

enum ProPlanPanePresentationState: Equatable {
    case free
    case pro

    init(hasPro: Bool) {
        self = hasPro ? .pro : .free
    }

    static func showsComparisonTable(for features: [PurchaseFeature]) -> Bool {
        features.contains {
            !$0.freeValue.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                || !$0.proValue.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        }
    }

    static func planBadgeLabel(
        hasPro: Bool,
        activeProduct: StoreProduct?,
        proTitle: String
    ) -> String? {
        guard hasPro, let activeProduct else {
            return nil
        }

        let label = activeProduct.planLabel
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .uppercased()
        guard !label.isEmpty else {
            return nil
        }

        let normalizedTitle = proTitle
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .uppercased()
        guard label != normalizedTitle else {
            return nil
        }

        return label
    }
}

struct ProPlanPaneActionState: Equatable {
    let showsUpgrade: Bool
    let showsViewPlans: Bool
    let showsManageSubscription: Bool

    init(
        hasPro: Bool,
        activeProduct: StoreProduct?,
        activeSubscriptionProduct: StoreProduct?
    ) {
        showsUpgrade = !hasPro
        showsViewPlans = hasPro && activeProduct?.isRecurring == true
        showsManageSubscription = hasPro && activeSubscriptionProduct != nil
    }

    var upgradeButtonKind: MacAppButtonStyle.Kind {
        .primary
    }

    var viewPlansButtonKind: MacAppButtonStyle.Kind {
        .secondary
    }

    var manageSubscriptionButtonKind: MacAppButtonStyle.Kind {
        .secondary
    }

    var restoreButtonKind: MacAppButtonStyle.Kind {
        hasLeadingAction ? .quiet : .secondary
    }

    private var hasLeadingAction: Bool {
        showsUpgrade || showsViewPlans || showsManageSubscription
    }
}
