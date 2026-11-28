import AppKit
import XCTest
@testable import MacAppFoundation

@MainActor
final class PurchaseManagerTests: XCTestCase {
    func testEffectiveAccessStartsFreeWhileLiveEntitlementIsChecking() {
        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [Self.monthly.id]),
            service: MockPurchaseService()
        )

        XCTAssertEqual(manager.entitlementState, .checking)
        XCTAssertEqual(manager.accessState, .inactive)
        XCTAssertFalse(manager.hasPro)
    }

    func testPrepareLoadsProductsAndEvaluatesEntitlement() async {
        let service = MockPurchaseService()
        service.productsResult = [Self.monthly]
        service.entitlements = [EntitlementRecord(productID: Self.monthly.id)]

        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [Self.monthly.id]),
            service: service
        )

        await manager.prepare()

        XCTAssertEqual(manager.products, [Self.monthly])
        XCTAssertEqual(manager.productLoadingState, .loaded)
        XCTAssertTrue(manager.hasPro)
        XCTAssertEqual(service.productLoadCount, 1)
        XCTAssertEqual(service.observedProductIDs, [Self.monthly.id])
    }

    func testPrepareObservesOnlyEntitlementProducts() async {
        let bonus = StoreProduct(
            id: "bonus",
            displayName: "Bonus",
            description: "",
            displayPrice: "$1.99",
            price: 1.99
        )
        let service = MockPurchaseService()
        service.productsResult = [Self.monthly, bonus]

        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(
                productIDs: [Self.monthly.id, bonus.id],
                entitledProductIDs: [Self.monthly.id]
            ),
            service: service
        )

        await manager.prepare()

        XCTAssertEqual(service.observedProductIDs, [Self.monthly.id])
        XCTAssertEqual(service.observedSubscriptionStatusProductIDs, [Self.monthly.id])
    }

    func testOlderEntitlementRefreshCannotOverwriteNewerState() async {
        let service = MockPurchaseService()
        service.blockedFirstEntitlementResponse = []
        service.entitlements = [EntitlementRecord(productID: Self.monthly.id)]

        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [Self.monthly.id]),
            service: service
        )

        let olderRefresh = Task {
            await manager.refreshEntitlements()
        }

        while !service.isFirstEntitlementRefreshBlocked {
            await Task.yield()
        }

        await manager.refreshEntitlements()
        XCTAssertTrue(manager.hasPro)

        service.releaseFirstEntitlementRefresh()
        await olderRefresh.value

        XCTAssertTrue(manager.hasPro)
    }

    func testSubscriptionStatusUpdateRefreshesEntitlementWhileAppRemainsOpen() async {
        let service = MockPurchaseService()
        service.productsResult = [Self.monthly]
        service.entitlements = [EntitlementRecord(productID: Self.monthly.id)]

        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [Self.monthly.id]),
            service: service
        )

        await manager.prepare()
        XCTAssertTrue(manager.hasPro)

        let beforeCount = service.entitlementRequestCount
        service.entitlements = []
        service.yieldSubscriptionStatusUpdate(productID: Self.monthly.id)
        await service.waitForEntitlementRequestCount(beforeCount + 1)

        XCTAssertFalse(manager.hasPro)
    }

    func testOlderProductLoadCannotOverwriteNewerMetadata() async {
        let staleMonthly = Self.monthly
        let refreshedMonthly = StoreProduct(
            id: Self.monthly.id,
            displayName: "Monthly",
            description: "Monthly access",
            displayPrice: "$5.99",
            price: 5.99,
            subscriptionPeriod: .init(value: 1, unit: .month)
        )
        let service = MockPurchaseService()
        service.blockedFirstProductsResponse = [staleMonthly]
        service.productsResult = [refreshedMonthly]
        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(
                productIDs: [Self.monthly.id],
                productLoadAttempts: 1
            ),
            service: service
        )

        let olderLoad = Task {
            await manager.loadProducts(force: true)
        }

        while !service.isFirstProductLoadBlocked {
            await Task.yield()
        }

        await manager.loadProducts(force: true)
        XCTAssertEqual(manager.products, [refreshedMonthly])
        XCTAssertEqual(manager.productLoadingState, .loaded)

        service.releaseFirstProductLoad()
        await olderLoad.value

        XCTAssertEqual(manager.products, [refreshedMonthly])
        XCTAssertEqual(manager.productLoadingState, .loaded)
    }

    func testPresentationRefreshReplacesCachedProductMetadata() async {
        let service = MockPurchaseService()
        service.productsResult = [Self.monthly]
        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [Self.monthly.id]),
            service: service
        )

        await manager.loadProducts()

        let refreshedMonthly = StoreProduct(
            id: Self.monthly.id,
            displayName: "Monthly",
            description: "Monthly access",
            displayPrice: "$5.99",
            price: 5.99,
            subscriptionPeriod: .init(value: 1, unit: .month),
            introductoryOffer: .init(
                paymentMode: .freeTrial,
                period: .init(value: 1, unit: .week),
                displayPrice: "Free",
                price: 0,
                isEligible: false
            )
        )
        service.productsResult = [refreshedMonthly]

        await manager.refreshProductsForPresentation()

        XCTAssertEqual(manager.products, [refreshedMonthly])
        XCTAssertEqual(manager.productLoadingState, .loaded)
        XCTAssertEqual(service.productLoadCount, 2)
    }

    func testPresentationRefreshKeepsCachedProductsWhenRefreshFails() async {
        let service = MockPurchaseService()
        service.productsResult = [Self.monthly]
        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(
                productIDs: [Self.monthly.id],
                productLoadAttempts: 1
            ),
            service: service
        )

        await manager.loadProducts()
        service.productLoadingFailure = PurchaseFailure(
            code: .networkUnavailable,
            message: "Offline"
        )

        await manager.refreshProductsForPresentation()

        XCTAssertEqual(manager.products, [Self.monthly])
        XCTAssertEqual(manager.productLoadingState, .loaded)
        XCTAssertEqual(service.productLoadCount, 2)
    }

    func testPrepareTrustsCurrentEntitlementsWithoutRecheckingExpiration() async {
        let service = MockPurchaseService()
        service.productsResult = [Self.monthly]
        service.entitlements = [
            EntitlementRecord(
                productID: Self.monthly.id,
                expirationDate: Date.now.addingTimeInterval(-60)
            )
        ]

        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [Self.monthly.id]),
            service: service
        )

        await manager.prepare()

        XCTAssertTrue(manager.hasPro)
        XCTAssertEqual(manager.activeProduct?.id, Self.monthly.id)
    }

    func testPurchaseReturnsOutcomeAndRefreshesEntitlementAfterSuccess() async {
        let service = MockPurchaseService()
        let record = EntitlementRecord(productID: Self.monthly.id)
        service.productsResult = [Self.monthly]
        service.purchaseOutcome = .success(record)

        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [Self.monthly.id]),
            service: service
        )

        await manager.loadProducts()
        service.entitlements = [record]
        let outcome = await manager.purchase(Self.monthly)

        XCTAssertEqual(outcome, .success(record))
        XCTAssertTrue(manager.hasPro)
        XCTAssertEqual(manager.activity, .idle)
    }

    func testPendingPurchaseDoesNotUnlockEntitlement() async {
        let service = MockPurchaseService()
        service.purchaseOutcome = .pending

        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [Self.monthly.id]),
            service: service
        )

        let outcome = await manager.purchase(Self.monthly)

        XCTAssertEqual(outcome, .pending)
        XCTAssertEqual(manager.activity, .pending(productID: Self.monthly.id))
        XCTAssertTrue(manager.isPurchasePending)
        XCTAssertEqual(manager.pendingProductID, Self.monthly.id)
        XCTAssertFalse(manager.isBusy)
        XCTAssertFalse(manager.hasPro)
    }

    func testClearActivityOnlyClearsFailureState() async {
        let pendingService = MockPurchaseService()
        pendingService.purchaseOutcome = .pending
        let pendingManager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [Self.monthly.id]),
            service: pendingService
        )

        _ = await pendingManager.purchase(Self.monthly)
        pendingManager.clearActivity()
        XCTAssertEqual(pendingManager.activity, .pending(productID: Self.monthly.id))

        let busyService = MockPurchaseService()
        busyService.blockNextPurchase = true
        let busyManager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [Self.monthly.id]),
            service: busyService
        )

        let purchaseTask = Task { await busyManager.purchase(Self.monthly) }
        await busyService.waitForPurchaseStart()
        busyManager.clearActivity()
        XCTAssertTrue(busyManager.isPurchasing)
        busyService.releasePurchase()
        _ = await purchaseTask.value

        let failureService = MockPurchaseService()
        failureService.purchaseFailure = .unknown
        let failureManager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [Self.monthly.id]),
            service: failureService
        )

        _ = await failureManager.purchase(Self.monthly)
        XCTAssertEqual(failureManager.activity, .failed(.unknown))
        failureManager.clearActivity()
        XCTAssertEqual(failureManager.activity, .idle)
    }

    func testPendingPurchaseBlocksAdditionalPurchase() async {
        let service = MockPurchaseService()
        service.purchaseOutcome = .pending

        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [Self.monthly.id]),
            service: service
        )

        let firstOutcome = await manager.purchase(Self.monthly)
        let secondOutcome = await manager.purchase(Self.monthly)

        XCTAssertEqual(firstOutcome, .pending)
        XCTAssertNil(secondOutcome)
        XCTAssertEqual(service.purchaseCount, 1)
        XCTAssertEqual(manager.activity, .pending(productID: Self.monthly.id))
    }

    func testRestoreDoesNotOverwritePendingPurchase() async {
        let service = MockPurchaseService()
        service.purchaseOutcome = .pending

        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [Self.monthly.id]),
            service: service
        )

        _ = await manager.purchase(Self.monthly)
        let restoreOutcome = await manager.restorePurchases()

        XCTAssertEqual(restoreOutcome, .failed(.operationInProgress))
        XCTAssertEqual(service.syncCount, 0)
        XCTAssertEqual(manager.activity, .pending(productID: Self.monthly.id))
    }

    func testUnsupportedProductTypeIsRejectedBeforeServicePurchase() async {
        let consumable = StoreProduct(
            id: "credits",
            displayName: "Credits",
            description: "",
            displayPrice: "$0.99",
            price: 0.99,
            type: .consumable
        )
        let service = MockPurchaseService()
        service.productsResult = [consumable]
        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [consumable.id]),
            service: service
        )

        await manager.loadProducts()
        let outcome = await manager.purchase(consumable)

        XCTAssertNil(outcome)
        XCTAssertEqual(manager.activity, .failed(.productUnavailable))
        XCTAssertEqual(service.purchaseCount, 0)
    }

    func testRestoreReportsNothingWhenNoEntitlementExists() async {
        let service = MockPurchaseService()
        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [Self.monthly.id]),
            service: service
        )

        let outcome = await manager.restorePurchases()

        XCTAssertEqual(outcome, .nothingToRestore)
        XCTAssertEqual(service.syncCount, 1)
        XCTAssertEqual(manager.activity, .idle)
    }

    func testRestoreRecoversFreeUserToPro() async {
        let service = MockPurchaseService()
        service.entitlements = []

        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [Self.monthly.id]),
            service: service
        )

        await manager.prepare()

        XCTAssertFalse(manager.hasPro)
        XCTAssertEqual(manager.accessState, .inactive)

        service.entitlementsAfterSync = [
            EntitlementRecord(productID: Self.monthly.id)
        ]

        let outcome = await manager.restorePurchases()

        XCTAssertEqual(outcome, .restored)
        XCTAssertEqual(service.syncCount, 1)
        XCTAssertTrue(manager.hasPro)
        XCTAssertEqual(manager.accessState.source, .storeKit)
        XCTAssertEqual(manager.activity, .idle)
    }

    func testRestoreReturnsFailureWhenSyncThrows() async {
        let service = MockPurchaseService()
        service.syncFailure = .unknown
        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [Self.monthly.id]),
            service: service
        )

        let outcome = await manager.restorePurchases()

        XCTAssertEqual(outcome, .failed(.unknown))
        XCTAssertEqual(manager.activity, .failed(.unknown))
    }

    func testRestoreDoesNotStartWhilePurchaseIsRunning() async {
        let service = MockPurchaseService()
        service.blockNextPurchase = true
        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [Self.monthly.id]),
            service: service
        )

        let purchaseTask = Task { await manager.purchase(Self.monthly) }
        await service.waitForPurchaseStart()
        XCTAssertTrue(manager.isPurchasing)

        let restoreOutcome = await manager.restorePurchases()

        XCTAssertEqual(restoreOutcome, .failed(.operationInProgress))
        XCTAssertEqual(service.syncCount, 0)
        XCTAssertTrue(manager.isPurchasing)

        service.releasePurchase()
        _ = await purchaseTask.value
    }

    func testCancelRestoreDoesNotClearPurchaseActivity() async {
        let service = MockPurchaseService()
        service.blockNextPurchase = true
        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [Self.monthly.id]),
            service: service
        )

        let purchaseTask = Task { await manager.purchase(Self.monthly) }
        await service.waitForPurchaseStart()
        manager.cancelRestore()

        XCTAssertTrue(manager.isPurchasing)
        service.releasePurchase()
        _ = await purchaseTask.value
    }

    func testUnrelatedTransactionUpdateDoesNotClearPendingAskToBuy() async {
        let service = MockPurchaseService()
        service.productsResult = [Self.monthly, Self.yearly]
        service.purchaseOutcome = .pending
        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(
                productIDs: [Self.monthly.id, Self.yearly.id]
            ),
            service: service
        )

        await manager.prepare()
        await manager.purchase(Self.monthly)
        XCTAssertEqual(manager.activity, .pending(productID: Self.monthly.id))

        let beforeCount = service.entitlementRequestCount
        service.yieldEntitlementUpdate(productID: Self.yearly.id)
        await service.waitForEntitlementRequestCount(beforeCount + 1)

        XCTAssertEqual(service.entitlementRequestCount, beforeCount + 1)
        XCTAssertEqual(manager.activity, .pending(productID: Self.monthly.id))
    }

    func testMatchingTransactionUpdateClearsPendingAskToBuy() async {
        let service = MockPurchaseService()
        service.productsResult = [Self.monthly, Self.yearly]
        service.purchaseOutcome = .pending
        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(
                productIDs: [Self.monthly.id, Self.yearly.id]
            ),
            service: service
        )

        await manager.prepare()
        await manager.purchase(Self.monthly)
        XCTAssertEqual(manager.activity, .pending(productID: Self.monthly.id))

        // Exercises the transaction observer's matching-product branch even when
        // currentEntitlements() stays empty (e.g., declined/revoked Ask to Buy).
        let beforeCount = service.entitlementRequestCount
        service.yieldEntitlementUpdate(productID: Self.monthly.id)
        await service.waitForEntitlementRequestCount(beforeCount + 1)

        XCTAssertEqual(manager.activity, .idle)
        XCTAssertFalse(manager.hasPro)
    }

    func testRefreshEntitlementsClearsPendingAskToBuyWhenProductIsActive() async {
        let service = MockPurchaseService()
        service.productsResult = [Self.monthly]
        service.purchaseOutcome = .pending
        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [Self.monthly.id]),
            service: service
        )

        await manager.prepare()
        await manager.purchase(Self.monthly)
        XCTAssertEqual(manager.activity, .pending(productID: Self.monthly.id))

        service.entitlements = [EntitlementRecord(productID: Self.monthly.id)]
        await manager.refreshEntitlements()

        XCTAssertEqual(manager.activity, .idle)
        XCTAssertTrue(manager.hasPro)
    }

    func testCancelRestoreWithTimeoutUnblocksImmediately() async {
        let service = MockPurchaseService()
        service.syncDelay = .seconds(10)
        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [Self.monthly.id]),
            service: service
        )

        let clock = ContinuousClock()
        let start = clock.now
        let restoreTask = Task {
            await manager.restorePurchases(timeout: .seconds(10))
        }
        await service.waitForSyncStart()
        XCTAssertTrue(manager.isRestoring)

        manager.cancelRestore()
        let outcome = await restoreTask.value
        let elapsed = start.duration(to: clock.now)

        XCTAssertEqual(outcome, .failed(.userCancelled))
        XCTAssertEqual(manager.activity, .idle)
        XCTAssertLessThan(elapsed, .seconds(1))
    }

    func testCancellingLoadProductsDuringRetryStopsRetriesAndResetsToIdle() async {
        let service = MockPurchaseService()
        service.productLoadingFailure = PurchaseFailure(
            code: .networkUnavailable,
            message: "Offline"
        )
        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(
                productIDs: [Self.monthly.id],
                productLoadAttempts: 3
            ),
            service: service
        )

        let loadTask = Task {
            await manager.loadProducts()
        }
        await service.waitForProductLoadCount(1)
        loadTask.cancel()
        await loadTask.value

        XCTAssertEqual(service.productLoadCount, 1)
        XCTAssertEqual(manager.productLoadingState, .idle)
    }

    func testPurchaseLifecycleCoordinatorDeduplicatesPrepareAndActivationRefresh() async {
        let center = NotificationCenter()
        let service = MockPurchaseService()
        service.productsResult = [Self.monthly]
        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [Self.monthly.id]),
            service: service
        )
        let coordinator = PurchaseLifecycleCoordinator(notificationCenter: center)

        let tokenA = coordinator.register(manager)
        let tokenB = coordinator.register(manager)
        await coordinator.waitForPendingWork(for: manager)
        XCTAssertEqual(service.entitlementRequestCount, 1)

        center.post(name: NSApplication.didBecomeActiveNotification, object: nil)
        await coordinator.waitForPendingWork(for: manager)
        XCTAssertEqual(service.entitlementRequestCount, 2)

        coordinator.unregister(tokenA)
        coordinator.unregister(tokenB)

        center.post(name: NSApplication.didBecomeActiveNotification, object: nil)
        await coordinator.waitForPendingWork(for: manager)
        XCTAssertEqual(service.entitlementRequestCount, 2)
    }

    func testPreferredProductUsesConfiguredCatalogOrder() async {
        let service = MockPurchaseService()
        service.productsResult = [Self.yearly, Self.monthly]
        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(
                productIDs: [Self.monthly.id, Self.yearly.id],
                preferredProductID: Self.yearly.id
            ),
            service: service
        )

        await manager.loadProducts()

        XCTAssertEqual(manager.products, [Self.monthly, Self.yearly])
        XCTAssertEqual(manager.preferredProduct?.id, Self.yearly.id)
        XCTAssertEqual(manager.preferredEntitlementProduct?.id, Self.yearly.id)
    }

    func testActiveProductMatchesVerifiedEntitlement() async {
        let service = MockPurchaseService()
        service.productsResult = [Self.monthly, Self.yearly]
        service.entitlements = [EntitlementRecord(productID: Self.yearly.id)]

        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(
                productIDs: [Self.monthly.id, Self.yearly.id]
            ),
            service: service
        )

        await manager.prepare()

        XCTAssertTrue(manager.hasPro)
        XCTAssertEqual(manager.activeProduct?.id, Self.yearly.id)
    }

    func testActiveProductPrefersLifetimeWhenSubscriptionAlsoActive() async {
        let service = MockPurchaseService()
        service.productsResult = [Self.monthly, Self.lifetime]
        service.entitlements = [
            EntitlementRecord(
                productID: Self.monthly.id,
                expirationDate: Date.now.addingTimeInterval(86_400)
            ),
            EntitlementRecord(productID: Self.lifetime.id)
        ]
        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(
                productIDs: [Self.monthly.id, Self.lifetime.id]
            ),
            service: service
        )

        await manager.prepare()

        XCTAssertEqual(manager.activeProduct?.id, Self.lifetime.id)
        XCTAssertEqual(manager.activeSubscriptionProduct?.id, Self.monthly.id)
    }

    func testLifetimeOnlyHasNoActiveSubscriptionProduct() async {
        let service = MockPurchaseService()
        service.productsResult = [Self.lifetime]
        service.entitlements = [EntitlementRecord(productID: Self.lifetime.id)]

        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: [Self.lifetime.id]),
            service: service
        )

        await manager.prepare()

        XCTAssertEqual(manager.activeProduct?.id, Self.lifetime.id)
        XCTAssertNil(manager.activeSubscriptionProduct)
    }

    func testEntitlementProductsExcludeNonEntitledAndUnsupportedProducts() async {
        let bonus = StoreProduct(
            id: "bonus",
            displayName: "Bonus",
            description: "",
            displayPrice: "$1.99",
            price: 1.99
        )
        let credits = StoreProduct(
            id: "credits",
            displayName: "Credits",
            description: "",
            displayPrice: "$0.99",
            price: 0.99,
            type: .consumable
        )
        let service = MockPurchaseService()
        service.productsResult = [Self.monthly, bonus, credits]
        let manager = PurchaseManager(
            configuration: PurchaseConfiguration(
                productIDs: [Self.monthly.id, bonus.id, credits.id],
                entitledProductIDs: [Self.monthly.id, credits.id]
            ),
            service: service
        )

        await manager.loadProducts()

        XCTAssertEqual(manager.entitlementProducts.map(\.id), [Self.monthly.id])
    }

    private static let monthly = StoreProduct(
        id: "pro.monthly",
        displayName: "Monthly",
        description: "Monthly access",
        displayPrice: "$4.99",
        price: 4.99,
        subscriptionPeriod: .init(value: 1, unit: .month)
    )

    private static let yearly = StoreProduct(
        id: "pro.yearly",
        displayName: "Yearly",
        description: "Yearly access",
        displayPrice: "$39.99",
        price: 39.99,
        subscriptionPeriod: .init(value: 1, unit: .year)
    )

    private static let lifetime = StoreProduct(
        id: "pro.lifetime",
        displayName: "Lifetime",
        description: "Lifetime access",
        displayPrice: "$79.99",
        price: 79.99
    )
}

