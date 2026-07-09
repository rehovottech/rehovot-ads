package com.rehovottech.levelplay

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

// Capacitor bridge only; all native logic lives in UnityLevelPlay and its managers.
@CapacitorPlugin(name = "UnityLevelPlay")
class UnityLevelPlayPlugin : Plugin() {
    private lateinit var unityLevelPlay: UnityLevelPlay

    override fun load() {
        unityLevelPlay = UnityLevelPlay(Logger("UnityLevelPlay", false))
    }

    @PluginMethod
    public fun initialize(call: PluginCall) {
        unityLevelPlay.initialize(call.toInitializeRequest())
        call.resolve()
    }

    @PluginMethod
    public fun showBanner(call: PluginCall) {
        unityLevelPlay.showBanner(call.toBannerRequest())
        call.resolve()
    }

    @PluginMethod
    public fun hideBanner(call: PluginCall) {
        unityLevelPlay.hideBanner()
        call.resolve()
    }

    @PluginMethod
    public fun destroyBanner(call: PluginCall) {
        unityLevelPlay.destroyBanner()
        call.resolve()
    }

    @PluginMethod
    public fun showInterstitial(call: PluginCall) {
        unityLevelPlay.showInterstitial(call.toInterstitialRequest())
        call.resolve()
    }

    @PluginMethod
    public fun showRewarded(call: PluginCall) {
        val result = unityLevelPlay.showRewarded(call.toRewardedRequest())
        val response = JSObject()
            .put("success", result.success)
            .put("rewardGranted", result.rewardGranted)
            .put("message", result.message)

        response.put("placementId", result.placementId)
        response.put("rewardAmount", result.rewardAmount)
        response.put("rewardCurrency", result.rewardCurrency)
        call.resolve(response)
    }

    @PluginMethod
    public fun isInterstitialReady(call: PluginCall) {
        call.resolve(JSObject().put("ready", unityLevelPlay.isInterstitialReady()))
    }

    @PluginMethod
    public fun isRewardedReady(call: PluginCall) {
        call.resolve(JSObject().put("ready", unityLevelPlay.isRewardedReady()))
    }

    @PluginMethod
    public fun setConsent(call: PluginCall) {
        unityLevelPlay.setConsent(call.toConsentRequest())
        call.resolve()
    }

    @PluginMethod
    public fun setCOPPA(call: PluginCall) {
        unityLevelPlay.setCOPPA(call.getBoolean("enabled") == true)
        call.resolve()
    }

    @PluginMethod
    public fun setUserId(call: PluginCall) {
        unityLevelPlay.setUserId(call.toUserRequest())
        call.resolve()
    }

    @PluginMethod
    public fun destroy(call: PluginCall) {
        unityLevelPlay.destroy()
        call.resolve()
    }

    private fun PluginCall.toInitializeRequest(): InitializeRequest {
        return InitializeRequest(
            appKey = getString("appKey"),
            testMode = getBoolean("testMode") == true,
            debug = getBoolean("debug") == true,
            autoStart = getBoolean("autoStart") != false,
        )
    }

    private fun PluginCall.toBannerRequest(): BannerRequest {
        return BannerRequest(
            placementId = getString("placementId"),
            position = getString("position"),
        )
    }

    private fun PluginCall.toInterstitialRequest(): InterstitialRequest {
        return InterstitialRequest(
            placementId = getString("placementId"),
            timeoutMs = getInt("timeoutMs"),
        )
    }

    private fun PluginCall.toRewardedRequest(): RewardedRequest {
        return RewardedRequest(
            placementId = getString("placementId"),
            rewardAmount = getInt("rewardAmount"),
            rewardCurrency = getString("rewardCurrency"),
        )
    }

    private fun PluginCall.toConsentRequest(): ConsentRequest {
        return ConsentRequest(
            gdprConsent = getBoolean("gdprConsent"),
            doNotSell = getBoolean("doNotSell"),
            childDirected = getBoolean("childDirected"),
            underAgeOfConsent = getBoolean("underAgeOfConsent"),
            consentString = getString("consentString"),
        )
    }

    private fun PluginCall.toUserRequest(): UserRequest {
        return UserRequest(
            userId = getString("userId"),
            ageRestrictedUser = getBoolean("ageRestrictedUser"),
        )
    }
}
