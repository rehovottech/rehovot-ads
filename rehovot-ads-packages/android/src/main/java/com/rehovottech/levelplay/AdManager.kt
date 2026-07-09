package com.rehovottech.levelplay

// The coordinator owns lifecycle order and forwards work to focused managers.
class AdManager(
    private val logger: Logger,
    private val consentManager: ConsentManager,
    private val bannerManager: BannerManager,
    private val interstitialManager: InterstitialManager,
    private val rewardedManager: RewardedManager,
) {
    public fun initialize(options: InitializeRequest) {
        logger.d("TODO: Initialize Unity LevelPlay SDK")
        logger.d("Initialize options: $options")
        interstitialManager.load(InterstitialRequest(placementId = null))
        rewardedManager.load(RewardedRequest(placementId = null))
    }

    public fun showBanner(options: BannerRequest) {
        bannerManager.show(options)
    }

    public fun hideBanner() {
        bannerManager.hide()
    }

    public fun destroyBanner() {
        bannerManager.destroy()
    }

    public fun showInterstitial(options: InterstitialRequest) {
        interstitialManager.show(options)
    }

    public fun showRewarded(options: RewardedRequest): RewardResultPayload {
        return rewardedManager.show(options)
    }

    public fun isInterstitialReady(): Boolean {
        return interstitialManager.isReady()
    }

    public fun isRewardedReady(): Boolean {
        return rewardedManager.isReady()
    }

    public fun setConsent(options: ConsentRequest) {
        consentManager.setConsent(options)
    }

    public fun setCOPPA(enabled: Boolean) {
        consentManager.setCOPPA(enabled)
    }

    public fun setUserId(options: UserRequest) {
        consentManager.setUserId(options)
    }

    public fun destroy() {
        logger.d("TODO: Destroy Unity LevelPlay SDK")
        bannerManager.destroy()
        interstitialManager.destroy()
        rewardedManager.destroy()
        consentManager.destroy()
    }
}
