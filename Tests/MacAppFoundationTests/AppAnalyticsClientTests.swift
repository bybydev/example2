import Foundation
import Testing
@testable import MacAppFoundation

@Test func analyticsConfigurationDefaultsToTwentySecondUploadInterval() {
    let configuration = AppAnalyticsConfiguration(
        appID: "analytics-test",
        baseURL: URL(string: "https://example.com")!
    )

    #expect(configuration.enabled)
    #expect(configuration.uploadInterval == 20)
    #expect(configuration.storageMode == .persisted)
}

@Test func disabledAnalyticsIsCompletelyInert() async throws {
    let transport = TestAnalyticsTransport()
    let store = TestAnalyticsStateStore()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(enabled: false),
        transport: transport,
        stateStore: store,
        now: { testAnalyticsDate("2026-09-05T10:00:00Z") },
        clientContext: testAnalyticsContext()
    )

    try await client.track("Not Valid")
    try await client.trackError("NotValid", component: "Not Valid")
    try await client.applicationDidBecomeActive()
    try await client.applicationWillResignActive()
    try await client.flush()
    await client.waitForAutomaticUpload()

    #expect(await transport.capturedRequests().isEmpty)
    #expect(await store.containsData() == false)
}

@Test func analyticsFlushMatchesNativeServerContract() async throws {
    let transport = TestAnalyticsTransport()
    let store = TestAnalyticsStateStore()
    let timestamp = testAnalyticsDate("2026-09-05T10:00:00Z")
    let configuration = makeTestAnalyticsConfiguration()
    let client = AppAnalyticsClient(
        configuration: configuration,
        transport: transport,
        stateStore: store,
        now: { timestamp },
        clientContext: testAnalyticsContext()
    )

    try await client.track("generation_completed", dimension: "nano", count: 2)
    await client.waitForAutomaticUpload()

    let requests = await transport.capturedRequests()
    #expect(requests.count == 1)
    let request = try #require(requests.first)
    #expect(request.url?.path == "/v1/analytics/batch")
    #expect(request.value(forHTTPHeaderField: "X-App-ID") == configuration.appID)
    #expect(request.value(forHTTPHeaderField: "X-App-Key") == configuration.appKey)
    #expect(request.value(forHTTPHeaderField: "X-App-Version") == "1.2.3")
    #expect(request.value(forHTTPHeaderField: "X-App-Build") == "143")
    #expect(request.value(forHTTPHeaderField: "X-Installation-ID")?.isEmpty == false)

    let body = try testAnalyticsRequestBody(request)
    #expect(body["schemaVersion"] as? Int == 1)
    let bodyRequestID = try #require(body["requestId"] as? String)
    #expect(bodyRequestID.hasPrefix("native-"))
    #expect(request.value(forHTTPHeaderField: "X-Request-ID") == bodyRequestID)
    let days = try #require(body["days"] as? [[String: Any]])
    #expect(days.count == 1)
    #expect(days[0]["day"] as? String == "2026-09-05")
    #expect(days[0]["platform"] as? String == "macos")
    #expect(days[0]["appVersion"] as? String == "1.2.3")
    #expect(days[0]["appBuild"] as? String == "143")
    #expect(days[0]["osVersion"] as? String == "26.0.1")
    #expect(days[0]["deviceFamily"] as? String == "mac")
    #expect(days[0]["architecture"] as? String == "arm64")
    let errors = try #require(days[0]["errors"] as? [[String: Any]])
    #expect(errors.isEmpty)
    let events = try #require(days[0]["events"] as? [[String: Any]])
    #expect(events.count == 1)
    #expect(events[0]["name"] as? String == "generation_completed")
    #expect(events[0]["dimension"] as? String == "nano")
    #expect(events[0]["count"] as? Int == 2)
}

@Test func analyticsOmitsAppKeyHeaderWhenNotConfigured() async throws {
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(appKey: nil),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { testAnalyticsDate("2026-09-05T10:00:00Z") },
        clientContext: testAnalyticsContext()
    )

    try await client.track("generation_completed")
    await client.waitForAutomaticUpload()

    let request = try #require(await transport.capturedRequests().first)
    #expect(request.value(forHTTPHeaderField: "X-App-Key") == nil)
    #expect(request.value(forHTTPHeaderField: "X-App-ID") == "analytics-test")
    #expect(request.value(forHTTPHeaderField: "X-Installation-ID")?.isEmpty == false)
}

