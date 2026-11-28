import Foundation
import Testing
@testable import MacAppFoundation

@Suite("MacAppSettings built-ins")
struct MacAppSettingsBuiltInsTests {
    private func makeDefaults() -> (UserDefaults, String) {
        let suiteName = "MacAppSettingsBuiltInsTests.\(UUID().uuidString)"
        let defaults = UserDefaults(suiteName: suiteName)!
        defaults.removePersistentDomain(forName: suiteName)
        return (defaults, suiteName)
    }

    @MainActor
    @Test("Theme pane uses stable built-in metadata")
    func themeMetadata() {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let store = MacAppThemeStore(
            configuration: .builtIns([.system, .midnight]),
            defaults: defaults
        )

        let pane = MacAppSettingsPane.theme(themeStore: store, variant: .compact)

        #expect(pane.id == .theme)
        #expect(pane.title == "Theme")
        #expect(pane.systemImage == "paintpalette")
    }

    @MainActor
    @Test("Theme settings pane validates commerce dependencies only when Pro themes exist")
    func themeSettingsPaneCommerceDependencyValidation() {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let freeStore = MacAppThemeStore(
            configuration: .builtIns([.system, .midnight]),
            defaults: defaults
        )
        #expect(MacAppThemeSettingsPane(themeStore: freeStore).configurationErrorMessage == nil)

        let proStore = MacAppThemeStore(
            configuration: .builtIns([.system, .midnight], proThemeIDs: [.midnight]),
            defaults: defaults
        )
        let purchases = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: ["pro"]),
            simulated: true
        )

        #expect(MacAppThemeSettingsPane(themeStore: proStore).configurationErrorMessage != nil)
        #expect(
            MacAppThemeSettingsPane(themeStore: proStore, onUpgrade: {}).configurationErrorMessage != nil
        )
        #expect(
            MacAppThemeSettingsPane(themeStore: proStore, purchaseManager: purchases)
                .configurationErrorMessage != nil
        )
        #expect(
            MacAppThemeSettingsPane(
                themeStore: proStore,
                purchaseManager: purchases,
                onUpgrade: {}
            ).configurationErrorMessage == nil
        )
    }

    @MainActor
    @Test("Theme preview progress follows remaining preview time")
    func themePreviewProgressTracksRemainingTime() {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }

        var now = Date(timeIntervalSince1970: 1_000)
        let configuration = MacAppThemeConfiguration(
            themes: [.system, .midnight],
            defaultThemeID: .system,
            storageKey: "theme",
            proThemeIDs: [.midnight],
            previewBehavior: .init(
                defaultDuration: 100,
                schedulesAutomaticExpiration: false
            )
        )
        let store = MacAppThemeStore(
            configuration: configuration,
            defaults: defaults,
            now: { now }
        )
        let purchases = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: ["pro"]),
            simulated: true
        )

        _ = store.choose(.midnight, hasPro: false)
        let pane = MacAppThemeSettingsPane(
            themeStore: store,
            purchaseManager: purchases,
            onUpgrade: {}
        )

        #expect(pane.previewProgress == 1)

        now = now.addingTimeInterval(25)

        #expect(pane.previewProgress == 0.75)
    }

    @MainActor
    @Test("Default built-ins are a flat Theme then Plan pane list")
    func defaultPanes() {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let store = MacAppThemeStore(defaults: defaults)
        let purchases = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: ["pro"]),
            simulated: true
        )

        let panes = MacAppSettingsBuiltIns.panes(
            themeStore: store,
            purchaseManager: purchases,
            planConfiguration: ProPlanPaneConfiguration(appName: "Demo"),
            onUpgrade: {}
        )

        #expect(panes.map { $0.id } == [.theme, .plan])
    }

    @MainActor
    @Test("Apps can disable either built-in pane")
    func subsetBuiltIns() {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let store = MacAppThemeStore(defaults: defaults)
        let purchases = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: ["pro"]),
            simulated: true
        )

        let themeOnly = MacAppSettingsBuiltIns.panes(
            themeStore: store,
            purchaseManager: purchases,
            planConfiguration: ProPlanPaneConfiguration(appName: "Demo"),
            enabledPanes: [.theme],
            onUpgrade: {}
        )
        let planOnly = MacAppSettingsBuiltIns.panes(
            themeStore: store,
            purchaseManager: purchases,
            planConfiguration: ProPlanPaneConfiguration(appName: "Demo"),
            enabledPanes: [.plan],
            onUpgrade: {}
        )

        #expect(themeOnly.map { $0.id } == [.theme])
        #expect(planOnly.map { $0.id } == [.plan])
    }

    @MainActor
    @Test("Grouped section helpers remain available for larger settings surfaces")
    func groupedSectionsRemainAvailable() {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let store = MacAppThemeStore(defaults: defaults)
        let purchases = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: ["pro"]),
            simulated: true
        )

        let sections = MacAppSettingsBuiltIns.sections(
            themeStore: store,
            purchaseManager: purchases,
            planConfiguration: ProPlanPaneConfiguration(appName: "Demo"),
            onUpgrade: {}
        )

        #expect(sections.map { $0.id } == [.application, .account])
        #expect(sections.flatMap { $0.panes }.map { $0.id } == [.theme, .plan])
    }
}
