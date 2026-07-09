import Foundation

// Banner responsibilities are isolated so future SDK adapters can replace them cleanly.
final class BannerManager {
    private let logger: Logger
    private var isLoaded: Bool = false

    init(logger: Logger) {
        self.logger = logger
    }

    func show(_ options: BannerRequest) {
        logger.debug("TODO: Show Banner")
        logger.debug("Banner options: \(options)")
        isLoaded = false
    }

    func hide() {
        logger.debug("TODO: Hide Banner")
    }

    func destroy() {
        logger.debug("TODO: Destroy Banner")
        isLoaded = false
    }

    func loaded() -> Bool {
        return isLoaded
    }
}
