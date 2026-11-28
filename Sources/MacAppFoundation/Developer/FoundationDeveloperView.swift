#if DEBUG
import AppKit
import Security
import SwiftUI

/// Debug-only developer controls shared by MacAppFoundation apps.
///
/// The window uses a native macOS navigation split view: built-in destinations
/// cover Overview, Commerce, Analytics, Logs, and User Defaults, alongside
/// optional app-registered replay flows and custom sections.
@MainActor
public struct FoundationDeveloperView: View {
    @Environment(\.macAppTheme) private var theme
    @Environment(\.appAnalytics) private var analytics

    private let purchaseManager: PurchaseManager
    private let configuration: FoundationDeveloperConfiguration

    @State private var selection: DeveloperDestination? = .overview
    @State private var purchaseOutcome: DeveloperPurchaseOutcome = .success
    @State private var catalogFailureEnabled = false
    @State private var restoreFailureEnabled = false
    @State private var latency: DeveloperPurchaseLatency = .normal
    @State private var replay: FoundationDeveloperReplay?
    @State private var actionError: String?
    @State private var diagnosticsCopied = false
    @State private var overviewAnalyticsSnapshot: AppAnalyticsDeveloperSnapshot?

    public init(
        purchaseManager: PurchaseManager,
        configuration: FoundationDeveloperConfiguration = .init()
    ) {
        self.purchaseManager = purchaseManager
        self.configuration = configuration
    }

    public var body: some View {
        NavigationSplitView {
            sidebar
                .navigationTitle(MacAppFoundationDeveloperTools.windowTitle)
                .navigationSplitViewColumnWidth(min: 190, ideal: 210, max: 260)
        } detail: {
            NavigationStack {
                detailView
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .navigationTitle(navigationTitle)
                    .toolbar {
                        if selection == .overview {
                            ToolbarItemGroup(placement: .primaryAction) {
                                Button {
                                    copyDiagnostics()
                                } label: {
                                    Label(
                                        diagnosticsCopied ? "Copied" : "Copy Diagnostics",
                                        systemImage: diagnosticsCopied ? "checkmark" : "doc.on.doc"
                                    )
                                }
                                .help("Copy app and commerce diagnostics")

                                Button {
                                    refreshOverview()
                                } label: {
                                    Label("Refresh", systemImage: "arrow.clockwise")
                                }
                                .help("Refresh overview status")
                            }
                        } else if selection == .commerce {
                            ToolbarItem(placement: .primaryAction) {
                                Button {
                                    refreshCommerce()
                                } label: {
                                    Label("Refresh", systemImage: "arrow.clockwise")
                                }
                                .help("Refresh entitlement and products")
                            }
                        }
                    }
            }
        }
        .navigationSplitViewStyle(.balanced)
        .foregroundStyle(theme.textPrimary)
        .tint(theme.accent)
        .background(theme.canvas)
        .frame(
            minWidth: 760,
            idealWidth: MacAppFoundationDeveloperTools.defaultWidth,
            minHeight: 560,
            idealHeight: MacAppFoundationDeveloperTools.defaultHeight
        )
        .sheet(item: $replay) { replay in
            replay.content { self.replay = nil }
        }
        .alert("Developer Action Failed", isPresented: Binding(
            get: { actionError != nil },
            set: { if !$0 { actionError = nil } }
        )) {
            Button("OK", role: .cancel) { actionError = nil }
        } message: {
            Text(actionError ?? "Unknown error")
        }
    }

    private var sidebar: some View {
        List(selection: $selection) {
            Section("Foundation") {
                sidebarRow(.overview, title: "Overview", systemImage: "square.grid.2x2")
                sidebarRow(.commerce, title: "Commerce", systemImage: "creditcard")
                sidebarRow(.analytics, title: "Analytics", systemImage: "chart.bar.xaxis")
                sidebarRow(.logs, title: "Logs", systemImage: "text.alignleft")
                sidebarRow(.userDefaults, title: "User Defaults", systemImage: "slider.horizontal.3")
            }

            if !configuration.replays.isEmpty {
                Section("Flows") {
                    sidebarRow(.replays, title: "Replay", systemImage: "play.rectangle")
                }
            }

            if !configuration.additionalSections.isEmpty {
                Section("App") {
                    ForEach(configuration.additionalSections) { section in
                        sidebarRow(
                            .customSection(section.id),
                            title: section.title,
                            systemImage: "wrench.and.screwdriver"
                        )
                    }
                }
            }
        }
        .listStyle(.sidebar)
        .scrollContentBackground(.hidden)
        .background(theme.canvas)
    }

