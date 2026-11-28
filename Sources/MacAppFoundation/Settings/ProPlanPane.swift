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
                ProFeatureComparisonSection(
                    items: resolvedFeatures.map(ProFeatureComparisonItem.init),
                    freeTitle: configuration.freeTitle,
                    proTitle: configuration.proTitle,
                    isProActive: presentationState == .pro
                )
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

enum ProPlanPanePresentationState: Equatable {
    case free
    case pro

    init(hasPro: Bool) {
        self = hasPro ? .pro : .free
    }

    static func showsComparisonTable(for features: [PurchaseFeature]) -> Bool {
        ProFeatureComparisonSection.showsComparisonTable(
            for: features.map(ProFeatureComparisonItem.init)
        )
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
