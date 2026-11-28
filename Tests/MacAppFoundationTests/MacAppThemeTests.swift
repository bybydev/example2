import Foundation
import SwiftUI
import Testing
@testable import MacAppFoundation

@Suite("MacAppTheme")
@MainActor
struct MacAppThemeTests {
    @Test("Built-in catalog exposes all 13 themes with stable raw IDs")
    func builtInCatalogAndStableRawIDs() {
        let expected: [(id: MacAppThemeID, rawValue: String)] = [
            (.system, "system"),
            (.githubDarkDimmed, "github-dark-dimmed"),
            (.midnight, "midnight"),
            (.ocean, "ocean"),
            (.aurora, "aurora"),
            (.ember, "ember"),
            (.graphite, "graphite"),
            (.porcelain, "porcelain"),
            (.blossom, "blossom"),
            (.morningMist, "morning-mist"),
            (.softSage, "soft-sage"),
            (.sunrise, "sunrise"),
            (.githubLight, "github-light"),
        ]

        let themes = MacAppThemeCatalog.allBuiltIn
        let ids = themes.map(\.id)

        #expect(themes.count == 13)
        #expect(Set(ids).count == themes.count)
        #expect(ids == expected.map(\.id))
        #expect(ids.map(\.rawValue) == expected.map(\.rawValue))
        #expect(MacAppThemeCatalog.theme(for: "unknown") == nil)
    }

    @Test("Environment defaults to System theme and round-trips assigned theme")
    func environmentDefaultsToSystemAndRoundTrips() {
        var values = EnvironmentValues()
        #expect(values.macAppTheme.id == .system)
        #expect(values.macAppTheme.preferredColorScheme == nil)

        values.macAppTheme = MacAppThemeCatalog.midnight
        #expect(values.macAppTheme.id == .midnight)
    }

    @Test("allBuiltIn and builtIns helpers preserve order, filter unknown IDs, and fall back to System")
    func configurationBuiltInHelpers() {
        let allBuiltIn = MacAppThemeConfiguration.allBuiltIn(defaultThemeID: .midnight)
        #expect(allBuiltIn.themes.count == MacAppThemeCatalog.allBuiltIn.count)
        #expect(allBuiltIn.defaultThemeID == .midnight)

        let subset = MacAppThemeConfiguration.builtIns(
            [.porcelain, "unknown", .midnight],
            defaultThemeID: .midnight
        )
        #expect(subset.themes.map(\.id) == [.porcelain, .midnight])
        #expect(subset.defaultThemeID == .midnight)

        let unknownOnly = MacAppThemeConfiguration.builtIns(["does-not-exist"])
        #expect(unknownOnly.themes.map(\.id) == [.system])
        #expect(unknownOnly.defaultThemeID == .system)
    }

    @Test("Configuration supports a subset of built-in themes")
    func configurationSupportsSubset() {
        let configuration = MacAppThemeConfiguration(
            themes: [
                MacAppThemeCatalog.midnight,
                MacAppThemeCatalog.porcelain,
            ],
            defaultThemeID: .porcelain,
            storageKey: "theme-tests.subset"
        )

        #expect(configuration.themes.count == 2)
        #expect(configuration.defaultThemeID == .porcelain)
        #expect(configuration.theme(for: .midnight)?.name == "Midnight")
        #expect(configuration.theme(for: .system) == nil)
    }

    @Test("Configuration falls back when requested default is unavailable")
    func configurationFallsBackToFirstTheme() {
        let configuration = MacAppThemeConfiguration(
            themes: [MacAppThemeCatalog.ocean, MacAppThemeCatalog.sunrise],
            defaultThemeID: .system,
            storageKey: "theme-tests.fallback"
        )

        #expect(configuration.defaultThemeID == .ocean)
    }

    @Test("Configuration accepts app-defined themes and preserves catalog order")
    func configurationAcceptsCustomTheme() {
        let customID: MacAppThemeID = "demo-custom"
        let customTheme = MacAppTheme(
            id: customID,
            name: "Demo Custom",
            caption: "Host-defined",
            preferredColorScheme: .dark,
            palette: MacAppThemeCatalog.midnight.palette
        )
        let configuration = MacAppThemeConfiguration(
            themes: [.porcelain, customTheme, .midnight],
            defaultThemeID: customID,
            storageKey: "theme-tests.custom"
        )

        #expect(configuration.themes.map(\.id) == [.porcelain, customID, .midnight])
        #expect(configuration.theme(for: customID)?.name == "Demo Custom")
        #expect(configuration.defaultThemeID == customID)
    }

    @Test("System derives Free light and dark backing themes")
    func systemDerivesFreeAppearanceThemes() {
        let configuration = MacAppThemeConfiguration(
            themes: [
                .system,
                MacAppThemeCatalog.midnight,
                MacAppThemeCatalog.porcelain,
            ],
            defaultThemeID: .system,
            storageKey: "theme-tests.system"
        )

        #expect(configuration.hasRequiredFreeAppearanceThemes)
        #expect(configuration.systemLightThemeID == .porcelain)
        #expect(configuration.systemDarkThemeID == .midnight)
    }

