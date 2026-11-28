import XCTest
@testable import MacAppFoundation

final class PremiumAccessTests: XCTestCase {
    private let feature = PremiumFeature(id: "export", title: "Unlimited Export")

    func testFreeRequirementIsAlwaysAllowed() {
        let decision = PremiumAccessPolicy().decision(
            for: feature,
            requirement: .free,
            hasPro: false
        )

        XCTAssertEqual(decision, .allowed)
    }

    func testProRequirementAllowsActiveProUser() {
        let decision = PremiumAccessPolicy().decision(
            for: feature,
            requirement: .pro,
            hasPro: true
        )

        XCTAssertEqual(decision, .allowed)
    }

    func testProRequirementLocksFreeUser() {
        let decision = PremiumAccessPolicy().decision(
            for: feature,
            requirement: .pro,
            hasPro: false
        )

        XCTAssertEqual(decision, .requiresPro(feature: feature))
    }

    func testExistingContentRemainsAccessibleByDefault() {
        let decision = PremiumAccessPolicy().decision(
            for: feature,
            requirement: .pro,
            hasPro: false,
            isExistingContent: true
        )

        XCTAssertEqual(decision, .allowed)
    }

    func testExistingContentCanBeLockedWithStrictPolicy() {
        let policy = PremiumAccessPolicy(existingContentRemainsAccessible: false)
        let decision = policy.decision(
            for: feature,
            requirement: .pro,
            hasPro: false,
            isExistingContent: true
        )

        XCTAssertEqual(decision, .requiresPro(feature: feature))
    }

    @MainActor
    func testProPlanButtonRetainsAndClampsCustomHeight() {
        let purchases = PurchaseManager(
            configuration: PurchaseConfiguration(productIDs: ["pro"]),
            simulated: true
        )

        let customButton = ProPlanButton(
            purchaseManager: purchases,
            height: 28,
            onUpgrade: {},
            onManagePlan: {}
        )
        XCTAssertEqual(customButton.height, 28)

        let negativeButton = ProPlanButton(
            purchaseManager: purchases,
            height: -4,
            onUpgrade: {},
            onManagePlan: {}
        )
        XCTAssertEqual(negativeButton.height, 0)
    }

    func testProPlanButtonPresentationFormatsFreeAndActivePlanLabels() {
        let freePlan = ProPlanButtonPresentation(
            hasPro: false,
            activeProduct: nil
        )
        XCTAssertEqual(freePlan.title, "Unlock Pro")
        XCTAssertEqual(freePlan.iconName, "crown.fill")
        XCTAssertEqual(freePlan.accessibilityValue, "Free plan")
        XCTAssertFalse(freePlan.isPro)

        let unknownPro = ProPlanButtonPresentation(
            hasPro: true,
            activeProduct: nil
        )
        XCTAssertEqual(unknownPro.title, "Pro")
        XCTAssertEqual(unknownPro.iconName, "checkmark.seal.fill")
        XCTAssertTrue(unknownPro.isPro)

        let lifetime = StoreProduct(
            id: "pro.lifetime",
            displayName: "Lifetime",
            description: "",
            displayPrice: "$79.99",
            price: 79.99
        )
        XCTAssertEqual(
            ProPlanButtonPresentation(hasPro: true, activeProduct: lifetime).title,
            "Pro Lifetime"
        )

        let monthly = StoreProduct(
            id: "pro.monthly",
            displayName: "Monthly",
            description: "",
            displayPrice: "$4.99",
            price: 4.99,
            subscriptionPeriod: .init(value: 1, unit: .month)
        )
        XCTAssertEqual(
            ProPlanButtonPresentation(hasPro: true, activeProduct: monthly).title,
            "Pro Monthly"
        )

        let yearly = StoreProduct(
            id: "pro.yearly",
            displayName: "Yearly",
            description: "",
            displayPrice: "$39.99",
            price: 39.99,
            subscriptionPeriod: .init(value: 1, unit: .year)
        )
        XCTAssertEqual(
            ProPlanButtonPresentation(hasPro: true, activeProduct: yearly).title,
            "Pro Yearly"
        )

        let weekly = StoreProduct(
            id: "pro.weekly",
            displayName: "Weekly",
            description: "",
            displayPrice: "$1.99",
            price: 1.99,
            subscriptionPeriod: .init(value: 1, unit: .week)
        )
        XCTAssertEqual(
            ProPlanButtonPresentation(hasPro: true, activeProduct: weekly).title,
            "Pro"
        )
    }
}
