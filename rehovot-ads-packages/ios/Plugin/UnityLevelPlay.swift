import Foundation
import UIKit
import IronSource

// Native facade over the Unity LevelPlay mediation SDK (pod "IronSourceSDK", 9.x).
// Ad networks (Unity Ads, AdMob, ...) are adapters the game adds to its own Podfile.
// The JavaScript contract in src/definitions.ts stays the same.

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

final class CapacitorAds: NSObject {
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
    private(set) var isInitialized = false

    init(logger: Logger) {
        self.logger = logger
        self.consent = ConsentManager(logger: logger)
        self.interstitial = InterstitialManager(logger: logger)
        self.rewarded = RewardedManager(logger: logger)
        self.banner = BannerManager(logger: logger)
        super.init()
        interstitial.facade = self
        rewarded.facade = self
    }

    func initialize(_ request: InitializeRequest, completion: @escaping (AdsFailure?) -> Void) {
        logger.setDebugEnabled(request.debug)
        logger.debug("initialize \(request)")
        guard let appKey = request.appKey, !appKey.isEmpty else {
            completion(AdsFailure(code: "INVALID_CONFIGURATION", message: "appKey (LevelPlay App Key) is required."))
            return
        }
        config = request
        interstitial.autoReload = request.autoStart
        rewarded.autoReload = request.autoStart

        if isInitialized {
            completion(nil)
            preload()
            return
        }
        pendingInit.append(completion)
        guard pendingInit.count == 1 else { return }
        LevelPlay.setAdaptersDebug(request.debug)
        // Test mode enables the LevelPlay Test Suite (openTestSuite). Test ads themselves come from
        // registering the device under LevelPlay > Setup > Test devices.
        if request.testMode { LevelPlay.setMetaDataWithKey("is_test_suite", value: "enable") }
        let initRequest = LPMInitRequestBuilder(appKey: appKey).build()
        LevelPlay.initWith(initRequest) { [weak self] _, error in
            DispatchQueue.main.async { self?.onInitialized(error) }
        }
    }

