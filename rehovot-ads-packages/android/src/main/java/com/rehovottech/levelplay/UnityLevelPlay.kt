package com.rehovottech.capacitorads

// Native facade placeholder. Real SDK wiring will live here when each backend is added.
class CapacitorAds(
    private val logger: Logger,
) {
    public fun initialize(options: InitializeRequest) {
        logger.setDebugEnabled(options.debug)
        logger.d("TODO: initialize native ad SDK")
        logger.d("initialize options = $options")
    }

    public fun showBanner(options: BannerRequest) {
        logger.d("TODO: show banner")
        logger.d("banner request = $options")
    }

    public fun hideBanner() {
        logger.d("TODO: hide banner")
    }

    public fun destroyBanner() {
        logger.d("TODO: destroy banner")
    }

    public fun showInterstitial(options: InterstitialRequest) {
        logger.d("TODO: show interstitial")
        logger.d("interstitial request = $options")
    }

    public fun showRewarded(options: RewardedRequest): RewardResultPayload {
        logger.d("TODO: show rewarded")
        logger.d("rewarded request = $options")
        return RewardResultPayload(
            success = false,
            completed = false,
            message = "Native rewarded flow is not implemented yet.",
            placementId = options.placementId,
            rewardAmount = options.rewardAmount,
            rewardCurrency = options.rewardCurrency,
        )
    }

    public fun destroy() {
        logger.d("TODO: destroy native ad SDK")
    }
}

internal data class InitializeRequest(
    val appKey: String? = null,
    val testMode: Boolean = false,
    val debug: Boolean = false,
    val autoStart: Boolean = true,
)

internal data class BannerRequest(
    val placementId: String? = null,
    val position: String? = null,
)

internal data class InterstitialRequest(
    val placementId: String? = null,
    val timeoutMs: Int? = null,
)

internal data class RewardedRequest(
    val placementId: String? = null,
    val rewardAmount: Int? = null,
    val rewardCurrency: String? = null,
)

internal data class RewardResultPayload(
    val success: Boolean,
    val completed: Boolean,
    val message: String,
    val placementId: String? = null,
    val rewardAmount: Int? = null,
    val rewardCurrency: String? = null,
)
