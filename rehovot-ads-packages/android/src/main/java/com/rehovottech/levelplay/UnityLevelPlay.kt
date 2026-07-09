package com.rehovottech.levelplay

// Root native facade keeps the public plugin bridge thin and easy to maintain.
class UnityLevelPlay(
    private val logger: Logger,
) {
    private val consentManager = ConsentManager(logger)
    private val bannerManager = BannerManager(logger)
    private val interstitialManager = InterstitialManager(logger)
    private val rewardedManager = RewardedManager(logger)
    private val adManager = AdManager(
        logger = logger,
        consentManager = consentManager,
        bannerManager = bannerManager,
        interstitialManager = interstitialManager,
        rewardedManager = rewardedManager,
    )

    public fun initialize(options: InitializeRequest) {
        logger.setDebugEnabled(options.debug)
        adManager.initialize(options)
    }

    public fun showBanner(options: BannerRequest) {
        adManager.showBanner(options)
    }

    public fun hideBanner() {
        adManager.hideBanner()
    }

    public fun destroyBanner() {
        adManager.destroyBanner()
    }

    public fun showInterstitial(options: InterstitialRequest) {
        adManager.showInterstitial(options)
    }

    public fun showRewarded(options: RewardedRequest): RewardResultPayload {
        return adManager.showRewarded(options)
    }

    public fun isInterstitialReady(): Boolean {
        return adManager.isInterstitialReady()
    }

    public fun isRewardedReady(): Boolean {
        return adManager.isRewardedReady()
    }

    public fun setConsent(options: ConsentRequest) {
        adManager.setConsent(options)
    }

    public fun setCOPPA(enabled: Boolean) {
        adManager.setCOPPA(enabled)
    }

    public fun setUserId(options: UserRequest) {
        adManager.setUserId(options)
    }

    public fun destroy() {
        adManager.destroy()
    }
}

// Internal request models mirror the TypeScript contract without leaking SDK details.
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
    val rewardGranted: Boolean,
    val message: String,
    val placementId: String? = null,
    val rewardAmount: Int? = null,
    val rewardCurrency: String? = null,
)

internal data class ConsentRequest(
    val gdprConsent: Boolean? = null,
    val doNotSell: Boolean? = null,
    val childDirected: Boolean? = null,
    val underAgeOfConsent: Boolean? = null,
    val consentString: String? = null,
)

internal data class UserRequest(
    val userId: String? = null,
    val ageRestrictedUser: Boolean? = null,
)
