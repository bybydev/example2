#if DEBUG
import AppKit
import Combine
import CoreFoundation
import Foundation
import SwiftUI

enum FoundationDeveloperUserDefaultsValueType: String, CaseIterable, Identifiable {
    case string
    case bool
    case integer
    case double
    case date
    case data
    case array
    case dictionary

    var id: String { rawValue }

    var title: String {
        switch self {
        case .string: "String"
        case .bool: "Bool"
        case .integer: "Integer"
        case .double: "Double"
        case .date: "Date"
        case .data: "Data"
        case .array: "Array"
        case .dictionary: "Dictionary"
        }
    }

    var systemImage: String {
        switch self {
        case .string: "textformat"
        case .bool: "switch.2"
        case .integer: "number"
        case .double: "function"
        case .date: "calendar"
        case .data: "doc.on.clipboard"
        case .array: "list.bullet"
        case .dictionary: "curlybraces"
        }
    }
}

struct FoundationDeveloperUserDefaultRow: Identifiable {
    var id: String { key }

    let key: String
    let type: FoundationDeveloperUserDefaultsValueType
    let value: Any
    let displayValue: String
    let isPersistent: Bool
}

enum FoundationDeveloperUserDefaultsCodec {
    static func valueType(for value: Any) -> FoundationDeveloperUserDefaultsValueType? {
        if let number = value as? NSNumber {
            if CFGetTypeID(number) == CFBooleanGetTypeID() {
                return .bool
            }

            let encoding = String(cString: number.objCType)
            if encoding == "f" || encoding == "d" {
                return .double
            }
            return .integer
        }

        if value is String { return .string }
        if value is Date { return .date }
        if value is Data { return .data }
        if value is [Any] { return .array }
        if value is [String: Any] { return .dictionary }
        return nil
    }

    static func displayValue(_ value: Any) -> String {
        switch valueType(for: value) {
        case .string:
            return value as? String ?? ""
        case .bool:
            return (value as? NSNumber)?.boolValue == true ? "true" : "false"
        case .integer:
            return String((value as? NSNumber)?.int64Value ?? 0)
        case .double:
            return String((value as? NSNumber)?.doubleValue ?? 0)
        case .date:
            guard let date = value as? Date else { return "Invalid date" }
            return ISO8601DateFormatter().string(from: date)
        case .data:
            return "\((value as? Data)?.count ?? 0) bytes"
        case .array:
            return "\((value as? [Any])?.count ?? 0) items"
        case .dictionary:
            return "\((value as? [String: Any])?.count ?? 0) keys"
        case nil:
            return String(describing: value)
        }
    }

    static func copyValue(_ value: Any) -> String {
        switch valueType(for: value) {
        case .data:
            return (value as? Data)?.base64EncodedString() ?? ""
        case .array, .dictionary:
            return propertyListText(value) ?? String(describing: value)
        default:
            return displayValue(value)
        }
    }

    static func propertyListText(_ value: Any) -> String? {
        guard PropertyListSerialization.propertyList(value, isValidFor: .xml) else {
            return nil
        }
        guard let data = try? PropertyListSerialization.data(
            fromPropertyList: value,
            format: .xml,
            options: 0
        ) else {
            return nil
        }
        return String(data: data, encoding: .utf8)
    }
}

@MainActor
final class FoundationDeveloperUserDefaultsModel: ObservableObject {
    @Published private(set) var rows: [FoundationDeveloperUserDefaultRow] = []

    let defaults: UserDefaults
    let domainName: String?

    init(
        defaults: UserDefaults = .standard,
        domainName: String? = Bundle.main.bundleIdentifier
    ) {
        self.defaults = defaults
        self.domainName = domainName
        refresh()
    }

    func refresh() {
        let effective = defaults.dictionaryRepresentation()
        let persistentKeys: Set<String>
        if let domainName {
            persistentKeys = Set(
                (defaults.persistentDomain(forName: domainName) ?? [:]).keys
            )
        } else {
            persistentKeys = []
        }

        rows = effective
            .compactMap { key, value -> FoundationDeveloperUserDefaultRow? in
                guard let type = FoundationDeveloperUserDefaultsCodec.valueType(for: value) else {
                    return nil
                }
                return FoundationDeveloperUserDefaultRow(
                    key: key,
                    type: type,
                    value: value,
                    displayValue: FoundationDeveloperUserDefaultsCodec.displayValue(value),
                    isPersistent: persistentKeys.contains(key)
                )
            }
            .sorted { $0.key.localizedCaseInsensitiveCompare($1.key) == .orderedAscending }
    }

    func set(_ value: Any, forKey key: String) {
        defaults.set(value, forKey: key)
        refresh()
    }

    func removeValue(forKey key: String) {
        defaults.removeObject(forKey: key)
        refresh()
    }

    func resetPersistentDomain() {
        guard let domainName else { return }
        defaults.removePersistentDomain(forName: domainName)
        refresh()
    }
}

private enum UserDefaultsScope: String, CaseIterable, Identifiable {
    case stored
    case all

    var id: String { rawValue }

    var title: String {
        switch self {
        case .stored: "App Stored"
        case .all: "All Effective"
        }
    }
}

@MainActor
struct FoundationDeveloperUserDefaultsView: View {
    @Environment(\.macAppTheme) private var theme

