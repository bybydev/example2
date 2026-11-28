#if os(macOS)
import Foundation
import StoreKit
import SwiftUI

/// Native macOS Pro paywall built on ``PurchaseManager``.
///
/// Purchase state, entitlement verification, and simulation remain owned by
/// MacAppFoundation's commerce layer while the host app supplies copy, features,
/// and legal links through ``ProPaywallConfiguration``.
public struct ProPaywallView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.displayScale) private var displayScale
    @Environment(\.macAppTheme) private var theme
    @Environment(\.appAnalytics) private var analytics
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    private let purchaseManager: PurchaseManager
    private let configuration: ProPaywallConfiguration
    private let onPurchased: ((StoreProduct) -> Void)?
    private let onRestored: (() -> Void)?
    private let onClose: (() -> Void)?

    @State private var selectedProductID: String?
    @State private var alertMessage: String?
    @State private var restoreMessage: String?
    @State private var isOfferCodeRedemptionPresented = false
    @State private var didTrackPaywallView = false
    @State private var didCompleteCommerce = false

    public init(
        purchaseManager: PurchaseManager,
        configuration: ProPaywallConfiguration,
        initialSelectedProductID: String? = nil,
        onPurchased: ((StoreProduct) -> Void)? = nil,
        onRestored: (() -> Void)? = nil,
        onClose: (() -> Void)? = nil
    ) {
        self.purchaseManager = purchaseManager
        self.configuration = configuration
        self.onPurchased = onPurchased
        self.onRestored = onRestored
        self.onClose = onClose
        _selectedProductID = State(initialValue: initialSelectedProductID)
    }

    public var body: some View {
        GeometryReader { proxy in
            let outerPadding = max(20, min(proxy.size.width * 0.03, 32))
            let topPadding = max(28, min(proxy.size.height * 0.08, 44))
            let columnSpacing = max(18, min(proxy.size.width * 0.03, 30))
            let footerHeight: CGFloat = 58

            VStack(spacing: 0) {
                HStack(alignment: .top, spacing: columnSpacing) {
                    leadingPane
                    trailingPane
                }
                .padding(.horizontal, outerPadding)
                .padding(.top, topPadding)
                .padding(.bottom, outerPadding)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)

                bottomBar
                    .padding(.horizontal, max(16, outerPadding - 6))
                    .frame(maxWidth: .infinity)
                    .frame(height: footerHeight)
                    .overlay(alignment: .top) {
                        Rectangle()
                            .fill(theme.separator.opacity(0.85))
                            .frame(height: 1 / displayScale)
                    }
            }
        }
        .frame(
            minWidth: 760,
            idealWidth: 860,
            maxWidth: 980,
            minHeight: 420,
            idealHeight: 580
        )
        .foregroundStyle(theme.textPrimary)
        .background(theme.canvas)
        .tint(theme.accent)
        .task(id: ObjectIdentifier(purchaseManager)) {
            if !didTrackPaywallView {
                didTrackPaywallView = true
                track(ProPaywallAnalytics.paywallViewed)
            }

            purchaseManager.ensureObserversStarted()
            await purchaseManager.refreshProductsForPresentation()
            await purchaseManager.refreshEntitlements()
            selectDefaultPlanIfNeeded()
        }
        .onChange(of: purchaseManager.products) { _, _ in
            selectDefaultPlanIfNeeded()
        }
        .onDisappear {
            if !didCompleteCommerce {
                track(ProPaywallAnalytics.paywallClosed)
            }
        }
        .offerCodeRedemption(isPresented: $isOfferCodeRedemptionPresented) { result in
            switch result {
            case .success:
                track(ProPaywallAnalytics.offerCodeSucceeded)
                Task {
                    await purchaseManager.refreshEntitlements()
                    if purchaseManager.hasPro {
                        didCompleteCommerce = true
                        restoreMessage = "Offer code redeemed."
                        if let activeProduct = purchaseManager.activeProduct {
                            onPurchased?(activeProduct)
                        }
                        dismiss()
                    } else {
                        restoreMessage = "Offer code redeemed."
                    }
                }
            case .failure(let error):
                track(ProPaywallAnalytics.offerCodeFailed(error))
                presentError(error)
            }
        }
        .alert("Purchase", isPresented: alertBinding) {
            Button("OK", role: .cancel) {
                alertMessage = nil
            }
        } message: {
            Text(alertMessage ?? PurchaseFailure.unknown.message)
        }
    }

    private var leadingPane: some View {
        VStack(alignment: .leading, spacing: 26) {
            VStack(alignment: .leading, spacing: 5) {
                Text(configuration.title)
                    .font(.system(size: 34, weight: .bold))
                    .foregroundStyle(theme.textPrimary)
                    .accessibilityAddTraits(.isHeader)

                Text(configuration.subtitle)
                    .font(.headline)
                    .foregroundStyle(theme.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            if !resolvedFeatures.isEmpty {
                ScrollView(.vertical, showsIndicators: true) {
                    VStack(alignment: .leading, spacing: 18) {
                        ForEach(resolvedFeatures) { feature in
                            HStack(alignment: .top, spacing: 14) {
                                featureIcon(feature.systemImage)

                                VStack(alignment: .leading, spacing: 3) {
                                    Text(feature.title)
                                        .font(.headline)
                                        .foregroundStyle(theme.textPrimary)
                                    Text(feature.message)
                                        .font(.body)
                                        .foregroundStyle(theme.textSecondary)
                                        .fixedSize(horizontal: false, vertical: true)
                                }
                            }
                            .accessibilityElement(children: .combine)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .topLeading)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            }
        }
        .frame(
            minWidth: 280,
            idealWidth: 420,
            maxWidth: .infinity,
            maxHeight: .infinity,
            alignment: .topLeading
        )
    }

    private var trailingPane: some View {
        ScrollView(.vertical, showsIndicators: true) {
            VStack(alignment: .leading, spacing: 12) {
                productContent

                purchaseButton
                    .padding(.top, 12)

                if let disclosure = selectedProduct?.introductoryOfferDisclosure,
                   canPurchaseSelectedProduct {
                    Text(disclosure)
                        .font(.caption2)
                        .foregroundStyle(theme.textSecondary)
                        .multilineTextAlignment(.center)
                        .fixedSize(horizontal: false, vertical: true)
                        .frame(maxWidth: .infinity)
                }

                legalFooter
                    .frame(maxWidth: .infinity, alignment: .center)
            }
            .frame(maxWidth: .infinity, alignment: .topLeading)
        }
        .frame(
            minWidth: 300,
            idealWidth: 340,
            maxWidth: 390,
            maxHeight: .infinity,
            alignment: .topLeading
        )
        .padding(.top, 8)
    }

    @ViewBuilder
    private var productContent: some View {
        switch purchaseManager.productLoadingState {
        case .idle, .loading:
            loadingState

        case .failed(let failure):
            VStack(spacing: 12) {
                Label("Unable to load plans", systemImage: "wifi.exclamationmark")
                    .font(.headline)
                    .foregroundStyle(theme.textPrimary)
                Text(failure.message)
                    .font(.subheadline)
                    .foregroundStyle(theme.textSecondary)
                    .multilineTextAlignment(.center)
                Button("Try Again") {
                    Task { await purchaseManager.loadProducts(force: true) }
                }
                .buttonStyle(PaywallButtonStyle(.secondary))
            }
            .frame(maxWidth: .infinity, minHeight: 180, alignment: .center)

        case .loaded:
            if paywallProducts.isEmpty {
                Text("No Pro purchase options are available right now.")
                    .font(.subheadline)
                    .foregroundStyle(theme.textSecondary)
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: .infinity, minHeight: 180, alignment: .center)
            } else {
                VStack(spacing: 12) {
                    ForEach(paywallProducts) { product in
                        ProPaywallPlanCard(
                            product: product,
                            isSelected: selectedProductID == product.id,
                            isActivePlan: purchaseManager.activeProduct?.id == product.id,
                            badge: badge(for: product)
                        ) {
                            guard !purchaseManager.isBusy, !purchaseManager.isPurchasePending else {
                                return
                            }
                            if selectedProductID != product.id {
                                track(ProPaywallAnalytics.planSelected(product))
                            }
                            if reduceMotion {
                                selectedProductID = product.id
                            } else {
                                withAnimation(.snappy) {
                                    selectedProductID = product.id
                                }
                            }
                        }
                        .disabled(purchaseManager.isBusy || purchaseManager.isPurchasePending)
                    }
                }
            }
        }
    }

    private var purchaseButton: some View {
        Button {
            guard let product = selectedProduct,
                  canPurchaseSelectedProduct
            else { return }

            restoreMessage = nil
            track(ProPaywallAnalytics.purchaseStarted(product))

            Task {
                let outcome = await purchaseManager.purchase(product)

                if case .failed(let failure) = purchaseManager.activity {
                    track(ProPaywallAnalytics.purchaseFailed(product, failure: failure))
                    alertMessage = failure.message
                    purchaseManager.clearActivity()
                    return
                }

                guard let outcome else { return }

                switch outcome {
                case .success:
                    didCompleteCommerce = true
                    track(ProPaywallAnalytics.purchaseSucceeded(product))
                    onPurchased?(product)
                    dismiss()
                case .pending:
                    track(ProPaywallAnalytics.purchasePending(product))
                case .userCancelled:
                    track(ProPaywallAnalytics.purchaseCancelled(product))
                }
            }
        } label: {
            HStack(spacing: 8) {
                if purchaseManager.isPurchasing {
                    ProgressView()
                        .controlSize(.small)
                }

                Text(purchaseButtonTitle)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(PaywallButtonStyle(.primary))
        .disabled(!canPurchaseSelectedProduct)
    }

    private var bottomBar: some View {
        HStack(spacing: 12) {
            Button {
                restorePurchases()
            } label: {
                HStack(spacing: 6) {
                    if purchaseManager.isRestoring {
                        ProgressView()
                            .controlSize(.small)
                    }
                    Text(purchaseManager.isRestoring ? "Restoring…" : "Restore Purchases")
                }
            }
            .buttonStyle(PaywallButtonStyle(.secondary))
            .disabled(purchaseManager.isBusy || purchaseManager.isPurchasePending)

            if configuration.showsRedeemCode {
                Button("Redeem Code") {
                    track(ProPaywallAnalytics.offerCodeOpened)
                    isOfferCodeRedemptionPresented = true
                }
                .buttonStyle(PaywallButtonStyle(.text))
                .disabled(purchaseManager.isBusy || purchaseManager.isPurchasePending)
            }

            if let restoreMessage {
                Text(restoreMessage)
                    .font(.caption)
                    .foregroundStyle(theme.textSecondary)
                    .lineLimit(1)
                    .help(restoreMessage)
            }

            Spacer()

            Button {
                close()
            } label: {
                Label("Close", systemImage: "xmark")
            }
            .buttonStyle(PaywallButtonStyle(.secondary))
            .keyboardShortcut(.cancelAction)
            .disabled(purchaseManager.isBusy)
        }
    }

    private var loadingState: some View {
        VStack(spacing: 12) {
            ProgressView()
                .controlSize(.small)
            Text("Loading available plans…")
                .font(.subheadline)
                .foregroundStyle(theme.textSecondary)
        }
        .frame(maxWidth: .infinity, minHeight: 180, alignment: .center)
    }

    private var legalFooter: some View {
        VStack(spacing: 9) {
            Text(PurchasePlanDisclosure.text(for: paywallProducts))
                .font(.caption2)
                .foregroundStyle(theme.textSecondary)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)

            HStack(spacing: 12) {
                PaywallLegalLink(
                    title: "Terms of Use",
                    destination: configuration.termsURL
                )
                Text("•")
                    .foregroundStyle(theme.textMuted)
                PaywallLegalLink(
                    title: "Privacy Policy",
                    destination: configuration.privacyURL
                )
            }
        }
    }

    private func featureIcon(_ systemName: String) -> some View {
        Image(systemName: systemName)
            .font(.system(size: 16, weight: .semibold))
            .foregroundStyle(theme.accentForeground)
            .frame(width: 38, height: 38)
            .background(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(theme.accent)
            )
            .accessibilityHidden(true)
    }

    private var resolvedFeatures: [ProPaywallFeature] {
        if !configuration.features.isEmpty {
            return configuration.features
        }
        return purchaseManager.features.map(ProPaywallFeature.init)
    }

    private var paywallProducts: [StoreProduct] {
        purchaseManager.entitlementProducts
    }

    private var selectedProduct: StoreProduct? {
        guard let selectedProductID else { return nil }
        return paywallProducts.first(where: { $0.id == selectedProductID })
    }

    private var canPurchaseSelectedProduct: Bool {
        ProPaywallPresentation.canPurchase(
            selectedProduct: selectedProduct,
            activeProduct: purchaseManager.activeProduct,
            isBusy: purchaseManager.isBusy,
            isPurchasePending: purchaseManager.isPurchasePending
        )
    }

    private var purchaseButtonTitle: String {
        ProPaywallPresentation.purchaseButtonTitle(
            isPurchasing: purchaseManager.isPurchasing,
            isPurchasePending: purchaseManager.isPurchasePending,
            selectedProduct: selectedProduct,
            activeProduct: purchaseManager.activeProduct,
            defaultTitle: configuration.purchaseButtonTitle
        )
    }

    private func selectDefaultPlanIfNeeded() {
        selectedProductID = ProPaywallPresentation.defaultSelectedProductID(
            currentSelection: selectedProductID,
            products: paywallProducts,
            highlightedProductID: configuration.highlightedProductID,
            preferredProductID: purchaseManager.preferredEntitlementProduct?.id,
            activeProductID: purchaseManager.activeProduct?.id
        )
    }

    private func restorePurchases() {
        guard !purchaseManager.isBusy, !purchaseManager.isPurchasePending else { return }
        restoreMessage = nil
        track(ProPaywallAnalytics.restoreStarted)

        Task {
            switch await purchaseManager.restorePurchases() {
            case .restored:
                didCompleteCommerce = true
                track(ProPaywallAnalytics.restoreSucceeded)
                restoreMessage = "Purchases restored."
                onRestored?()
                dismiss()
            case .nothingToRestore:
                track(ProPaywallAnalytics.restoreNothingToRestore)
                restoreMessage = "No previous purchases were found."
            case .failed(let failure):
                if failure.code != .userCancelled {
                    track(ProPaywallAnalytics.restoreFailed(failure))
                    restoreMessage = failure.message
                }
                purchaseManager.clearActivity()
            }
        }
    }

    private func close() {
        if let onClose {
            onClose()
        } else {
            dismiss()
        }
    }

    private func badge(for product: StoreProduct) -> String? {
        ProPaywallPresentation.badge(
            for: product,
            products: paywallProducts,
            highlightedProductID: configuration.highlightedProductID,
            highlightedProductBadge: configuration.highlightedProductBadge,
            activeProductID: purchaseManager.activeProduct?.id
        )
    }

    private var alertBinding: Binding<Bool> {
        Binding(
            get: { alertMessage != nil },
            set: { isPresented in
                if !isPresented {
                    alertMessage = nil
                }
            }
        )
    }

    private func track(_ event: ProPaywallAnalyticsEvent) {
        guard let analytics else { return }

        Task {
            try? await analytics.track(
                event.name,
                dimension: event.dimension
            )
        }
    }

    private func presentError(_ error: Error) {
        if let localizedError = error as? LocalizedError,
           let description = localizedError.errorDescription,
           !description.isEmpty {
            alertMessage = description
        } else {
            alertMessage = error.localizedDescription
        }
    }
}

enum ProPaywallPresentation {
    static func defaultSelectedProductID(
        currentSelection: String?,
        products: [StoreProduct],
        highlightedProductID: String?,
        preferredProductID: String?,
        activeProductID: String?
    ) -> String? {
        if let currentSelection,
           products.contains(where: { $0.id == currentSelection }) {
            return currentSelection
        }

        let selectableProducts = products.filter { $0.id != activeProductID }
        let candidates = selectableProducts.isEmpty ? products : selectableProducts

        if let highlightedProductID,
           candidates.contains(where: { $0.id == highlightedProductID }) {
            return highlightedProductID
        }

        if let preferredProductID,
           candidates.contains(where: { $0.id == preferredProductID }) {
            return preferredProductID
        }

        return candidates.first?.id
    }

    static func badge(
        for product: StoreProduct,
        products: [StoreProduct],
        highlightedProductID: String?,
        highlightedProductBadge: String,
        activeProductID: String?
    ) -> String? {
        if activeProductID == product.id {
            return "CURRENT PLAN"
        }

        if highlightedProductID == product.id {
            let configuredBadge = highlightedProductBadge
                .trimmingCharacters(in: .whitespacesAndNewlines)
            if !configuredBadge.isEmpty {
                return configuredBadge
            }
        }

        if isYearlyPlan(product),
           let monthlyProduct = products.first(where: isMonthlyPlan),
           let savingsPercentage = yearlySavingsPercentage(
               monthlyPrice: monthlyProduct.price,
               yearlyPrice: product.price
           ) {
            return "SAVE \(savingsPercentage)%"
        }

        return nil
    }

    static func canPurchase(
        selectedProduct: StoreProduct?,
        activeProduct: StoreProduct?,
        isBusy: Bool,
        isPurchasePending: Bool
    ) -> Bool {
        guard let selectedProduct,
              !isBusy,
              !isPurchasePending
        else { return false }

        if activeProduct?.id == selectedProduct.id {
            return false
        }

        if activeProduct?.isLifetime == true {
            return false
        }

        return true
    }

    static func purchaseButtonTitle(
        isPurchasing: Bool,
        isPurchasePending: Bool,
        selectedProduct: StoreProduct?,
        activeProduct: StoreProduct?,
        defaultTitle: String
    ) -> String {
        if isPurchasing {
            return "Purchasing…"
        }
        if isPurchasePending {
            return "Pending Approval"
        }
        guard let selectedProduct else {
            return defaultTitle
        }
        if activeProduct?.id == selectedProduct.id {
            return "Current Plan"
        }
        if activeProduct?.isLifetime == true {
            return "Pro Lifetime Active"
        }
        return selectedProduct.purchaseActionTitle(defaultTitle: defaultTitle)
    }

    static func yearlySavingsPercentage(
        monthlyPrice: Double,
        yearlyPrice: Double
    ) -> Int? {
        let annualizedMonthlyPrice = monthlyPrice * 12
        guard annualizedMonthlyPrice > 0,
              yearlyPrice >= 0,
              yearlyPrice < annualizedMonthlyPrice
        else { return nil }

        let percentage = ((annualizedMonthlyPrice - yearlyPrice) / annualizedMonthlyPrice) * 100
        let rounded = Int(percentage.rounded())
        return rounded > 0 ? rounded : nil
    }

    private static func isMonthlyPlan(_ product: StoreProduct) -> Bool {
        guard let period = product.subscriptionPeriod else { return false }
        return period.value == 1 && period.unit == .month
    }

    private static func isYearlyPlan(_ product: StoreProduct) -> Bool {
        guard let period = product.subscriptionPeriod else { return false }
        return (period.value == 1 && period.unit == .year)
            || (period.value == 12 && period.unit == .month)
    }
}

private struct ProPaywallPlanCard: View {
    let product: StoreProduct
    let isSelected: Bool
    let isActivePlan: Bool
    let badge: String?
    let onSelect: () -> Void

    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.macAppTheme) private var theme
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var isHovering = false

    var body: some View {
        Button(action: onSelect) {
            HStack(alignment: .center, spacing: 12) {
                selectionIndicator

                VStack(alignment: .leading, spacing: 4) {
                    Text(product.planLabel)
                        .font(.headline)
                        .foregroundStyle(theme.textPrimary)

                    if !isActivePlan, let headline = product.introductoryOfferHeadline {
                        Text(headline)
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(theme.accent)

                        if let postOffer = product.postIntroductoryOfferBillingDescription {
                            Text(postOffer)
                                .font(.caption2)
                                .foregroundStyle(theme.textSecondary)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    } else {
                        Text(product.isLifetime ? "Pay once" : product.billingDescription)
                            .font(.caption)
                            .foregroundStyle(theme.textSecondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }

                Spacer(minLength: 10)

                VStack(alignment: .trailing, spacing: 7) {
                    if let badge {
                        Text(badge)
                            .font(.caption2.bold())
                            .foregroundStyle(isActivePlan ? theme.textSecondary : theme.accent)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(
                                isActivePlan ? theme.surfaceRaised : theme.accentSoft,
                                in: Capsule()
                            )
                            .overlay {
                                if isActivePlan {
                                    Capsule()
                                        .strokeBorder(theme.border, lineWidth: 0.5)
                                }
                            }
                    }

                    Text(product.displayPrice)
                        .font(.headline.weight(.bold))
                        .foregroundStyle(theme.textPrimary)
                        .lineLimit(1)
                        .minimumScaleFactor(0.65)
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity, minHeight: 78, alignment: .leading)
            .background(
                cardBackground,
                in: RoundedRectangle(cornerRadius: 14, style: .continuous)
            )
            .overlay {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .strokeBorder(
                        cardBorder,
                        lineWidth: isSelected ? 2 : 1
                    )
            }
            .contentShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        }
        .buttonStyle(.plain)
        .onHover { hovering in
            guard isEnabled else {
                isHovering = false
                return
            }

            if reduceMotion {
                isHovering = hovering
            } else {
                withAnimation(.easeOut(duration: 0.12)) {
                    isHovering = hovering
                }
            }
        }
        .onChange(of: isEnabled) { _, enabled in
            if !enabled {
                isHovering = false
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(isSelected ? .isSelected : [])
    }

    private var effectiveHover: Bool {
        isHovering && isEnabled
    }

    private var cardBackground: Color {
        if isSelected {
            return theme.selection
        }
        if effectiveHover {
            return theme.selection.opacity(0.45)
        }
        return theme.surface
    }

    private var cardBorder: Color {
        if isSelected {
            return theme.accent
        }
        if effectiveHover {
            return theme.accent.opacity(0.45)
        }
        return theme.border
    }

    private var selectionIndicator: some View {
        ZStack {
            Circle()
                .strokeBorder(
                    isSelected ? theme.accent : theme.textMuted,
                    lineWidth: 1.5
                )
            if isSelected {
                Circle()
                    .fill(theme.accent)
                    .padding(4)
            }
        }
        .frame(width: 21, height: 21)
        .accessibilityHidden(true)
    }
}

private struct PaywallLegalLink: View {
    let title: String
    let destination: URL

    @Environment(\.macAppTheme) private var theme
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var isHovering = false

    var body: some View {
        Link(destination: destination) {
            Text(title)
                .font(.caption.weight(.semibold))
                .foregroundStyle(isHovering ? theme.textPrimary : theme.accent)
                .padding(.horizontal, 6)
                .padding(.vertical, 4)
                .background(
                    isHovering ? theme.selection.opacity(0.72) : .clear,
                    in: RoundedRectangle(cornerRadius: 6, style: .continuous)
                )
                .contentShape(
                    RoundedRectangle(cornerRadius: 6, style: .continuous)
                )
        }
        .onHover { hovering in
            if reduceMotion {
                isHovering = hovering
            } else {
                withAnimation(.easeOut(duration: 0.12)) {
                    isHovering = hovering
                }
            }
        }
    }
}
#endif
