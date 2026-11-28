import AppKit
import Foundation
import SwiftUI
import XCTest
@testable import MacAppFoundation

final class AppAnalyticsEnvironmentTests: XCTestCase {
    func testAnalyticsEnvironmentDefaultsToNilAndStoresClient() {
        var values = EnvironmentValues()
        XCTAssertNil(values.appAnalytics)

        let client = AppAnalyticsClient(
            configuration: makeTestAnalyticsConfiguration(appID: "test-app")
        )
        values.appAnalytics = client

        XCTAssertTrue(values.appAnalytics === client)
    }

    @MainActor
    func testLifecycleCoordinatorDeduplicatesNotificationsAcrossMultipleScenes() async throws {
        let center = NotificationCenter()
        let store = TestAnalyticsStateStore()
        let transport = TestAnalyticsTransport()
        let startDate = testAnalyticsDate("2026-09-05T10:00:00Z")
        let clock = TestAnalyticsClock(startDate)
        let client = AppAnalyticsClient(
            configuration: makeTestAnalyticsConfiguration(
                appID: "lifecycle-dedupe",
                uploadInterval: 86_400,
                storageMode: .inMemory
            ),
            transport: transport,
            stateStore: store,
            now: { clock.now() }
        )

        let coordinator = AppAnalyticsLifecycleCoordinator(
            notificationCenter: center,
            isApplicationActive: { true }
        )

        // Registering three scenes starts only one session.
        let tokenA = coordinator.register(client)
        let tokenB = coordinator.register(client)
        let tokenC = coordinator.register(client)
        await coordinator.waitForPendingEvents(for: client)
        await client.waitForAutomaticUpload()

        clock.set(startDate.addingTimeInterval(60))
        center.post(name: NSApplication.willResignActiveNotification, object: nil)
        await coordinator.waitForPendingEvents(for: client)
        await client.waitForAutomaticUpload()

        try await client.flush()
        let rawFirstSnapshot = try await Self.lastSessionSnapshot(from: transport)
        let firstSnapshot = try XCTUnwrap(rawFirstSnapshot)
        XCTAssertEqual(firstSnapshot.sessions, 1)
        XCTAssertEqual(firstSnapshot.sessionSeconds, 60)

        // Unregistering two of three scenes keeps notifications active (and deduplicated).
        coordinator.unregister(tokenA)
        coordinator.unregister(tokenB)

        clock.set(startDate.addingTimeInterval(3_600))
        center.post(name: NSApplication.didBecomeActiveNotification, object: nil)
        await coordinator.waitForPendingEvents(for: client)

        clock.set(startDate.addingTimeInterval(3_720))
        center.post(name: NSApplication.willResignActiveNotification, object: nil)
        await coordinator.waitForPendingEvents(for: client)
        await client.waitForAutomaticUpload()

        try await client.flush()
        let rawSecondSnapshot = try await Self.lastSessionSnapshot(from: transport)
        let secondSnapshot = try XCTUnwrap(rawSecondSnapshot)
        XCTAssertEqual(secondSnapshot.sessions, 2)
        XCTAssertEqual(secondSnapshot.sessionSeconds, 180)

        // Unregistering the final scene tears down observers so later notifications are ignored.
        coordinator.unregister(tokenC)

        clock.set(startDate.addingTimeInterval(7_200))
        center.post(name: NSApplication.didBecomeActiveNotification, object: nil)
        await coordinator.waitForPendingEvents(for: client)

        clock.set(startDate.addingTimeInterval(7_320))
        center.post(name: NSApplication.willResignActiveNotification, object: nil)
        await coordinator.waitForPendingEvents(for: client)
        await client.waitForAutomaticUpload()

        try await client.flush()
        let rawFinalSnapshot = try await Self.lastSessionSnapshot(from: transport)
        let finalSnapshot = try XCTUnwrap(rawFinalSnapshot)
        XCTAssertEqual(finalSnapshot.sessions, 2)
        XCTAssertEqual(finalSnapshot.sessionSeconds, 180)
    }

    private static func lastSessionSnapshot(
        from transport: TestAnalyticsTransport
    ) async throws -> (sessions: Int?, sessionSeconds: Int?)? {
        guard let request = await transport.capturedRequests().last else {
            return nil
        }
        let days = try testAnalyticsDays(request)
        guard let lastDay = days.last else {
            return nil
        }
        return (
            sessions: lastDay["sessions"] as? Int,
            sessionSeconds: lastDay["sessionSeconds"] as? Int
        )
    }
}
