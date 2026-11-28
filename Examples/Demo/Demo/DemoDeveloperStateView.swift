import SwiftUI

@MainActor
struct DemoDeveloperStateView: View {
    @Environment(DemoState.self) private var demoState

    var body: some View {
        Form {
            Section("App-owned debug state") {
                LabeledContent("Compact Cards", value: demoState.compactCards ? "On" : "Off")
                LabeledContent("Analytics", value: demoState.analyticsEnabled ? "On" : "Off")
                LabeledContent(
                    "Analytics Storage",
                    value: demoState.analyticsStorageMode == .inMemory ? "In Memory" : "Persisted"
                )
                LabeledContent("Action Count", value: "\(demoState.actionCount)")
                LabeledContent("Last Action", value: demoState.lastAction)
            }
        }
        .formStyle(.grouped)
        .navigationTitle("Demo App State")
    }
}
