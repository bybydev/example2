import SwiftUI

/// General-purpose MacAppFoundation button styling backed by the active app theme.
///
/// Feature-specific components may provide their own semantic wrappers, while
/// generic framework-owned surfaces can use this style directly without falling
/// back to OS-version-dependent bordered button appearances.
public struct MacAppButtonStyle: ButtonStyle {
    public enum Kind: Sendable, Equatable {
        case primary
        case secondary
        case quiet
    }

    private let kind: Kind

    public init(_ kind: Kind = .secondary) {
        self.kind = kind
    }

    public func makeBody(configuration: Configuration) -> some View {
        MacAppButtonStyleBody(
            label: configuration.label,
            kind: kind,
            isPressed: configuration.isPressed
        )
    }
}

private struct MacAppButtonStyleBody<Label: View>: View {
    let label: Label
    let kind: MacAppButtonStyle.Kind
    let isPressed: Bool

    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.macAppTheme) private var theme
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var isHovering = false

    var body: some View {
        let shape = RoundedRectangle(cornerRadius: 8, style: .continuous)

        label
            .font(.system(size: 13, weight: kind == .primary ? .semibold : .medium))
            .lineLimit(1)
            .foregroundStyle(foregroundColor)
            .tint(foregroundColor)
            .padding(.horizontal, horizontalPadding)
            .frame(minHeight: 32)
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

    private var horizontalPadding: CGFloat {
        kind == .quiet ? 8 : 14
    }

    private var foregroundColor: Color {
        switch kind {
        case .primary:
            theme.accentForeground
        case .secondary:
            theme.textPrimary
        case .quiet:
            effectiveHover ? theme.textPrimary : theme.textSecondary
        }
    }

    private var backgroundColor: Color {
        switch kind {
        case .primary:
            if isPressed { return theme.accent.opacity(0.84) }
            if effectiveHover { return theme.accent.opacity(0.9) }
            return theme.accent
        case .secondary:
            if isPressed { return theme.selection }
            if effectiveHover { return theme.selection.opacity(0.72) }
            return theme.surfaceRaised
        case .quiet:
            if isPressed { return theme.selection }
            if effectiveHover { return theme.selection.opacity(0.55) }
            return .clear
        }
    }

    private var borderColor: Color {
        switch kind {
        case .primary, .quiet:
            .clear
        case .secondary:
            effectiveHover ? theme.accent.opacity(0.45) : theme.border
        }
    }
}
