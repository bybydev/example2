import Foundation
import Testing
@testable import MacAppFoundation

@Test func analyticsRetentionKeepsSixDayOldSnapshotAndPrunesSevenDayOldSnapshot() async throws {
    let now = testAnalyticsDate("2026-09-08T12:00:00Z")
    let state = try testAnalyticsPersistedState(days: [
        "2026-09-01": testAnalyticsPersistedDay(events: [("old_event", nil, 1)]),
        "2026-09-02": testAnalyticsPersistedDay(events: [("kept_event", nil, 1)]),
    ])
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: transport,
        stateStore: TestAnalyticsStateStore(data: state),
        now: { now }
    )

    try await client.flush()

    let request = try #require(await transport.capturedRequests().first)
    let days = try testAnalyticsDays(request)
    #expect(days.count == 1)
    #expect(days[0]["day"] as? String == "2026-09-02")
}

@Test func analyticsBatchContainsAtMostSevenUTCdays() async throws {
    let seededDays = [
        "2026-09-01",
        "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05",
        "2026-09-06", "2026-09-07", "2026-09-08",
        "2026-09-09",
    ]
    let state = try testAnalyticsPersistedState(days: Dictionary(uniqueKeysWithValues: seededDays.map {
        ($0, testAnalyticsPersistedDay(events: [("daily_event", nil, 1)]))
    }))
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: transport,
        stateStore: TestAnalyticsStateStore(data: state),
        now: { testAnalyticsDate("2026-09-08T12:00:00Z") }
    )

    try await client.flush()

    let requests = await transport.capturedRequests()
    #expect(requests.count == 1)
    let sentDays = try testAnalyticsDays(requests[0]).compactMap { $0["day"] as? String }
    #expect(sentDays == [
        "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05",
        "2026-09-06", "2026-09-07", "2026-09-08",
    ])
}

@Test func analyticsHundredCounterBatchLimitSplitsLargeSnapshotSet() async throws {
    let state = try testAnalyticsPersistedState(days: [
        "2026-09-06": testAnalyticsPersistedDay(events: testAnalyticsEventCounters(40, prefix: "first")),
        "2026-09-07": testAnalyticsPersistedDay(events: testAnalyticsEventCounters(40, prefix: "second")),
        "2026-09-08": testAnalyticsPersistedDay(events: testAnalyticsEventCounters(40, prefix: "third")),
    ])
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: transport,
        stateStore: TestAnalyticsStateStore(data: state),
        now: { testAnalyticsDate("2026-09-08T12:00:00Z") }
    )

    try await client.flush()

    let requests = await transport.capturedRequests()
    #expect(requests.count == 2)
    let firstCounters = try testAnalyticsDays(requests[0]).reduce(0) { total, day in
        total + (try testAnalyticsEvents(day).count)
    }
    let secondCounters = try testAnalyticsDays(requests[1]).reduce(0) { total, day in
        total + (try testAnalyticsEvents(day).count)
    }
    #expect(firstCounters == 80)
    #expect(secondCounters == 40)
    #expect(firstCounters <= 100)
    #expect(secondCounters <= 100)
}

@Test func analyticsAllowsExactlyFiftyCountersButRejectsFiftyFirstUniqueCounter() async throws {
    let timestamp = testAnalyticsDate("2026-09-08T12:00:00Z")
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { timestamp }
    )

    for index in 0..<50 {
        try await client.track("event_\(String(format: "%02d", index))")
    }

    await #expect(throws: AppAnalyticsError.self) {
        try await client.track("event_50")
    }

    try await client.flush()
    let request = try #require(await transport.capturedRequests().last)
    let day = try #require(testAnalyticsDays(request).first)
    #expect(try testAnalyticsEvents(day).count == 50)
}

@Test func analyticsEventCountSaturatesAtServerMaximum() async throws {
    let timestamp = testAnalyticsDate("2026-09-08T12:00:00Z")
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { timestamp }
    )

    try await client.track("generation_completed", count: 499)
    try await client.track("generation_completed", count: 10)
    try await client.flush()

    let request = try #require(await transport.capturedRequests().last)
    let day = try #require(testAnalyticsDays(request).first)
    let event = try #require(testAnalyticsEvents(day).first)
    #expect(event["count"] as? Int == 500)
}