@MainActor
private final class MockPurchaseService: PurchaseServing {
    var productsResult: [StoreProduct] = []
    var purchaseOutcome: PurchaseOutcome = .userCancelled
    var purchaseFailure: PurchaseFailure?
    var blockNextPurchase = false
    var entitlements: [EntitlementRecord] = []
    var entitlementsAfterSync: [EntitlementRecord]?
    var blockedFirstEntitlementResponse: [EntitlementRecord]?
    var blockedFirstProductsResponse: [StoreProduct]?
    var productLoadCount = 0
    var purchaseCount = 0
    var syncCount = 0
    var syncDelay: Duration = .milliseconds(0)
    var syncFailure: PurchaseFailure?
    var productLoadingFailure: PurchaseFailure?
    var observedProductIDs: Set<String> = []
    var observedSubscriptionStatusProductIDs: Set<String> = []
    var entitlementRequestCount = 0

    private var updateContinuations: [AsyncStream<String>.Continuation] = []
    private var subscriptionStatusUpdateContinuations: [AsyncStream<String>.Continuation] = []
    private var firstEntitlementRefreshContinuation: CheckedContinuation<Void, Never>?
    private var productRequestCount = 0
    private var firstProductLoadContinuation: CheckedContinuation<Void, Never>?
    private var purchaseStartWaiters: [CheckedContinuation<Void, Never>] = []
    private var purchaseReleaseContinuation: CheckedContinuation<Void, Never>?
    private var isPurchaseBlocked = false
    private var syncStartWaiters: [CheckedContinuation<Void, Never>] = []
    private var hasStartedSync = false
    private var entitlementRequestWaiters: [(target: Int, continuation: CheckedContinuation<Void, Never>)] = []
    private var productLoadWaiters: [(target: Int, continuation: CheckedContinuation<Void, Never>)] = []

