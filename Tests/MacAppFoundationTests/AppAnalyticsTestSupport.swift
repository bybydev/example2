import Foundation
import Security
@testable import MacAppFoundation

actor TestAnalyticsStateStore: AppAnalyticsStateStoring {
    private var data: Data?
    private var saves = 0
    private var removals = 0
    private let yieldOnAccess: Bool

    init(data: Data? = nil, yieldOnAccess: Bool = false) {
        self.data = data
        self.yieldOnAccess = yieldOnAccess
    }

    func load() async throws -> Data? {
        if yieldOnAccess {
            await Task.yield()
        }
        return data
    }

    func save(_ data: Data) async throws {
        if yieldOnAccess {
            await Task.yield()
        }
        self.data = data
        saves += 1
    }

    func remove() async throws {
        data = nil
        removals += 1
    }

    func containsData() -> Bool { data != nil }
    func snapshot() -> Data? { data }
    func saveCount() -> Int { saves }
    func removalCount() -> Int { removals }
}

final class TestAnalyticsClock: @unchecked Sendable {
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

    func advance(by seconds: TimeInterval) {
        lock.lock()
        value = value.addingTimeInterval(seconds)
        lock.unlock()
    }
}

actor TestAnalyticsTransport: AppAnalyticsTransport {
    enum Outcome: Sendable {
        case success
        case invalidRequestID
        case acceptedDays([String])
        case reverseAcceptedDays
        case server(status: Int, code: String, message: String, retryAfter: String?)
        case transportFailure
        case cancelled
    }

    private var outcomes: [Outcome]
    private var requests: [URLRequest] = []

    init(_ outcomes: [Outcome] = []) {
        self.outcomes = outcomes
    }

    func enqueue(_ newOutcomes: Outcome...) {
        outcomes.append(contentsOf: newOutcomes)
    }

    func data(for request: URLRequest) async throws -> (Data, HTTPURLResponse) {
        requests.append(request)
        let outcome = outcomes.isEmpty ? Outcome.success : outcomes.removeFirst()

        switch outcome {
        case .success:
            return try testAnalyticsSuccessResponse(for: request)

        case .invalidRequestID:
            let days = try testAnalyticsDays(request)
            let actualDays = days.compactMap { $0["day"] as? String }
            return try testAnalyticsJSONResponse(
                for: request,
                status: 200,
                payload: [
                    "ok": true,
                    "requestId": "wrong-request-id",
                    "acceptedDays": actualDays,
                ]
            )

        case .acceptedDays(let acceptedDays):
            let body = try testAnalyticsRequestBody(request)
            guard let requestID = body["requestId"] as? String else {
                throw AppAnalyticsError.invalidResponse
            }
            return try testAnalyticsJSONResponse(
                for: request,
                status: 200,
                payload: [
                    "ok": true,
                    "requestId": requestID,
                    "acceptedDays": acceptedDays,
                ]
            )

        case .reverseAcceptedDays:
            let body = try testAnalyticsRequestBody(request)
            guard let requestID = body["requestId"] as? String,
                  let days = body["days"] as? [[String: Any]] else {
                throw AppAnalyticsError.invalidResponse
            }
            let actualDays = days.compactMap { $0["day"] as? String }
            return try testAnalyticsJSONResponse(
                for: request,
                status: 200,
                payload: [
                    "ok": true,
                    "requestId": requestID,
                    "acceptedDays": Array(actualDays.reversed()),
                ]
            )

        case .server(let status, let code, let message, let retryAfter):
            return try testAnalyticsServerErrorResponse(
                for: request,
                status: status,
                code: code,
                message: message,
                retryAfter: retryAfter
            )

        case .transportFailure:
            throw URLError(.networkConnectionLost)

        case .cancelled:
            throw CancellationError()
        }
    }

    func capturedRequests() -> [URLRequest] { requests }
    func requestCount() -> Int { requests.count }
}

func makeTestAnalyticsConfiguration(
    appID: String = "analytics-test",
    appKey: String? = "test-key-123456789",
    enabled: Bool = true,
    keychainService: String? = nil,
    stateStorageKey: String? = nil,
    appVersion: String? = "1.2.3",
    uploadInterval: TimeInterval = 21_600,
    transportRetryCount: Int = 0,
    storageMode: AppAnalyticsStorageMode = .inMemory
) -> AppAnalyticsConfiguration {
    AppAnalyticsConfiguration(
        appID: appID,
        appKey: appKey,
        baseURL: URL(string: "https://example.com")!,
        enabled: enabled,
        keychainService: keychainService
            ?? "com.hoangbkit.MacAppFoundationTests.\(UUID().uuidString)",
        stateStorageKey: stateStorageKey
            ?? "analytics-state-\(UUID().uuidString)",
        appVersion: appVersion,
        uploadInterval: uploadInterval,
        transportRetryCount: transportRetryCount,
        storageMode: storageMode
    )
}