    private func sidebarRow(
        _ destination: DeveloperDestination,
        title: String,
        systemImage: String
    ) -> some View {
        Label(title, systemImage: systemImage)
            .tag(destination)
    }

    @ViewBuilder
    private var detailView: some View {
        switch selection ?? .overview {
        case .overview:
            overviewView
        case .commerce:
            commerceView
        case .replays:
            replayView
        case .analytics:
            FoundationDeveloperAnalyticsView(
                analytics: analytics,
                onStorageModeChange: configuration.onAnalyticsStorageModeChange
            )
        case .logs:
            MacAppFoundationLogInspectorView(store: MacAppFoundationLogStore.shared)
        case .userDefaults:
            FoundationDeveloperUserDefaultsView()
        case .customSection(let sectionID):
            customSectionView(sectionID: sectionID)
        }
    }

    private var overviewView: some View {
        let info = DeveloperAppInfo.current
        return Form {
            Section("App") {
                LabeledContent("App", value: "\(info.displayName) \(info.versionAndBuild)")
                LabeledContent("Bundle ID", value: info.bundleIdentifier)
                LabeledContent("System", value: "\(ProcessInfo.processInfo.operatingSystemVersionString) · \(info.architecture)")
                LabeledContent("Sandbox", value: info.isSandboxed ? "Enabled" : "Disabled")
                LabeledContent("Theme", value: "\(theme.name) (\(theme.id.rawValue))")
                LabeledContent(
                    "MAF logging",
                    value: MacAppFoundationLogging.isBootstrapped ? "Enabled" : "Not enabled"
                )
            }

            Section("Commerce") {
                LabeledContent("Mode", value: purchaseModeTitle)
                LabeledContent("Effective access", value: accessTitle)
                LabeledContent("Activity", value: purchaseActivityTitle)
                LabeledContent("Products", value: "\(purchaseManager.products.count) loaded (\(productLoadingTitle))")
            }

            Section("Analytics") {
                if analytics == nil {
                    LabeledContent("Client", value: "Not connected")
                } else if let snapshot = overviewAnalyticsSnapshot {
                    LabeledContent("Status", value: snapshot.configuration.effectiveEnabled ? "Enabled" : "Disabled")
                    LabeledContent(
                        "Storage mode",
                        value: snapshot.configuration.storageMode == .inMemory ? "In Memory" : "Persisted"
                    )
                    LabeledContent("Stored UTC days", value: "\(snapshot.runtime.pendingDayCount)")
                    LabeledContent("Installation ID") {
                        Text(snapshot.runtime.installationID ?? "Not created")
                            .font(.caption.monospaced())
                            .textSelection(.enabled)
                    }
                } else {
                    LabeledContent("Client", value: "Loading…")
                }
            }

            Section("Paths") {
                LabeledContent("Bundle") {
                    Text(info.bundlePath)
                        .font(.caption.monospaced())
                        .textSelection(.enabled)
                }

                LabeledContent(info.isSandboxed ? "Container" : "Home") {
                    Text(info.homeDirectory)
                        .font(.caption.monospaced())
                        .textSelection(.enabled)
                }
            }
        }
        .developerFormStyle(theme: theme)
        .task(id: analytics.map(ObjectIdentifier.init)) {
            await refreshOverviewAnalytics()
        }
    }

