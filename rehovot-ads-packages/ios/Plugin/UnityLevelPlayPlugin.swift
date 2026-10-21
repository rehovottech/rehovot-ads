import Capacitor
import Foundation
import AppTrackingTransparency

// Capacitor bridge only; all native behaviour stays behind CapacitorAds (UnityLevelPlay.swift).
@objc(CapacitorAdsPlugin)
public class CapacitorAdsPlugin: CAPPlugin, CAPBridgedPlugin, AdsEventSink {
    public let identifier = "CapacitorAdsPlugin"
    public let jsName = "CapacitorAds"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "initialize", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showBanner", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "hideBanner", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "destroyBanner", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "loadInterstitial", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "loadRewarded", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isInterstitialReady", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isRewardedReady", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showInterstitial", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showRewarded", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setConsent", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestTracking", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openTestSuite", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "destroy", returnType: CAPPluginReturnPromise),
    ]

    private var ads: CapacitorAds!

    public override func load() {
        ads = CapacitorAds(logger: Logger(tag: "CapacitorAds"))
        ads.events = self
    }

    func emit(_ event: String, _ data: [String: Any]) {
        notifyListeners(event, data: data)
    }

    @objc func initialize(_ call: CAPPluginCall) {
        let placements = call.getObject("placements") ?? [:]
        let request = InitializeRequest(
            appKey: call.getString("appKey"),
            testMode: call.getBool("testMode") ?? false,
            debug: call.getBool("debug") ?? false,
            autoStart: call.getBool("autoStart") ?? true,
            bannerId: placements["banner"] as? String,
            interstitialId: placements["interstitial"] as? String,
            rewardedId: placements["rewarded"] as? String
        )
        DispatchQueue.main.async {
            self.ads.initialize(request) { failure in
                if let failure = failure {
                    call.reject(failure.message, failure.code)
                } else {
                    call.resolve()
                }
            }
        }
    }

    // MARK: Banner

    @objc func showBanner(_ call: CAPPluginCall) {
        guard let placementId = ads.bannerId(call.getString("placementId")) else {
            call.reject("placementId is required (or set placements.banner in initialize).", "INVALID_CONFIGURATION")
            return
        }
        let request = BannerRequest(placementId: placementId, position: call.getString("position"))
        DispatchQueue.main.async {
            self.ads.banner.show(request, placementId: placementId, from: self.bridge?.viewController)
            call.resolve()
        }
    }

    @objc func hideBanner(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.ads.banner.hide()
            call.resolve()
        }
    }

    @objc func destroyBanner(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.ads.banner.destroy()
            call.resolve()
        }
    }

    // MARK: Full-screen

    @objc func loadInterstitial(_ call: CAPPluginCall) {
        load(call, manager: ads.interstitial, placementId: ads.interstitialId(call.getString("placementId")))
    }

    @objc func loadRewarded(_ call: CAPPluginCall) {
        load(call, manager: ads.rewarded, placementId: ads.rewardedId(call.getString("placementId")))
    }

    @objc func isInterstitialReady(_ call: CAPPluginCall) {
        let id = ads.interstitialId(call.getString("placementId"))
        DispatchQueue.main.async { call.resolve(["value": id.map { self.ads.interstitial.isReady($0) } ?? false]) }
    }

    @objc func isRewardedReady(_ call: CAPPluginCall) {
        let id = ads.rewardedId(call.getString("placementId"))
        DispatchQueue.main.async { call.resolve(["value": id.map { self.ads.rewarded.isReady($0) } ?? false]) }
    }

    @objc func showInterstitial(_ call: CAPPluginCall) {
        guard let placementId = ads.interstitialId(call.getString("placementId")) else {
            call.resolve(["success": false, "message": "No interstitial placement configured."])
            return
        }
        DispatchQueue.main.async {
            self.ads.interstitial.show(placementId, from: self.bridge?.viewController) { outcome in
                call.resolve(["success": outcome.shown, "message": outcome.message, "placementId": outcome.placementId])
            }
        }
    }

    @objc func showRewarded(_ call: CAPPluginCall) {
        let amount = call.getInt("rewardAmount")
        let currency = call.getString("rewardCurrency")
        guard let placementId = ads.rewardedId(call.getString("placementId")) else {
            call.resolve(["success": false, "completed": false, "message": "No rewarded placement configured."])
            return
        }
        DispatchQueue.main.async {
            self.ads.rewarded.show(placementId, from: self.bridge?.viewController) { outcome in
                var response: [String: Any] = [
                    "success": outcome.shown,
                    "completed": outcome.completed,
                    "message": outcome.message,
                    "placementId": outcome.placementId,
                ]
                if let amount = amount { response["rewardAmount"] = amount }
                if let currency = currency { response["rewardCurrency"] = currency }
                call.resolve(response)
            }
        }
    }

    private func load(_ call: CAPPluginCall, manager: FullscreenAdManager, placementId: String?) {
        guard let placementId = placementId else {
            call.reject("placementId is required (or set placements in initialize).", "INVALID_CONFIGURATION")
            return
        }
        DispatchQueue.main.async {
            manager.load(placementId) { failure in
                if let failure = failure {
                    call.reject(failure.message, failure.code)
                } else {
                    call.resolve()
                }
            }
        }
    }

    // MARK: Privacy

    @objc func setConsent(_ call: CAPPluginCall) {
        ads.consent.setConsent(ConsentRequest(
            gdprConsent: call.getBool("gdprConsent"),
            doNotSell: call.getBool("doNotSell"),
            childDirected: call.getBool("childDirected")
        ))
        call.resolve()
    }

    @objc func requestTracking(_ call: CAPPluginCall) {
        guard #available(iOS 14, *) else {
            call.resolve(["status": "authorized"])
            return
        }
        DispatchQueue.main.async {
            ATTrackingManager.requestTrackingAuthorization { status in
                let value: String
                switch status {
                case .authorized: value = "authorized"
                case .denied: value = "denied"
                case .restricted: value = "restricted"
                case .notDetermined: value = "notDetermined"
                @unknown default: value = "notDetermined"
                }
                call.resolve(["status": value])
            }
        }
    }

    @objc func openTestSuite(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.ads.openTestSuite(from: self.bridge?.viewController)
            call.resolve()
        }
    }

    @objc func destroy(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.ads.destroy()
            call.resolve()
        }
    }
}
