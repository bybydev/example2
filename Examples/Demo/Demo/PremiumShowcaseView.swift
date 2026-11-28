import MacAppFoundation
import SwiftUI

@MainActor
struct PremiumShowcaseView: View {
    let purchaseManager: PurchaseManager

    @Environment(\.openWindow) private var openWindow
    @Environment(\.macAppTheme) private var theme
    @Environment(DemoState.self) private var demoState

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Premium UI")
                        .font(.system(size: 30, weight: .bold))
                        .foregroundStyle(theme.textPrimary)
                    Text("Reusable badges, gates, popovers, and upsell surfaces driven by the shared PurchaseManager.")
                        .foregroundStyle(theme.textSecondary)
                }

                GroupBox("ProBadge") {
                    HStack(spacing: 14) {
                        Text("Filled").proBadge(style: .filled)
                        Text("Outline").proBadge(style: .outline)
                        Text("Icon").proBadge(style: .icon)
                        Spacer()
                    }
                    .padding(8)
                }

                GroupBox("ProGate + ProLockedOverlay") {
                    ProGate(
                        purchaseManager: purchaseManager,
                        feature: DemoCommerce.batchFeature
                    ) {
                        allowedCard(
                            title: "Batch workspace unlocked",
                            message: "This is the Pro content branch of ProGate."
                        )
                    } lockedContent: { feature in
                        ProLockedOverlay(
                            feature: feature,
                            message: "This surface unlocks automatically when Pro becomes active.",
                            onUpgrade: { openWindow(id: DemoWindowID.paywall) }
                        )
                    }
                    .frame(height: 170)
                }

                GroupBox("Existing-Content Policy") {
                    ProGate(
                        purchaseManager: purchaseManager,
                        feature: DemoCommerce.automationFeature,
                        isExistingContent: true,
                        policy: PremiumAccessPolicy(existingContentRemainsAccessible: true)
                    ) {
                        allowedCard(
                            title: "Existing project stays accessible",
                            message: "Remains readable even when Free; new creation can still be gated separately."
                        )
                    } lockedContent: { feature in
                        ProLockedOverlay(feature: feature, onUpgrade: {
                            openWindow(id: DemoWindowID.paywall)
                        })
                    }
                    .frame(height: 120)
                }

                GroupBox("ProGateButton + ProLockPopover") {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("When Free, clicking shows the comparison popover before routing to the paywall.")
                            .font(.subheadline)
                            .foregroundStyle(theme.textSecondary)

                        ProGateButton(
                            purchaseManager: purchaseManager,
                            feature: DemoCommerce.batchFeature,
                            lockInfo: ProLockInfo(
                                title: "Batch workflows",
                                reason: "Batch processing is a Pro workflow.",
                                freeTierDescription: "Process one item at a time.",
                                proTierDescription: "Process unlimited items in one run."
                            ),
                            onAction: {
                                demoState.record("Ran gated batch action")
                            },
                            onUpgrade: {
                                openWindow(id: DemoWindowID.paywall)
                            }
                        ) {
                            Label("Run Batch Workflow", systemImage: "play.fill")
                        }
                        .buttonStyle(MacAppButtonStyle(.primary))
                    }
                    .padding(8)
                }

                GroupBox("ProUpsellView") {
                    VStack(alignment: .leading, spacing: 14) {
                        Button("Open Upsell Window", systemImage: "macwindow") {
                            openWindow(id: DemoWindowID.upsell)
                        }
                        .buttonStyle(MacAppButtonStyle(.secondary))

                        ProUpsellView(
                            title: "Unlock the complete workflow",
                            message: "Embedded instance of the reusable upsell surface.",
                            features: Array(purchaseManager.features.prefix(3)),
                            primaryActionTitle: "Show Pro Paywall",
                            secondaryActionTitle: "Not Now",
                            onPrimaryAction: {
                                openWindow(id: DemoWindowID.paywall)
                            },
                            onSecondaryAction: {}
                        )
                    }
                    .padding(8)
                }
            }
            .padding(28)
            .frame(maxWidth: 800, alignment: .leading)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(theme.canvas)
        .navigationTitle("Premium UI")
    }

    private func allowedCard(title: String, message: String) -> some View {
        VStack(spacing: 7) {
            Image(systemName: "checkmark.seal.fill")
                .font(.title2)
                .foregroundStyle(theme.success)
            Text(title)
                .font(.headline)
                .foregroundStyle(theme.textPrimary)
            Text(message)
                .font(.subheadline)
                .foregroundStyle(theme.textSecondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }
}
