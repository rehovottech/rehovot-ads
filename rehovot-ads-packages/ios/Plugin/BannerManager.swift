import Foundation
import UIKit
import IronSource

// Banner format: a 320x50 LevelPlay banner pinned to the top or bottom safe area of the web view.
final class BannerManager: NSObject, LPMBannerAdViewDelegate {
    private let logger: Logger
    weak var events: AdsEventSink?
    private var bannerView: LPMBannerAdView?
    private var placementId: String?

    init(logger: Logger) {
        self.logger = logger
        super.init()
    }

    func show(_ request: BannerRequest, placementId: String, from viewController: UIViewController?) {
        guard let viewController = viewController, let container = viewController.view else { return }
        if let existing = bannerView, self.placementId == placementId {
            existing.isHidden = false
            events?.emit("bannerShown", ["placementId": placementId])
            return
        }
        destroy()
        let config = LPMBannerAdViewConfigBuilder().set(adSize: LPMAdSize.banner()).build()
        let view = LPMBannerAdView(adUnitId: placementId, config: config)
        view.setDelegate(self)
        view.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(view)
        let guide = container.safeAreaLayoutGuide
        var constraints = [
            view.centerXAnchor.constraint(equalTo: container.centerXAnchor),
            view.widthAnchor.constraint(equalToConstant: 320),
            view.heightAnchor.constraint(equalToConstant: 50),
        ]
        if request.position == "top" {
            constraints.append(view.topAnchor.constraint(equalTo: guide.topAnchor))
        } else {
            constraints.append(view.bottomAnchor.constraint(equalTo: guide.bottomAnchor))
        }
        NSLayoutConstraint.activate(constraints)
        bannerView = view
        self.placementId = placementId
        logger.debug("load \(request)")
        view.loadAd(with: viewController)
    }

    func hide() {
        bannerView?.isHidden = true
        events?.emit("bannerHidden", ["placementId": placementId ?? ""])
    }

    func destroy() {
        bannerView?.destroy()
        bannerView?.removeFromSuperview()
        bannerView = nil
        placementId = nil
    }

    // MARK: LPMBannerAdViewDelegate

    func didLoadAd(with adInfo: LPMAdInfo) {
        events?.emit("bannerLoaded", ["placementId": adInfo.adUnitId])
        events?.emit("bannerShown", ["placementId": adInfo.adUnitId])
    }

    func didFailToLoadAd(withAdUnitId adUnitId: String, error: Error) {
        events?.emit("bannerFailed", ["placementId": adUnitId, "message": error.localizedDescription])
    }

    func didClickAd(with adInfo: LPMAdInfo) {
        events?.emit("bannerClicked", ["placementId": adInfo.adUnitId])
    }
}