    private var commerceView: some View {
        Form {
            Section("Status") {
                Toggle(
                    "Simulated purchases",
                    isOn: Binding(
                        get: { purchaseManager.isUsingSimulatedPurchases },
                        set: { enabled in
                            Task { @MainActor in
                                await purchaseManager.setSimulatedPurchasesEnabled(enabled)
                                resetFailureControls()
                            }
                        }
                    )
                )

                LabeledContent("Live entitlement", value: entitlementTitle)
                LabeledContent("Effective access", value: accessTitle)
                LabeledContent("Product state", value: productLoadingTitle)
                LabeledContent("Activity", value: purchaseActivityTitle)
            }

            if purchaseManager.isUsingSimulatedPurchases {
                Section("Simulated Entitlement") {
                    simulatedEntitlementRow(title: "Free", productID: nil)

                    ForEach(purchaseManager.simulatedConfigurationSnapshot.productIDs, id: \.self) { productID in
                        let title = purchaseManager.simulatedCatalogProducts
                            .first(where: { $0.id == productID })?.displayName ?? productID
                        simulatedEntitlementRow(title: title, productID: productID)
                    }
                }

                Section("Failure & Latency Simulation") {
                    Picker("Purchase outcome", selection: $purchaseOutcome) {
                        ForEach(DeveloperPurchaseOutcome.allCases) { outcome in
                            Text(outcome.title).tag(outcome)
                        }
                    }
                    .onChange(of: purchaseOutcome) { _, newValue in
                        applyPurchaseOutcome(newValue)
                    }

                    Toggle("Product loading failure", isOn: Binding(
                        get: { catalogFailureEnabled },
                        set: { enabled in
                            catalogFailureEnabled = enabled
                            Task { @MainActor in
                                await purchaseManager.setSimulatedProductLoadingFailure(
                                    enabled ? .noProductsAvailable : nil
                                )
                            }
                        }
                    ))

                    Toggle("Restore failure", isOn: Binding(
                        get: { restoreFailureEnabled },
                        set: { enabled in
                            restoreFailureEnabled = enabled
                            purchaseManager.setSimulatedRestoreFailure(
                                enabled ? DeveloperPurchaseOutcome.networkFailure.failure : nil
                            )
                        }
                    ))

                    Picker("Operation latency", selection: $latency) {
                        ForEach(DeveloperPurchaseLatency.allCases) { latency in
                            Text(latency.title).tag(latency)
                        }
                    }
                    .onChange(of: latency) { _, newValue in
                        purchaseManager.setSimulatedOperationDelay(newValue.duration)
                    }

                    Button("Reset failure simulation", systemImage: "arrow.counterclockwise") {
                        Task { @MainActor in
                            await purchaseManager.resetSimulatedFailures()
                            resetFailureControls()
                        }
                    }
                }
            }

            Section("Loaded Products") {
                if purchaseManager.products.isEmpty {
                    Text("No products loaded.")
                        .foregroundStyle(theme.textSecondary)
                } else {
                    ForEach(purchaseManager.products) { product in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text(product.displayName)
                                    .fontWeight(.semibold)
                                if product.id == purchaseManager.preferredProduct?.id {
                                    Text("PREFERRED")
                                        .font(.caption2.bold())
                                        .foregroundStyle(theme.accent)
                                }
                                Spacer()
                                Text(product.displayPrice)
                                    .fontWeight(.semibold)
                            }
                            Text("\(product.id) · \(product.planLabel)")
                                .font(.caption.monospaced())
                                .foregroundStyle(theme.textSecondary)
                            if let offer = product.introductoryOffer {
                                Text("\(offer.headline) · \(offer.isEligible ? "Eligible" : "Ineligible")")
                                    .font(.caption)
                                    .foregroundStyle(offer.isEligible ? theme.success : theme.textSecondary)
                            }
                        }
                        .padding(.vertical, 2)
                    }
                }
            }

