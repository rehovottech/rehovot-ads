import Foundation
import UIKit
import UnityAds

// Native facade. The backend today is the Unity Ads SDK (pod "UnityAds").
// Swapping to another SDK (e.g. Unity LevelPlay mediation) only changes files in this folder;
// the JavaScript contract in src/definitions.ts stays the same.

struct AdsFailure: Error {
    let code: String
    let message: String
}

protocol AdsEventSink: AnyObject {
    func emit(_ event: String, _ data: [String: Any])
}

struct InitializeRequest: CustomStringConvertible {
    let appKey: String?
    let testMode: Bool
    let debug: Bool
    let autoStart: Bool
    let bannerId: String?
    let interstitialId: String?
    let rewardedId: String?

    var description: String {
        "InitializeRequest(appKey: \(appKey ?? "nil"), testMode: \(testMode), debug: \(debug), autoStart: \(autoStart))"
    }
}

struct BannerRequest: CustomStringConvertible {
    let placementId: String?
    let position: String?

    var description: String { "BannerRequest(placementId: \(placementId ?? "default"), position: \(position ?? "bottom"))" }
}

struct InterstitialRequest {
    let placementId: String?
}

struct RewardedRequest {
    let placementId: String?
    let rewardAmount: Int?
    let rewardCurrency: String?
}

struct ConsentRequest: CustomStringConvertible {
    let gdprConsent: Bool?
    let doNotSell: Bool?
    let childDirected: Bool?

    var description: String {
        "ConsentRequest(gdpr: \(String(describing: gdprConsent)), doNotSell: \(String(describing: doNotSell)), childDirected: \(String(describing: childDirected)))"
    }
}

struct ShowOutcome {
    let shown: Bool
    let completed: Bool
    let message: String
    let placementId: String
}

final class CapacitorAds: NSObject, UnityAdsInitializationDelegate {
    let logger: Logger
    let consent: ConsentManager
    let interstitial: InterstitialManager
    let rewarded: RewardedManager
    let banner: BannerManager
    weak var events: AdsEventSink? {
        didSet {
            interstitial.events = events
            rewarded.events = events
            banner.events = events
        }
    }

    private(set) var config: InitializeRequest?
    private var pendingInit: [(AdsFailure?) -> Void] = []

    init(logger: Logger) {
        self.logger = logger
        self.consent = ConsentManager(logger: logger)
        self.interstitial = InterstitialManager(logger: logger)
        self.rewarded = RewardedManager(logger: logger)
        self.banner = BannerManager(logger: logger)
        super.init()
    }

    var isInitialized: Bool { UnityAds.isInitialized() }

    func initialize(_ request: InitializeRequest, completion: @escaping (AdsFailure?) -> Void) {
        logger.setDebugEnabled(request.debug)
        logger.debug("initialize \(request)")
        guard let appKey = request.appKey, !appKey.isEmpty else {
            completion(AdsFailure(code: "INVALID_CONFIGURATION", message: "appKey (Unity Game ID) is required."))
            return
        }
        config = request
        interstitial.autoReload = request.autoStart
        rewarded.autoReload = request.autoStart

        if UnityAds.isInitialized() {
            completion(nil)
            preload()
            return
        }
        pendingInit.append(completion)
        guard pendingInit.count == 1 else { return }
        UnityAds.setDebugMode(request.debug)
        UnityAds.initialize(appKey, testMode: request.testMode, initializationDelegate: self)
    }

    // MARK: UnityAdsInitializationDelegate

    func initializationComplete() {
        DispatchQueue.main.async {
            self.logger.info("Unity Ads initialized")
            self.flushInit(nil)
            self.events?.emit("initialized", ["message": "Unity Ads initialized."])
            self.preload()
        }
    }

    func initializationFailed(_ error: UnityAdsInitializationError, withMessage message: String) {
        DispatchQueue.main.async {
            self.logger.error("Unity Ads init failed: \(message)")
            self.flushInit(AdsFailure(code: "INIT_FAILED", message: message))
            self.events?.emit("failed", ["message": message, "code": "INIT_FAILED"])
        }
    }

    private func flushInit(_ failure: AdsFailure?) {
        let waiters = pendingInit
        pendingInit.removeAll()
        waiters.forEach { $0(failure) }
    }

    private func preload() {
        guard let config = config, config.autoStart else { return }
        if let id = config.interstitialId, !id.isEmpty { interstitial.load(id) }
        if let id = config.rewardedId, !id.isEmpty { rewarded.load(id) }
    }

    // MARK: Placement resolution

    func interstitialId(_ explicit: String?) -> String? { nonEmpty(explicit) ?? nonEmpty(config?.interstitialId) }
    func rewardedId(_ explicit: String?) -> String? { nonEmpty(explicit) ?? nonEmpty(config?.rewardedId) }
    func bannerId(_ explicit: String?) -> String? { nonEmpty(explicit) ?? nonEmpty(config?.bannerId) }

    private func nonEmpty(_ value: String?) -> String? {
        guard let value = value, !value.isEmpty else { return nil }
        return value
    }

