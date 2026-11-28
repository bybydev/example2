#if DEBUG
import Foundation
import XCTest
@testable import MacAppFoundation

final class AppAnalyticsDeveloperToolsTests: XCTestCase {
    func testDeveloperSnapshotExposesConfigurationAndPersistedCounters() async throws {
        let store = TestAnalyticsStateStore()
        let appKey = "com.example.analytics"
        let client = AppAnalyticsClient(
            configuration: makeTestAnalyticsConfiguration(
                appID: "developer-test",
                appKey: appKey,
                appVersion: "1.2.3",
                uploadInterval: 300,
                storageMode: .inMemory
            ),
            transport: TestAnalyticsTransport(),
            stateStore: store
        )

        try await client.track(
            "export_completed",
            dimension: "mp3",
            count: 2
        )
        await client.waitForAutomaticUpload()

        let snapshot = try await client.developerSnapshot()

        XCTAssertEqual(snapshot.configuration.appID, "developer-test")
        XCTAssertEqual(snapshot.configuration.appKey, appKey)
        XCTAssertEqual(snapshot.configuration.resolvedAppVersion, "1.2.3")
        XCTAssertEqual(snapshot.runtime.pendingDayCount, 1)

        let day = try XCTUnwrap(snapshot.days.first)
        let event = try XCTUnwrap(
            day.events.first {
                $0.name == "export_completed" && $0.dimension == "mp3"
            }
        )
        XCTAssertEqual(event.count, 2)
    }

    func testDeveloperOverrideCanEnableConfiguredDisabledAnalytics() async throws {
        let store = TestAnalyticsStateStore()
        let client = AppAnalyticsClient(
            configuration: makeTestAnalyticsConfiguration(
                appID: "developer-disabled-test",
                appKey: "com.example.disabledoverride",
                enabled: false,
                uploadInterval: 300,
                storageMode: .inMemory
            ),
            transport: TestAnalyticsTransport(),
            stateStore: store
        )

        try await client.track("Not Valid")
        var snapshot = try await client.developerSnapshot()
        XCTAssertFalse(snapshot.configuration.configuredEnabled)
        XCTAssertFalse(snapshot.configuration.effectiveEnabled)
        XCTAssertNil(snapshot.configuration.developerEnabledOverride)
        XCTAssertTrue(snapshot.days.isEmpty)

        await client.developerSetEnabledOverride(true)
        try await client.track("generation_completed", dimension: "local")
        await client.waitForAutomaticUpload()

        snapshot = try await client.developerSnapshot()
        XCTAssertFalse(snapshot.configuration.configuredEnabled)
        XCTAssertTrue(snapshot.configuration.effectiveEnabled)
        XCTAssertEqual(snapshot.configuration.developerEnabledOverride, true)
        XCTAssertTrue(
            snapshot.days.flatMap(\.events).contains {
                $0.name == "generation_completed" && $0.dimension == "local"
            }
        )
    }

    func testDeveloperOverrideCanDisableConfiguredEnabledAnalytics() async throws {
        let client = AppAnalyticsClient(
            configuration: makeTestAnalyticsConfiguration(
                appID: "developer-enabled-test",
                appKey: "com.example.enabledoverride",
                enabled: true,
                uploadInterval: 300,
                storageMode: .inMemory
            ),
            transport: TestAnalyticsTransport(),
            stateStore: TestAnalyticsStateStore()
        )

        await client.developerSetEnabledOverride(false)
        try await client.track("Not Valid")

        var snapshot = try await client.developerSnapshot()
        XCTAssertTrue(snapshot.configuration.configuredEnabled)
        XCTAssertFalse(snapshot.configuration.effectiveEnabled)
        XCTAssertEqual(snapshot.configuration.developerEnabledOverride, false)
        XCTAssertTrue(snapshot.days.isEmpty)

        await client.developerSetEnabledOverride(nil)
        try await client.track("resumed_after_override", dimension: "local")
        await client.waitForAutomaticUpload()

        snapshot = try await client.developerSnapshot()
        XCTAssertTrue(snapshot.configuration.configuredEnabled)
        XCTAssertTrue(snapshot.configuration.effectiveEnabled)
        XCTAssertNil(snapshot.configuration.developerEnabledOverride)
        XCTAssertTrue(
            snapshot.days.flatMap(\.events).contains {
                $0.name == "resumed_after_override" && $0.dimension == "local"
            }
        )
    }

    @MainActor
    func testTrackedEventAppearsInLiveDeveloperActivity() async throws {
        let activityStore = AppAnalyticsDeveloperActivityStore()
        let client = AppAnalyticsClient(
            configuration: makeTestAnalyticsConfiguration(
                appID: "developer-live-test",
                appKey: "com.example.liveanalytics",
                uploadInterval: 300,
                storageMode: .inMemory
            ),
            transport: TestAnalyticsTransport(),
            stateStore: TestAnalyticsStateStore()
        )
        await client.developerSetActivityStore(activityStore)

        try await client.track("generation_completed", dimension: "local")
        await client.waitForAutomaticUpload()

        let clock = ContinuousClock()
        let deadline = clock.now.advanced(by: .seconds(1))
        while clock.now < deadline {
            if activityStore.entries.contains(where: {
                $0.kind == .event
                    && $0.title == "generation_completed"
                    && $0.detail?.contains("dimension=local") == true
            }) {
                break
            }
            try? await Task.sleep(for: .milliseconds(5))
        }

        XCTAssertTrue(
            activityStore.entries.contains {
                $0.kind == .event
                    && $0.title == "generation_completed"
                    && $0.detail?.contains("dimension=local") == true
            }
        )
    }

    func testDeveloperSnapshotReflectsInMemoryStorageModeWithoutTouchingKeychain() async throws {
        let keychainService = "com.hoangbkit.MacAppFoundationTests.DeveloperInMemory.\(UUID().uuidString)"
        let secureStore = AppAnalyticsSecureStore(service: keychainService)
        let client = AppAnalyticsClient(
            configuration: makeTestAnalyticsConfiguration(
                appID: "developer-in-memory",
                keychainService: keychainService,
                uploadInterval: 300,
                storageMode: .inMemory
            ),
            transport: TestAnalyticsTransport()
        )

        let initialSnapshot = try await client.developerSnapshot()
        XCTAssertEqual(initialSnapshot.configuration.storageMode, .inMemory)
        XCTAssertTrue(initialSnapshot.configuration.stateStoreType.contains("InMemoryAppAnalyticsStateStore"))
        XCTAssertNil(initialSnapshot.runtime.installationID)

        try await client.track("generation_completed", dimension: "memory")
        await client.waitForAutomaticUpload()

        let uploadedSnapshot = try await client.developerSnapshot()
        XCTAssertEqual(uploadedSnapshot.configuration.storageMode, .inMemory)
        XCTAssertNotNil(uploadedSnapshot.runtime.installationID)
        let storedInKeychain = try await secureStore.string(for: "developer-in-memory.installation")
        XCTAssertNil(storedInKeychain)
    }
}
#endif
