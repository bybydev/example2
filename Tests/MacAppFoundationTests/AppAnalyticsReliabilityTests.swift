import Foundation
import Testing
@testable import MacAppFoundation

private actor BlockingAnalyticsTransport: AppAnalyticsTransport {
    enum FirstOutcome: Sendable {
        case success
        case serviceUnavailable
        case rateLimited
    }

    private let firstOutcome: FirstOutcome
    private let blockedRequestIndex: Int
    private var requests: [URLRequest] = []
    private var firstRequestReleased = false
    private var releaseWaiters: [CheckedContinuation<Void, Never>] = []
    private var requestCountWaiters: [(target: Int, continuation: CheckedContinuation<Void, Never>)] = []
    private var inFlightCount = 0
    private var peakConcurrentRequests = 0

    init(firstOutcome: FirstOutcome, blockedRequestIndex: Int = 1) {
        self.firstOutcome = firstOutcome
        self.blockedRequestIndex = blockedRequestIndex
    }

    func data(for request: URLRequest) async throws -> (Data, HTTPURLResponse) {
        inFlightCount += 1
        peakConcurrentRequests = max(peakConcurrentRequests, inFlightCount)
        defer { inFlightCount -= 1 }

        requests.append(request)
        let requestIndex = requests.count
        resolveRequestCountWaiters()

        if requestIndex == blockedRequestIndex {
            if !firstRequestReleased {
                await withCheckedContinuation { continuation in
                    releaseWaiters.append(continuation)
                }
            }

            switch firstOutcome {
            case .success:
                return try testAnalyticsSuccessResponse(for: request)
            case .serviceUnavailable:
                return try testAnalyticsServerErrorResponse(
                    for: request,
                    status: 503,
                    code: "service_disabled",
                    message: "Unavailable.",
                    retryAfter: nil
                )
            case .rateLimited:
                return try testAnalyticsServerErrorResponse(
                    for: request,
                    status: 429,
                    code: "rate_limited",
                    message: "Slow down.",
                    retryAfter: "60"
                )
            }
        }

        return try testAnalyticsSuccessResponse(for: request)
    }

    func releaseFirstRequest() {
        firstRequestReleased = true
        let waiters = releaseWaiters
        releaseWaiters.removeAll()
        waiters.forEach { $0.resume() }
    }

    func waitForRequestCount(_ expected: Int) async {
        guard requests.count < expected else { return }
        await withCheckedContinuation { continuation in
            requestCountWaiters.append((target: expected, continuation: continuation))
        }
    }

    func requestCount() -> Int { requests.count }
    func maxConcurrentRequests() -> Int { peakConcurrentRequests }
    func capturedRequests() -> [URLRequest] { requests }

    private func resolveRequestCountWaiters() {
        let ready = requestCountWaiters.filter { requests.count >= $0.target }
        requestCountWaiters.removeAll { requests.count >= $0.target }
        ready.forEach { $0.continuation.resume() }
    }
}

private actor BlockingFailureAnalyticsTransport: AppAnalyticsTransport {
    private let failFromRequestIndex: Int
    private var requests: [URLRequest] = []
    private var released = false
    private var releaseWaiters: [CheckedContinuation<Void, Never>] = []
    private var requestCountWaiters: [(target: Int, continuation: CheckedContinuation<Void, Never>)] = []

    init(failFromRequestIndex: Int = 1) {
        self.failFromRequestIndex = failFromRequestIndex
    }

    func data(for request: URLRequest) async throws -> (Data, HTTPURLResponse) {
        requests.append(request)
        let index = requests.count
        resolveRequestCountWaiters()

        if index < failFromRequestIndex {
            return try testAnalyticsSuccessResponse(for: request)
        }
        if index == failFromRequestIndex, !released {
            await withCheckedContinuation { continuation in
                releaseWaiters.append(continuation)
            }
        }
        throw URLError(.networkConnectionLost)
    }

    func waitForRequestCount(_ expected: Int) async {
        guard requests.count < expected else { return }
        await withCheckedContinuation { continuation in
            requestCountWaiters.append((target: expected, continuation: continuation))
        }
    }

    func release() {
        released = true
        let waiters = releaseWaiters
        releaseWaiters.removeAll()
        waiters.forEach { $0.resume() }
    }

    func requestCount() -> Int { requests.count }

    private func resolveRequestCountWaiters() {
        let ready = requestCountWaiters.filter { requests.count >= $0.target }
        requestCountWaiters.removeAll { requests.count >= $0.target }
        ready.forEach { $0.continuation.resume() }
    }
}

