import Foundation
import SwiftUI
import Testing
@testable import MacAppFoundation

@Suite("ThemePickerView")
@MainActor
struct ThemePickerViewTests {
    private func makeDefaults() -> (UserDefaults, String) {
        let suiteName = "ThemePickerViewTests.\(UUID().uuidString)"
        return (UserDefaults(suiteName: suiteName)!, suiteName)
    }

    @Test("Picker requires a Free light theme when System is configured")
    func requiresFreeLightTheme() {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let configuration = MacAppThemeConfiguration(
            themes: [.system, MacAppThemeCatalog.midnight],
            defaultThemeID: .system,
            storageKey: "theme"
        )
        let store = MacAppThemeStore(configuration: configuration, defaults: defaults)
        let picker = ThemePickerView(themeStore: store)

        #expect(picker.configurationErrorMessage != nil)
        #expect(
            picker.configurationErrorMessage?.contains(
                "at least one Free Light theme and one Free Dark theme"
            ) == true
        )
    }

    @Test("Picker requires a Free dark theme when System is configured")
    func requiresFreeDarkTheme() {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let configuration = MacAppThemeConfiguration(
            themes: [.system, MacAppThemeCatalog.porcelain],
            defaultThemeID: .system,
            storageKey: "theme"
        )
        let store = MacAppThemeStore(configuration: configuration, defaults: defaults)
        let picker = ThemePickerView(themeStore: store)

        #expect(picker.configurationErrorMessage != nil)
    }

    @Test("Picker allows single-appearance catalogs when System is not configured")
    func allowsSingleAppearanceWithoutSystem() {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let configuration = MacAppThemeConfiguration(
            themes: [MacAppThemeCatalog.midnight, MacAppThemeCatalog.ocean],
            defaultThemeID: .midnight,
            storageKey: "theme"
        )
        let store = MacAppThemeStore(configuration: configuration, defaults: defaults)
        let picker = ThemePickerView(themeStore: store)

        #expect(picker.configurationErrorMessage == nil)
    }

    @Test("Pro themes cannot satisfy Free appearance requirements")
    func proThemesDoNotSatisfyFreeAppearanceRequirements() {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let configuration = MacAppThemeConfiguration(
            themes: [
                .system,
                MacAppThemeCatalog.midnight,
                MacAppThemeCatalog.porcelain,
            ],
            defaultThemeID: .system,
            storageKey: "theme",
            proThemeIDs: [.midnight]
        )
        let store = MacAppThemeStore(configuration: configuration, defaults: defaults)
        let purchases = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: ["pro"]),
            simulated: true
        )
        let picker = ThemePickerView(
            themeStore: store,
            purchaseManager: purchases,
            onUpgrade: {}
        )

        #expect(
            picker.configurationErrorMessage?.contains(
                "at least one Free Light theme and one Free Dark theme"
            ) == true
        )
    }

    @Test("Pro themes require PurchaseManager and upgrade action")
    func proThemesRequireCommerceDependencies() {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let configuration = MacAppThemeConfiguration(
            themes: [
                .system,
                MacAppThemeCatalog.midnight,
                MacAppThemeCatalog.porcelain,
                MacAppThemeCatalog.ocean,
            ],
            defaultThemeID: .system,
            storageKey: "theme",
            proThemeIDs: [.ocean]
        )
        let store = MacAppThemeStore(configuration: configuration, defaults: defaults)
        let purchases = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: ["pro"]),
            simulated: true
        )

        let missingBoth = ThemePickerView(themeStore: store)
        #expect(
            missingBoth.configurationErrorMessage?.contains(
                "missing PurchaseManager or onUpgrade"
            ) == true
        )

        let missingPurchaseManager = ThemePickerView(
            themeStore: store,
            onUpgrade: {}
        )
        #expect(
            missingPurchaseManager.configurationErrorMessage?.contains(
                "missing PurchaseManager or onUpgrade"
            ) == true
        )

        let missingUpgrade = ThemePickerView(
            themeStore: store,
            purchaseManager: purchases
        )
        #expect(
            missingUpgrade.configurationErrorMessage?.contains(
                "missing PurchaseManager or onUpgrade"
            ) == true
        )

        let complete = ThemePickerView(
            themeStore: store,
            purchaseManager: purchases,
            onUpgrade: {}
        )
        #expect(complete.configurationErrorMessage == nil)
    }

    @Test("Picker accepts Free light and dark coverage")
    func acceptsFreeLightAndDarkCoverage() {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let configuration = MacAppThemeConfiguration(
            themes: [
                .system,
                MacAppThemeCatalog.midnight,
                MacAppThemeCatalog.porcelain,
            ],
            defaultThemeID: .system,
            storageKey: "theme"
        )
        let store = MacAppThemeStore(configuration: configuration, defaults: defaults)
        let picker = ThemePickerView(themeStore: store)

        #expect(picker.configurationErrorMessage == nil)
    }

    @Test("System card preview follows supplied macOS appearance")
    func systemCardPreviewFollowsSystemAppearance() {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let configuration = MacAppThemeConfiguration(
            themes: [
                .system,
                MacAppThemeCatalog.midnight,
                MacAppThemeCatalog.porcelain,
            ],
            defaultThemeID: .system,
            storageKey: "theme"
        )
        let store = MacAppThemeStore(configuration: configuration, defaults: defaults)
        store.select(.midnight)
        let picker = ThemePickerView(themeStore: store)

        let lightSystemCard = picker.pickerThemes(for: .light).first { $0.id == .system }
        let darkSystemCard = picker.pickerThemes(for: .dark).first { $0.id == .system }

        #expect(lightSystemCard?.preferredColorScheme == nil)
        #expect(darkSystemCard?.preferredColorScheme == nil)
        #expect(lightSystemCard?.canvas == MacAppThemeCatalog.porcelain.canvas)
        #expect(darkSystemCard?.canvas == MacAppThemeCatalog.midnight.canvas)
    }

    @Test("System appearance helper reads AppleInterfaceStyle")
    func systemAppearanceHelperReadsPreference() {
        #expect(MacAppApplicationAppearance.systemColorScheme(interfaceStyle: nil) == .light)
        #expect(MacAppApplicationAppearance.systemColorScheme(interfaceStyle: "Light") == .light)
        #expect(MacAppApplicationAppearance.systemColorScheme(interfaceStyle: "Dark") == .dark)
    }

    @Test("Picker preview progress follows remaining preview time and hides for Pro")
    func previewProgressTracksRemainingTime() {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }

        var now = Date(timeIntervalSince1970: 1_000)
        let configuration = MacAppThemeConfiguration(
            themes: [
                .system,
                MacAppThemeCatalog.midnight,
                MacAppThemeCatalog.porcelain,
                MacAppThemeCatalog.ocean,
            ],
            defaultThemeID: .system,
            storageKey: "theme",
            proThemeIDs: [.ocean],
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
        let picker = ThemePickerView(
            themeStore: store,
            purchaseManager: purchases,
            onUpgrade: {}
        )

        #expect(picker.previewProgress == 0)

        _ = store.choose(.ocean, hasPro: false)
        #expect(picker.previewProgress == 1)

        now = now.addingTimeInterval(25)
        #expect(picker.previewProgress == 0.75)

        let proState = MacAppThemePickerState(
            themeStore: store,
            entitlementState: .active(
                EntitlementSnapshot(activeProductIDs: ["pro"], latestExpirationDate: nil)
            ),
            hasPro: true
        )
        #expect(!proState.showsPreviewStatus)
        #expect(proState.previewingThemeID == nil)
        #expect(proState.previewProgress == 0)
    }

    @Test("Checking entitlement keeps persisted Pro theme selected without lock state")
    func checkingEntitlementKeepsPersistedProThemeSelected() {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }
        defaults.set(MacAppThemeID.ocean.rawValue, forKey: "theme")

        let configuration = MacAppThemeConfiguration(
            themes: [
                .system,
                MacAppThemeCatalog.midnight,
                MacAppThemeCatalog.porcelain,
                MacAppThemeCatalog.ocean,
                MacAppThemeCatalog.aurora,
            ],
            defaultThemeID: .system,
            storageKey: "theme",
            proThemeIDs: [.ocean, .aurora]
        )
        let store = MacAppThemeStore(configuration: configuration, defaults: defaults)

        let checkingState = MacAppThemePickerState(
            themeStore: store,
            entitlementState: .checking,
            hasPro: false
        )

        #expect(checkingState.selectedThemeID == .ocean)
        #expect(!checkingState.previewableThemeIDs.contains(.ocean))
        #expect(!checkingState.lockedThemeIDs.contains(.ocean))
        #expect(checkingState.previewableThemeIDs.contains(.aurora))

        let inactiveState = MacAppThemePickerState(
            themeStore: store,
            entitlementState: .inactive,
            hasPro: false
        )

        #expect(inactiveState.selectedThemeID == .system)
        #expect(inactiveState.previewableThemeIDs.contains(.ocean))
    }
}
