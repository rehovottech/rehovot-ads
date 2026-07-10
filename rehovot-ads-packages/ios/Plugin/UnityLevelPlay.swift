import Foundation

// Native facade placeholder. Real SDK wiring will live here when each backend is added.
final class CapacitorAds {
    private let logger: Logger

    init(logger: Logger) {
        self.logger = logger
    }

    func initialize(_ options: InitializeRequest) {
        logger.setDebugEnabled(options.debug)
        logger.debug("TODO: initialize native ad SDK")
        logger.debug("initialize options: \(options)")
    }

    func showBanner(_ options: BannerRequest) {
        logger.debug("TODO: show banner")
        logger.debug("banner request: \(options)")
    }

    func hideBanner() {
        logger.debug("TODO: hide banner")
    }

    func destroyBanner() {
        logger.debug("TODO: destroy banner")
    }

    func showInterstitial(_ options: InterstitialRequest) {
        logger.debug("TODO: show interstitial")
        logger.debug("interstitial request: \(options)")
    }

    func showRewarded(_ options: RewardedRequest) -> RewardResultPayload {
        logger.debug("TODO: show rewarded")
        logger.debug("rewarded request: \(options)")
        return RewardResultPayload(
            success: false,
            completed: false,
            message: "Native rewarded flow is not implemented yet.",
            placementId: options.placementId,
            rewardAmount: options.rewardAmount,
            rewardCurrency: options.rewardCurrency
        )
    }

    func destroy() {
        logger.debug("TODO: destroy native ad SDK")
    }
}

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
    let completed: Bool
    let message: String
    let placementId: String?
    let rewardAmount: Int?
    let rewardCurrency: String?
}
