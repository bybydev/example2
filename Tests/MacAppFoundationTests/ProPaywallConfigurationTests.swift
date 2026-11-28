import Foundation
import XCTest
@testable import MacAppFoundation

final class ProPaywallConfigurationTests: XCTestCase {
    func testKeepsAppOwnedCopyAndLegalDestinations() throws {
        let termsURL = try XCTUnwrap(URL(string: "https://example.com/terms"))
        let privacyURL = try XCTUnwrap(URL(string: "https://example.com/privacy"))
        let feature = ProPaywallFeature(
            id: "export",
            systemImage: "square.and.arrow.up",
            title: "Export",
            message: "Export without limits."
        )

        let configuration = ProPaywallConfiguration(
            title: "Example Pro",
            subtitle: "Unlock everything.",
            features: [feature],
            highlightedProductID: "pro.yearly",
            termsURL: termsURL,
            privacyURL: privacyURL
        )

        XCTAssertEqual(configuration.title, "Example Pro")
        XCTAssertEqual(configuration.subtitle, "Unlock everything.")
        XCTAssertEqual(configuration.features, [feature])
        XCTAssertEqual(configuration.highlightedProductID, "pro.yearly")
        XCTAssertEqual(configuration.highlightedProductBadge, "BEST VALUE")
        XCTAssertEqual(configuration.purchaseButtonTitle, "Continue")
        XCTAssertEqual(configuration.termsURL, termsURL)
        XCTAssertEqual(configuration.privacyURL, privacyURL)
        XCTAssertTrue(configuration.showsRedeemCode)
    }

    func testPurchaseFeatureCanFeedPaywallFeature() {
        let purchaseFeature = PurchaseFeature(
            id: "voices",
            systemImage: "waveform",
            title: "Voices",
            message: "Unlock every voice.",
            freeValue: "Limited",
            proValue: "Unlimited"
        )

        let paywallFeature = ProPaywallFeature(purchaseFeature)

        XCTAssertEqual(paywallFeature.id, purchaseFeature.id)
        XCTAssertEqual(paywallFeature.systemImage, purchaseFeature.systemImage)
        XCTAssertEqual(paywallFeature.title, purchaseFeature.title)
        XCTAssertEqual(paywallFeature.message, purchaseFeature.message)
    }

    func testDefaultSelectionPrefersUpgradeOptionWhenActivePlanExists() {
        let monthly = StoreProduct(
            id: "pro.monthly",
            displayName: "Monthly",
            description: "",
            displayPrice: "$4.99",
            price: 4.99,
            subscriptionPeriod: .init(value: 1, unit: .month)
        )
        let yearly = StoreProduct(
            id: "pro.yearly",
            displayName: "Yearly",
            description: "",
            displayPrice: "$39.99",
            price: 39.99,
            subscriptionPeriod: .init(value: 1, unit: .year)
        )
        let lifetime = StoreProduct(
            id: "pro.lifetime",
            displayName: "Lifetime",
            description: "",
            displayPrice: "$79.99",
            price: 79.99
        )
        let products = [monthly, yearly, lifetime]

        XCTAssertEqual(
            ProPaywallPresentation.defaultSelectedProductID(
                currentSelection: nil,
                products: products,
                highlightedProductID: yearly.id,
                preferredProductID: yearly.id,
                activeProductID: nil
            ),
            yearly.id
        )

        XCTAssertEqual(
            ProPaywallPresentation.defaultSelectedProductID(
                currentSelection: nil,
                products: products,
                highlightedProductID: yearly.id,
                preferredProductID: yearly.id,
                activeProductID: yearly.id
            ),
            monthly.id
        )

        XCTAssertEqual(
            ProPaywallPresentation.defaultSelectedProductID(
                currentSelection: monthly.id,
                products: products,
                highlightedProductID: yearly.id,
                preferredProductID: yearly.id,
                activeProductID: nil
            ),
            monthly.id
        )

        XCTAssertEqual(
            ProPaywallPresentation.defaultSelectedProductID(
                currentSelection: nil,
                products: [yearly],
                highlightedProductID: yearly.id,
                preferredProductID: yearly.id,
                activeProductID: yearly.id
            ),
            yearly.id
        )
    }