    @StateObject private var model: FoundationDeveloperUserDefaultsModel
    @State private var scope: UserDefaultsScope = .stored
    @State private var searchText = ""
    @State private var pendingDelete: FoundationDeveloperUserDefaultRow?
    @State private var resetConfirmationPresented = false
    @State private var statusMessage: String?

    init(
        defaults: UserDefaults = .standard,
        domainName: String? = Bundle.main.bundleIdentifier
    ) {
        _model = StateObject(
            wrappedValue: FoundationDeveloperUserDefaultsModel(
                defaults: defaults,
                domainName: domainName
            )
        )
    }

    var body: some View {
        List {
            Section("Domain") {
                LabeledContent("Persistent domain", value: model.domainName ?? "Unavailable")
                LabeledContent("Stored values", value: "\(model.rows.filter(\.isPersistent).count)")
                Picker("Show", selection: $scope) {
                    ForEach(UserDefaultsScope.allCases) { option in
                        Text(option.title).tag(option)
                    }
                }
                .pickerStyle(.segmented)
            }

            Section {
                if filteredRows.isEmpty {
                    ContentUnavailableView(
                        searchText.isEmpty ? "No User Defaults" : "No Matches",
                        systemImage: "slider.horizontal.3",
                        description: Text(
                            searchText.isEmpty
                                ? "No keys in this scope."
                                : "No keys or values match your search."
                        )
                    )
                } else {
                    ForEach(filteredRows) { row in
                        userDefaultRow(row)
                    }
                }
            } header: {
                HStack {
                    Text("Values")
                    Spacer()
                    Text("\(filteredRows.count)")
                        .font(.caption)
                        .foregroundStyle(theme.textMuted)
                }
            }

            Section("Actions") {
                Button("Reset App UserDefaults", systemImage: "trash", role: .destructive) {
                    resetConfirmationPresented = true
                }
                .disabled(model.domainName == nil || !model.rows.contains(where: \.isPersistent))

                if let statusMessage {
                    Text(statusMessage)
                        .font(.caption)
                        .foregroundStyle(theme.textSecondary)
                }
            }
        }
        .listStyle(.inset)
        .scrollContentBackground(.hidden)
        .background(theme.canvas)
        .searchable(text: $searchText, prompt: "Search keys or values")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    model.refresh()
                    statusMessage = "UserDefaults refreshed."
                } label: {
                    Label("Refresh", systemImage: "arrow.clockwise")
                }
                .help("Refresh UserDefaults")
            }
        }
        .confirmationDialog(
            "Delete UserDefaults Value?",
            isPresented: Binding(
                get: { pendingDelete != nil },
                set: { if !$0 { pendingDelete = nil } }
            ),
            presenting: pendingDelete
        ) { row in
            Button("Delete \(row.key)", role: .destructive) {
                model.removeValue(forKey: row.key)
                statusMessage = "Removed \(row.key)."
                pendingDelete = nil
            }
            Button("Cancel", role: .cancel) {
                pendingDelete = nil
            }
        } message: { row in
            Text("Removes \(row.key) from the app's persistent domain.")
        }
        .confirmationDialog(
            "Reset App UserDefaults?",
            isPresented: $resetConfirmationPresented
        ) {
            Button("Reset App UserDefaults", role: .destructive) {
                model.resetPersistentDomain()
                statusMessage = "App UserDefaults reset."
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Removes every stored value in the app's persistent UserDefaults domain.")
        }
    }

    private var filteredRows: [FoundationDeveloperUserDefaultRow] {
        let scoped = scope == .stored ? model.rows.filter(\.isPersistent) : model.rows
        let query = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !query.isEmpty else { return scoped }

        return scoped.filter {
            $0.key.localizedCaseInsensitiveContains(query)
                || $0.displayValue.localizedCaseInsensitiveContains(query)
        }
    }

    private func userDefaultRow(_ row: FoundationDeveloperUserDefaultRow) -> some View {
        HStack(alignment: .center, spacing: 10) {
            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(row.key)
                        .font(.callout.monospaced())
                        .textSelection(.enabled)

                    Text(row.type.title)
                        .font(.caption2)
                        .foregroundStyle(theme.textMuted)
                }

                if row.type != .bool {
                    Text(row.displayValue)
                        .font(.caption.monospaced())
                        .foregroundStyle(theme.textSecondary)
                        .lineLimit(2)
                        .textSelection(.enabled)
                }
            }

            Spacer(minLength: 8)

            if row.type == .bool {
                Toggle(
                    "",
                    isOn: Binding(
                        get: { (row.value as? NSNumber)?.boolValue == true },
                        set: { newValue in
                            model.set(newValue, forKey: row.key)
                            statusMessage = "Updated \(row.key)."
                        }
                    )
                )
                .labelsHidden()
                .toggleStyle(.switch)
                .controlSize(.small)
            }

            Button {
                let text = FoundationDeveloperUserDefaultsCodec.copyValue(row.value)
                let pasteboard = NSPasteboard.general
                pasteboard.clearContents()
                pasteboard.setString(text, forType: .string)
                statusMessage = "Copied \(row.key)."
            } label: {
                Image(systemName: "doc.on.doc")
            }
            .buttonStyle(.borderless)
            .help("Copy value")

            if row.isPersistent {
                Button(role: .destructive) {
                    pendingDelete = row
                } label: {
                    Image(systemName: "trash")
                }
                .buttonStyle(.borderless)
                .help("Delete key")
            }
        }
        .padding(.vertical, 2)
    }
}
#endif
