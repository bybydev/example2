import AppKit
import Foundation
import SwiftUI
import XCTest
@testable import MacAppFoundation

final class AppAnalyticsEnvironmentTests: XCTestCase {
    func testAnalyticsEnvironmentDefaultsToNil() {
        let values = EnvironmentValues()
        XCTAssertNil(values.appAnalytics)
    }

    func testAnalyticsEnvironmentCanCarrySharedClient() throws {
        let baseURL = try XCTUnwrap(URL(string: "https://analytics.example.com"))
        let configuration = AppAnalyticsConfiguration(
            appID: "test-app",
            baseURL: baseURL
        )
        XCTAssertEqual(configuration.baseURL, baseURL)

        let client = AppAnalyticsClient(configuration: configuration)
        var values = EnvironmentValues()

        values.appAnalytics = client

        XCTAssertTrue(values.appAnalytics === client)
    }

    @MainActor
    func testLifecycleCoordinatorDeduplicatesNotificationsAcrossMultipleScenes() async throws {
        let center = NotificationCenter()
        let store = LifecycleCoordinatorMemoryStore()
        let transport = LifecycleCoordinatorMockTransport()
        let startDate = Date(timeIntervalSince1970: 1_788_602_400)
        let clock = LifecycleCoordinatorClock(startDate)
        let client = AppAnalyticsClient(
            configuration: AppAnalyticsConfiguration(
                appID: "lifecycle-dedupe",
                baseURL: try XCTUnwrap(URL(string: "https://analytics.example.com")),
                uploadInterval: 86_400,
                transportRetryCount: 0,
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

        let tokenA = coordinator.register(client)
        let tokenB = coordinator.register(client)
        let tokenC = coordinator.register(client)
        await coordinator.waitForPendingEvents(for: client)
        await client.waitForAutomaticUpload()

        let savesAfterRegister = await store.saveCount()
        XCTAssertEqual(savesAfterRegister, 3)

        clock.set(startDate.addingTimeInterval(60))
        center.post(name: NSApplication.willResignActiveNotification, object: nil)
        await coordinator.waitForPendingEvents(for: client)
        await client.waitForAutomaticUpload()

        let savesAfterResign = await store.saveCount()
        XCTAssertEqual(savesAfterResign, 5)

        coordinator.unregister(tokenA)
        coordinator.unregister(tokenB)
        coordinator.unregister(tokenC)

        clock.set(startDate.addingTimeInterval(3_600))
        center.post(name: NSApplication.didBecomeActiveNotification, object: nil)
        await coordinator.waitForPendingEvents(for: client)
        await client.waitForAutomaticUpload()

        let savesAfterUnregister = await store.saveCount()
        XCTAssertEqual(savesAfterUnregister, 5)

        try await client.flush()
        let snapshot = await transport.lastSessionSnapshot()
        XCTAssertEqual(snapshot.sessions, 1)
        XCTAssertEqual(snapshot.sessionSeconds, 60)
    }
}

private final class LifecycleCoordinatorClock: @unchecked Sendable {
    private let lock = NSLock()
    private var value: Date

    init(_ value: Date) {
        self.value = value
    }

    func now() -> Date {
        lock.lock()
        defer { lock.unlock() }
        return value
    }

    func set(_ value: Date) {
        lock.lock()
        self.value = value
        lock.unlock()
    }
}

private actor LifecycleCoordinatorMemoryStore: AppAnalyticsStateStoring {
    private var data: Data?
    private var saves = 0

    func load() async throws -> Data? { data }

    func save(_ data: Data) async throws {
        self.data = data
        saves += 1
    }

    func remove() async throws {
        data = nil
    }

    func saveCount() -> Int {
        saves
    }
}

private actor LifecycleCoordinatorMockTransport: AppAnalyticsTransport {
    private var lastSessions: Int?
    private var lastSessionSeconds: Int?

    func data(for request: URLRequest) async throws -> (Data, HTTPURLResponse) {
        let response = HTTPURLResponse(
            url: request.url!,
            statusCode: 200,
            httpVersion: nil,
            headerFields: nil
        )!
        let body = request.httpBody ?? Data()
        let json = (try? JSONSerialization.jsonObject(with: body) as? [String: Any]) ?? [:]
        let requestID = json["requestId"] as? String ?? ""
        let days = json["days"] as? [[String: Any]] ?? []
        if let lastDay = days.last {
            lastSessions = lastDay["sessions"] as? Int
            lastSessionSeconds = lastDay["sessionSeconds"] as? Int
        }
        let acceptedDays = days.compactMap { $0["day"] as? String }
        let payload: [String: Any] = [
            "ok": true,
            "requestId": requestID,
            "acceptedDays": acceptedDays,
        ]
        return (try JSONSerialization.data(withJSONObject: payload), response)
    }

    func lastSessionSnapshot() -> (sessions: Int?, sessionSeconds: Int?) {
        (lastSessions, lastSessionSeconds)
    }
}
