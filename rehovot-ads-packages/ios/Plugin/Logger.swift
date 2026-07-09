import Foundation

// Lightweight logger keeps debug output controllable without coupling to SDK logic.
final class Logger {
    private let tag: String
    private var debugEnabled: Bool

    init(tag: String, debugEnabled: Bool = false) {
        self.tag = tag
        self.debugEnabled = debugEnabled
    }

    func setDebugEnabled(_ enabled: Bool) {
        debugEnabled = enabled
    }

    func debug(_ message: String) {
        guard debugEnabled else { return }
        print("[\(tag)] \(message)")
    }

    func info(_ message: String) {
        guard debugEnabled else { return }
        print("[\(tag)] \(message)")
    }

    func warning(_ message: String) {
        guard debugEnabled else { return }
        print("[\(tag)] \(message)")
    }

    func error(_ message: String) {
        guard debugEnabled else { return }
        print("[\(tag)] \(message)")
    }
}