    func testBadgesPrioritizeCurrentPlanThenConfiguredThenSavings() {
        let monthly = StoreProduct(
            id: "pro.monthly",
            displayName: "Monthly",
            description: "",
            displayPrice: "$4.99",
            price: 4.99,
            subscriptionPeriod: .init(value: 1, unit: .month)
        )
        let yearly = StoreProduct(
            id: "pro.yearly",
            displayName: "Yearly",
            description: "",
            displayPrice: "$39.99",
            price: 39.99,
            subscriptionPeriod: .init(value: 1, unit: .year)
        )
        let products = [monthly, yearly]

        XCTAssertEqual(
            ProPaywallPresentation.badge(
                for: yearly,
                products: products,
                highlightedProductID: yearly.id,
                highlightedProductBadge: "BEST VALUE",
                activeProductID: yearly.id
            ),
            "CURRENT PLAN"
        )

        XCTAssertEqual(
            ProPaywallPresentation.badge(
                for: yearly,
                products: products,
                highlightedProductID: yearly.id,
                highlightedProductBadge: "BEST VALUE",
                activeProductID: nil
            ),
            "BEST VALUE"
        )

        XCTAssertEqual(
            ProPaywallPresentation.badge(
                for: yearly,
                products: products,
                highlightedProductID: nil,
                highlightedProductBadge: "BEST VALUE",
                activeProductID: nil
            ),
            "SAVE 33%"
        )

        XCTAssertNil(
            ProPaywallPresentation.yearlySavingsPercentage(
                monthlyPrice: 4.99,
                yearlyPrice: 60.00
            )
        )
    }

    func testPurchaseAvailabilityAndTitleRespectActiveAndLifetimePlans() {
        let monthly = StoreProduct(
            id: "pro.monthly",
            displayName: "Monthly",
            description: "",
            displayPrice: "$4.99",
            price: 4.99,
            subscriptionPeriod: .init(value: 1, unit: .month)
        )
        let yearly = StoreProduct(
            id: "pro.yearly",
            displayName: "Yearly",
            description: "",
            displayPrice: "$39.99",
            price: 39.99,
            subscriptionPeriod: .init(value: 1, unit: .year),
            introductoryOffer: .init(
                paymentMode: .freeTrial,
                period: .init(value: 7, unit: .day),
                displayPrice: "Free",
                price: 0,
                isEligible: true
            )
        )
        let lifetime = StoreProduct(
            id: "pro.lifetime",
            displayName: "Lifetime",
            description: "",
            displayPrice: "$79.99",
            price: 79.99
        )

        XCTAssertFalse(
            ProPaywallPresentation.canPurchase(
                selectedProduct: monthly,
                activeProduct: monthly,
                isBusy: false,
                isPurchasePending: false
            )
        )
        XCTAssertEqual(
            ProPaywallPresentation.purchaseButtonTitle(
                isPurchasing: false,
                isPurchasePending: false,
                selectedProduct: monthly,
                activeProduct: monthly,
                defaultTitle: "Continue"
            ),
            "Current Plan"
        )

        XCTAssertTrue(
            ProPaywallPresentation.canPurchase(
                selectedProduct: yearly,
                activeProduct: monthly,
                isBusy: false,
                isPurchasePending: false
            )
        )
        XCTAssertEqual(
            ProPaywallPresentation.purchaseButtonTitle(
                isPurchasing: false,
                isPurchasePending: false,
                selectedProduct: yearly,
                activeProduct: monthly,
                defaultTitle: "Continue"
            ),
            "Start Free Trial"
        )

        XCTAssertFalse(
            ProPaywallPresentation.canPurchase(
                selectedProduct: yearly,
                activeProduct: lifetime,
                isBusy: false,
                isPurchasePending: false
            )
        )
        XCTAssertEqual(
            ProPaywallPresentation.purchaseButtonTitle(
                isPurchasing: false,
                isPurchasePending: false,
                selectedProduct: yearly,
                activeProduct: lifetime,
                defaultTitle: "Continue"
            ),
            "Pro Lifetime Active"
        )
    }
}
