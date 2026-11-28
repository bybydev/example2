import Testing
@testable import MacAppFoundation

@Suite("MacAppSettings")
struct MacAppSettingsTests {
    @MainActor
    @Test("Router keeps the latest pane request and increments request identity")
    func routerRequests() {
        let router = MacAppSettingsRouter()
        #expect(router.requestedPaneID == nil)
        #expect(router.requestID == 0)

        router.request(.plan)
        let firstRequestID = router.requestID
        #expect(router.requestedPaneID == .plan)
        #expect(firstRequestID == 1)

        router.request(.plan)
        #expect(router.requestedPaneID == .plan)
        #expect(router.requestID == firstRequestID + 1)

        router.request("providers")
        #expect(router.requestedPaneID == MacAppSettingsPaneID("providers"))
        #expect(router.requestID == firstRequestID + 2)

        router.clear()
        #expect(router.requestedPaneID == nil)
        #expect(router.requestID == firstRequestID + 2)
    }
}
