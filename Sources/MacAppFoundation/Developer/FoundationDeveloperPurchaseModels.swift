#if DEBUG
import Foundation

enum DeveloperPurchaseOutcome: String, CaseIterable, Identifiable {
    case success
    case pending
    case userCancelled
    case networkFailure
    case productUnavailable
    case systemFailure

    var id: String { rawValue }

    var title: String {
        switch self {
        case .success: "Success"
        case .pending: "Pending"
        case .userCancelled: "User Cancelled"
        case .networkFailure: "Network Failure"
        case .productUnavailable: "Product Unavailable"
        case .systemFailure: "System Failure"
        }
    }

    var failure: PurchaseFailure? {
        switch self {
        case .networkFailure:
            PurchaseFailure(
                code: .networkUnavailable,
                message: "Simulated network failure."
            )
        case .productUnavailable:
            .productUnavailable
        case .systemFailure:
            PurchaseFailure(
                code: .system,
                message: "Simulated App Store system failure."
            )
        case .success, .pending, .userCancelled:
            nil
        }
    }

    var result: SimulatedPurchaseResult {
        switch self {
        case .success: .success
        case .pending: .pending
        case .userCancelled: .userCancelled
        case .networkFailure, .productUnavailable, .systemFailure:
            .failure(failure ?? .unknown)
        }
    }
}

enum DeveloperPurchaseLatency: String, CaseIterable, Identifiable {
    case instant
    case normal
    case oneSecond
    case threeSeconds

    var id: String { rawValue }

    var title: String {
        switch self {
        case .instant: "Instant"
        case .normal: "250 ms"
        case .oneSecond: "1 second"
        case .threeSeconds: "3 seconds"
        }
    }

    var duration: Duration {
        switch self {
        case .instant: .milliseconds(0)
        case .normal: .milliseconds(250)
        case .oneSecond: .seconds(1)
        case .threeSeconds: .seconds(3)
        }
    }
}
#endif
