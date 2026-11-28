import Foundation
import Testing
@testable import MacAppFoundation

@Suite("ProPlanPane")
struct ProPlanPaneTests {
    @Test("Default configuration copy uses app name and Apple subscription URL")
    func defaultCopyUsesAppName() {
        let configuration = ProPlanPaneConfiguration(appName: "Demo")

        #expect(configuration.freeTitle == "Free")
        #expect(configuration.proTitle == "Pro")
        #expect(configuration.freeDescription == "Upgrade to unlock the full Demo experience.")
        #expect(configuration.proDescription == "You have access to Demo Pro features.")
        #expect(configuration.upgradeButtonTitle == "Upgrade to Pro")
        #expect(configuration.viewPlansButtonTitle == "View Plans")
        #expect(configuration.manageSubscriptionTitle == "Manage Subscription")
        #expect(configuration.restorePurchasesTitle == "Restore Purchases")
        #expect(
            configuration.manageSubscriptionURL.absoluteString
                == "https://apps.apple.com/account/subscriptions"
        )
        #expect(configuration.features == nil)
    }

    @Test("Configuration overrides default app-name descriptions and feature list")
    func appCanOverrideDescriptionsAndFeatures() {
        let feature = PurchaseFeature(
            id: "export",
            systemImage: "square.and.arrow.up",
            title: "Batch Export",
            message: "Export whole folders at once.",
            freeValue: "Single file",
            proValue: "Whole folders"
        )
        let configuration = ProPlanPaneConfiguration(
            appName: "Demo",
            freeDescription: "Starter access",
            proDescription: "Everything unlocked",
            features: [feature]
        )

        #expect(configuration.freeDescription == "Starter access")
        #expect(configuration.proDescription == "Everything unlocked")
        #expect(configuration.features == [feature])
    }

    @Test("Comparison table enables only when features or upsell benefits include tier values")
    func comparisonTableDetection() {
        let comparable = PurchaseFeature(
            id: "batch",
            systemImage: "square.stack.3d.up",
            title: "Batch workflows",
            message: "Process many items in one operation.",
            freeValue: "One item",
            proValue: "Unlimited"
        )
        let plain = PurchaseFeature(
            id: "plain",
            systemImage: "sparkles",
            title: "Plain feature",
            message: "Description only.",
            freeValue: " ",
            proValue: ""
        )

        #expect(ProPlanPanePresentationState.showsComparisonTable(for: [comparable]))
        #expect(ProPlanPanePresentationState.showsComparisonTable(for: [plain, comparable]))
        #expect(!ProPlanPanePresentationState.showsComparisonTable(for: [plain]))
        #expect(!ProPlanPanePresentationState.showsComparisonTable(for: []))

        let fromFeature = ProUpsellBenefit(comparable)
        #expect(fromFeature.freeValue == "One item")
        #expect(fromFeature.proValue == "Unlimited")
        #expect(
            ProFeatureComparisonSection.showsComparisonTable(
                for: [ProFeatureComparisonItem(fromFeature)]
            )
        )

        let plainBenefit = ProUpsellBenefit(
            id: "plain",
            systemImage: "sparkles",
            title: "Plain benefit",
            message: "Description only."
        )
        #expect(plainBenefit.freeValue == "")
        #expect(plainBenefit.proValue == "")
        #expect(
            !ProFeatureComparisonSection.showsComparisonTable(
                for: [ProFeatureComparisonItem(plainBenefit)]
            )
        )
    }

    @Test("Plan badge shows known plan label and omits redundant or unloaded badges")
    func planBadgeLabel() {
        let monthly = StoreProduct(
            id: "pro.monthly",
            displayName: "Monthly",
            description: "",
            displayPrice: "$4.99",
            price: 4.99,
            subscriptionPeriod: .init(value: 1, unit: .month)
        )
        let lifetime = StoreProduct(
            id: "pro.lifetime",
            displayName: "Lifetime",
            description: "",
            displayPrice: "$79.99",
            price: 79.99
        )

        #expect(
            ProPlanPanePresentationState.planBadgeLabel(
                hasPro: false,
                activeProduct: monthly,
                proTitle: "Pro"
            ) == nil
        )
        #expect(
            ProPlanPanePresentationState.planBadgeLabel(
                hasPro: true,
                activeProduct: nil,
                proTitle: "Pro"
            ) == nil
        )
        #expect(
            ProPlanPanePresentationState.planBadgeLabel(
                hasPro: true,
                activeProduct: monthly,
                proTitle: "Pro"
            ) == "MONTHLY"
        )
        #expect(
            ProPlanPanePresentationState.planBadgeLabel(
                hasPro: true,
                activeProduct: lifetime,
                proTitle: "Pro"
            ) == "LIFETIME"
        )
        #expect(
            ProPlanPanePresentationState.planBadgeLabel(
                hasPro: true,
                activeProduct: lifetime,
                proTitle: "Lifetime"
            ) == nil
        )
    }

    @Test("Plan actions match free, subscription, lifetime, offline, and mixed entitlements")
    func planPaneActions() {
        let monthly = StoreProduct(
            id: "pro.monthly",
            displayName: "Monthly",
            description: "",
            displayPrice: "$4.99",
            price: 4.99,
            subscriptionPeriod: .init(value: 1, unit: .month)
        )
        let lifetime = StoreProduct(
            id: "pro.lifetime",
            displayName: "Lifetime",
            description: "",
            displayPrice: "$79.99",
            price: 79.99
        )

        let free = ProPlanPaneActionState(
            hasPro: false,
            activeProduct: nil,
            activeSubscriptionProduct: nil
        )
        #expect(free.showsUpgrade)
        #expect(!free.showsViewPlans)
        #expect(!free.showsManageSubscription)
        #expect(free.upgradeButtonKind == .primary)
        #expect(free.restoreButtonKind == .quiet)

        let freeWithStaleSubscription = ProPlanPaneActionState(
            hasPro: false,
            activeProduct: nil,
            activeSubscriptionProduct: monthly
        )
        #expect(freeWithStaleSubscription.showsUpgrade)
        #expect(!freeWithStaleSubscription.showsManageSubscription)

        let subscription = ProPlanPaneActionState(
            hasPro: true,
            activeProduct: monthly,
            activeSubscriptionProduct: monthly
        )
        #expect(!subscription.showsUpgrade)
        #expect(subscription.showsViewPlans)
        #expect(subscription.showsManageSubscription)
        #expect(subscription.viewPlansButtonKind == .secondary)
        #expect(subscription.manageSubscriptionButtonKind == .secondary)
        #expect(subscription.restoreButtonKind == .quiet)

        let lifetimeOnly = ProPlanPaneActionState(
            hasPro: true,
            activeProduct: lifetime,
            activeSubscriptionProduct: nil
        )
        #expect(!lifetimeOnly.showsUpgrade)
        #expect(!lifetimeOnly.showsViewPlans)
        #expect(!lifetimeOnly.showsManageSubscription)
        #expect(lifetimeOnly.restoreButtonKind == .secondary)

        let offlinePro = ProPlanPaneActionState(
            hasPro: true,
            activeProduct: nil,
            activeSubscriptionProduct: nil
        )
        #expect(!offlinePro.showsUpgrade)
        #expect(!offlinePro.showsViewPlans)
        #expect(!offlinePro.showsManageSubscription)
        #expect(offlinePro.restoreButtonKind == .secondary)

        let lifetimeAndSubscription = ProPlanPaneActionState(
            hasPro: true,
            activeProduct: lifetime,
            activeSubscriptionProduct: monthly
        )
        #expect(!lifetimeAndSubscription.showsUpgrade)
        #expect(!lifetimeAndSubscription.showsViewPlans)
        #expect(lifetimeAndSubscription.showsManageSubscription)
        #expect(lifetimeAndSubscription.manageSubscriptionButtonKind == .secondary)
        #expect(lifetimeAndSubscription.restoreButtonKind == .quiet)
    }
}