@Test func analyticsTracksBoundedCumulativeErrors() async throws {
    let transport = TestAnalyticsTransport()
    let store = TestAnalyticsStateStore()
    let timestamp = testAnalyticsDate("2026-09-05T10:00:00Z")
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: transport,
        stateStore: store,
        now: { timestamp },
        clientContext: testAnalyticsContext()
    )

    try await client.trackError(
        "model_load_failed",
        component: "generation",
        count: 2
    )
    try await client.trackError(
        "model_load_failed",
        component: "generation",
        count: 1
    )
    try await client.trackError(
        "unexpected_termination",
        component: "app",
        severity: .fatal
    )
    try await client.flush()

    let request = try #require(await transport.capturedRequests().last)
    let body = try testAnalyticsRequestBody(request)
    let days = try #require(body["days"] as? [[String: Any]])
    let errors = try #require(days[0]["errors"] as? [[String: Any]])
    #expect(errors.count == 2)

    let modelError = try #require(errors.first { $0["code"] as? String == "model_load_failed" })
    #expect(modelError["component"] as? String == "generation")
    #expect(modelError["severity"] as? String == "error")
    #expect(modelError["count"] as? Int == 3)

    let fatal = try #require(errors.first { $0["code"] as? String == "unexpected_termination" })
    #expect(fatal["component"] as? String == "app")
    #expect(fatal["severity"] as? String == "fatal")
    #expect(fatal["count"] as? Int == 1)
}

@Test func analyticsRejectsInvalidOrExcessErrorSignals() async throws {
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: TestAnalyticsTransport(),
        stateStore: TestAnalyticsStateStore(),
        now: { testAnalyticsDate("2026-09-05T10:00:00Z") },
        clientContext: testAnalyticsContext()
    )

    await #expect(throws: AppAnalyticsError.self) {
        try await client.trackError("NotValid", component: "generation")
    }
    await #expect(throws: AppAnalyticsError.self) {
        try await client.trackError("model_load_failed", component: "Generation")
    }
    await #expect(throws: AppAnalyticsError.self) {
        try await client.trackError("model_load_failed", component: "generation", count: 101)
    }

    try await client.trackError("model_load_failed", component: "generation", count: 100)
    await #expect(throws: AppAnalyticsError.self) {
        try await client.trackError("database_open_failed", component: "storage")
    }
}

@Test func analyticsRejectsInvalidEventNamesBeforePersistence() async throws {
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(),
        transport: TestAnalyticsTransport(),
        stateStore: TestAnalyticsStateStore(),
        now: { testAnalyticsDate("2026-09-05T10:00:00Z") }
    )

    await #expect(throws: AppAnalyticsError.self) {
        try await client.track("Not Valid")
    }
    #expect(try await client.pendingDayCount() == 0)
}

@Test func inMemoryInstallationIDIsStableWithinClient() async throws {
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 0, storageMode: .inMemory),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { testAnalyticsDate("2026-09-05T10:00:00Z") }
    )

    try await client.track("generation_completed")
    await client.waitForAutomaticUpload()
    try await client.track("export_completed")
    await client.waitForAutomaticUpload()

    let requests = await transport.capturedRequests()
    #expect(requests.count == 2)
    let firstID = try #require(requests[0].value(forHTTPHeaderField: "X-Installation-ID"))
    let secondID = try #require(requests[1].value(forHTTPHeaderField: "X-Installation-ID"))
    #expect(firstID == secondID)
}

