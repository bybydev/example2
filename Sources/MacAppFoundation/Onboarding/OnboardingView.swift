import Foundation
import SwiftUI

/// A neutral onboarding shell whose entire main content area belongs to the app.
///
/// MacAppFoundation owns only the footer layout: leading actions, a centered
/// message, and trailing actions. The app supplies every view in the content area.
public struct OnboardingView<Content: View, LeadingActions: View, Message: View, TrailingActions: View>: View {
    @Environment(\.macAppTheme) private var theme

    private let content: Content
    private let leadingActions: LeadingActions
    private let message: Message
    private let trailingActions: TrailingActions

    public init(
        @ViewBuilder content: () -> Content,
        @ViewBuilder leadingActions: () -> LeadingActions,
        @ViewBuilder message: () -> Message,
        @ViewBuilder trailingActions: () -> TrailingActions
    ) {
        self.content = content()
        self.leadingActions = leadingActions()
        self.message = message()
        self.trailingActions = trailingActions()
    }

    public var body: some View {
        VStack(spacing: 0) {
            content
                .frame(maxWidth: .infinity, maxHeight: .infinity)

            OnboardingFooter(
                leadingActions: { leadingActions },
                message: { message },
                trailingActions: { trailingActions }
            )
        }
        .background(theme.canvas)
    }
}

/// The framework-owned footer used by ``OnboardingView``.
///
/// The center message stays visually centered in the window independently of
/// the width of the actions on either side, and truncates cleanly between the
/// action groups when horizontal space is tight. Leading actions use the
/// secondary onboarding button style and trailing actions use the primary style
/// by default. Apps can still apply a more specific button style to an
/// individual action.
public struct OnboardingFooter<LeadingActions: View, Message: View, TrailingActions: View>: View {
    @Environment(\.macAppTheme) private var theme
    @Environment(\.displayScale) private var displayScale

    private let leadingActions: LeadingActions
    private let message: Message
    private let trailingActions: TrailingActions

    public init(
        @ViewBuilder leadingActions: () -> LeadingActions,
        @ViewBuilder message: () -> Message,
        @ViewBuilder trailingActions: () -> TrailingActions
    ) {
        self.leadingActions = leadingActions()
        self.message = message()
        self.trailingActions = trailingActions()
    }

    public var body: some View {
        OnboardingFooterLayout(minSpacing: 16) {
            HStack(spacing: 8) {
                leadingActions
            }
            .buttonStyle(OnboardingButtonStyle(.secondary))

            HStack(spacing: 0) {
                message
            }
            .lineLimit(1)
            .truncationMode(.tail)

            HStack(spacing: 8) {
                trailingActions
            }
            .buttonStyle(OnboardingButtonStyle(.primary))
        }
        .padding(.horizontal, 16)
        .frame(maxWidth: .infinity)
        .frame(height: 52)
        .background(theme.canvas)
        .overlay(alignment: .top) {
            Rectangle()
                .fill(theme.separator.opacity(0.85))
                .frame(height: 1 / displayScale)
        }
    }
}

struct OnboardingFooterMessagePlacement: Equatable {
    let originX: CGFloat
    let availableWidth: CGFloat
}

enum OnboardingFooterLayoutMetrics {
    static func messagePlacement(
        boundsWidth: CGFloat,
        leadingWidth: CGFloat,
        trailingWidth: CGFloat,
        messageIdealWidth: CGFloat,
        minSpacing: CGFloat
    ) -> OnboardingFooterMessagePlacement {
        let safeBoundsWidth = max(0, boundsWidth)
        let leadingEdge = leadingWidth > 0 ? leadingWidth + minSpacing : 0
        let trailingEdge = safeBoundsWidth - (trailingWidth > 0 ? trailingWidth + minSpacing : 0)
        let availableWidth = max(0, trailingEdge - leadingEdge)
        let placedWidth = min(max(0, messageIdealWidth), availableWidth)

        let centeredOriginX = (safeBoundsWidth - placedWidth) / 2
        let maxOriginX = max(leadingEdge, trailingEdge - placedWidth)
        let clampedOriginX = min(max(centeredOriginX, leadingEdge), maxOriginX)

        return OnboardingFooterMessagePlacement(
            originX: clampedOriginX,
            availableWidth: availableWidth
        )
    }
}