@Test func automaticAnalyticsUploadRespectsNormalInterval() async throws {
    let clock = TestAnalyticsClock(testAnalyticsDate("2026-09-05T10:00:00Z"))
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 3_600),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { clock.now() }
    )

    try await client.track("first_event")
    await client.waitForAutomaticUpload()
    #expect(await transport.requestCount() == 1)

    clock.advance(by: 60)
    try await client.track("second_event")
    await client.waitForAutomaticUpload()
    #expect(await transport.requestCount() == 1)

    clock.advance(by: 3_541)
    try await client.track("third_event")
    await client.waitForAutomaticUpload()
    #expect(await transport.requestCount() == 2)
}

@Test func rateLimitBackoffSuppressesAutomaticRequestsUntilExpiry() async throws {
    let clock = TestAnalyticsClock(testAnalyticsDate("2026-09-05T10:00:00Z"))
    let transport = TestAnalyticsTransport([
        .server(status: 429, code: "rate_limited", message: "Slow down.", retryAfter: "60"),
    ])
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 0),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { clock.now() }
    )

    try await client.track("first_event")
    await client.waitForAutomaticUpload()
    #expect(await transport.requestCount() == 1)

    try await client.track("second_event")
    await client.waitForAutomaticUpload()
    clock.advance(by: 59)
    try await client.track("third_event")
    await client.waitForAutomaticUpload()
    #expect(await transport.requestCount() == 1)

    clock.advance(by: 2)
    try await client.track("fourth_event")
    await client.waitForAutomaticUpload()
    #expect(await transport.requestCount() == 2)
}

@Test func explicitFlushBypassesBackoffAndSurfacesRateLimit() async throws {
    let clock = TestAnalyticsClock(testAnalyticsDate("2026-09-05T10:00:00Z"))
    let transport = TestAnalyticsTransport([
        .server(status: 429, code: "rate_limited", message: "Slow down.", retryAfter: "60"),
        .server(status: 429, code: "rate_limited", message: "Slow down.", retryAfter: "60"),
    ])
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 0),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { clock.now() }
    )

    try await client.track("first_event")
    await client.waitForAutomaticUpload()
    #expect(await transport.requestCount() == 1)

    do {
        try await client.flush()
        Issue.record("Expected explicit flush to surface the rate-limit error.")
    } catch let error as AppAnalyticsError {
        #expect(error == .server(code: "rate_limited", message: "Slow down.", retryAfter: "60"))
    }

    #expect(await transport.requestCount() == 2)
    #expect(try await client.pendingDayCount() == 1)
}

@Test func transientTransportFailureRetriesSameCumulativeRequest() async throws {
    let transport = TestAnalyticsTransport([
        .transportFailure,
        .success,
    ])
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(transportRetryCount: 1),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { testAnalyticsDate("2026-09-05T10:00:00Z") }
    )

    try await client.track("generation_completed", dimension: "nano", count: 2)
    await client.waitForAutomaticUpload()

    let requests = await transport.capturedRequests()
    #expect(requests.count == 2)
    #expect(requests[0].httpBody == requests[1].httpBody)
    #expect(requests[0].value(forHTTPHeaderField: "X-Request-ID")
            == requests[1].value(forHTTPHeaderField: "X-Request-ID"))
}

@Test func exhaustedTransportRetriesPreservePendingAnalytics() async throws {
    let transport = TestAnalyticsTransport([
        .transportFailure,
        .transportFailure,
    ])
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(transportRetryCount: 1),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { testAnalyticsDate("2026-09-05T10:00:00Z") }
    )

    try await client.track("generation_completed")
    await client.waitForAutomaticUpload()
    #expect(await transport.requestCount() == 2)
    #expect(try await client.pendingDayCount() == 1)

    await transport.enqueue(.success)
    try await client.flush()
    #expect(await transport.requestCount() == 3)

    let request = try #require(await transport.capturedRequests().last)
    let events = try #require(testAnalyticsDays(request)[0]["events"] as? [[String: Any]])
    #expect(events.contains { $0["name"] as? String == "generation_completed" && $0["count"] as? Int == 1 })
}