@Test func analyticsRejectsMoreThanTwoThousandTotalEventsPerDay() async throws {
    let timestamp = testAnalyticsDate("2026-09-08T12:00:00Z")
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: TestAnalyticsTransport(),
        stateStore: TestAnalyticsStateStore(),
        now: { timestamp }
    )

    try await client.track("event_one", count: 500)
    try await client.track("event_two", count: 500)
    try await client.track("event_three", count: 500)
    try await client.track("event_four", count: 500)

    await #expect(throws: AppAnalyticsError.self) {
        try await client.track("event_five")
    }
}

@Test func analyticsStoredSessionValuesAreBoundedToServerCaps() async throws {
    let state = try testAnalyticsPersistedState(days: [
        "2026-09-08": testAnalyticsPersistedDay(
            sessions: 1_500,
            sessionSeconds: 100_000,
            events: []
        ),
    ])
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: transport,
        stateStore: TestAnalyticsStateStore(data: state),
        now: { testAnalyticsDate("2026-09-08T12:00:00Z") }
    )

    try await client.flush()

    let request = try #require(await transport.capturedRequests().first)
    let day = try #require(testAnalyticsDays(request).first)
    #expect(day["sessions"] as? Int == 1_000)
    #expect(day["sessionSeconds"] as? Int == 86_400)
}

@Test func analyticsTokenBoundariesMatchServerContract() async throws {
    let timestamp = testAnalyticsDate("2026-09-08T12:00:00Z")
    let validName = "a" + String(repeating: "b", count: 47)
    let invalidName = "a" + String(repeating: "b", count: 48)
    let validDimension = "A" + String(repeating: "b", count: 63)
    let invalidDimension = "A" + String(repeating: "b", count: 64)
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { timestamp }
    )

    try await client.track(validName, dimension: validDimension)

    await #expect(throws: AppAnalyticsError.self) {
        try await client.track(invalidName)
    }
    await #expect(throws: AppAnalyticsError.self) {
        try await client.track("valid_name", dimension: invalidDimension)
    }
    await #expect(throws: AppAnalyticsError.self) {
        try await client.track("Uppercase")
    }
    await #expect(throws: AppAnalyticsError.self) {
        try await client.track("valid_name", dimension: "-invalid")
    }
}

@Test func analyticsAppVersionBoundaryIsSentWhenValidAndOmittedWhenInvalid() async throws {
    let timestamp = testAnalyticsDate("2026-09-08T12:00:00Z")
    let validVersion = "A" + String(repeating: "b", count: 63)
    let validTransport = TestAnalyticsTransport()
    let validClient = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(appVersion: validVersion, uploadInterval: 86_400),
        transport: validTransport,
        stateStore: TestAnalyticsStateStore(),
        now: { timestamp }
    )

    try await validClient.track("generation_completed")
    await validClient.waitForAutomaticUpload()
    let validRequest = try #require(await validTransport.capturedRequests().first)
    let validDay = try #require(testAnalyticsDays(validRequest).first)
    #expect(validRequest.value(forHTTPHeaderField: "X-App-Version") == validVersion)
    #expect(validDay["appVersion"] as? String == validVersion)

    let invalidVersion = "A" + String(repeating: "b", count: 64)
    let invalidTransport = TestAnalyticsTransport()
    let invalidClient = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(appVersion: invalidVersion, uploadInterval: 86_400),
        transport: invalidTransport,
        stateStore: TestAnalyticsStateStore(),
        now: { timestamp }
    )

    try await invalidClient.track("generation_completed")
    await invalidClient.waitForAutomaticUpload()
    let invalidRequest = try #require(await invalidTransport.capturedRequests().first)
    let invalidDay = try #require(testAnalyticsDays(invalidRequest).first)
    #expect(invalidRequest.value(forHTTPHeaderField: "X-App-Version") == nil)
    #expect(invalidDay["appVersion"] == nil)
}

