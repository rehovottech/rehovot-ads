import Foundation
import UIKit
import IronSource

// Interstitial format: one LPMInterstitialAd per ad unit; state lives in FullscreenAdManager (UnityLevelPlay.swift).
final class InterstitialManager: FullscreenAdManager, LPMInterstitialAdDelegate {
    private var ads: [String: LPMInterstitialAd] = [:]

    init(logger: Logger) {
        super.init(kind: "interstitial", logger: logger)
    }

    private func ad(_ adUnitId: String) -> LPMInterstitialAd {
        if let ad = ads[adUnitId] { return ad }
        let ad = LPMInterstitialAd(adUnitId: adUnitId)
        ad.setDelegate(self)
        ads[adUnitId] = ad
        return ad
    }

    override func adReady(_ adUnitId: String) -> Bool { ads[adUnitId]?.isAdReady() ?? false }
    override func startLoad(_ adUnitId: String) { ad(adUnitId).loadAd() }
    override func startShow(_ adUnitId: String, from viewController: UIViewController) {
        ad(adUnitId).showAd(viewController: viewController, placementName: nil)
    }
    override func dropAds() { ads.removeAll() }

    // MARK: LPMInterstitialAdDelegate

    func didLoadAd(with adInfo: LPMAdInfo) {
        DispatchQueue.main.async { self.handleLoaded(adInfo.adUnitId) }
    }

    func didFailToLoadAd(withAdUnitId adUnitId: String, error: Error) {
        DispatchQueue.main.async { self.handleLoadFailed(adUnitId, error.localizedDescription) }
    }

    func didDisplayAd(with adInfo: LPMAdInfo) {
        DispatchQueue.main.async { self.handleDisplayed(adInfo.adUnitId) }
    }

    func didFailToDisplayAd(with adInfo: LPMAdInfo, error: Error) {
        DispatchQueue.main.async { self.handleDisplayFailed(adInfo.adUnitId, error.localizedDescription) }
    }

    func didCloseAd(with adInfo: LPMAdInfo) {
        DispatchQueue.main.async { self.handleClosed(adInfo.adUnitId) }
    }
}