    var isFirstEntitlementRefreshBlocked: Bool {
        firstEntitlementRefreshContinuation != nil
    }

    var isFirstProductLoadBlocked: Bool {
        firstProductLoadContinuation != nil
    }

    func products(for identifiers: [String]) async throws -> [StoreProduct] {
        productLoadCount += 1
        resolveProductLoadWaiters()
        if let productLoadingFailure {
            throw productLoadingFailure
        }

        productRequestCount += 1
        if productRequestCount == 1,
           let blockedFirstProductsResponse {
            await withCheckedContinuation { continuation in
                firstProductLoadContinuation = continuation
            }
            return blockedFirstProductsResponse.filter { identifiers.contains($0.id) }
        }

        return productsResult.filter { identifiers.contains($0.id) }
    }

    func releaseFirstProductLoad() {
        firstProductLoadContinuation?.resume()
        firstProductLoadContinuation = nil
    }

    func waitForProductLoadCount(_ target: Int) async {
        guard productLoadCount < target else { return }
        await withCheckedContinuation { continuation in
            productLoadWaiters.append((target: target, continuation: continuation))
        }
    }

    func purchase(productID: String) async throws -> PurchaseOutcome {
        purchaseCount += 1
        if blockNextPurchase {
            blockNextPurchase = false
            isPurchaseBlocked = true
            let waiters = purchaseStartWaiters
            purchaseStartWaiters.removeAll()
            waiters.forEach { $0.resume() }
            await withCheckedContinuation { continuation in
                purchaseReleaseContinuation = continuation
            }
            isPurchaseBlocked = false
        }
        if let purchaseFailure {
            throw purchaseFailure
        }
        return purchaseOutcome
    }

