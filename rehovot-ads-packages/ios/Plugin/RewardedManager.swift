import Foundation

// Rewarded responsibilities remain separate so reward flow logic stays easy to audit.
final class RewardedManager {
    private let logger: Logger
    private var ready: Bool = false

    init(logger: Logger) {
        self.logger = logger
    }

    func load(_ options: RewardedRequest) {
        logger.debug("TODO: Load Rewarded")
        logger.debug("Rewarded options: \(options)")
        ready = false
    }

    func show(_ options: RewardedRequest) -> RewardResultPayload {
        logger.debug("TODO: Show Rewarded")
        logger.debug("Rewarded options: \(options)")
        return RewardResultPayload(
            success: false,
            rewardGranted: false,
            message: "Unity LevelPlay SDK is not implemented yet.",
            placementId: options.placementId,
            rewardAmount: options.rewardAmount,
            rewardCurrency: options.rewardCurrency
        )
    }

    func isReady() -> Bool {
        return ready
    }

    func destroy() {
        logger.debug("TODO: Destroy Rewarded")
        ready = false
    }
}
