import MacAppFoundation
import Observation

@MainActor
@Observable
final class DemoState {
    var compactCards = false
    var analyticsEnabled = true
    var analyticsStorageMode: AppAnalyticsStorageMode = .persisted
    var actionCount = 0
    var lastAction = "Ready"

    func record(_ message: String) {
        actionCount += 1
        lastAction = message
    }

    func reset() {
        compactCards = false
        analyticsEnabled = true
        analyticsStorageMode = .persisted
        actionCount = 0
        lastAction = "Ready"
    }
}