private struct OnboardingFooterLayout: Layout {
    let minSpacing: CGFloat

    func sizeThatFits(
        proposal: ProposedViewSize,
        subviews: Subviews,
        cache: inout ()
    ) -> CGSize {
        guard subviews.count == 3 else {
            return proposal.replacingUnspecifiedDimensions()
        }

        let leadingSize = subviews[0].sizeThatFits(.unspecified)
        let messageSize = subviews[1].sizeThatFits(.unspecified)
        let trailingSize = subviews[2].sizeThatFits(.unspecified)

        let naturalWidth = leadingSize.width
            + messageSize.width
            + trailingSize.width
            + (leadingSize.width > 0 ? minSpacing : 0)
            + (trailingSize.width > 0 ? minSpacing : 0)
        let naturalHeight = max(leadingSize.height, messageSize.height, trailingSize.height)

        return CGSize(
            width: proposal.width ?? naturalWidth,
            height: proposal.height ?? naturalHeight
        )
    }

    func placeSubviews(
        in bounds: CGRect,
        proposal: ProposedViewSize,
        subviews: Subviews,
        cache: inout ()
    ) {
        guard subviews.count == 3 else { return }

        let leadingSize = subviews[0].sizeThatFits(.unspecified)
        let trailingSize = subviews[2].sizeThatFits(.unspecified)

        let preliminary = OnboardingFooterLayoutMetrics.messagePlacement(
            boundsWidth: bounds.width,
            leadingWidth: leadingSize.width,
            trailingWidth: trailingSize.width,
            messageIdealWidth: 0,
            minSpacing: minSpacing
        )
        let messageSize = subviews[1].sizeThatFits(
            ProposedViewSize(width: preliminary.availableWidth, height: bounds.height)
        )
        let placement = OnboardingFooterLayoutMetrics.messagePlacement(
            boundsWidth: bounds.width,
            leadingWidth: leadingSize.width,
            trailingWidth: trailingSize.width,
            messageIdealWidth: messageSize.width,
            minSpacing: minSpacing
        )

        subviews[0].place(
            at: CGPoint(x: bounds.minX, y: bounds.midY),
            anchor: .leading,
            proposal: ProposedViewSize(leadingSize)
        )

        subviews[1].place(
            at: CGPoint(x: bounds.minX + placement.originX, y: bounds.midY),
            anchor: .leading,
            proposal: ProposedViewSize(width: placement.availableWidth, height: bounds.height)
        )

        subviews[2].place(
            at: CGPoint(x: bounds.maxX, y: bounds.midY),
            anchor: .trailing,
            proposal: ProposedViewSize(trailingSize)
        )
    }
}

/// Convenience center message for step-based onboarding flows.
///
/// The title is intentionally optional so apps can display either a compact
/// "Step 2 of 4" message or combine the step with app-owned context such as
/// "Step 2 of 4 · Permissions".
public struct OnboardingStepMessage: View {
    @Environment(\.macAppTheme) private var theme

    public let title: String?
    public let currentStep: Int
    public let stepCount: Int

    public init(
        title: String? = nil,
        currentStep: Int,
        stepCount: Int
    ) {
        self.title = title
        self.currentStep = currentStep
        self.stepCount = stepCount
    }

    public var body: some View {
        Text(message)
            .font(.callout)
            .monospacedDigit()
            .foregroundStyle(theme.textSecondary)
            .help(message)
    }

    var message: String {
        Self.formattedMessage(
            title: title,
            currentStep: currentStep,
            stepCount: stepCount
        )
    }

    nonisolated static func formattedMessage(
        title: String?,
        currentStep: Int,
        stepCount: Int
    ) -> String {
        let safeCount = max(stepCount, 1)
        let displayedStep = min(max(currentStep + 1, 1), safeCount)
        let progress = "Step \(displayedStep) of \(safeCount)"

        guard let title = title?.trimmingCharacters(in: .whitespacesAndNewlines),
              !title.isEmpty
        else {
            return progress
        }

        return "\(progress) · \(title)"
    }
}
