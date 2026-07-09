package com.rehovottech.levelplay

// Rewarded concerns stay isolated to keep reward logic easy to audit later.
class RewardedManager(
    private val logger: Logger,
) {
    private var ready: Boolean = false

    public fun load(options: RewardedRequest) {
        logger.d("TODO: Load Rewarded")
        logger.d("Rewarded options: $options")
        ready = false
    }

    public fun show(options: RewardedRequest): RewardResultPayload {
        logger.d("TODO: Show Rewarded")
        logger.d("Rewarded options: $options")
        return RewardResultPayload(
            success = false,
            rewardGranted = false,
            message = "Unity LevelPlay SDK is not implemented yet.",
            placementId = options.placementId,
        )
    }

    public fun isReady(): Boolean {
        return ready
    }

    public fun destroy() {
        logger.d("TODO: Destroy Rewarded")
        ready = false
    }
}