@Test func serverFailurePreservesPendingAnalyticsForLaterRetry() async throws {
    let transport = TestAnalyticsTransport([
        .server(status: 503, code: "service_disabled", message: "Unavailable.", retryAfter: nil),
    ])
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { testAnalyticsDate("2026-09-05T10:00:00Z") }
    )

    try await client.track("export_completed", count: 3)
    await client.waitForAutomaticUpload()
    #expect(try await client.pendingDayCount() == 1)

    await transport.enqueue(.success)
    try await client.flush()

    let request = try #require(await transport.capturedRequests().last)
    let events = try #require(testAnalyticsDays(request)[0]["events"] as? [[String: Any]])
    #expect(events.contains { $0["name"] as? String == "export_completed" && $0["count"] as? Int == 3 })
}

@Test func partialMultiBatchFailureKeepsUnacceptedBatchRetryable() async throws {
    let clock = TestAnalyticsClock(testAnalyticsDate("2026-09-03T10:00:00Z"))
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 10 * 24 * 60 * 60),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { clock.now() }
    )

    for index in 0..<40 {
        try await client.track("day_one_\(index)")
    }
    await client.waitForAutomaticUpload()
    clock.set(testAnalyticsDate("2026-09-04T10:00:00Z"))
    for index in 0..<40 {
        try await client.track("day_two_\(index)")
    }
    await client.waitForAutomaticUpload()
    clock.set(testAnalyticsDate("2026-09-05T10:00:00Z"))
    for index in 0..<40 {
        try await client.track("day_three_\(index)")
    }
    await client.waitForAutomaticUpload()

    #expect(await transport.requestCount() == 1)
    await transport.enqueue(
        .success,
        .server(status: 503, code: "service_disabled", message: "Unavailable.", retryAfter: nil)
    )

    await #expect(throws: AppAnalyticsError.self) {
        try await client.flush()
    }

    let failedRequests = await transport.capturedRequests()
    #expect(failedRequests.count == 3)
    #expect(try testAnalyticsDays(failedRequests[1]).count == 2)
    #expect(try testAnalyticsDays(failedRequests[2]).count == 1)
    #expect(try await client.pendingDayCount() == 1)

    await transport.enqueue(.success)
    try await client.flush()

    let retriedRequests = await transport.capturedRequests()
    #expect(retriedRequests.count == 4)
    let retriedDays = try testAnalyticsDays(retriedRequests[3])
    #expect(retriedDays.count == 1)
    #expect(retriedDays[0]["day"] as? String == "2026-09-05")
}

@Test func cancelledFlushDoesNotDiscardPendingAnalytics() async throws {
    let clock = TestAnalyticsClock(testAnalyticsDate("2026-09-05T10:00:00Z"))
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 3_600),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { clock.now() }
    )

    try await client.track("first_event")
    try await client.track("second_event")
    await client.waitForAutomaticUpload()
    #expect(await transport.requestCount() == 1)

    await transport.enqueue(.cancelled)
    await #expect(throws: CancellationError.self) {
        try await client.flush()
    }

    #expect(try await client.pendingDayCount() == 1)

    await transport.enqueue(.success)
    try await client.flush()
    let request = try #require(await transport.capturedRequests().last)
    let events = try #require(testAnalyticsDays(request)[0]["events"] as? [[String: Any]])
    #expect(events.count == 2)
}

@Test func automaticAnalyticsUploadDoesNotBlockTrackingAndCoalescesWhileInFlight() async throws {
    let transport = BlockingAnalyticsTransport(firstOutcome: .success)
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 0),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { testAnalyticsDate("2026-09-05T10:00:00Z") }
    )

    try await client.track("first_event")
    await transport.waitForRequestCount(1)

    try await client.track("second_event")
    try await client.track("third_event")
    #expect(await transport.requestCount() == 1)

    await transport.releaseFirstRequest()
    await client.waitForAutomaticUpload()

    try await client.flush()
    let requests = await transport.capturedRequests()
    #expect(requests.count == 2)

    let events = try #require(testAnalyticsDays(requests[1])[0]["events"] as? [[String: Any]])
    let names = Set(events.compactMap { $0["name"] as? String })
    #expect(names == ["first_event", "second_event", "third_event"])
}