    func waitForPurchaseStart() async {
        guard !isPurchaseBlocked else { return }
        await withCheckedContinuation { continuation in
            purchaseStartWaiters.append(continuation)
        }
    }

    func releasePurchase() {
        purchaseReleaseContinuation?.resume()
        purchaseReleaseContinuation = nil
    }

    func currentEntitlements() async -> [EntitlementRecord] {
        entitlementRequestCount += 1
        defer { resolveEntitlementRequestWaiters() }

        if entitlementRequestCount == 1,
           let blockedFirstEntitlementResponse {
            await withCheckedContinuation { continuation in
                firstEntitlementRefreshContinuation = continuation
            }
            return blockedFirstEntitlementResponse
        }

        return entitlements
    }

    func waitForEntitlementRequestCount(_ target: Int) async {
        guard entitlementRequestCount < target else { return }
        await withCheckedContinuation { continuation in
            entitlementRequestWaiters.append((target: target, continuation: continuation))
        }
    }

    func releaseFirstEntitlementRefresh() {
        firstEntitlementRefreshContinuation?.resume()
        firstEntitlementRefreshContinuation = nil
    }

    func entitlementUpdates(for productIDs: Set<String>) -> AsyncStream<String> {
        observedProductIDs = productIDs
        return AsyncStream { continuation in
            updateContinuations.append(continuation)
        }
    }

