import Foundation
import UIKit
import IronSource

// Rewarded format. A reward is earned only when LevelPlay reports didRewardAd (outcome.completed).
// That callback can arrive just after didCloseAd, so the close outcome waits briefly for it.
final class RewardedManager: FullscreenAdManager, LPMRewardedAdDelegate {
    private static let rewardGrace: TimeInterval = 0.5
    private var ads: [String: LPMRewardedAd] = [:]
    private var rewardedUnits = Set<String>()

    init(logger: Logger) {
        super.init(kind: "rewarded", logger: logger)
    }

    private func ad(_ adUnitId: String) -> LPMRewardedAd {
        if let ad = ads[adUnitId] { return ad }
        let ad = LPMRewardedAd(adUnitId: adUnitId)
        ad.setDelegate(self)
        ads[adUnitId] = ad
        return ad
    }

    override func adReady(_ adUnitId: String) -> Bool { ads[adUnitId]?.isAdReady() ?? false }
    override func startLoad(_ adUnitId: String) { ad(adUnitId).loadAd() }
    override func startShow(_ adUnitId: String, from viewController: UIViewController) {
        rewardedUnits.remove(adUnitId)
        ad(adUnitId).showAd(viewController: viewController, placementName: nil)
    }
    override func dropAds() {
        ads.removeAll()
        rewardedUnits.removeAll()
    }

    override func closedOutcome(_ adUnitId: String, completion: @escaping (ShowOutcome) -> Void) {
        let resolve = { [weak self] in
            let completed = self?.rewardedUnits.remove(adUnitId) != nil
            completion(ShowOutcome(shown: true, completed: completed, message: completed ? "Completed." : "Skipped.", placementId: adUnitId))
        }
        if rewardedUnits.contains(adUnitId) { resolve() } else {
            DispatchQueue.main.asyncAfter(deadline: .now() + Self.rewardGrace, execute: resolve)
        }
    }

    override func didFinish(_ outcome: ShowOutcome) {
        guard outcome.completed else { return }
        events?.emit("rewardedCompleted", ["placementId": outcome.placementId])
        events?.emit("rewardedRewardGranted", ["placementId": outcome.placementId])
    }

    // MARK: LPMRewardedAdDelegate

    func didLoadAd(with adInfo: LPMAdInfo) {
        DispatchQueue.main.async { self.handleLoaded(adInfo.adUnitId) }
    }

    func didFailToLoadAd(withAdUnitId adUnitId: String, error: Error) {
        DispatchQueue.main.async { self.handleLoadFailed(adUnitId, error.localizedDescription) }
    }

    func didDisplayAd(with adInfo: LPMAdInfo) {
        DispatchQueue.main.async { self.handleDisplayed(adInfo.adUnitId) }
    }

    func didRewardAd(with adInfo: LPMAdInfo, reward: LPMReward) {
        DispatchQueue.main.async { self.rewardedUnits.insert(adInfo.adUnitId) }
    }

    func didFailToDisplayAd(with adInfo: LPMAdInfo, error: Error) {
        DispatchQueue.main.async { self.handleDisplayFailed(adInfo.adUnitId, error.localizedDescription) }
    }

    func didCloseAd(with adInfo: LPMAdInfo) {
        DispatchQueue.main.async { self.handleClosed(adInfo.adUnitId) }
    }
}
