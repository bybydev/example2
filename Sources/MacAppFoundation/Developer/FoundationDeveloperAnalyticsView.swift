#if DEBUG
import AppKit
import SwiftUI

private enum DeveloperAnalyticsEnabledOverride: String, CaseIterable, Identifiable {
    case configured
    case enabled
    case disabled

    var id: String { rawValue }

    var title: String {
        switch self {
        case .configured: "Configured"
        case .enabled: "On"
        case .disabled: "Off"
        }
    }

    var value: Bool? {
        switch self {
        case .configured: nil
        case .enabled: true
        case .disabled: false
        }
    }

    init(_ value: Bool?) {
        switch value {
        case true: self = .enabled
        case false: self = .disabled
        case nil: self = .configured
        }
    }
}

@MainActor
struct FoundationDeveloperAnalyticsView: View {
    @Environment(\.macAppTheme) private var theme

    let analytics: AppAnalyticsClient?
    var onStorageModeChange: ((AppAnalyticsStorageMode) -> Void)? = nil

    @ObservedObject private var activityStore = AppAnalyticsDeveloperActivityStore.shared
    @State private var snapshot: AppAnalyticsDeveloperSnapshot?
    @State private var loadError: String?
    @State private var actionStatus: String?
    @State private var actionStatusIsError = false
    @State private var isFlushing = false
    @State private var resetConfirmationPresented = false

