import Foundation
import SwiftUI

struct ProFeatureComparisonItem: Identifiable, Hashable, Sendable {
    let id: String
    let systemImage: String
    let title: String
    let message: String
    let freeValue: String
    let proValue: String

    init(_ feature: PurchaseFeature) {
        self.id = feature.id
        self.systemImage = feature.systemImage
        self.title = feature.title
        self.message = feature.message
        self.freeValue = feature.freeValue
        self.proValue = feature.proValue
    }

    init(_ benefit: ProUpsellBenefit) {
        self.id = benefit.id
        self.systemImage = benefit.systemImage
        self.title = benefit.title
        self.message = benefit.message
        self.freeValue = benefit.freeValue
        self.proValue = benefit.proValue
    }
}

@MainActor
struct ProFeatureComparisonSection: View {
    @Environment(\.macAppTheme) private var theme

    let items: [ProFeatureComparisonItem]
    let freeTitle: String
    let proTitle: String
    let isProActive: Bool
    let freeColumnWidth: CGFloat
    let proColumnWidth: CGFloat

    init(
        items: [ProFeatureComparisonItem],
        freeTitle: String = "Free",
        proTitle: String = "Pro",
        isProActive: Bool = false,
        freeColumnWidth: CGFloat = 128,
        proColumnWidth: CGFloat = 140
    ) {
        self.items = items
        self.freeTitle = freeTitle
        self.proTitle = proTitle
        self.isProActive = isProActive
        self.freeColumnWidth = freeColumnWidth
        self.proColumnWidth = proColumnWidth
    }

    nonisolated static func showsComparisonTable(for items: [ProFeatureComparisonItem]) -> Bool {
        items.contains {
            !$0.freeValue.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                || !$0.proValue.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        }
    }

    var body: some View {
        Group {
            if Self.showsComparisonTable(for: items) {
                comparisonTable
            } else {
                fallbackFeatureList
            }
        }
        .background(
            theme.surface,
            in: RoundedRectangle(cornerRadius: 12, style: .continuous)
        )
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .strokeBorder(theme.border, lineWidth: 1)
        }
    }

    private var comparisonTable: some View {
        VStack(spacing: 0) {
            HStack(alignment: .center, spacing: 0) {
                Text("FEATURE")
                    .font(.system(size: 11, weight: .semibold))
                    .tracking(0.4)
                    .foregroundStyle(theme.textMuted)
                    .padding(.leading, 16)
                    .padding(.trailing, 12)
                    .frame(maxWidth: .infinity, alignment: .leading)

                Text(freeTitle.uppercased())
                    .font(.system(size: 11, weight: .semibold))
                    .tracking(0.4)
                    .foregroundStyle(theme.textSecondary)
                    .lineLimit(1)
                    .padding(.horizontal, 12)
                    .frame(width: freeColumnWidth, alignment: .leading)

                HStack(spacing: 4) {
                    if isProActive {
                        Image(systemName: "checkmark")
                            .font(.system(size: 10, weight: .bold))
                            .accessibilityHidden(true)
                    }

                    Text(proTitle.uppercased())
                        .font(.system(size: 11, weight: .semibold))
                        .tracking(0.4)
                        .lineLimit(1)
                }
                .foregroundStyle(theme.accent)
                .padding(.leading, 12)
                .padding(.trailing, 16)
                .frame(width: proColumnWidth, alignment: .leading)
            }
            .padding(.vertical, 10)
            .accessibilityHidden(true)

            ForEach(items) { item in
                Rectangle()
                    .fill(theme.separator.opacity(0.72))
                    .frame(height: 1)

                HStack(alignment: .center, spacing: 0) {
                    HStack(alignment: .center, spacing: 10) {
                        featureIcon(item.systemImage, size: 26, cornerRadius: 7, glyphSize: 12)

                        Text(item.title)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundStyle(theme.textPrimary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(.leading, 16)
                    .padding(.trailing, 12)
                    .frame(maxWidth: .infinity, alignment: .leading)

                    Text(displayValue(item.freeValue))
                        .font(.system(size: 12))
                        .foregroundStyle(theme.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                        .padding(.horizontal, 12)
                        .frame(width: freeColumnWidth, alignment: .leading)

                    Text(displayValue(item.proValue))
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(isProActive ? theme.accent : theme.textPrimary)
                        .fixedSize(horizontal: false, vertical: true)
                        .padding(.leading, 12)
                        .padding(.trailing, 16)
                        .frame(width: proColumnWidth, alignment: .leading)
                }
                .padding(.vertical, 10)
                .accessibilityElement(children: .ignore)
                .accessibilityLabel(item.title)
                .accessibilityValue(
                    "\(freeTitle): \(displayValue(item.freeValue)), \(proTitle): \(displayValue(item.proValue))"
                )
            }
        }
        .background(alignment: .trailing) {
            theme.accentSoft.opacity(0.35)
                .frame(width: proColumnWidth)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var fallbackFeatureList: some View {
        VStack(alignment: .leading, spacing: 12) {
            ForEach(items) { item in
                HStack(alignment: .top, spacing: 12) {
                    featureIcon(item.systemImage, size: 28, cornerRadius: 8, glyphSize: 13)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(item.title)
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundStyle(theme.textPrimary)

                        Text(item.message)
                            .font(.system(size: 12))
                            .foregroundStyle(theme.textSecondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }

                    Spacer(minLength: 0)
                }
                .accessibilityElement(children: .combine)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func featureIcon(
        _ systemImage: String,
        size: CGFloat,
        cornerRadius: CGFloat,
        glyphSize: CGFloat
    ) -> some View {
        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
            .fill(featureIconBackground)
            .frame(width: size, height: size)
            .overlay {
                Image(systemName: systemImage)
                    .font(.system(size: glyphSize, weight: .semibold))
                    .foregroundStyle(featureIconForeground)
            }
            .overlay {
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .strokeBorder(theme.border, lineWidth: 0.5)
            }
            .accessibilityHidden(true)
    }

    private func displayValue(_ rawValue: String) -> String {
        let trimmed = rawValue.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? "—" : trimmed
    }

    private var featureIconBackground: Color {
        isProActive ? theme.accentSoft : theme.surfaceRaised
    }

    private var featureIconForeground: Color {
        isProActive ? theme.accent : theme.textSecondary
    }
}
