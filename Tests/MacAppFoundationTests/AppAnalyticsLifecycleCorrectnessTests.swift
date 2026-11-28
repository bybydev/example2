import Foundation
import Testing
@testable import MacAppFoundation

@Test func sameDayAnalyticsEventsRemainCumulativeAcrossUploads() async throws {
    let timestamp = testAnalyticsDate("2026-09-05T10:00:00Z")
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 0),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { timestamp }
    )

    try await client.track("generation_completed", count: 2)
    await client.waitForAutomaticUpload()
    try await client.track("generation_completed", count: 3)
    await client.waitForAutomaticUpload()

    let requests = await transport.capturedRequests()
    #expect(requests.count == 2)

    let firstDay = try testAnalyticsDay(requests[0], day: "2026-09-05")
    let secondDay = try testAnalyticsDay(requests[1], day: "2026-09-05")
    #expect(try testAnalyticsEvent(firstDay, name: "generation_completed")["count"] as? Int == 2)
    #expect(try testAnalyticsEvent(secondDay, name: "generation_completed")["count"] as? Int == 5)
}

@Test func analyticsDimensionsAccumulateAsIndependentCounters() async throws {
    let timestamp = testAnalyticsDate("2026-09-05T10:00:00Z")
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 0),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { timestamp }
    )

    try await client.track("generation_completed", dimension: "nano", count: 2)
    await client.waitForAutomaticUpload()
    try await client.track("generation_completed", dimension: "turbo", count: 3)
    await client.waitForAutomaticUpload()
    try await client.track("generation_completed", dimension: "nano", count: 4)
    await client.waitForAutomaticUpload()

    let request = try #require(await transport.capturedRequests().last)
    let day = try testAnalyticsDay(request, day: "2026-09-05")
    let events = try testAnalyticsEvents(day)
    #expect(events.count == 2)
    #expect(try testAnalyticsEvent(day, name: "generation_completed", dimension: "nano")["count"] as? Int == 6)
    #expect(try testAnalyticsEvent(day, name: "generation_completed", dimension: "turbo")["count"] as? Int == 3)
}

@Test func repeatedFlushResendsEquivalentCumulativeSnapshot() async throws {
    let timestamp = testAnalyticsDate("2026-09-05T10:00:00Z")
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { timestamp }
    )

    try await client.track("generation_completed", dimension: "nano", count: 7)
    try await client.flush()
    try await client.flush()

    let requests = await transport.capturedRequests()
    #expect(requests.count == 3)

    for request in requests {
        let day = try testAnalyticsDay(request, day: "2026-09-05")
        #expect(day["sessions"] as? Int == 0)
        #expect(day["sessionSeconds"] as? Int == 0)
        #expect(try testAnalyticsEvent(day, name: "generation_completed", dimension: "nano")["count"] as? Int == 7)
    }
}

@Test func sessionSnapshotsRemainCumulativeAcrossUploads() async throws {
    let clock = TestAnalyticsClock(testAnalyticsDate("2026-09-05T10:00:00Z"))
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { clock.now() }
    )

    try await client.applicationDidBecomeActive(at: testAnalyticsDate("2026-09-05T10:00:00Z"))
    try await client.applicationWillResignActive(at: testAnalyticsDate("2026-09-05T10:10:00Z"))
    clock.set(testAnalyticsDate("2026-09-05T10:10:00Z"))
    try await client.flush()

    try await client.applicationDidBecomeActive(at: testAnalyticsDate("2026-09-05T10:20:00Z"))
    try await client.applicationWillResignActive(at: testAnalyticsDate("2026-09-05T10:25:00Z"))
    clock.set(testAnalyticsDate("2026-09-05T10:25:00Z"))
    try await client.flush()

    let requests = await transport.capturedRequests()
    #expect(requests.count == 3)
    let firstCheckpoint = try testAnalyticsDay(requests[1], day: "2026-09-05")
    let secondCheckpoint = try testAnalyticsDay(requests[2], day: "2026-09-05")

    #expect(firstCheckpoint["sessions"] as? Int == 1)
    #expect(firstCheckpoint["sessionSeconds"] as? Int == 600)
    #expect(secondCheckpoint["sessions"] as? Int == 1)
    #expect(secondCheckpoint["sessionSeconds"] as? Int == 900)
}

