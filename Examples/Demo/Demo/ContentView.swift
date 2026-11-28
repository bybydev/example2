import MacAppFoundation
import SwiftUI

private enum DemoSection: String, CaseIterable, Identifiable {
    case home
    case premium

    var id: String { rawValue }

    var title: String {
        switch self {
        case .home: "Home"
        case .premium: "Premium UI"
        }
    }

    var systemImage: String {
        switch self {
        case .home: "square.grid.2x2"
        case .premium: "crown.fill"
        }
    }
}

@MainActor
struct ContentView: View {
    let purchaseManager: PurchaseManager
    let settingsRouter: MacAppSettingsRouter
    let onReplayOnboarding: () -> Void

    @Environment(\.openWindow) private var openWindow
    @Environment(\.openSettings) private var openSettings
    @State private var selection: DemoSection? = .home

    var body: some View {
        NavigationSplitView {
            List(DemoSection.allCases, selection: $selection) { section in
                Label(section.title, systemImage: section.systemImage)
                    .tag(section)
            }
            .navigationTitle("Foundation Demo")
            .navigationSplitViewColumnWidth(min: 180, ideal: 200)
        } detail: {
            detailView
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .toolbar {
                    ToolbarItem(placement: .primaryAction) {
                        ProPlanButton(
                            purchaseManager: purchaseManager,
                            onUpgrade: {
                                openWindow(id: DemoWindowID.paywall)
                            },
                            onManagePlan: {
                                settingsRouter.request(.plan)
                                openSettings()
                            }
                        )
                    }
                }
        }
    }

    @ViewBuilder
    private var detailView: some View {
        switch selection ?? .home {
        case .home:
            DemoHomeView(
                purchaseManager: purchaseManager,
                settingsRouter: settingsRouter,
                onReplayOnboarding: onReplayOnboarding
            )
        case .premium:
            PremiumShowcaseView(purchaseManager: purchaseManager)
        }
    }
}

@MainActor
private struct DemoHomeView: View {
    let purchaseManager: PurchaseManager
    let settingsRouter: MacAppSettingsRouter
    let onReplayOnboarding: () -> Void

    @Environment(DemoState.self) private var demoState
    @Environment(\.macAppTheme) private var theme
    @Environment(\.openWindow) private var openWindow
    @Environment(\.openSettings) private var openSettings
    @State private var restoreStatus: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("MacAppFoundation")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundStyle(theme.textPrimary)
                    Text("Interactive macOS 15 demo of commerce, premium surfaces, themes, settings, onboarding, analytics, and debug tools.")
                        .font(.subheadline)
                        .foregroundStyle(theme.textSecondary)
                }

                HStack(spacing: 12) {
                    statusCard(
                        title: "Plan",
                        value: planSummary,
                        systemImage: purchaseManager.hasPro ? "checkmark.seal.fill" : "person"
                    )
                    statusCard(
                        title: "Theme",
                        value: theme.name,
                        systemImage: "paintpalette"
                    )
                    statusCard(
                        title: "Analytics",
                        value: demoState.analyticsEnabled
                            ? (demoState.analyticsStorageMode == .inMemory ? "On · Memory" : "On · Persisted")
                            : "Off",
                        systemImage: "chart.bar.xaxis"
                    )
                }

                GroupBox("Launch Package Surfaces") {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(spacing: 10) {
                            Button("Pro Paywall", systemImage: "crown.fill") {
                                openWindow(id: DemoWindowID.paywall)
                            }
                            .buttonStyle(MacAppButtonStyle(.primary))

                            Button("Upsell Window", systemImage: "arrow.up.circle") {
                                openWindow(id: DemoWindowID.upsell)
                            }
                            .buttonStyle(MacAppButtonStyle(.secondary))

                            Button("Settings", systemImage: "gearshape") {
                                openSettings()
                            }
                            .buttonStyle(MacAppButtonStyle(.secondary))

                            Button("Plan Settings", systemImage: "creditcard") {
                                settingsRouter.request(.plan)
                                openSettings()
                            }
                            .buttonStyle(MacAppButtonStyle(.secondary))
                        }

                        HStack(spacing: 10) {
                            Button("Replay Onboarding", systemImage: "arrow.counterclockwise") {
                                onReplayOnboarding()
                            }
                            .buttonStyle(MacAppButtonStyle(.secondary))

                            #if DEBUG
                            Button("Developer Tools", systemImage: "hammer") {
                                openWindow(id: MacAppFoundationDeveloperTools.windowID)
                            }
                            .buttonStyle(MacAppButtonStyle(.secondary))
                            #endif

                            Button("Restore Purchases", systemImage: "arrow.clockwise") {
                                Task {
                                    let outcome = await purchaseManager.restorePurchases(timeout: .seconds(5))
                                    let message = restoreMessage(outcome)
                                    restoreStatus = message
                                    demoState.record(message)
                                }
                            }
                            .buttonStyle(MacAppButtonStyle(.quiet))
                            .disabled(purchaseManager.isBusy || purchaseManager.isPurchasePending)
                        }

                        if let restoreStatus {
                            Text(restoreStatus)
                                .font(.caption)
                                .foregroundStyle(theme.textSecondary)
                        }
                    }
                    .padding(6)
                }

                LabeledContent("Last demo action", value: demoState.lastAction)
                    .font(.caption)
                    .foregroundStyle(theme.textSecondary)
            }
            .padding(28)
            .frame(maxWidth: 820, alignment: .leading)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(theme.canvas)
        .navigationTitle("Home")
    }

    private var planSummary: String {
        guard purchaseManager.hasPro else { return "Free" }
        if let active = purchaseManager.activeProduct {
            return "Pro · \(active.planLabel)"
        }
        return "Pro"
    }

    private func restoreMessage(_ outcome: RestoreOutcome) -> String {
        switch outcome {
        case .restored: "Purchases restored"
        case .nothingToRestore: "No previous purchases found"
        case .failed(let failure): "Restore failed: \(failure.message)"
        }
    }

    private func statusCard(title: String, value: String, systemImage: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: systemImage)
                .font(.title3)
                .foregroundStyle(theme.accent)
            Text(value)
                .font(.headline)
                .foregroundStyle(theme.textPrimary)
                .lineLimit(1)
            Text(title)
                .font(.caption)
                .foregroundStyle(theme.textSecondary)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(theme.surface, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .strokeBorder(theme.separator.opacity(0.82), lineWidth: 1)
        }
    }
}
