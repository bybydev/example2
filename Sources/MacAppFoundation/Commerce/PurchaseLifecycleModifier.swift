import AppKit
import Foundation
import SwiftUI

public extension View {
    /// Prepares StoreKit once and refreshes entitlements whenever the app becomes active.
    func managesPurchases(_ manager: PurchaseManager) -> some View {
        modifier(PurchaseLifecycleModifier(manager: manager))
    }
}

@MainActor
final class PurchaseLifecycleCoordinator {
    static let shared = PurchaseLifecycleCoordinator()

    @MainActor
    private final class ManagerRegistration {
        weak var manager: PurchaseManager?
        var tokens: Set<UUID> = []
        var observer: NSObjectProtocol?
        var pendingTask: Task<Void, Never>?
        var nextEventGeneration: UInt64 = 0
        var latestEventGeneration: UInt64 = 0

        init(manager: PurchaseManager) {
            self.manager = manager
        }
    }

    private let notificationCenter: NotificationCenter
    private var registrationsByManager: [ObjectIdentifier: ManagerRegistration] = [:]
    private var managerByToken: [UUID: ObjectIdentifier] = [:]

    init(notificationCenter: NotificationCenter = .default) {
        self.notificationCenter = notificationCenter
    }

    @discardableResult
    func register(_ manager: PurchaseManager) -> UUID {
        let token = UUID()
        let managerID = ObjectIdentifier(manager)
        managerByToken[token] = managerID

        if let existing = registrationsByManager[managerID] {
            existing.tokens.insert(token)
            return token
        }

        let registration = ManagerRegistration(manager: manager)
        registration.tokens.insert(token)
        registrationsByManager[managerID] = registration

        registration.observer = notificationCenter.addObserver(
            forName: NSApplication.didBecomeActiveNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            MainActor.assumeIsolated {
                self?.enqueueRefresh(for: managerID)
            }
        }

        enqueuePrepare(for: managerID)
        return token
    }

    func unregister(_ token: UUID) {
        guard let managerID = managerByToken.removeValue(forKey: token),
              let registration = registrationsByManager[managerID]
        else {
            return
        }

        registration.tokens.remove(token)
        guard registration.tokens.isEmpty else {
            return
        }

        if let observer = registration.observer {
            notificationCenter.removeObserver(observer)
            registration.observer = nil
        }
        registrationsByManager.removeValue(forKey: managerID)
    }

    func waitForPendingWork(for manager: PurchaseManager) async {
        let managerID = ObjectIdentifier(manager)
        while let pending = registrationsByManager[managerID]?.pendingTask {
            await pending.value
        }
    }

    private func enqueuePrepare(for managerID: ObjectIdentifier) {
        enqueue(for: managerID) { manager in
            await manager.prepare()
        }
    }

    private func enqueueRefresh(for managerID: ObjectIdentifier) {
        enqueue(for: managerID) { manager in
            await manager.refreshEntitlements()
        }
    }

    private func enqueue(
        for managerID: ObjectIdentifier,
        operation: @escaping @MainActor (PurchaseManager) async -> Void
    ) {
        guard let registration = registrationsByManager[managerID],
              let manager = registration.manager
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
            await operation(manager)
            if registration?.latestEventGeneration == generation {
                registration?.pendingTask = nil
            }
        }
    }
}

private struct PurchaseLifecycleModifier: ViewModifier {
    let manager: PurchaseManager

    @State private var registration: (managerID: ObjectIdentifier, token: UUID)?

    func body(content: Content) -> some View {
        content
            .onAppear {
                syncRegistration(for: manager)
            }
            .onChange(of: ObjectIdentifier(manager)) { _, _ in
                syncRegistration(for: manager)
            }
            .onDisappear {
                clearRegistration()
            }
    }

    private func syncRegistration(for manager: PurchaseManager) {
        let managerID = ObjectIdentifier(manager)
        if registration?.managerID == managerID {
            return
        }
        clearRegistration()
        let token = PurchaseLifecycleCoordinator.shared.register(manager)
        registration = (managerID, token)
    }

    private func clearRegistration() {
        guard let existing = registration else { return }
        PurchaseLifecycleCoordinator.shared.unregister(existing.token)
        registration = nil
    }
}