@Test func activeSessionDurationSplitsAcrossUTCMidnight() async throws {
    let clock = TestAnalyticsClock(testAnalyticsDate("2026-09-05T23:55:00Z"))
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { clock.now() }
    )

    try await client.applicationDidBecomeActive(at: testAnalyticsDate("2026-09-05T23:55:00Z"))
    await client.waitForAutomaticUpload()

    clock.set(testAnalyticsDate("2026-09-06T00:05:00Z"))
    try await client.applicationWillResignActive(at: testAnalyticsDate("2026-09-06T00:05:00Z"))
    await client.waitForAutomaticUpload()
    try await client.flush()

    let request = try #require(await transport.capturedRequests().last)
    let dayOne = try testAnalyticsDay(request, day: "2026-09-05")
    let dayTwo = try testAnalyticsDay(request, day: "2026-09-06")

    #expect(dayOne["sessions"] as? Int == 1)
    #expect(dayOne["sessionSeconds"] as? Int == 300)
    #expect(dayTwo["sessions"] as? Int == 0)
    #expect(dayTwo["sessionSeconds"] as? Int == 300)
}

@Test func thirtyMinuteBoundaryResumesButOneSecondBeyondStartsNewSession() async throws {
    let exactClock = TestAnalyticsClock(testAnalyticsDate("2026-09-05T10:00:00Z"))
    let exactTransport = TestAnalyticsTransport()
    let exactClient = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: exactTransport,
        stateStore: TestAnalyticsStateStore(),
        now: { exactClock.now() }
    )

    try await exactClient.applicationDidBecomeActive(at: testAnalyticsDate("2026-09-05T10:00:00Z"))
    try await exactClient.applicationWillResignActive(at: testAnalyticsDate("2026-09-05T10:10:00Z"))
    try await exactClient.applicationDidBecomeActive(at: testAnalyticsDate("2026-09-05T10:40:00Z"))
    try await exactClient.applicationWillResignActive(at: testAnalyticsDate("2026-09-05T10:45:00Z"))
    exactClock.set(testAnalyticsDate("2026-09-05T10:45:00Z"))
    try await exactClient.flush()

    let exactRequest = try #require(await exactTransport.capturedRequests().last)
    let exactDay = try testAnalyticsDay(exactRequest, day: "2026-09-05")
    #expect(exactDay["sessions"] as? Int == 1)
    #expect(exactDay["sessionSeconds"] as? Int == 900)

    let beyondClock = TestAnalyticsClock(testAnalyticsDate("2026-09-05T10:00:00Z"))
    let beyondTransport = TestAnalyticsTransport()
    let beyondClient = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: beyondTransport,
        stateStore: TestAnalyticsStateStore(),
        now: { beyondClock.now() }
    )

    try await beyondClient.applicationDidBecomeActive(at: testAnalyticsDate("2026-09-05T10:00:00Z"))
    try await beyondClient.applicationWillResignActive(at: testAnalyticsDate("2026-09-05T10:10:00Z"))
    try await beyondClient.applicationDidBecomeActive(at: testAnalyticsDate("2026-09-05T10:40:01Z"))
    try await beyondClient.applicationWillResignActive(at: testAnalyticsDate("2026-09-05T10:45:01Z"))
    beyondClock.set(testAnalyticsDate("2026-09-05T10:45:01Z"))
    try await beyondClient.flush()

    let beyondRequest = try #require(await beyondTransport.capturedRequests().last)
    let beyondDay = try testAnalyticsDay(beyondRequest, day: "2026-09-05")
    #expect(beyondDay["sessions"] as? Int == 2)
    #expect(beyondDay["sessionSeconds"] as? Int == 900)
}