    func destroy() {
        banner.destroy()
        interstitial.reset()
        rewarded.reset()
    }
}

/// Shared load/show state machine for full-screen formats (interstitial + rewarded).
class FullscreenAdManager: NSObject, UnityAdsLoadDelegate, UnityAdsShowDelegate {
    let kind: String
    let logger: Logger
    weak var events: AdsEventSink?
    var autoReload = true

    private var ready = Set<String>()
    private var loading = Set<String>()
    private var loadWaiters: [String: [(AdsFailure?) -> Void]] = [:]
    private var retries: [String: Int] = [:]
    private var showing: String?
    private var showCompletion: ((ShowOutcome) -> Void)?

    init(kind: String, logger: Logger) {
        self.kind = kind
        self.logger = logger
        super.init()
    }

    func isReady(_ placementId: String) -> Bool { ready.contains(placementId) }

    func load(_ placementId: String, completion: ((AdsFailure?) -> Void)? = nil) {
        if ready.contains(placementId) {
            completion?(nil)
            return
        }
        if let completion = completion { loadWaiters[placementId, default: []].append(completion) }
        guard !loading.contains(placementId) else { return }
        guard UnityAds.isInitialized() else {
            flushLoad(placementId, AdsFailure(code: "NOT_INITIALIZED", message: "Call initialize() first."))
            return
        }
        loading.insert(placementId)
        logger.debug("load \(kind) \(placementId)")
        UnityAds.load(placementId, loadDelegate: self)
    }

    func show(_ placementId: String, from viewController: UIViewController?, completion: @escaping (ShowOutcome) -> Void) {
        guard showing == nil else {
            completion(ShowOutcome(shown: false, completed: false, message: "Another ad is already showing.", placementId: placementId))
            return
        }
        guard ready.contains(placementId), let viewController = viewController else {
            completion(ShowOutcome(shown: false, completed: false, message: "Ad is not ready yet.", placementId: placementId))
            load(placementId)
            return
        }
        ready.remove(placementId)
        showing = placementId
        showCompletion = completion
        UnityAds.show(viewController, placementId: placementId, showDelegate: self)
    }

    func reset() {
        ready.removeAll()
        loading.removeAll()
        loadWaiters.removeAll()
        retries.removeAll()
    }

    /// Hook for subclasses (rewarded emits its reward events here).
    func didFinish(_ outcome: ShowOutcome) {}

    private func flushLoad(_ placementId: String, _ failure: AdsFailure?) {
        let waiters = loadWaiters.removeValue(forKey: placementId) ?? []
        waiters.forEach { $0(failure) }
    }

    private func finish(_ outcome: ShowOutcome) {
        showing = nil
        let completion = showCompletion
        showCompletion = nil
        completion?(outcome)
        didFinish(outcome)
        events?.emit("\(kind)Closed", ["placementId": outcome.placementId])
        if autoReload { load(outcome.placementId) }
    }

    // MARK: UnityAdsLoadDelegate

    func unityAdsAdLoaded(_ placementId: String) {
        DispatchQueue.main.async {
            self.loading.remove(placementId)
            self.ready.insert(placementId)
            self.retries[placementId] = 0
            self.flushLoad(placementId, nil)
            self.events?.emit("\(self.kind)Loaded", ["placementId": placementId])
        }
    }

    func unityAdsAdFailed(toLoad placementId: String, withError error: UnityAdsLoadError, withMessage message: String) {
        DispatchQueue.main.async {
            self.logger.warning("\(self.kind) load failed: \(message)")
            self.loading.remove(placementId)
            self.ready.remove(placementId)
            self.flushLoad(placementId, AdsFailure(code: "LOAD_FAILED", message: message))
            self.events?.emit("\(self.kind)Failed", ["placementId": placementId, "message": message, "code": "LOAD_FAILED"])
            guard self.autoReload else { return }
            let attempt = self.retries[placementId, default: 0]
            self.retries[placementId] = attempt + 1
            let delay = min(60.0, 5.0 * pow(2.0, Double(attempt)))
            DispatchQueue.main.asyncAfter(deadline: .now() + delay) { self.load(placementId) }
        }
    }

    // MARK: UnityAdsShowDelegate

    func unityAdsShowStart(_ placementId: String) {
        events?.emit("\(kind)Opened", ["placementId": placementId])
    }

    func unityAdsShowClick(_ placementId: String) {}

    func unityAdsShowComplete(_ placementId: String, withFinish state: UnityAdsShowCompletionState) {
        DispatchQueue.main.async {
            let completed = state == .showCompletionStateCompleted
            self.finish(ShowOutcome(shown: true, completed: completed, message: completed ? "Completed." : "Skipped.", placementId: placementId))
        }
    }

    func unityAdsShowFailed(_ placementId: String, withError error: UnityAdsShowError, withMessage message: String) {
        DispatchQueue.main.async {
            self.events?.emit("\(self.kind)Failed", ["placementId": placementId, "message": message, "code": "SHOW_FAILED"])
            self.finish(ShowOutcome(shown: false, completed: false, message: message, placementId: placementId))
        }
    }
}
