import AppKit
import Foundation
import SwiftUI

private struct AppAnalyticsEnvironmentKey: EnvironmentKey {
    static let defaultValue: AppAnalyticsClient? = nil
}

extension EnvironmentValues {
    var appAnalytics: AppAnalyticsClient? {
        get { self[AppAnalyticsEnvironmentKey.self] }
        set { self[AppAnalyticsEnvironmentKey.self] = newValue }
    }
}

public extension View {
    /// Manages application analytics lifecycle and exposes the same optional client
    /// to MacAppFoundation-owned descendant views.
    func managesAnalytics(_ analytics: AppAnalyticsClient) -> some View {
        modifier(AppAnalyticsLifecycleModifier(analytics: analytics))
    }
}

@MainActor
final class AppAnalyticsLifecycleCoordinator {
    static let shared = AppAnalyticsLifecycleCoordinator()

    @MainActor
    private final class ClientRegistration {
        weak var client: AppAnalyticsClient?
        var tokens: Set<UUID> = []
        var observers: [NSObjectProtocol] = []
        var pendingTask: Task<Void, Never>?
        var nextEventGeneration: UInt64 = 0
        var latestEventGeneration: UInt64 = 0

        init(client: AppAnalyticsClient) {
            self.client = client
        }
    }

    private let notificationCenter: NotificationCenter
    private let isApplicationActive: () -> Bool
    private var registrationsByClient: [ObjectIdentifier: ClientRegistration] = [:]
    private var clientByToken: [UUID: ObjectIdentifier] = [:]

    init(
        notificationCenter: NotificationCenter = .default,
        isApplicationActive: @escaping () -> Bool = { NSApplication.shared.isActive }
    ) {
        self.notificationCenter = notificationCenter
        self.isApplicationActive = isApplicationActive
    }

    @discardableResult
    func register(_ client: AppAnalyticsClient) -> UUID {
        let token = UUID()
        let clientID = ObjectIdentifier(client)
        clientByToken[token] = clientID

        if let existing = registrationsByClient[clientID] {
            existing.tokens.insert(token)
            return token
        }

        let registration = ClientRegistration(client: client)
        registration.tokens.insert(token)
        registrationsByClient[clientID] = registration

        let activeObserver = notificationCenter.addObserver(
            forName: NSApplication.didBecomeActiveNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            MainActor.assumeIsolated {
                self?.enqueueLifecycleEvent(for: clientID, active: true)
            }
        }

        let resignObserver = notificationCenter.addObserver(
            forName: NSApplication.willResignActiveNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            MainActor.assumeIsolated {
                self?.enqueueLifecycleEvent(for: clientID, active: false)
            }
        }

        registration.observers = [activeObserver, resignObserver]

        if isApplicationActive() {
            enqueueLifecycleEvent(for: clientID, active: true)
        }

        return token
    }

    func unregister(_ token: UUID) {
        guard let clientID = clientByToken.removeValue(forKey: token),
              let registration = registrationsByClient[clientID]
        else {
            return
        }

        registration.tokens.remove(token)
        guard registration.tokens.isEmpty else {
            return
        }

        for observer in registration.observers {
            notificationCenter.removeObserver(observer)
        }
        registration.observers.removeAll()
        registrationsByClient.removeValue(forKey: clientID)
    }

    func waitForPendingEvents(for client: AppAnalyticsClient) async {
        let clientID = ObjectIdentifier(client)
        while let pending = registrationsByClient[clientID]?.pendingTask {
            await pending.value
        }
    }

    private func enqueueLifecycleEvent(for clientID: ObjectIdentifier, active: Bool) {
        guard let registration = registrationsByClient[clientID],
              let client = registration.client
        else {
            return
        }

        let previousTask = registration.pendingTask
        let generation = registration.nextEventGeneration
        registration.nextEventGeneration &+= 1
        registration.latestEventGeneration = generation

        registration.pendingTask = Task { @MainActor [weak registration] in
            if let previousTask {
                await previousTask.value
            }
            if active {
                try? await client.applicationDidBecomeActive()
            } else {
                try? await client.applicationWillResignActive()
            }
            if registration?.latestEventGeneration == generation {
                registration?.pendingTask = nil
            }
        }
    }
}

private struct AppAnalyticsLifecycleModifier: ViewModifier {
    let analytics: AppAnalyticsClient

    @State private var registration: (clientID: ObjectIdentifier, token: UUID)?

    func body(content: Content) -> some View {
        content
            .environment(\.appAnalytics, analytics)
            .onAppear {
                syncRegistration(for: analytics)
            }
            .onChange(of: ObjectIdentifier(analytics)) { _, _ in
                syncRegistration(for: analytics)
            }
            .onDisappear {
                clearRegistration()
            }
    }

    private func syncRegistration(for client: AppAnalyticsClient) {
        let clientID = ObjectIdentifier(client)
        if registration?.clientID == clientID {
            return
        }
        clearRegistration()
        let token = AppAnalyticsLifecycleCoordinator.shared.register(client)
        registration = (clientID, token)
    }

    private func clearRegistration() {
        guard let existing = registration else { return }
        AppAnalyticsLifecycleCoordinator.shared.unregister(existing.token)
        registration = nil
    }
}