            Section("Actions") {
                Button("Refresh entitlement", systemImage: "arrow.clockwise") {
                    Task { @MainActor in
                        await purchaseManager.refreshEntitlements()
                    }
                }

                Button("Reload products", systemImage: "arrow.triangle.2.circlepath") {
                    Task { @MainActor in
                        await purchaseManager.loadProducts(force: true)
                    }
                }

                if purchaseManager.isUsingSimulatedPurchases {
                    Button("Reset simulated purchases", systemImage: "trash", role: .destructive) {
                        Task { @MainActor in
                            await purchaseManager.resetSimulatedPurchases()
                            resetFailureControls()
                        }
                    }
                }
            }
        }
        .developerFormStyle(theme: theme)
    }

    private func simulatedEntitlementRow(title: String, productID: String?) -> some View {
        Button {
            Task { @MainActor in
                let ids: Set<String> = productID.map { [$0] } ?? []
                await purchaseManager.setSimulatedPurchasedProductIDs(ids)
            }
        } label: {
            HStack {
                Text(title)
                    .foregroundStyle(theme.textPrimary)
                Spacer()
                if isSimulatedEntitlementSelected(productID) {
                    Image(systemName: "checkmark")
                        .fontWeight(.semibold)
                        .foregroundStyle(theme.accent)
                }
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    private func isSimulatedEntitlementSelected(_ productID: String?) -> Bool {
        let active = purchaseManager.simulatedPurchasedProductIDs
        guard let productID else { return active.isEmpty }
        return active == Set([productID])
    }

    private var replayView: some View {
        List {
            ForEach(configuration.replays) { replay in
                Button {
                    self.replay = replay
                } label: {
                    Label(replay.title, systemImage: replay.systemImage)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .padding(.vertical, 4)
            }
        }
        .scrollContentBackground(.hidden)
        .background(theme.canvas)
    }

    @ViewBuilder
    private func customSectionView(sectionID: String) -> some View {
        if let section = configuration.additionalSections.first(where: { $0.id == sectionID }) {
            Form {
                Section(section.title) {
                    ForEach(section.items) { item in
                        developerItem(item)
                    }
                }
            }
            .developerFormStyle(theme: theme)
        } else {
            ContentUnavailableView(
                "Section Unavailable",
                systemImage: "questionmark.folder",
                description: Text("The selected developer section is no longer registered.")
            )
            .background(theme.canvas)
        }
    }

    private func refreshOverview() {
        Task { @MainActor in
            await purchaseManager.refreshEntitlements()
            await refreshOverviewAnalytics()
        }
    }

    private func refreshOverviewAnalytics() async {
        guard let analytics else {
            overviewAnalyticsSnapshot = nil
            return
        }

        overviewAnalyticsSnapshot = try? await analytics.developerSnapshot()
    }

    private func copyDiagnostics() {
        let pasteboard = NSPasteboard.general
        pasteboard.clearContents()
        pasteboard.setString(diagnosticText, forType: .string)
        diagnosticsCopied = true
        Task { @MainActor in
            try? await Task.sleep(for: .seconds(1.5))
            diagnosticsCopied = false
        }
    }

    @ViewBuilder
    private func developerItem(_ item: FoundationDeveloperItem) -> some View {
        switch item {
        case .action(let action):
            developerActionButton(action)

        case .toggle(let toggle):
            Toggle(toggle.title, isOn: Binding(
                get: { toggle.value },
                set: { toggle.set($0) }
            ))

        case .value(let value):
            LabeledContent(value.title, value: value.value)

        case .destination(let destination):
            NavigationLink {
                destination.content()
                    .navigationTitle(destination.title)
            } label: {
                Label(destination.title, systemImage: destination.systemImage)
            }
        }
    }

    private func developerActionButton(_ action: FoundationDeveloperAction) -> some View {
        Button(
            action.title,
            systemImage: action.systemImage,
            role: action.role == .destructive ? .destructive : nil
        ) {
            Task { @MainActor in
                do {
                    try await action.perform()
                } catch {
                    actionError = error.localizedDescription
                }
            }
        }
    }

    private var navigationTitle: String {
        switch selection ?? .overview {
        case .overview:
            "Overview"
        case .commerce:
            "Commerce"
        case .replays:
            "Replay"
        case .analytics:
            "Analytics"
        case .logs:
            "Logs"
        case .userDefaults:
            "User Defaults"
        case .customSection(let sectionID):
            configuration.additionalSections
                .first(where: { $0.id == sectionID })?
                .title ?? MacAppFoundationDeveloperTools.windowTitle
        }
    }

    private func refreshCommerce() {
        Task { @MainActor in
            await purchaseManager.refreshEntitlements()
            await purchaseManager.loadProducts(force: true)
        }
    }

    private func applyPurchaseOutcome(_ outcome: DeveloperPurchaseOutcome) {
        for productID in purchaseManager.simulatedConfigurationSnapshot.productIDs {
            purchaseManager.setSimulatedPurchaseResult(outcome.result, for: productID)
        }
    }

    private func resetFailureControls() {
        purchaseOutcome = .success
        catalogFailureEnabled = false
        restoreFailureEnabled = false
        latency = .normal
        purchaseManager.setSimulatedOperationDelay(latency.duration)
    }

    private var purchaseModeTitle: String {
        purchaseManager.isUsingSimulatedPurchases ? "Simulated" : "Live StoreKit"
    }

    private var entitlementTitle: String {
        switch purchaseManager.entitlementState {
        case .checking: "Checking"
        case .inactive: "Free"
        case .active: "Pro"
        }
    }

    private var accessTitle: String {
        switch purchaseManager.accessState {
        case .inactive:
            return "Free"
        case .active(let source, let snapshot):
            let productIDs = snapshot.activeProductIDs.sorted().joined(separator: ", ")
            let sourceLabel = source == .storeKit ? "StoreKit" : "Verified cache"
            return "\(productIDs) · \(sourceLabel)"
        }
    }

    private var productLoadingTitle: String {
        switch purchaseManager.productLoadingState {
        case .idle: "Idle"
        case .loading: "Loading"
        case .loaded: "Loaded"
        case .failed(let failure): "Failed: \(failure.code.rawValue)"
        }
    }

    private var purchaseActivityTitle: String {
        switch purchaseManager.activity {
        case .idle: "Idle"
        case .purchasing(let productID): "Purchasing \(productID)"
        case .restoring: "Restoring"
        case .pending(let productID): "Pending \(productID)"
        case .failed(let failure): "Failed: \(failure.code.rawValue)"
        }
    }

    private var diagnosticText: String {
        let info = DeveloperAppInfo.current
        let products = purchaseManager.products
            .map { product in
                var value = "\(product.id) = \(product.displayPrice)"
                if let offer = product.introductoryOffer {
                    let eligibility = offer.isEligible ? "eligible" : "ineligible"
                    value += " · \(offer.headline) · \(eligibility)"
                }
                return value
            }
            .joined(separator: "\n")

        return """
        App: \(info.displayName) \(info.versionAndBuild)
        Bundle: \(info.bundleIdentifier)
        System: \(ProcessInfo.processInfo.operatingSystemVersionString)
        Purchase mode: \(purchaseModeTitle)
        Live entitlement: \(entitlementTitle)
        Effective access: \(accessTitle)
        Product state: \(productLoadingTitle)
        Purchase activity: \(purchaseActivityTitle)
        Preferred product: \(purchaseManager.preferredProduct?.id ?? "None")
        Products:\n\(products.isEmpty ? "None" : products)
        """
    }
}

private enum DeveloperDestination: Hashable {
    case overview
    case commerce
    case replays
    case analytics
    case logs
    case userDefaults
    case customSection(String)
}

private extension View {
    func developerFormStyle(theme: MacAppTheme) -> some View {
        formStyle(.grouped)
            .scrollContentBackground(.hidden)
            .background(theme.canvas)
    }
}

private struct DeveloperAppInfo {
    let displayName: String
    let version: String
    let build: String
    let bundleIdentifier: String
    let architecture: String
    let isSandboxed: Bool
    let bundlePath: String
    let homeDirectory: String

    var versionAndBuild: String {
        guard build != "—" else { return version }
        return "\(version) (\(build))"
    }

    static var current: DeveloperAppInfo {
        let bundle = Bundle.main
        let displayName = (bundle.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String)
            ?? (bundle.object(forInfoDictionaryKey: "CFBundleName") as? String)
            ?? ProcessInfo.processInfo.processName
        let version = (bundle.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String)
            ?? "—"
        let build = (bundle.object(forInfoDictionaryKey: "CFBundleVersion") as? String)
            ?? "—"
        return DeveloperAppInfo(
            displayName: displayName,
            version: version,
            build: build,
            bundleIdentifier: bundle.bundleIdentifier ?? "—",
            architecture: currentArchitecture,
            isSandboxed: sandboxEnabled,
            bundlePath: bundle.bundleURL.path,
            homeDirectory: NSHomeDirectory()
        )
    }

    private static var currentArchitecture: String {
        #if arch(arm64)
        "arm64"
        #elseif arch(x86_64)
        "x86_64"
        #else
        "unknown"
        #endif
    }

    private static var sandboxEnabled: Bool {
        guard let task = SecTaskCreateFromSelf(nil),
              let value = SecTaskCopyValueForEntitlement(
                task,
                "com.apple.security.app-sandbox" as CFString,
                nil
              ) else {
            return false
        }
        return (value as? Bool) == true
    }
}
#endif