    private let timestampFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd HH:mm:ss.SSS"
        return formatter
    }()

    var body: some View {
        Group {
            if let analytics {
                configuredView
                    .task(id: ObjectIdentifier(analytics)) {
                        await refreshLoop(analytics)
                    }
            } else {
                ContentUnavailableView(
                    "Analytics Not Connected",
                    systemImage: "chart.bar.xaxis",
                    description: Text(
                        "Attach the app-scoped analytics client to the Developer Tools scene with .managesAnalytics(analytics)."
                    )
                )
                .background(theme.canvas)
            }
        }
        .toolbar {
            if let analytics {
                ToolbarItemGroup(placement: .primaryAction) {
                    Button {
                        Task { await refresh(analytics) }
                    } label: {
                        Label("Refresh", systemImage: "arrow.clockwise")
                    }
                    .help("Refresh the local analytics snapshot")

                    Button {
                        Task { await flush(analytics) }
                    } label: {
                        if isFlushing {
                            ProgressView()
                                .controlSize(.small)
                        } else {
                            Label("Flush", systemImage: "arrow.up.circle")
                        }
                    }
                    .disabled(isFlushing)
                    .help("Flush pending analytics to the configured server")

                    Button {
                        copySnapshot()
                    } label: {
                        Label("Copy Snapshot", systemImage: "doc.on.doc")
                    }
                    .disabled(snapshot == nil)
                }
            }
        }
        .confirmationDialog(
            "Reset Local Analytics State?",
            isPresented: $resetConfirmationPresented
        ) {
            Button("Reset Local State", role: .destructive) {
                if let analytics {
                    Task { await resetLocalState(analytics) }
                }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This clears locally stored analytics counters and session state. The installation identity is preserved.")
        }
    }

    @ViewBuilder
    private var configuredView: some View {
        if let snapshot {
            List {
                controlsSection(snapshot.configuration)
                statusSection(snapshot)
                storedDaysSection(snapshot.days)
                liveActivitySection
            }
            .listStyle(.inset)
            .scrollContentBackground(.hidden)
            .background(theme.canvas)
        } else if let loadError {
            ContentUnavailableView(
                "Analytics Snapshot Unavailable",
                systemImage: "exclamationmark.triangle",
                description: Text(loadError)
            )
            .background(theme.canvas)
        } else {
            ProgressView("Loading analytics…")
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(theme.canvas)
        }
    }

    private func controlsSection(
        _ configuration: AppAnalyticsDeveloperSnapshot.Configuration
    ) -> some View {
        Section {
            if let analytics {
                LabeledContent("Developer override") {
                    Picker(
                        "Developer override",
                        selection: Binding(
                            get: {
                                DeveloperAnalyticsEnabledOverride(
                                    configuration.developerEnabledOverride
                                )
                            },
                            set: { selection in
                                Task {
                                    await setEnabledOverride(
                                        selection.value,
                                        configuration: configuration,
                                        analytics: analytics
                                    )
                                }
                            }
                        )
                    ) {
                        ForEach(DeveloperAnalyticsEnabledOverride.allCases) { option in
                            Text(option.title).tag(option)
                        }
                    }
                    .labelsHidden()
                    .pickerStyle(.segmented)
                    .frame(width: 240)
                }

                LabeledContent("Storage mode") {
                    Picker(
                        "Storage mode",
                        selection: Binding(
                            get: { configuration.storageMode },
                            set: { selection in
                                setStorageMode(
                                    selection,
                                    current: configuration.storageMode
                                )
                            }
                        )
                    ) {
                        Text("Persisted").tag(AppAnalyticsStorageMode.persisted)
                        Text("In Memory").tag(AppAnalyticsStorageMode.inMemory)
                    }
                    .labelsHidden()
                    .pickerStyle(.segmented)
                    .frame(width: 240)
                    .disabled(onStorageModeChange == nil)
                }

                HStack(spacing: 10) {
                    Button("Send Test Event", systemImage: "paperplane") {
                        Task { await sendTestEvent(analytics) }
                    }
                    .disabled(isFlushing)

                    Button("Flush Now", systemImage: "arrow.up.circle") {
                        Task { await flush(analytics) }
                    }
                    .disabled(isFlushing)

                    Spacer()

                    Button("Reset Local State", systemImage: "trash", role: .destructive) {
                        resetConfirmationPresented = true
                    }
                }
            }

            if let actionStatus {
                Label(
                    actionStatus,
                    systemImage: actionStatusIsError
                        ? "xmark.circle.fill"
                        : "checkmark.circle.fill"
                )
                .font(.caption)
                .foregroundStyle(actionStatusIsError ? theme.destructive : theme.success)
                .textSelection(.enabled)
            }
        } header: {
            Text("Controls")
        } footer: {
            Text("Persisted mode keeps the installation ID in Keychain and counters in UserDefaults. In-memory mode keeps both in memory for this client instance only.")
                .foregroundStyle(theme.textSecondary)
        }
    }

    private func statusSection(
        _ snapshot: AppAnalyticsDeveloperSnapshot
    ) -> some View {
        let configuration = snapshot.configuration
        let runtime = snapshot.runtime

        return Section("Status") {
            LabeledContent(
                "Enabled",
                value: "\(configuration.effectiveEnabled ? "On" : "Off") (configured: \(configuration.configuredEnabled ? "On" : "Off"))"
            )
            copyableValue("App ID", configuration.appID)
            copyableValue("Endpoint", configuration.endpointURL.absoluteString)
            copyableValue("Installation ID", runtime.installationID ?? "Not created")

            if let installationIdentityError = runtime.installationIdentityError {
                LabeledContent("Identity error") {
                    Text(installationIdentityError)
                        .foregroundStyle(theme.destructive)
                        .textSelection(.enabled)
                }
            }

            LabeledContent("Upload interval", value: durationLabel(configuration.uploadInterval))
            LabeledContent("Active session", value: runtime.activeSession ? "Yes" : "No")
            LabeledContent("Stored UTC days", value: "\(runtime.pendingDayCount)")
            LabeledContent("Last upload", value: dateLabel(runtime.lastUploadAt))
            LabeledContent("Next attempt", value: dateLabel(runtime.nextUploadAttemptAt))
            LabeledContent(
                "Pipeline",
                value: runtime.uploadInFlight
                    ? "Uploading"
                    : (runtime.automaticUploadScheduled ? "Scheduled" : "Idle")
            )
        }
    }

    private func storedDaysSection(
        _ days: [AppAnalyticsDeveloperSnapshot.Day]
    ) -> some View {
        Section("Stored Counters") {
            if days.isEmpty {
                Text("No locally stored analytics counters.")
                    .foregroundStyle(theme.textSecondary)
            } else {
                ForEach(days) { day in
                    DisclosureGroup {
                        LabeledContent("Sessions", value: "\(day.sessions) (\(day.sessionSeconds)s)")
                        LabeledContent("App version", value: day.appVersion ?? "Unavailable")

                        if !day.events.isEmpty {
                            Text("Events")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(theme.textSecondary)

                            ForEach(day.events) { event in
                                LabeledContent(eventTitle(event)) {
                                    Text("\(event.count)")
                                        .monospacedDigit()
                                }
                            }
                        }

                        if !day.errors.isEmpty {
                            Text("Errors")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(theme.textSecondary)

                            ForEach(day.errors) { error in
                                LabeledContent(errorTitle(error)) {
                                    Text("\(error.count)")
                                        .monospacedDigit()
                                }
                            }
                        }
                    } label: {
                        HStack {
                            Text(day.day)
                                .font(.body.monospaced())
                            Spacer()
                            Text(
                                "\(day.events.count) events · \(day.errors.count) errors · \(day.sessions) sessions"
                            )
                            .font(.caption)
                            .foregroundStyle(theme.textSecondary)
                        }
                    }
                }
            }
        }
    }

    private var liveActivitySection: some View {
        Section {
            if activityStore.entries.isEmpty {
                Text("No analytics activity captured yet.")
                    .foregroundStyle(theme.textSecondary)
            } else {
                ForEach(activityStore.entries.reversed()) { entry in
                    VStack(alignment: .leading, spacing: 3) {
                        HStack(spacing: 8) {
                            Text(timestampFormatter.string(from: entry.timestamp))
                                .font(.caption.monospaced())
                                .foregroundStyle(theme.textMuted)

                            Text(entry.kind.rawValue)
                                .font(.caption.weight(.semibold))

                            Text(entry.title)
                                .font(.caption.monospaced())
                                .textSelection(.enabled)

                            Spacer()
                        }

                        if let detail = entry.detail {
                            Text(detail)
                                .font(.caption.monospaced())
                                .foregroundStyle(theme.textSecondary)
                                .textSelection(.enabled)
                        }
                    }
                    .padding(.vertical, 2)
                }
            }
        } header: {
            HStack {
                Text("Live Activity")
                Spacer()
                Text("\(activityStore.entries.count) / 500")
                    .font(.caption)
                    .foregroundStyle(theme.textMuted)
                if !activityStore.entries.isEmpty {
                    Button("Clear") {
                        activityStore.clear()
                        actionStatus = "Live analytics activity cleared."
                        actionStatusIsError = false
                    }
                    .buttonStyle(.borderless)
                    .font(.caption)
                }
            }
        }
    }

    private func refreshLoop(_ analytics: AppAnalyticsClient) async {
        while !Task.isCancelled {
            await refresh(analytics, updateStatus: false)
            try? await Task.sleep(for: .seconds(1))
        }
    }

    private func setEnabledOverride(
        _ override: Bool?,
        configuration: AppAnalyticsDeveloperSnapshot.Configuration,
        analytics: AppAnalyticsClient
    ) async {
        let nextEffective = override ?? configuration.configuredEnabled

        if configuration.effectiveEnabled && !nextEffective {
            try? await analytics.applicationWillResignActive()
        }

        await analytics.developerSetEnabledOverride(override)

        if !configuration.effectiveEnabled,
           nextEffective,
           NSApplication.shared.isActive {
            try? await analytics.applicationDidBecomeActive()
        }

        await refresh(analytics, updateStatus: false)
        actionStatus = "Analytics \(nextEffective ? "enabled" : "disabled") for this Debug run."
        actionStatusIsError = false
    }

    private func refresh(
        _ analytics: AppAnalyticsClient,
        updateStatus: Bool = true
    ) async {
        do {
            snapshot = try await analytics.developerSnapshot()
            loadError = nil
            if updateStatus {
                actionStatus = "Analytics snapshot refreshed."
                actionStatusIsError = false
            }
        } catch {
            loadError = error.localizedDescription
            if updateStatus {
                actionStatus = error.localizedDescription
                actionStatusIsError = true
            }
        }
    }

    private func setStorageMode(
        _ storageMode: AppAnalyticsStorageMode,
        current: AppAnalyticsStorageMode
    ) {
        guard storageMode != current else { return }
        onStorageModeChange?(storageMode)
        actionStatus = "Switched storage mode to \(storageModeTitle(storageMode))."
        actionStatusIsError = false
    }

    private func sendTestEvent(_ analytics: AppAnalyticsClient) async {
        actionStatus = nil
        let dimension = snapshot?.configuration.storageMode.rawValue

        do {
            try await analytics.track("developer_test_event", dimension: dimension)
            await refresh(analytics, updateStatus: false)
            actionStatus = "Test event recorded (developer_test_event)."
            actionStatusIsError = false
        } catch {
            await refresh(analytics, updateStatus: false)
            actionStatus = error.localizedDescription
            actionStatusIsError = true
        }
    }

    private func flush(_ analytics: AppAnalyticsClient) async {
        isFlushing = true
        actionStatus = nil
        defer { isFlushing = false }

        do {
            try await analytics.flush()
            await refresh(analytics, updateStatus: false)
            actionStatus = "Analytics flush completed."
            actionStatusIsError = false
        } catch {
            await refresh(analytics, updateStatus: false)
            actionStatus = error.localizedDescription
            actionStatusIsError = true
        }
    }

    private func resetLocalState(_ analytics: AppAnalyticsClient) async {
        do {
            try await analytics.resetLocalState()
            await refresh(analytics, updateStatus: false)
            actionStatus = "Local analytics state reset. Installation identity preserved."
            actionStatusIsError = false
        } catch {
            actionStatus = error.localizedDescription
            actionStatusIsError = true
        }
    }

    private func eventTitle(
        _ event: AppAnalyticsDeveloperSnapshot.Event
    ) -> String {
        if let dimension = event.dimension {
            return "\(event.name) [\(dimension)]"
        }
        return event.name
    }

    private func errorTitle(
        _ error: AppAnalyticsDeveloperSnapshot.TrackedError
    ) -> String {
        "\(error.code) [\(error.component) · \(error.severity.rawValue)]"
    }

    @ViewBuilder
    private func copyableValue(_ title: String, _ value: String) -> some View {
        LabeledContent(title) {
            HStack(spacing: 8) {
                Text(value)
                    .textSelection(.enabled)
                Button {
                    copyToPasteboard(value)
                } label: {
                    Image(systemName: "doc.on.doc")
                }
                .buttonStyle(.borderless)
                .help("Copy \(title.lowercased())")
            }
        }
    }

    private func durationLabel(_ interval: TimeInterval) -> String {
        if interval == 0 { return "Immediate" }
        if interval.truncatingRemainder(dividingBy: 60) == 0 {
            return "\(Int(interval / 60)) min"
        }
        return "\(Int(interval)) sec"
    }

    private func dateLabel(_ date: Date?) -> String {
        guard let date else { return "None" }
        return timestampFormatter.string(from: date)
    }

    private func storageModeTitle(_ storageMode: AppAnalyticsStorageMode) -> String {
        switch storageMode {
        case .persisted: "Persisted"
        case .inMemory: "In Memory"
        }
    }

    private func copySnapshot() {
        guard let snapshot else { return }

        var lines = [
            "Analytics",
            "Configured enabled: \(snapshot.configuration.configuredEnabled)",
            "Effective enabled: \(snapshot.configuration.effectiveEnabled)",
            "Developer override: \(snapshot.configuration.developerEnabledOverride.map { $0 ? "true" : "false" } ?? "configured")",
            "Storage mode: \(storageModeTitle(snapshot.configuration.storageMode))",
            "App ID: \(snapshot.configuration.appID)",
            "Endpoint: \(snapshot.configuration.endpointURL.absoluteString)",
            "Installation ID: \(snapshot.runtime.installationID ?? "Not created")",
            "Active session: \(snapshot.runtime.activeSession)",
            "Last upload: \(dateLabel(snapshot.runtime.lastUploadAt))",
            "Next attempt: \(dateLabel(snapshot.runtime.nextUploadAttemptAt))",
            ""
        ]

        for day in snapshot.days {
            lines.append("UTC day \(day.day)")
            lines.append("  sessions=\(day.sessions) sessionSeconds=\(day.sessionSeconds)")
            for event in day.events {
                lines.append("  event \(eventTitle(event)) = \(event.count)")
            }
            for error in day.errors {
                lines.append("  error \(errorTitle(error)) = \(error.count)")
            }
        }

        copyToPasteboard(lines.joined(separator: "\n"))
        actionStatus = "Analytics snapshot copied."
        actionStatusIsError = false
    }

    private func copyToPasteboard(_ text: String) {
        let pasteboard = NSPasteboard.general
        pasteboard.clearContents()
        pasteboard.setString(text, forType: .string)
    }
}
#endif
