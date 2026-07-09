import Foundation

// Root native facade coordinates managers while keeping the bridge thin and stable.
final class UnityLevelPlay {
    private let logger: Logger
    private let consentManager: ConsentManager
    private let bannerManager: BannerManager
    private let interstitialManager: InterstitialManager
    private let rewardedManager: RewardedManager

    init(logger: Logger) {
        self.logger = logger
        self.consentManager = ConsentManager(logger: logger)
        self.bannerManager = BannerManager(logger: logger)
        self.interstitialManager = InterstitialManager(logger: logger)
        self.rewardedManager = RewardedManager(logger: logger)
    }

    func initialize(_ options: InitializeRequest) {
        logger.setDebugEnabled(options.debug)
        logger.debug("TODO: Initialize Unity LevelPlay SDK")
        logger.debug("Initialize options: \(options)")
        interstitialManager.load(InterstitialRequest(placementId: nil, timeoutMs: nil))
        rewardedManager.load(RewardedRequest(placementId: nil, rewardAmount: nil, rewardCurrency: nil))
    }

    func showBanner(_ options: BannerRequest) {
        bannerManager.show(options)
    }

    func hideBanner() {
        bannerManager.hide()
    }

    func destroyBanner() {
        bannerManager.destroy()
    }

    func showInterstitial(_ options: InterstitialRequest) {
        interstitialManager.show(options)
    }

    func showRewarded(_ options: RewardedRequest) -> RewardResultPayload {
        return rewardedManager.show(options)
    }

    func isInterstitialReady() -> Bool {
        return interstitialManager.isReady()
    }

    func isRewardedReady() -> Bool {
        return rewardedManager.isReady()
    }

    func setConsent(_ options: ConsentRequest) {
        consentManager.setConsent(options)
    }

    func setCOPPA(_ enabled: Bool) {
        consentManager.setCOPPA(enabled)
    }

    func setUserId(_ options: UserRequest) {
        consentManager.setUserId(options)
    }

    func destroy() {
        logger.debug("TODO: Destroy Unity LevelPlay SDK")
        bannerManager.destroy()
        interstitialManager.destroy()
        rewardedManager.destroy()
        consentManager.destroy()
    }
}

// Internal request models mirror the TypeScript contract without exposing SDK specifics.
struct InitializeRequest: CustomStringConvertible {
    let appKey: String?
    let testMode: Bool
    let debug: Bool
    let autoStart: Bool

    var description: String {
        "InitializeRequest(appKey: \(String(describing: appKey)), testMode: \(testMode), debug: \(debug), autoStart: \(autoStart))"
    }
}

struct BannerRequest: CustomStringConvertible {
    let placementId: String?
    let position: String?

    var description: String {
        "BannerRequest(placementId: \(String(describing: placementId)), position: \(String(describing: position)))"
    }
}

struct InterstitialRequest: CustomStringConvertible {
    let placementId: String?
    let timeoutMs: Int?

    var description: String {
        "InterstitialRequest(placementId: \(String(describing: placementId)), timeoutMs: \(String(describing: timeoutMs)))"
    }
}

struct RewardedRequest: CustomStringConvertible {
    let placementId: String?
    let rewardAmount: Int?
    let rewardCurrency: String?

    var description: String {
        "RewardedRequest(placementId: \(String(describing: placementId)), rewardAmount: \(String(describing: rewardAmount)), rewardCurrency: \(String(describing: rewardCurrency)))"
    }
}

struct RewardResultPayload {
    let success: Bool
    let rewardGranted: Bool
    let message: String
    let placementId: String?
    let rewardAmount: Int?
    let rewardCurrency: String?
}

struct ConsentRequest: CustomStringConvertible {
    let gdprConsent: Bool?
    let doNotSell: Bool?
    let childDirected: Bool?
    let underAgeOfConsent: Bool?
    let consentString: String?

    var description: String {
        "ConsentRequest(gdprConsent: \(String(describing: gdprConsent)), doNotSell: \(String(describing: doNotSell)), childDirected: \(String(describing: childDirected)), underAgeOfConsent: \(String(describing: underAgeOfConsent)), consentString: \(String(describing: consentString)))"
    }
}

struct UserRequest: CustomStringConvertible {
    let userId: String?
    let ageRestrictedUser: Bool?

    var description: String {
        "UserRequest(userId: \(String(describing: userId)), ageRestrictedUser: \(String(describing: ageRestrictedUser)))"
    }
}