@Test func duplicateLifecycleNotificationsDoNotMoveInactiveSessionBoundary() async throws {
    let clock = TestAnalyticsClock(testAnalyticsDate("2026-09-05T10:00:00Z"))
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { clock.now() }
    )

    try await client.applicationDidBecomeActive(at: testAnalyticsDate("2026-09-05T10:00:00Z"))
    try await client.applicationDidBecomeActive(at: testAnalyticsDate("2026-09-05T10:05:00Z"))
    try await client.applicationWillResignActive(at: testAnalyticsDate("2026-09-05T10:10:00Z"))
    try await client.applicationWillResignActive(at: testAnalyticsDate("2026-09-05T10:20:00Z"))
    try await client.applicationDidBecomeActive(at: testAnalyticsDate("2026-09-05T10:45:00Z"))
    try await client.applicationWillResignActive(at: testAnalyticsDate("2026-09-05T10:50:00Z"))
    clock.set(testAnalyticsDate("2026-09-05T10:50:00Z"))
    try await client.flush()

    let request = try #require(await transport.capturedRequests().last)
    let day = try testAnalyticsDay(request, day: "2026-09-05")
    #expect(day["sessions"] as? Int == 2)
    #expect(day["sessionSeconds"] as? Int == 900)
}

@Test func longActiveSessionIsNotExpiredByInactiveTimeout() async throws {
    let clock = TestAnalyticsClock(testAnalyticsDate("2026-09-05T10:00:00Z"))
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { clock.now() }
    )

    try await client.applicationDidBecomeActive(at: testAnalyticsDate("2026-09-05T10:00:00Z"))

    clock.set(testAnalyticsDate("2026-09-05T10:40:00Z"))
    try await client.track("long_active_checkpoint")
    try await client.applicationDidBecomeActive(at: testAnalyticsDate("2026-09-05T10:45:00Z"))
    try await client.applicationWillResignActive(at: testAnalyticsDate("2026-09-05T10:50:00Z"))

    clock.set(testAnalyticsDate("2026-09-05T10:50:00Z"))
    try await client.flush()

    let request = try #require(await transport.capturedRequests().last)
    let day = try testAnalyticsDay(request, day: "2026-09-05")
    #expect(day["sessions"] as? Int == 1)
    #expect(day["sessionSeconds"] as? Int == 3_000)
    #expect(try testAnalyticsEvent(day, name: "long_active_checkpoint")["count"] as? Int == 1)
}

@Test func recreatedClientContinuesPersistedCumulativeState() async throws {
    let clock = TestAnalyticsClock(testAnalyticsDate("2026-09-05T10:00:00Z"))
    let firstTransport = TestAnalyticsTransport()
    let secondTransport = TestAnalyticsTransport()
    let store = TestAnalyticsStateStore()
    let configuration = makeTestAnalyticsConfiguration(uploadInterval: 86_400)

    let firstClient = AppAnalyticsClient(
        configuration: configuration,
        transport: firstTransport,
        stateStore: store,
        now: { clock.now() }
    )

    try await firstClient.track("generation_completed", dimension: "nano", count: 2)
    try await firstClient.applicationDidBecomeActive(at: testAnalyticsDate("2026-09-05T10:00:00Z"))
    try await firstClient.applicationWillResignActive(at: testAnalyticsDate("2026-09-05T10:10:00Z"))
    await firstClient.waitForAutomaticUpload()

    clock.set(testAnalyticsDate("2026-09-05T10:20:00Z"))
    let secondClient = AppAnalyticsClient(
        configuration: configuration,
        transport: secondTransport,
        stateStore: store,
        now: { clock.now() }
    )

    try await secondClient.track("generation_completed", dimension: "nano", count: 3)
    try await secondClient.applicationDidBecomeActive(at: testAnalyticsDate("2026-09-05T10:20:00Z"))
    try await secondClient.applicationWillResignActive(at: testAnalyticsDate("2026-09-05T10:25:00Z"))
    clock.set(testAnalyticsDate("2026-09-05T10:25:00Z"))
    try await secondClient.flush()

    let request = try #require(await secondTransport.capturedRequests().last)
    let day = try testAnalyticsDay(request, day: "2026-09-05")
    #expect(day["sessions"] as? Int == 1)
    #expect(day["sessionSeconds"] as? Int == 900)
    #expect(try testAnalyticsEvent(day, name: "generation_completed", dimension: "nano")["count"] as? Int == 5)
}