func deleteTestAnalyticsKeychainItems(service: String) {
    let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrService as String: service,
    ]
    SecItemDelete(query as CFDictionary)
}

func testAnalyticsDate(_ value: String) -> Date {
    ISO8601DateFormatter().date(from: value)!
}

func testAnalyticsContext() -> AppAnalyticsClientContext {
    AppAnalyticsClientContext(
        osVersion: "26.0.1",
        appBuild: "143",
        deviceFamily: "mac",
        architecture: "arm64"
    )
}

func testAnalyticsRequestBody(_ request: URLRequest) throws -> [String: Any] {
    guard let body = request.httpBody,
          let object = try JSONSerialization.jsonObject(with: body) as? [String: Any] else {
        throw AppAnalyticsError.invalidResponse
    }
    return object
}

func testAnalyticsDays(_ request: URLRequest) throws -> [[String: Any]] {
    let body = try testAnalyticsRequestBody(request)
    guard let days = body["days"] as? [[String: Any]] else {
        throw AppAnalyticsError.invalidResponse
    }
    return days
}

func testAnalyticsDay(_ request: URLRequest, day: String) throws -> [String: Any] {
    let days = try testAnalyticsDays(request)
    guard let match = days.first(where: { $0["day"] as? String == day }) else {
        throw AppAnalyticsError.invalidResponse
    }
    return match
}

func testAnalyticsEvents(_ day: [String: Any]) throws -> [[String: Any]] {
    guard let events = day["events"] as? [[String: Any]] else {
        throw AppAnalyticsError.invalidResponse
    }
    return events
}

func testAnalyticsEvent(
    _ day: [String: Any],
    name: String,
    dimension: String? = nil
) throws -> [String: Any] {
    let events = try testAnalyticsEvents(day)
    guard let event = events.first(where: {
        guard $0["name"] as? String == name else { return false }
        return ($0["dimension"] as? String) == dimension
    }) else {
        throw AppAnalyticsError.invalidResponse
    }
    return event
}

func testAnalyticsSuccessResponse(for request: URLRequest) throws -> (Data, HTTPURLResponse) {
    let body = try testAnalyticsRequestBody(request)
    guard let requestID = body["requestId"] as? String,
          let days = body["days"] as? [[String: Any]] else {
        throw AppAnalyticsError.invalidResponse
    }
    let acceptedDays = days.compactMap { $0["day"] as? String }
    return try testAnalyticsJSONResponse(
        for: request,
        status: 200,
        payload: [
            "ok": true,
            "requestId": requestID,
            "acceptedDays": acceptedDays,
        ]
    )
}

func testAnalyticsServerErrorResponse(
    for request: URLRequest,
    status: Int,
    code: String,
    message: String,
    retryAfter: String?
) throws -> (Data, HTTPURLResponse) {
    var detail: [String: Any] = [
        "code": code,
        "message": message,
    ]
    if let retryAfter {
        detail["retryAfter"] = retryAfter
    }
    let headers = retryAfter.map { ["Retry-After": $0] }
    return try testAnalyticsJSONResponse(
        for: request,
        status: status,
        headers: headers,
        payload: ["error": detail]
    )
}

func testAnalyticsJSONResponse(
    for request: URLRequest,
    status: Int,
    headers: [String: String]? = nil,
    payload: [String: Any]
) throws -> (Data, HTTPURLResponse) {
    let data = try JSONSerialization.data(withJSONObject: payload)
    let response = HTTPURLResponse(
        url: request.url!,
        statusCode: status,
        httpVersion: nil,
        headerFields: headers
    )!
    return (data, response)
}

func testAnalyticsPersistedState(
    days: [String: [String: Any]]
) throws -> Data {
    try JSONSerialization.data(withJSONObject: ["days": days])
}

func testAnalyticsPersistedDay(
    appVersion: String? = "1.2.3",
    sessions: Int = 0,
    sessionSeconds: Int = 0,
    events: [(name: String, dimension: String?, count: Int)] = []
) -> [String: Any] {
    var eventMap: [String: Any] = [:]
    for (index, event) in events.enumerated() {
        var payload: [String: Any] = [
            "name": event.name,
            "count": event.count,
        ]
        if let dimension = event.dimension {
            payload["dimension"] = dimension
        }
        eventMap["event-\(index)"] = payload
    }

    var result: [String: Any] = [
        "sessions": sessions,
        "sessionSeconds": sessionSeconds,
        "events": eventMap,
    ]
    if let appVersion {
        result["appVersion"] = appVersion
    }
    return result
}

func testAnalyticsEventCounters(
    _ count: Int,
    prefix: String = "event"
) -> [(String, String?, Int)] {
    (0..<count).map { index in
        ("\(prefix)_\(String(format: "%03d", index))", nil, 1)
    }
}
