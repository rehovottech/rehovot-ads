package com.rehovottech.levelplay;

import android.app.Activity;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import com.unity3d.services.banners.BannerErrorInfo;
import com.unity3d.services.banners.BannerView;
import com.unity3d.services.banners.UnityBannerSize;

/** Banner format: a 320x50 Unity banner pinned to the top or bottom of the activity. Main thread only. */
@SuppressWarnings("deprecation")
final class BannerManager {
    private final Logger logger;
    UnityEvents.Sink events;
    private BannerView bannerView;
    private String placementId;

    BannerManager(Logger logger) {
        this.logger = logger;
    }

    void show(Activity activity, String placementId, String position) {
        if (bannerView != null && placementId.equals(this.placementId)) {
            bannerView.setVisibility(View.VISIBLE);
            emit(UnityEvents.BANNER_SHOWN, placementId, null);
            return;
        }
        destroy();
        BannerView view = new BannerView(activity, placementId, new UnityBannerSize(320, 50));
        view.setListener(new BannerView.IListener() {
            @Override
            public void onBannerLoaded(BannerView banner) {
                emit(UnityEvents.BANNER_LOADED, banner.getPlacementId(), null);
            }

            @Override
            public void onBannerShown(BannerView banner) {
                emit(UnityEvents.BANNER_SHOWN, banner.getPlacementId(), null);
            }

            @Override
            public void onBannerClick(BannerView banner) {
                emit(UnityEvents.BANNER_CLICKED, banner.getPlacementId(), null);
            }

            @Override
            public void onBannerFailedToLoad(BannerView banner, BannerErrorInfo errorInfo) {
                emit(UnityEvents.BANNER_FAILED, banner.getPlacementId(), errorInfo != null ? errorInfo.errorMessage : "Banner failed.");
            }

            @Override
            public void onBannerLeftApplication(BannerView banner) {}
        });
        int gravity = ("top".equals(position) ? Gravity.TOP : Gravity.BOTTOM) | Gravity.CENTER_HORIZONTAL;
        activity.addContentView(view, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, gravity));
        bannerView = view;
        this.placementId = placementId;
        logger.debug("load banner " + placementId + " (" + position + ")");
        view.load();
    }

    void hide() {
        if (bannerView != null) bannerView.setVisibility(View.GONE);
        emit(UnityEvents.BANNER_HIDDEN, placementId, null);
    }

    void destroy() {
        if (bannerView != null) {
            if (bannerView.getParent() instanceof ViewGroup) ((ViewGroup) bannerView.getParent()).removeView(bannerView);
            bannerView.destroy();
        }
        bannerView = null;
        placementId = null;
    }

    private void emit(String event, String placementId, String message) {
        if (events != null) events.emit(event, UnityEvents.data("placementId", placementId, "message", message));
    }
}
