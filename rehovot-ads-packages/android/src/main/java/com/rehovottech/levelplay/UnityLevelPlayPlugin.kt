package com.rehovottech.capacitorads

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

// Capacitor bridge only; all native behavior stays behind CapacitorAds.
@CapacitorPlugin(name = "CapacitorAds")
class CapacitorAdsPlugin : Plugin() {
    private lateinit var capacitorAds: CapacitorAds

    override fun load() {
        capacitorAds = CapacitorAds(Logger("CapacitorAds", false))
    }

    @PluginMethod
    public fun initialize(call: PluginCall) {
        capacitorAds.initialize(call.toInitializeRequest())
        call.resolve()
    }

    @PluginMethod
    public fun showBanner(call: PluginCall) {
        capacitorAds.showBanner(call.toBannerRequest())
        call.resolve()
    }

    @PluginMethod
    public fun hideBanner(call: PluginCall) {
        capacitorAds.hideBanner()
        call.resolve()
    }

    @PluginMethod
    public fun destroyBanner(call: PluginCall) {
        capacitorAds.destroyBanner()
        call.resolve()
    }

    @PluginMethod
    public fun showInterstitial(call: PluginCall) {
        capacitorAds.showInterstitial(call.toInterstitialRequest())
        call.resolve()
    }

    @PluginMethod
    public fun showRewarded(call: PluginCall) {
        val result = capacitorAds.showRewarded(call.toRewardedRequest())
        val response = JSObject()
            .put("success", result.success)
            .put("completed", result.completed)
            .put("message", result.message)

        response.put("placementId", result.placementId)
        response.put("rewardAmount", result.rewardAmount)
        response.put("rewardCurrency", result.rewardCurrency)
        call.resolve(response)
    }

    @PluginMethod
    public fun destroy(call: PluginCall) {
        capacitorAds.destroy()
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
}