    func yieldEntitlementUpdate(productID: String) {
        for continuation in updateContinuations {
            continuation.yield(productID)
        }
    }

    func subscriptionStatusUpdates(for productIDs: Set<String>) -> AsyncStream<String> {
        observedSubscriptionStatusProductIDs = productIDs
        return AsyncStream { continuation in
            subscriptionStatusUpdateContinuations.append(continuation)
        }
    }

    func yieldSubscriptionStatusUpdate(productID: String) {
        for continuation in subscriptionStatusUpdateContinuations {
            continuation.yield(productID)
        }
    }

    func sync() async throws {
        syncCount += 1
        hasStartedSync = true
        let waiters = syncStartWaiters
        syncStartWaiters.removeAll()
        waiters.forEach { $0.resume() }
        if syncDelay > .zero {
            try await Task.sleep(for: syncDelay)
        }
        if let syncFailure {
            throw syncFailure
        }
        if let entitlementsAfterSync {
            entitlements = entitlementsAfterSync
        }
    }

    func waitForSyncStart() async {
        guard !hasStartedSync else { return }
        await withCheckedContinuation { continuation in
            syncStartWaiters.append(continuation)
        }
    }

    private func resolveEntitlementRequestWaiters() {
        let ready = entitlementRequestWaiters.filter { entitlementRequestCount >= $0.target }
        entitlementRequestWaiters.removeAll { entitlementRequestCount >= $0.target }
        ready.forEach { $0.continuation.resume() }
    }

    private func resolveProductLoadWaiters() {
        let ready = productLoadWaiters.filter { productLoadCount >= $0.target }
        productLoadWaiters.removeAll { productLoadCount >= $0.target }
        ready.forEach { $0.continuation.resume() }
    }
}
