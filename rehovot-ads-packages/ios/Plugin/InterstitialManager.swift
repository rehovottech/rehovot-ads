import Foundation

// Interstitial responsibilities are isolated so only this file changes for SDK swaps.
final class InterstitialManager {
    private let logger: Logger
    private var ready: Bool = false

    init(logger: Logger) {
        self.logger = logger
    }

    func load(_ options: InterstitialRequest) {
        logger.debug("TODO: Load Interstitial")
        logger.debug("Interstitial options: \(options)")
        ready = false
    }

    func show(_ options: InterstitialRequest) {
        logger.debug("TODO: Show Interstitial")
        logger.debug("Interstitial options: \(options)")
    }

    func isReady() -> Bool {
        return ready
    }

    func destroy() {
        logger.debug("TODO: Destroy Interstitial")
        ready = false
    }
}
