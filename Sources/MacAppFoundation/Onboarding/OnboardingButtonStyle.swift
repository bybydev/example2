import SwiftUI

/// A framework-owned button style for onboarding actions.
///
/// The style uses explicit sizing, padding, shape, hover, and pressed-state
/// treatment so onboarding controls stay visually consistent across supported
/// macOS releases.
public struct OnboardingButtonStyle: ButtonStyle {
    public enum Prominence: Sendable, Equatable {
        case secondary
        case primary
    }

    private let prominence: Prominence

    public init(_ prominence: Prominence = .secondary) {
        self.prominence = prominence
    }

    public func makeBody(configuration: Configuration) -> some View {
        OnboardingButtonStyleBody(
            label: configuration.label,
            prominence: prominence,
            isPressed: configuration.isPressed
        )
    }
}

private struct OnboardingButtonStyleBody<Label: View>: View {
    let label: Label
    let prominence: OnboardingButtonStyle.Prominence
    let isPressed: Bool

    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.macAppTheme) private var theme
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var isHovering = false

    var body: some View {
        let shape = RoundedRectangle(cornerRadius: 7, style: .continuous)

        label
            .font(.system(size: 13, weight: prominence == .primary ? .semibold : .medium))
            .lineLimit(1)
            .foregroundStyle(foregroundColor)
            .tint(foregroundColor)
            .padding(.horizontal, 14)
            .frame(minHeight: 30)
            .background {
                shape.fill(backgroundColor)
            }
            .overlay {
                shape.strokeBorder(borderColor, lineWidth: 1)
            }
            .contentShape(shape)
            .opacity(isEnabled ? 1 : 0.55)
            .scaleEffect(isPressed && isEnabled && !reduceMotion ? 0.98 : 1)
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
            .animation(
                reduceMotion ? nil : .easeOut(duration: 0.08),
                value: isPressed
            )
    }

    private var effectiveHover: Bool {
        isHovering && isEnabled
    }

    private var foregroundColor: Color {
        switch prominence {
        case .secondary:
            theme.textPrimary
        case .primary:
            theme.accentForeground
        }
    }

    private var backgroundColor: Color {
        switch prominence {
        case .secondary:
            if isPressed && isEnabled { return theme.selection }
            if effectiveHover { return theme.selection.opacity(0.72) }
            return theme.surfaceRaised
        case .primary:
            if isPressed && isEnabled { return theme.accent.opacity(0.84) }
            if effectiveHover { return theme.accent.opacity(0.9) }
            return theme.accent
        }
    }

    private var borderColor: Color {
        switch prominence {
        case .secondary:
            effectiveHover ? theme.accent.opacity(0.45) : theme.border
        case .primary:
            .clear
        }
    }
}