@Test func failedInFlightUploadPreservesEventsRecordedWhileRequestWasSuspended() async throws {
    let transport = BlockingAnalyticsTransport(firstOutcome: .serviceUnavailable)
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 0),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { testAnalyticsDate("2026-09-05T10:00:00Z") }
    )

    try await client.track("before_failure")
    await transport.waitForRequestCount(1)
    try await client.track("during_failure")

    await transport.releaseFirstRequest()
    await client.waitForAutomaticUpload()
    #expect(try await client.pendingDayCount() == 1)

    try await client.flush()
    let request = try #require(await transport.capturedRequests().last)
    let events = try #require(testAnalyticsDays(request)[0]["events"] as? [[String: Any]])
    #expect(events.contains { $0["name"] as? String == "before_failure" })
    #expect(events.contains { $0["name"] as? String == "during_failure" })
}

@Test func rateLimitBackoffMergePreservesEventsRecordedDuringUpload() async throws {
    let transport = BlockingAnalyticsTransport(firstOutcome: .rateLimited)
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 0),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { testAnalyticsDate("2026-09-05T10:00:00Z") }
    )

    try await client.track("before_rate_limit")
    await transport.waitForRequestCount(1)
    try await client.track("during_rate_limit")

    await transport.releaseFirstRequest()
    await client.waitForAutomaticUpload()

    try await client.track("while_backed_off")
    await client.waitForAutomaticUpload()
    #expect(await transport.requestCount() == 1)

    try await client.flush()
    let request = try #require(await transport.capturedRequests().last)
    let events = try #require(testAnalyticsDays(request)[0]["events"] as? [[String: Any]])
    let names = Set(events.compactMap { $0["name"] as? String })
    #expect(names == ["before_rate_limit", "during_rate_limit", "while_backed_off"])
}

@Test func concurrentTrackingSerializesLocalStateUpdates() async throws {
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: transport,
        stateStore: TestAnalyticsStateStore(yieldOnAccess: true),
        now: { testAnalyticsDate("2026-09-05T10:00:00Z") }
    )

    try await withThrowingTaskGroup(of: Void.self) { group in
        for index in 0..<20 {
            group.addTask {
                try await client.track("concurrent_\(index)")
            }
        }
        try await group.waitForAll()
    }

    try await client.flush()
    let request = try #require(await transport.capturedRequests().last)
    let events = try #require(testAnalyticsDays(request)[0]["events"] as? [[String: Any]])
    let names = Set(events.compactMap { $0["name"] as? String })

    #expect(names.count == 20)
    for index in 0..<20 {
        #expect(names.contains("concurrent_\(index)"))
    }
}

@Test func explicitFlushWaitsForAutomaticUploadThenRunsSerializedForcedFlush() async throws {
    let transport = BlockingAnalyticsTransport(firstOutcome: .success)
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 0),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { testAnalyticsDate("2026-09-05T10:00:00Z") }
    )

    try await client.track("first_event")
    await transport.waitForRequestCount(1)

    let flushTask = Task {
        try await client.flush()
    }
    await Task.yield()

    #expect(await transport.requestCount() == 1)
    await transport.releaseFirstRequest()
    try await flushTask.value

    #expect(await transport.requestCount() == 2)
    #expect(await transport.maxConcurrentRequests() == 1)
}