    @Test("System follows the supplied macOS appearance")
    func systemFollowsAppearance() {
        let suiteName = "MacAppThemeTests.systemAppearance.\(UUID().uuidString)"
        let defaults = UserDefaults(suiteName: suiteName)!
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

        #expect(
            store.currentTheme(
                hasPro: false,
                systemColorScheme: .light
            ).id == .porcelain
        )
        #expect(
            store.currentTheme(
                hasPro: false,
                systemColorScheme: .dark
            ).id == .midnight
        )
        #expect(store.selectedThemeID == .system)
    }

    @Test("Explicit System backing themes override derived order")
    func explicitSystemBackingThemesOverrideDerivedOrder() {
        let configuration = MacAppThemeConfiguration(
            themes: [
                .system,
                MacAppThemeCatalog.midnight,
                MacAppThemeCatalog.ocean,
                MacAppThemeCatalog.porcelain,
                MacAppThemeCatalog.sunrise,
            ],
            defaultThemeID: .system,
            storageKey: "theme-tests.system.explicit",
            systemLightThemeID: .sunrise,
            systemDarkThemeID: .ocean
        )

        #expect(configuration.systemLightThemeID == .sunrise)
        #expect(configuration.systemDarkThemeID == .ocean)
    }

    @Test("Pro themes do not satisfy System Free appearance requirements")
    func proThemesDoNotSatisfySystemRequirements() {
        let configuration = MacAppThemeConfiguration(
            themes: [
                .system,
                MacAppThemeCatalog.midnight,
                MacAppThemeCatalog.porcelain,
            ],
            defaultThemeID: .system,
            storageKey: "theme-tests.system.pro",
            proThemeIDs: [.midnight]
        )

        #expect(!configuration.hasRequiredFreeAppearanceThemes)
        #expect(configuration.systemLightThemeID == .porcelain)
        #expect(configuration.systemDarkThemeID == nil)
    }

    @Test("Store restores and persists a valid selection")
    func storeRestoresAndPersistsSelection() {
        let suiteName = "MacAppThemeTests.persistence.\(UUID().uuidString)"
        let defaults = UserDefaults(suiteName: suiteName)!
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let configuration = MacAppThemeConfiguration(
            themes: [.system, MacAppThemeCatalog.midnight, MacAppThemeCatalog.porcelain],
            defaultThemeID: .system,
            storageKey: "theme"
        )

        let firstStore = MacAppThemeStore(configuration: configuration, defaults: defaults)
        firstStore.select(.midnight)
        #expect(firstStore.selectedThemeID == .midnight)
        #expect(defaults.string(forKey: "theme") == MacAppThemeID.midnight.rawValue)

        let restoredStore = MacAppThemeStore(configuration: configuration, defaults: defaults)
        #expect(restoredStore.selectedThemeID == .midnight)
        #expect(restoredStore.currentTheme.id == .midnight)
    }

    @Test("Store reset restores configured default and clears active Pro preview")
    func storeResetRestoresDefaultAndClearsPreview() {
        let suiteName = "MacAppThemeTests.reset.\(UUID().uuidString)"
        let defaults = UserDefaults(suiteName: suiteName)!
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let configuration = MacAppThemeConfiguration(
            themes: [.system, .midnight, .ocean],
            defaultThemeID: .system,
            storageKey: "theme",
            proThemeIDs: [.ocean],
            previewBehavior: .init(schedulesAutomaticExpiration: false)
        )
        let store = MacAppThemeStore(configuration: configuration, defaults: defaults)

        store.select(.midnight)
        _ = store.choose(.ocean, hasPro: false)
        #expect(store.isPreviewActive)

        store.reset()

        #expect(store.selectedThemeID == .system)
        #expect(defaults.string(forKey: "theme") == MacAppThemeID.system.rawValue)
        #expect(!store.isPreviewActive)
        #expect(store.previewThemeID == nil)
        #expect(defaults.string(forKey: "theme.previewThemeID") == nil)
        #expect(defaults.object(forKey: "theme.previewExpiresAt") == nil)
    }

    @Test("Store ignores a persisted theme not exposed by the app")
    func storeIgnoresUnavailablePersistedTheme() {
        let suiteName = "MacAppThemeTests.unavailable.\(UUID().uuidString)"
        let defaults = UserDefaults(suiteName: suiteName)!
        defer { defaults.removePersistentDomain(forName: suiteName) }
        defaults.set(MacAppThemeID.aurora.rawValue, forKey: "theme")

        let configuration = MacAppThemeConfiguration(
            themes: [MacAppThemeCatalog.ocean, MacAppThemeCatalog.porcelain],
            defaultThemeID: .porcelain,
            storageKey: "theme"
        )
        let store = MacAppThemeStore(configuration: configuration, defaults: defaults)

        #expect(store.selectedThemeID == .porcelain)
        #expect(store.currentTheme.id == .porcelain)
    }

    @Test("Store rejects programmatic selection outside the configured catalog")
    func storeRejectsUnavailableSelection() {
        let suiteName = "MacAppThemeTests.selection.\(UUID().uuidString)"
        let defaults = UserDefaults(suiteName: suiteName)!
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let configuration = MacAppThemeConfiguration(
            themes: [MacAppThemeCatalog.ocean, MacAppThemeCatalog.porcelain],
            defaultThemeID: .ocean,
            storageKey: "theme"
        )
        let store = MacAppThemeStore(configuration: configuration, defaults: defaults)

        store.select(.aurora)

        #expect(store.selectedThemeID == .ocean)
        #expect(store.currentTheme.id == .ocean)
    }
}