    private func onInitialized(_ error: Error?) {
        if let error = error {
            logger.error("LevelPlay init failed: \(error.localizedDescription)")
            flushInit(AdsFailure(code: "INIT_FAILED", message: error.localizedDescription))
            events?.emit("failed", ["message": error.localizedDescription, "code": "INIT_FAILED"])
            return
        }
        isInitialized = true
        logger.info("LevelPlay initialized (SDK \(LevelPlay.sdkVersion()))")
        flushInit(nil)
        events?.emit("initialized", ["message": "LevelPlay initialized."])
        preload()
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

    func openTestSuite(from viewController: UIViewController?) {
        guard let viewController = viewController else { return }
        LevelPlay.launchTestSuite(viewController)
    }

    // MARK: Ad unit resolution

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
/// One LevelPlay ad object per ad unit id; subclasses create it and forward its delegate callbacks.
class FullscreenAdManager: NSObject {
    let kind: String
    let logger: Logger
    weak var events: AdsEventSink?
    weak var facade: CapacitorAds?
    var autoReload = true

    private var loading = Set<String>()
    private var loadWaiters: [String: [(AdsFailure?) -> Void]] = [:]
    private var retries: [String: Int] = [:]
    private(set) var showing: String?
    private var showCompletion: ((ShowOutcome) -> Void)?

    init(kind: String, logger: Logger) {
        self.kind = kind
        self.logger = logger
        super.init()
    }

    // MARK: Subclass hooks

    func adReady(_ adUnitId: String) -> Bool { false }
    func startLoad(_ adUnitId: String) {}
    func startShow(_ adUnitId: String, from viewController: UIViewController) {}
    func dropAds() {}
    /// Outcome once the ad is closed; rewarded overrides this to report whether the reward was earned.
    func closedOutcome(_ adUnitId: String, completion: @escaping (ShowOutcome) -> Void) {
        completion(ShowOutcome(shown: true, completed: true, message: "Closed.", placementId: adUnitId))
    }
    /// Hook for subclasses (rewarded emits its reward events here).
    func didFinish(_ outcome: ShowOutcome) {}

    // MARK: Public API

    func isReady(_ adUnitId: String) -> Bool { adReady(adUnitId) }

    func load(_ adUnitId: String, completion: ((AdsFailure?) -> Void)? = nil) {
        if adReady(adUnitId) {
            completion?(nil)
            return
        }
        if let completion = completion { loadWaiters[adUnitId, default: []].append(completion) }
        guard !loading.contains(adUnitId), showing != adUnitId else { return }
        guard facade?.isInitialized == true else {
            flushLoad(adUnitId, AdsFailure(code: "NOT_INITIALIZED", message: "Call initialize() first."))
            return
        }
        loading.insert(adUnitId)
        logger.debug("load \(kind) \(adUnitId)")
        startLoad(adUnitId)
    }

    func show(_ adUnitId: String, from viewController: UIViewController?, completion: @escaping (ShowOutcome) -> Void) {
        guard showing == nil else {
            completion(ShowOutcome(shown: false, completed: false, message: "Another ad is already showing.", placementId: adUnitId))
            return
        }
        guard adReady(adUnitId), let viewController = viewController else {
            completion(ShowOutcome(shown: false, completed: false, message: "Ad is not ready yet.", placementId: adUnitId))
            load(adUnitId)
            return
        }
        showing = adUnitId
        showCompletion = completion
        startShow(adUnitId, from: viewController)
    }

    func reset() {
        dropAds()
        loading.removeAll()
        loadWaiters.removeAll()
        retries.removeAll()
    }

    // MARK: Callbacks from the LevelPlay delegates (main thread)

    func handleLoaded(_ adUnitId: String) {
        loading.remove(adUnitId)
        retries[adUnitId] = 0
        flushLoad(adUnitId, nil)
        events?.emit("\(kind)Loaded", ["placementId": adUnitId])
    }

    func handleLoadFailed(_ adUnitId: String, _ message: String) {
        logger.warning("\(kind) load failed: \(message)")
        loading.remove(adUnitId)
        flushLoad(adUnitId, AdsFailure(code: "LOAD_FAILED", message: message))
        events?.emit("\(kind)Failed", ["placementId": adUnitId, "message": message, "code": "LOAD_FAILED"])
        guard autoReload else { return }
        let attempt = retries[adUnitId, default: 0]
        retries[adUnitId] = attempt + 1
        let delay = min(60.0, 5.0 * pow(2.0, Double(attempt)))
        DispatchQueue.main.asyncAfter(deadline: .now() + delay) { self.load(adUnitId) }
    }

    func handleDisplayed(_ adUnitId: String) {
        events?.emit("\(kind)Opened", ["placementId": adUnitId])
    }

    func handleDisplayFailed(_ adUnitId: String, _ message: String) {
        events?.emit("\(kind)Failed", ["placementId": adUnitId, "message": message, "code": "SHOW_FAILED"])
        finish(ShowOutcome(shown: false, completed: false, message: message, placementId: adUnitId))
    }

    func handleClosed(_ adUnitId: String) {
        closedOutcome(adUnitId) { [weak self] outcome in self?.finish(outcome) }
    }

    private func flushLoad(_ adUnitId: String, _ failure: AdsFailure?) {
        let waiters = loadWaiters.removeValue(forKey: adUnitId) ?? []
        waiters.forEach { $0(failure) }
    }

    private func finish(_ outcome: ShowOutcome) {
        guard showing != nil else { return }
        showing = nil
        let completion = showCompletion
        showCompletion = nil
        completion?(outcome)
        didFinish(outcome)
        events?.emit("\(kind)Closed", ["placementId": outcome.placementId])
        if autoReload { load(outcome.placementId) }
    }
}