@Test func oversizedPersistedAnalyticsBatchIsRejectedBeforeTransport() async throws {
    let oversizedEvents: [(String, String?, Int)] = (0..<40).map { index in
        ("e\(index)_" + String(repeating: "x", count: 1_000), nil, 1)
    }
    let state = try testAnalyticsPersistedState(days: [
        "2026-09-08": testAnalyticsPersistedDay(events: oversizedEvents),
    ])
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: transport,
        stateStore: TestAnalyticsStateStore(data: state),
        now: { testAnalyticsDate("2026-09-08T12:00:00Z") }
    )

    do {
        try await client.flush()
        Issue.record("Expected oversized analytics batch to fail with invalidConfiguration.")
    } catch let error as AppAnalyticsError {
        guard case .invalidConfiguration = error else {
            Issue.record("Expected invalidConfiguration error, got \(error).")
            return
        }
    }
    #expect(await transport.requestCount() == 0)
}

@Test func analyticsRejectsMismatchedResponseRequestIDWithoutDroppingState() async throws {
    let state = try testAnalyticsPersistedState(days: [
        "2026-09-08": testAnalyticsPersistedDay(events: [("generation_completed", nil, 1)]),
    ])
    let store = TestAnalyticsStateStore(data: state)
    let transport = TestAnalyticsTransport([.invalidRequestID])
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: transport,
        stateStore: store,
        now: { testAnalyticsDate("2026-09-08T12:00:00Z") }
    )

    do {
        try await client.flush()
        Issue.record("Expected mismatched requestId response to fail with invalidResponse.")
    } catch let error as AppAnalyticsError {
        #expect(error == .invalidResponse)
    }
    #expect(await transport.requestCount() == 1)
    #expect(try await client.pendingDayCount() == 1)
}

@Test func analyticsRejectsMissingExtraOrReorderedAcceptedDays() async throws {
    let days = [
        "2026-09-07": testAnalyticsPersistedDay(events: [("first_event", nil, 1)]),
        "2026-09-08": testAnalyticsPersistedDay(events: [("second_event", nil, 1)]),
    ]
    let now = testAnalyticsDate("2026-09-08T12:00:00Z")
    let invalidOutcomes: [TestAnalyticsTransport.Outcome] = [
        .acceptedDays(["2026-09-07"]),
        .acceptedDays(["2026-09-07", "2026-09-08", "2026-09-06"]),
        .reverseAcceptedDays,
    ]

    for outcome in invalidOutcomes {
        let transport = TestAnalyticsTransport([outcome])
        let client = AppAnalyticsClient(
            configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
            transport: transport,
            stateStore: TestAnalyticsStateStore(data: try testAnalyticsPersistedState(days: days)),
            now: { now }
        )

        do {
            try await client.flush()
            Issue.record("Expected invalid acceptedDays response to fail with invalidResponse.")
        } catch let error as AppAnalyticsError {
            #expect(error == .invalidResponse)
        }
        #expect(await transport.requestCount() == 1)
        #expect(try await client.pendingDayCount() == 2)
    }
}

@Test func analyticsStructuredServerErrorsPreserveCodeMessageAndRetryAfter() async throws {
    let cases: [(Int, String, String, String?)] = [
        (401, "attestation_required", "Attestation required.", nil),
        (403, "installation_suspended", "Installation suspended.", nil),
        (429, "rate_limited", "Slow down.", "60"),
        (503, "app_disabled", "Analytics disabled.", "120"),
    ]

    for (status, code, message, retryAfter) in cases {
        let state = try testAnalyticsPersistedState(days: [
            "2026-09-08": testAnalyticsPersistedDay(events: [("generation_completed", nil, 1)]),
        ])
        let transport = TestAnalyticsTransport([
            .server(status: status, code: code, message: message, retryAfter: retryAfter),
        ])
        let client = AppAnalyticsClient(
            configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
            transport: transport,
            stateStore: TestAnalyticsStateStore(data: state),
            now: { testAnalyticsDate("2026-09-08T12:00:00Z") }
        )

        do {
            try await client.flush()
            Issue.record("Expected server error \(code).")
        } catch let error as AppAnalyticsError {
            #expect(error == .server(code: code, message: message, retryAfter: retryAfter))
        }
    }
}

@Test func corruptAnalyticsPersistenceRecoversToCleanState() async throws {
    let store = TestAnalyticsStateStore(data: Data("not-valid-json".utf8))
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: transport,
        stateStore: store,
        now: { testAnalyticsDate("2026-09-08T12:00:00Z") }
    )

    try await client.track("generation_completed")

    #expect(await store.removalCount() == 1)
    #expect(try await client.pendingDayCount() == 1)
    #expect(await store.snapshot() != nil)
}

