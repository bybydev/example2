import Foundation
import XCTest
@testable import MacAppFoundation

@MainActor
final class OnboardingStateTests: XCTestCase {
    func testProgressResumesUntilCompletion() {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let state = OnboardingState(
            id: "demo",
            stepCount: 3,
            defaults: defaults
        )

        XCTAssertEqual(state.currentStep, 0)
        XCTAssertFalse(state.isCompleted)

        state.goForward()
        XCTAssertEqual(state.currentStep, 1)

        let resumed = OnboardingState(
            id: "demo",
            stepCount: 3,
            defaults: defaults
        )
        XCTAssertEqual(resumed.currentStep, 1)
        XCTAssertFalse(resumed.isCompleted)
    }

    func testCompletionPersists() {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let state = OnboardingState(
            id: "demo",
            stepCount: 3,
            defaults: defaults
        )
        state.complete()

        let resumed = OnboardingState(
            id: "demo",
            stepCount: 3,
            defaults: defaults
        )
        XCTAssertTrue(resumed.isCompleted)
    }

    func testReplayRestartsWithoutClearingCompletion() {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let state = OnboardingState(
            id: "demo",
            stepCount: 3,
            defaults: defaults
        )
        state.move(to: 2)
        state.complete()
        state.restart()

        XCTAssertEqual(state.currentStep, 0)
        XCTAssertTrue(state.isCompleted)

        let resumed = OnboardingState(
            id: "demo",
            stepCount: 3,
            defaults: defaults
        )
        XCTAssertEqual(resumed.currentStep, 0)
        XCTAssertTrue(resumed.isCompleted)
    }

    func testResetRestoresFirstLaunchState() {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let state = OnboardingState(
            id: "demo",
            stepCount: 3,
            defaults: defaults
        )
        state.move(to: 2)
        state.complete()
        state.reset()

        XCTAssertEqual(state.currentStep, 0)
        XCTAssertFalse(state.isCompleted)

        let resumed = OnboardingState(
            id: "demo",
            stepCount: 3,
            defaults: defaults
        )
        XCTAssertEqual(resumed.currentStep, 0)
        XCTAssertFalse(resumed.isCompleted)
    }

    func testNavigationBoundariesAndClamping() {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let state = OnboardingState(
            id: "demo",
            stepCount: 3,
            defaults: defaults
        )

        XCTAssertFalse(state.canGoBack)
        XCTAssertTrue(state.canGoForward)
        XCTAssertFalse(state.isLastStep)

        state.goBack()
        XCTAssertEqual(state.currentStep, 0)

        state.move(to: 99)
        XCTAssertEqual(state.currentStep, 2)
        XCTAssertTrue(state.canGoBack)
        XCTAssertFalse(state.canGoForward)
        XCTAssertTrue(state.isLastStep)

        state.goForward()
        XCTAssertEqual(state.currentStep, 2)

        state.move(to: -5)
        XCTAssertEqual(state.currentStep, 0)
    }

    func testOnboardingStepMessageFormattingAndClamping() {
        XCTAssertEqual(
            OnboardingStepMessage.formattedMessage(title: nil, currentStep: 0, stepCount: 3),
            "Step 1 of 3"
        )
        XCTAssertEqual(
            OnboardingStepMessage.formattedMessage(title: "  Permissions  ", currentStep: 1, stepCount: 4),
            "Step 2 of 4 · Permissions"
        )
        XCTAssertEqual(
            OnboardingStepMessage.formattedMessage(title: "   ", currentStep: 2, stepCount: 3),
            "Step 3 of 3"
        )
        XCTAssertEqual(
            OnboardingStepMessage.formattedMessage(title: nil, currentStep: -2, stepCount: 3),
            "Step 1 of 3"
        )
        XCTAssertEqual(
            OnboardingStepMessage.formattedMessage(title: nil, currentStep: 10, stepCount: 3),
            "Step 3 of 3"
        )
        XCTAssertEqual(
            OnboardingStepMessage.formattedMessage(title: nil, currentStep: 0, stepCount: 0),
            "Step 1 of 1"
        )
    }

    func testOnboardingFooterMessagePlacementCentersAndClampsWithoutOverlap() {
        let centered = OnboardingFooterLayoutMetrics.messagePlacement(
            boundsWidth: 600,
            leadingWidth: 60,
            trailingWidth: 90,
            messageIdealWidth: 160,
            minSpacing: 16
        )
        XCTAssertEqual(centered.originX, 220)
        XCTAssertEqual(centered.availableWidth, 418)

        let shiftedForWideTrailing = OnboardingFooterLayoutMetrics.messagePlacement(
            boundsWidth: 400,
            leadingWidth: 0,
            trailingWidth: 200,
            messageIdealWidth: 120,
            minSpacing: 16
        )
        XCTAssertEqual(shiftedForWideTrailing.availableWidth, 184)
        XCTAssertEqual(shiftedForWideTrailing.originX, 64)

        let truncatedBetweenActions = OnboardingFooterLayoutMetrics.messagePlacement(
            boundsWidth: 360,
            leadingWidth: 80,
            trailingWidth: 100,
            messageIdealWidth: 260,
            minSpacing: 16
        )
        XCTAssertEqual(truncatedBetweenActions.availableWidth, 148)
        XCTAssertEqual(truncatedBetweenActions.originX, 96)
    }

    private func makeDefaults() -> (UserDefaults, String) {
        let suiteName = "MacAppFoundationTests.OnboardingState.\(UUID().uuidString)"
        let defaults = UserDefaults(suiteName: suiteName)!
        defaults.removePersistentDomain(forName: suiteName)
        return (defaults, suiteName)
    }
}