@Test func inMemoryInstallationIDIsUniquePerClientAndDoesNotTouchKeychain() async throws {
    let service = "com.hoangbkit.MacAppFoundationTests.InMemory.\(UUID().uuidString)"
    let secureStore = AppAnalyticsSecureStore(service: service)

    func trackedID() async throws -> String {
        let transport = TestAnalyticsTransport()
        let client = AppAnalyticsClient(
            configuration: makeTestAnalyticsConfiguration(
                keychainService: service,
                uploadInterval: 0,
                storageMode: .inMemory
            ),
            transport: transport,
            stateStore: TestAnalyticsStateStore(),
            now: { testAnalyticsDate("2026-09-05T10:00:00Z") }
        )
        try await client.track("generation_completed")
        await client.waitForAutomaticUpload()
        let request = try #require(await transport.capturedRequests().first)
        return try #require(request.value(forHTTPHeaderField: "X-Installation-ID"))
    }

    let first = try await trackedID()
    let second = try await trackedID()
    #expect(first != second)
    #expect(try await secureStore.string(for: "analytics-test.installation") == nil)
}

@Test func inMemoryInstallationIDIgnoresKeychainIdentity() async throws {
    let service = "com.hoangbkit.MacAppFoundationTests.InMemory.\(UUID().uuidString)"
    defer { deleteTestAnalyticsKeychainItems(service: service) }

    func trackedID(for mode: AppAnalyticsStorageMode) async throws -> String {
        let transport = TestAnalyticsTransport()
        let client = AppAnalyticsClient(
            configuration: makeTestAnalyticsConfiguration(
                keychainService: service,
                uploadInterval: 0,
                storageMode: mode
            ),
            transport: transport,
            stateStore: TestAnalyticsStateStore(),
            now: { testAnalyticsDate("2026-09-05T10:00:00Z") }
        )
        try await client.track("generation_completed")
        await client.waitForAutomaticUpload()
        let request = try #require(await transport.capturedRequests().first)
        return try #require(request.value(forHTTPHeaderField: "X-Installation-ID"))
    }

    let keychainID = try await trackedID(for: .persisted)
    let inMemoryID = try await trackedID(for: .inMemory)
    #expect(inMemoryID != keychainID)
}

@Test func inMemoryStorageModeDoesNotWriteUserDefaults() async throws {
    let key = "analytics-in-memory-\(UUID().uuidString)"
    let configuration = makeTestAnalyticsConfiguration(
        stateStorageKey: key,
        uploadInterval: 86_400,
        storageMode: .inMemory
    )

    let client = AppAnalyticsClient(
        configuration: configuration,
        transport: TestAnalyticsTransport()
    )
    try await client.track("generation_completed", count: 3)
    try await client.flush()

    #expect(UserDefaults.standard.data(forKey: key) == nil)
}

@Test func inMemoryStorageModeCountersArePerClient() async throws {
    let configuration = makeTestAnalyticsConfiguration(
        uploadInterval: 86_400,
        storageMode: .inMemory
    )

    let first = AppAnalyticsClient(
        configuration: configuration,
        transport: TestAnalyticsTransport()
    )
    try await first.track("generation_completed", count: 3)
    #expect(try await first.pendingDayCount() == 1)

    let second = AppAnalyticsClient(
        configuration: configuration,
        transport: TestAnalyticsTransport()
    )
    #expect(try await second.pendingDayCount() == 0)
}

@Test func explicitlyInjectedStateStoreWinsOverStorageMode() async throws {
    let customStore = TestAnalyticsStateStore()
    let configuration = makeTestAnalyticsConfiguration(
        uploadInterval: 86_400,
        storageMode: .inMemory
    )
    let client = AppAnalyticsClient(
        configuration: configuration,
        transport: TestAnalyticsTransport(),
        stateStore: customStore
    )

    try await client.track("generation_completed", count: 2)
    #expect(await customStore.containsData())
    #expect(UserDefaults.standard.data(forKey: configuration.stateStorageKey) == nil)
}

@Test func setEnabledFalseStopsAllAnalyticsWorkAndClearsStateWithoutFinalUpload() async throws {
    let transport = TestAnalyticsTransport()
    let store = TestAnalyticsStateStore()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400),
        transport: transport,
        stateStore: store,
        now: { testAnalyticsDate("2026-09-05T10:00:00Z") }
    )

    try await client.track("generation_completed")
    await client.waitForAutomaticUpload()
    #expect(await transport.capturedRequests().count == 1)

    // Record new local activity that has not been uploaded yet (throttled by uploadInterval).
    try await client.track("pending_before_disable")
    #expect(try await client.pendingDayCount() == 1)

    await client.setEnabled(false)
    #expect(await client.isEnabled == false)
    #expect(await store.containsData() == false)
    #expect(try await client.pendingDayCount() == 0)

    try await client.track("export_completed")
    try await client.trackError("model_load_failed", component: "generation")
    try await client.applicationDidBecomeActive(at: testAnalyticsDate("2026-09-05T10:00:00Z"))
    try await client.applicationWillResignActive(at: testAnalyticsDate("2026-09-05T10:01:00Z"))
    try await client.flush()
    await client.waitForAutomaticUpload()

    // Only the initial automatic upload ran; disabling performed no final upload and blocked later work.
    #expect(await transport.capturedRequests().count == 1)
    #expect(try await client.pendingDayCount() == 0)
}