@Test func resetAnalyticsStatePreservesInstallationIdentity() async throws {
    let service = "com.hoangbkit.MacAppFoundationTests.Reset.\(UUID().uuidString)"
    defer { deleteTestAnalyticsKeychainItems(service: service) }

    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(
            keychainService: service,
            uploadInterval: 86_400,
            storageMode: .persisted
        ),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { testAnalyticsDate("2026-09-08T12:00:00Z") }
    )

    try await client.track("generation_completed", count: 3)
    await client.waitForAutomaticUpload()
    let firstRequest = try #require(await transport.capturedRequests().first)
    let firstID = try #require(firstRequest.value(forHTTPHeaderField: "X-Installation-ID"))

    try await client.resetLocalState()
    try await client.track("generation_completed")
    await client.waitForAutomaticUpload()

    let secondRequest = try #require(await transport.capturedRequests().last)
    let secondID = try #require(secondRequest.value(forHTTPHeaderField: "X-Installation-ID"))
    let day = try #require(testAnalyticsDays(secondRequest).first)
    let event = try #require(testAnalyticsEvents(day).first)

    #expect(secondID == firstID)
    #expect(event["count"] as? Int == 1)
}

@Test func analyticsInstallationIdentityIsStableAcrossClientInstances() async throws {
    let service = "com.hoangbkit.MacAppFoundationTests.Stable.\(UUID().uuidString)"
    defer { deleteTestAnalyticsKeychainItems(service: service) }

    let configuration = makeTestAnalyticsConfiguration(
        keychainService: service,
        uploadInterval: 86_400,
        storageMode: .persisted
    )
    let firstTransport = TestAnalyticsTransport()
    let secondTransport = TestAnalyticsTransport()
    let timestamp = testAnalyticsDate("2026-09-08T12:00:00Z")

    let first = AppAnalyticsClient(
        configuration: configuration,
        transport: firstTransport,
        stateStore: TestAnalyticsStateStore(),
        now: { timestamp }
    )
    try await first.track("first_event")
    await first.waitForAutomaticUpload()

    let second = AppAnalyticsClient(
        configuration: configuration,
        transport: secondTransport,
        stateStore: TestAnalyticsStateStore(),
        now: { timestamp }
    )
    try await second.track("second_event")
    await second.waitForAutomaticUpload()

    let firstRequest = try #require(await firstTransport.capturedRequests().first)
    let secondRequest = try #require(await secondTransport.capturedRequests().first)
    #expect(firstRequest.value(forHTTPHeaderField: "X-Installation-ID")
            == secondRequest.value(forHTTPHeaderField: "X-Installation-ID"))
}

@Test func concurrentAnalyticsClientsShareFirstInstallationIdentity() async throws {
    let service = "com.hoangbkit.MacAppFoundationTests.Concurrent.\(UUID().uuidString)"
    defer { deleteTestAnalyticsKeychainItems(service: service) }

    let configuration = makeTestAnalyticsConfiguration(
        keychainService: service,
        uploadInterval: 86_400,
        storageMode: .persisted
    )
    let firstTransport = TestAnalyticsTransport()
    let secondTransport = TestAnalyticsTransport()
    let timestamp = testAnalyticsDate("2026-09-08T12:00:00Z")

    let first = AppAnalyticsClient(
        configuration: configuration,
        transport: firstTransport,
        stateStore: TestAnalyticsStateStore(),
        now: { timestamp }
    )
    let second = AppAnalyticsClient(
        configuration: configuration,
        transport: secondTransport,
        stateStore: TestAnalyticsStateStore(),
        now: { timestamp }
    )

    async let firstTrack: Void = first.track("first_event")
    async let secondTrack: Void = second.track("second_event")
    _ = try await (firstTrack, secondTrack)
    await first.waitForAutomaticUpload()
    await second.waitForAutomaticUpload()

    let firstRequest = try #require(await firstTransport.capturedRequests().first)
    let secondRequest = try #require(await secondTransport.capturedRequests().first)
    let firstID = try #require(firstRequest.value(forHTTPHeaderField: "X-Installation-ID"))
    let secondID = try #require(secondRequest.value(forHTTPHeaderField: "X-Installation-ID"))

    #expect(firstID == secondID)
    #expect(firstID.isEmpty == false)
}
