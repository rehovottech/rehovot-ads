import Capacitor
import Foundation

// Capacitor bridge only; all native behavior stays behind CapacitorAds.
@objc(CapacitorAdsPlugin)
public class CapacitorAdsPlugin: CAPPlugin {
    private var capacitorAds: CapacitorAds?

    public override func load() {
        capacitorAds = CapacitorAds(logger: Logger(tag: "CapacitorAds"))
    }

    @objc func initialize(_ call: CAPPluginCall) {
        capacitorAds?.initialize(call.toInitializeRequest())
        call.resolve()
    }

    @objc func showBanner(_ call: CAPPluginCall) {
        capacitorAds?.showBanner(call.toBannerRequest())
        call.resolve()
    }

    @objc func hideBanner(_ call: CAPPluginCall) {
        capacitorAds?.hideBanner()
        call.resolve()
    }

    @objc func destroyBanner(_ call: CAPPluginCall) {
        capacitorAds?.destroyBanner()
        call.resolve()
    }

    @objc func showInterstitial(_ call: CAPPluginCall) {
        capacitorAds?.showInterstitial(call.toInterstitialRequest())
        call.resolve()
    }

    @objc func showRewarded(_ call: CAPPluginCall) {
        guard let result = capacitorAds?.showRewarded(call.toRewardedRequest()) else {
            call.resolve([
                "success": false,
                "completed": false,
                "message": "CapacitorAds bridge is not ready.",
            ])
            return
        }

        var response: [String: Any] = [
            "success": result.success,
            "completed": result.completed,
            "message": result.message,
        ]

        if let placementId = result.placementId {
            response["placementId"] = placementId
        }

        if let rewardAmount = result.rewardAmount {
            response["rewardAmount"] = rewardAmount
        }

        if let rewardCurrency = result.rewardCurrency {
            response["rewardCurrency"] = rewardCurrency
        }

        call.resolve(response)
    }

    @objc func destroy(_ call: CAPPluginCall) {
        capacitorAds?.destroy()
        call.resolve()
    }
}

private extension CAPPluginCall {
    func toInitializeRequest() -> InitializeRequest {
        return InitializeRequest(
            appKey: getString("appKey"),
            testMode: getBool("testMode") ?? false,
            debug: getBool("debug") ?? false,
            autoStart: getBool("autoStart") ?? true
        )
    }

    func toBannerRequest() -> BannerRequest {
        return BannerRequest(
            placementId: getString("placementId"),
            position: getString("position")
        )
    }

    func toInterstitialRequest() -> InterstitialRequest {
        return InterstitialRequest(
            placementId: getString("placementId"),
            timeoutMs: getInt("timeoutMs")
        )
    }

    func toRewardedRequest() -> RewardedRequest {
        return RewardedRequest(
            placementId: getString("placementId"),
            rewardAmount: getInt("rewardAmount"),
            rewardCurrency: getString("rewardCurrency")
        )
    }
}