@Test func reEnablingAnalyticsStartsFromCleanStateAndPreservesInstallationIdentity() async throws {
    let transport = TestAnalyticsTransport()
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(uploadInterval: 86_400, storageMode: .inMemory),
        transport: transport,
        stateStore: TestAnalyticsStateStore(),
        now: { testAnalyticsDate("2026-09-05T10:00:00Z") }
    )

    try await client.track("generation_completed", count: 5)
    await client.waitForAutomaticUpload()
    let firstRequest = try #require(await transport.capturedRequests().first)
    let firstInstallationID = try #require(firstRequest.value(forHTTPHeaderField: "X-Installation-ID"))

    await client.setEnabled(false)
    await client.setEnabled(true)
    #expect(await client.isEnabled)

    try await client.track("generation_completed")
    try await client.flush()

    let requests = await transport.capturedRequests()
    let lastRequest = try #require(requests.last)
    let secondInstallationID = try #require(lastRequest.value(forHTTPHeaderField: "X-Installation-ID"))
    #expect(firstInstallationID == secondInstallationID)

    let body = try testAnalyticsRequestBody(lastRequest)
    let days = try #require(body["days"] as? [[String: Any]])
    let events = try #require(days[0]["events"] as? [[String: Any]])
    #expect(events.count == 1)
    #expect(events[0]["count"] as? Int == 1)
}

@Test func setEnabledIsIdempotentAndDoesNotClearPreexistingStateWhenAlreadyDisabled() async throws {
    let transport = TestAnalyticsTransport()
    let store = TestAnalyticsStateStore()
    let configuration = makeTestAnalyticsConfiguration(uploadInterval: 86_400)

    let firstClient = AppAnalyticsClient(
        configuration: configuration,
        transport: transport,
        stateStore: store,
        now: { testAnalyticsDate("2026-09-05T10:00:00Z") }
    )
    try await firstClient.track("generation_completed", count: 2)
    await firstClient.waitForAutomaticUpload()
    #expect(await store.containsData())

    // Calling setEnabled(true) when already enabled is a no-op and preserves state.
    await firstClient.setEnabled(true)
    #expect(try await firstClient.pendingDayCount() == 1)

    // A client created with enabled: false leaves existing state intact even if setEnabled(false) is called redundantly.
    var disabledConfig = configuration
    disabledConfig.enabled = false
    let disabledClient = AppAnalyticsClient(
        configuration: disabledConfig,
        transport: transport,
        stateStore: store,
        now: { testAnalyticsDate("2026-09-05T10:00:00Z") }
    )
    await disabledClient.setEnabled(false)
    #expect(await store.containsData())

    await disabledClient.setEnabled(true)
    #expect(try await disabledClient.pendingDayCount() == 1)
}

@Test func resetLocalStateWorksWhileAnalyticsDisabled() async throws {
    let seededState = try testAnalyticsPersistedState(days: [
        "2026-09-05": testAnalyticsPersistedDay(events: [("persisted_event", nil, 2)]),
    ])
    let store = TestAnalyticsStateStore(data: seededState)
    let client = AppAnalyticsClient(
        configuration: makeTestAnalyticsConfiguration(enabled: false),
        transport: TestAnalyticsTransport(),
        stateStore: store,
        now: { testAnalyticsDate("2026-09-05T10:00:00Z") }
    )

    #expect(await store.containsData())
    #expect(try await client.pendingDayCount() == 1)

    try await client.resetLocalState()

    #expect(await store.containsData() == false)
    #expect(try await client.pendingDayCount() == 0)
}