@Test func delayedAutomaticFlushUsesExecutionTimeAcrossUTCMidnight() async throws {
    let clock = TestAnalyticsClock(testAnalyticsDate("2026-09-05T23:59:00Z"))
    let transport = BlockingAnalyticsTransport(
        firstOutcome: .success,
        blockedRequestIndex: 2
    )
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 0),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { clock.now() }
    )

    // Establish the first successful automatic upload.
    try await client.track("seed_event")
    await client.waitForAutomaticUpload()
    #expect(await transport.requestCount() == 1)

    // Hold an explicit upload so the next automatic upload is queued behind it.
    let blockingFlush = Task {
        try await client.flush()
    }
    await transport.waitForRequestCount(2)

    // This schedules an automatic flush while the clock is still on September 5.
    try await client.track("before_midnight")

    // A newer event is persisted on September 6 before that automatic flush can start.
    clock.set(testAnalyticsDate("2026-09-06T00:01:00Z"))
    try await client.track("after_midnight")

    await transport.releaseFirstRequest()
    try await blockingFlush.value
    await client.waitForAutomaticUpload()

    let request = try #require(await transport.capturedRequests().last)
    let days = try testAnalyticsDays(request)
    #expect(days.compactMap { $0["day"] as? String } == ["2026-09-05", "2026-09-06"])

    let allEvents = days.flatMap { day in
        (day["events"] as? [[String: Any]]) ?? []
    }
    let names = Set(allEvents.compactMap { $0["name"] as? String })
    #expect(names.contains("before_midnight"))
    #expect(names.contains("after_midnight"))
}

@Test func disablingMidFlightStopsRemainingBatchesAndDoesNotMergeState() async throws {
    let clock = TestAnalyticsClock(testAnalyticsDate("2026-09-03T10:00:00Z"))
    let transport = BlockingAnalyticsTransport(
        firstOutcome: .success,
        blockedRequestIndex: 2
    )
    let store = TestAnalyticsStateStore()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 10 * 24 * 60 * 60),
        transport: transport,
        stateStore: store,
        now: { clock.now() }
    )

    for index in 0..<40 {
        try await client.track("day_one_\(index)")
    }
    await client.waitForAutomaticUpload()
    clock.set(testAnalyticsDate("2026-09-04T10:00:00Z"))
    for index in 0..<40 {
        try await client.track("day_two_\(index)")
    }
    await client.waitForAutomaticUpload()
    clock.set(testAnalyticsDate("2026-09-05T10:00:00Z"))
    for index in 0..<40 {
        try await client.track("day_three_\(index)")
    }
    await client.waitForAutomaticUpload()
    #expect(await transport.requestCount() == 1)

    // Start a multi-batch explicit flush and block on its first batch (request #2).
    let flushTask = Task {
        try? await client.flush()
    }
    await transport.waitForRequestCount(2)

    // Disable analytics while the first batch of the flush is suspended in flight.
    await client.setEnabled(false)
    await transport.releaseFirstRequest()
    await flushTask.value

    // The second batch must not be sent and local state must remain cleared.
    #expect(await transport.requestCount() == 2)
    #expect(try await store.load() == nil)
    #expect(try await client.pendingDayCount() == 0)
}

@Test func disablingAndReEnablingDuringInFlightUploadFencesStaleUploadAndFlushesNewGeneration() async throws {
    let transport = BlockingAnalyticsTransport(firstOutcome: .success)
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 0),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { testAnalyticsDate("2026-09-05T10:00:00Z") }
    )

    try await client.track("before_disable")
    await transport.waitForRequestCount(1)

    await client.setEnabled(false)
    await client.setEnabled(true)
    try await client.track("after_reenable")

    await transport.releaseFirstRequest()
    await client.waitForAutomaticUpload()

    let requests = await transport.capturedRequests()
    #expect(requests.count == 2)

    let latestEvents = try #require(testAnalyticsDays(requests[1])[0]["events"] as? [[String: Any]])
    let names = Set(latestEvents.compactMap { $0["name"] as? String })
    #expect(names == ["after_reenable"])
}

@Test func disablingDuringFailingFlushFencesOffTransportRetries() async throws {
    let transport = BlockingFailureAnalyticsTransport(failFromRequestIndex: 2)
    let store = TestAnalyticsStateStore()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(
            uploadInterval: 86_400,
            transportRetryCount: 2
        ),
        transport: transport,
        stateStore: store,
        now: { testAnalyticsDate("2026-09-05T10:00:00Z") }
    )

    try await client.track("retry_fenced_event")
    await client.waitForAutomaticUpload()
    #expect(await transport.requestCount() == 1)

    let flushTask = Task {
        try? await client.flush()
    }
    await transport.waitForRequestCount(2)

    await client.setEnabled(false)
    await transport.release()
    await flushTask.value

    #expect(await transport.requestCount() == 2)
    #expect(try await store.load() == nil)
}

