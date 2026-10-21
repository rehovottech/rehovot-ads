package com.rehovottech.levelplay;

import android.app.Activity;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import com.unity3d.mediation.LevelPlayAdError;
import com.unity3d.mediation.LevelPlayAdInfo;
import com.unity3d.mediation.LevelPlayAdSize;
import com.unity3d.mediation.banner.LevelPlayBannerAdView;
import com.unity3d.mediation.banner.LevelPlayBannerAdViewListener;

/** Banner format: a 320x50 LevelPlay banner pinned to the top or bottom of the activity. Main thread only. */
final class BannerManager {
    private final Logger logger;
    UnityEvents.Sink events;
    private LevelPlayBannerAdView bannerView;
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
        LevelPlayBannerAdView.Config config = new LevelPlayBannerAdView.Config.Builder().setAdSize(LevelPlayAdSize.BANNER).build();
        final LevelPlayBannerAdView view = new LevelPlayBannerAdView(activity, placementId, config);
        view.setBannerListener(new LevelPlayBannerAdViewListener() {
            @Override
            public void onAdLoaded(LevelPlayAdInfo info) {
                emit(UnityEvents.BANNER_LOADED, view.getAdUnitId(), null);
                emit(UnityEvents.BANNER_SHOWN, view.getAdUnitId(), null);
            }

            @Override
            public void onAdLoadFailed(LevelPlayAdError error) {
                emit(UnityEvents.BANNER_FAILED, view.getAdUnitId(), error != null ? error.getErrorMessage() : "Banner failed.");
            }

            @Override
            public void onAdClicked(LevelPlayAdInfo info) {
                emit(UnityEvents.BANNER_CLICKED, view.getAdUnitId(), null);
            }
        });
        int gravity = ("top".equals(position) ? Gravity.TOP : Gravity.BOTTOM) | Gravity.CENTER_HORIZONTAL;
        activity.addContentView(view, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, gravity));
        bannerView = view;
        this.placementId = placementId;
        logger.debug("load banner " + placementId + " (" + position + ")");
        view.loadAd();
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
