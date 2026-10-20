import Foundation
import UIKit
import UnityAds

// Banner format: a 320x50 Unity banner pinned to the top or bottom safe area of the web view.
final class BannerManager: NSObject, UADSBannerViewDelegate {
    private let logger: Logger
    weak var events: AdsEventSink?
    private var bannerView: UADSBannerView?
    private var placementId: String?

    init(logger: Logger) {
        self.logger = logger
        super.init()
    }

    func show(_ request: BannerRequest, placementId: String, in container: UIView?) {
        guard let container = container else { return }
        if let existing = bannerView, self.placementId == placementId {
            existing.isHidden = false
            events?.emit("bannerShown", ["placementId": placementId])
            return
        }
        destroy()
        let view = UADSBannerView(placementId: placementId, size: CGSize(width: 320, height: 50))
        view.delegate = self
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
        view.load()
    }

    func hide() {
        bannerView?.isHidden = true
        events?.emit("bannerHidden", ["placementId": placementId ?? ""])
    }

    func destroy() {
        bannerView?.delegate = nil
        bannerView?.removeFromSuperview()
        bannerView = nil
        placementId = nil
    }

    // MARK: UADSBannerViewDelegate

    func bannerViewDidLoad(_ bannerView: UADSBannerView!) {
        events?.emit("bannerLoaded", ["placementId": bannerView.placementId ?? ""])
        events?.emit("bannerShown", ["placementId": bannerView.placementId ?? ""])
    }

    func bannerViewDidError(_ bannerView: UADSBannerView!, error: UADSBannerError!) {
        events?.emit("bannerFailed", ["placementId": bannerView.placementId ?? "", "message": error?.localizedDescription ?? "Banner failed."])
    }

    func bannerViewDidClick(_ bannerView: UADSBannerView!) {
        events?.emit("bannerClicked", ["placementId": bannerView.placementId ?? ""])
    }
}