@Test func resetLocalStateDuringInFlightUploadPreventsStaleMetadataMerge() async throws {
    let transport = BlockingAnalyticsTransport(firstOutcome: .success)
    let store = TestAnalyticsStateStore()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: transport,
        stateStore: store,
        now: { testAnalyticsDate("2026-09-05T10:00:00Z") }
    )

    try await client.track("before_reset")
    await transport.waitForRequestCount(1)

    try await client.resetLocalState()
    await transport.releaseFirstRequest()
    await client.waitForAutomaticUpload()

    #expect(try await store.load() == nil)
    #expect(try await client.pendingDayCount() == 0)
}

@Test func retryAfterRejectsNonFiniteAndClampsHugeValues() {
    let now = testAnalyticsDate("2026-09-05T10:00:00Z")

    let infError = AppAnalyticsError.server(
        code: "rate_limited",
        message: "Slow down",
        retryAfter: "inf"
    )
    #expect(
        AppAnalyticsClient.automaticRetryDate(for: infError, relativeTo: now)
            == now.addingTimeInterval(60)
    )

    let nanError = AppAnalyticsError.server(
        code: "http_429",
        message: "Too many requests",
        retryAfter: "nan"
    )
    #expect(
        AppAnalyticsClient.automaticRetryDate(for: nanError, relativeTo: now)
            == now.addingTimeInterval(60)
    )

    let hugeError = AppAnalyticsError.server(
        code: "rate_limited",
        message: "Slow down",
        retryAfter: "99999999"
    )
    #expect(
        AppAnalyticsClient.automaticRetryDate(for: hugeError, relativeTo: now)
            == now.addingTimeInterval(24 * 60 * 60)
    )
}

@Test func lifecycleMethodsDefaultToInjectedClock() async throws {
    let clock = TestAnalyticsClock(testAnalyticsDate("2026-09-05T10:00:00Z"))
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { clock.now() }
    )

    try await client.applicationDidBecomeActive()
    clock.advance(by: 300)
    try await client.applicationWillResignActive()
    await client.waitForAutomaticUpload()
    try await client.flush()

    let request = try #require(await transport.capturedRequests().last)
    let day = try #require(testAnalyticsDays(request).first)
    #expect(day["day"] as? String == "2026-09-05")
    #expect(day["sessions"] as? Int == 1)
    #expect(day["sessionSeconds"] as? Int == 300)
}

@Test func batchesSplitWhenEncodedPayloadWouldExceedServerByteLimit() async throws {
    let clock = TestAnalyticsClock(testAnalyticsDate("2026-09-01T10:00:00Z"))
    let transport = TestAnalyticsTransport()
    let store = TestAnalyticsStateStore()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 10 * 24 * 60 * 60),
        transport: transport,
        stateStore: store,
        now: { clock.now() }
    )

    let longDimension = String(repeating: "d", count: 64)
    let longComponent = String(repeating: "c", count: 48)
    let eventSuffix = String(repeating: "e", count: 39)
    let errorSuffix = String(repeating: "x", count: 39)

    for dayOffset in 0..<7 {
        clock.set(
            testAnalyticsDate("2026-09-01T10:00:00Z")
                .addingTimeInterval(TimeInterval(dayOffset * 86_400))
        )
        for eventIndex in 0..<14 {
            let padded = eventIndex < 10 ? "0\(eventIndex)" : "\(eventIndex)"
            try await client.track("event_\(padded)_\(eventSuffix)", dimension: longDimension)
            if dayOffset == 0 && eventIndex == 0 {
                await client.waitForAutomaticUpload()
            }
        }
        for errorIndex in 0..<20 {
            let padded = errorIndex < 10 ? "0\(errorIndex)" : "\(errorIndex)"
            try await client.trackError("error_\(padded)_\(errorSuffix)", component: longComponent)
        }
    }
    await client.waitForAutomaticUpload()

    let beforeFlushCount = await transport.requestCount()
    try await client.flush()

    let requests = Array((await transport.capturedRequests()).dropFirst(beforeFlushCount))
    #expect(requests.count >= 2)
    for request in requests {
        let body = try #require(request.httpBody)
        #expect(body.count <= 32 * 1024)
    }
}
