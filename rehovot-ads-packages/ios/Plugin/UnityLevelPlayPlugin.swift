import Capacitor
import Foundation

// Capacitor bridge only; all native logic lives in UnityLevelPlay and its managers.
@objc(UnityLevelPlayPlugin)
public class UnityLevelPlayPlugin: CAPPlugin {
    private var unityLevelPlay: UnityLevelPlay?

    public override func load() {
        unityLevelPlay = UnityLevelPlay(logger: Logger(tag: "UnityLevelPlay"))
    }

    @objc func initialize(_ call: CAPPluginCall) {
        unityLevelPlay?.initialize(call.toInitializeRequest())
        call.resolve()
    }

    @objc func showBanner(_ call: CAPPluginCall) {
        unityLevelPlay?.showBanner(call.toBannerRequest())
        call.resolve()
    }

    @objc func hideBanner(_ call: CAPPluginCall) {
        unityLevelPlay?.hideBanner()
        call.resolve()
    }

    @objc func destroyBanner(_ call: CAPPluginCall) {
        unityLevelPlay?.destroyBanner()
        call.resolve()
    }

    @objc func showInterstitial(_ call: CAPPluginCall) {
        unityLevelPlay?.showInterstitial(call.toInterstitialRequest())
        call.resolve()
    }

    @objc func showRewarded(_ call: CAPPluginCall) {
        guard let result = unityLevelPlay?.showRewarded(call.toRewardedRequest()) else {
            call.resolve([
                "success": false,
                "rewardGranted": false,
                "message": "Unity LevelPlay bridge is not ready.",
            ])
            return
        }

        var response: [String: Any] = [
            "success": result.success,
            "rewardGranted": result.rewardGranted,
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

    @objc func isInterstitialReady(_ call: CAPPluginCall) {
        call.resolve(["ready": unityLevelPlay?.isInterstitialReady() ?? false])
    }

    @objc func isRewardedReady(_ call: CAPPluginCall) {
        call.resolve(["ready": unityLevelPlay?.isRewardedReady() ?? false])
    }

    @objc func setConsent(_ call: CAPPluginCall) {
        unityLevelPlay?.setConsent(call.toConsentRequest())
        call.resolve()
    }

    @objc func setCOPPA(_ call: CAPPluginCall) {
        unityLevelPlay?.setCOPPA(call.getBool("enabled") ?? false)
        call.resolve()
    }

    @objc func setUserId(_ call: CAPPluginCall) {
        unityLevelPlay?.setUserId(call.toUserRequest())
        call.resolve()
    }

    @objc func destroy(_ call: CAPPluginCall) {
        unityLevelPlay?.destroy()
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

    func toConsentRequest() -> ConsentRequest {
        return ConsentRequest(
            gdprConsent: getBool("gdprConsent"),
            doNotSell: getBool("doNotSell"),
            childDirected: getBool("childDirected"),
            underAgeOfConsent: getBool("underAgeOfConsent"),
            consentString: getString("consentString")
        )
    }

    func toUserRequest() -> UserRequest {
        return UserRequest(
            userId: getString("userId"),
            ageRestrictedUser: getBool("ageRestrictedUser")
        )
    }
}
