package com.rehovottech.levelplay;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import com.unity3d.ads.IUnityAdsInitializationListener;
import com.unity3d.ads.UnityAds;
import java.util.ArrayList;
import java.util.List;

/**
 * Native facade. The backend today is the Unity Ads SDK (com.unity3d.ads:unity-ads, 4.x).
 * Swapping to another SDK (e.g. Unity LevelPlay mediation) only changes this package;
 * the JavaScript contract in src/definitions.ts stays the same.
 * Call everything on the main thread.
 */
@SuppressWarnings("deprecation")
final class UnityLevelPlay {
    final Logger logger;
    final ConsentManager consent;
    final InterstitialManager interstitial;
    final RewardedManager rewarded;
    final BannerManager banner;

    private final Handler main = new Handler(Looper.getMainLooper());
    private UnityEvents.Sink events;
    private UnityEvents.InitializeRequest config;
    private final List<UnityEvents.LoadCallback> pendingInit = new ArrayList<>();

    UnityLevelPlay(Logger logger) {
        this.logger = logger;
        this.consent = new ConsentManager(logger);
        this.interstitial = new InterstitialManager(logger);
        this.rewarded = new RewardedManager(logger);
        this.banner = new BannerManager(logger);
    }

    void setEvents(UnityEvents.Sink sink) {
        events = sink;
        interstitial.events = sink;
        rewarded.events = sink;
        banner.events = sink;
    }

    void initialize(Context context, UnityEvents.InitializeRequest request, UnityEvents.LoadCallback completion) {
        logger.setDebugEnabled(request.debug);
        logger.debug("initialize " + request);
        if (request.appKey == null || request.appKey.isEmpty()) {
            completion.done(new UnityEvents.Failure("INVALID_CONFIGURATION", "appKey (Unity Game ID) is required."));
            return;
        }
        config = request;
        interstitial.autoReload = request.autoStart;
        rewarded.autoReload = request.autoStart;

        if (UnityAds.isInitialized()) {
            completion.done(null);
            preload();
            return;
        }
        pendingInit.add(completion);
        if (pendingInit.size() > 1) return;
        UnityAds.initialize(context.getApplicationContext(), request.appKey, request.testMode, new IUnityAdsInitializationListener() {
            @Override
            public void onInitializationComplete() {
                main.post(() -> onInitialized(null));
            }

            @Override
            public void onInitializationFailed(UnityAds.UnityAdsInitializationError error, String message) {
                main.post(() -> onInitialized(new UnityEvents.Failure("INIT_FAILED", message)));
            }
        });
    }

    private void onInitialized(UnityEvents.Failure failure) {
        List<UnityEvents.LoadCallback> waiters = new ArrayList<>(pendingInit);
        pendingInit.clear();
        for (UnityEvents.LoadCallback callback : waiters) callback.done(failure);
        if (failure == null) {
            logger.info("Unity Ads initialized");
            if (events != null) events.emit(UnityEvents.INITIALIZED, UnityEvents.data("message", "Unity Ads initialized."));
            preload();
        } else {
            logger.error("Unity Ads init failed: " + failure.message);
            if (events != null) events.emit(UnityEvents.FAILED, UnityEvents.data("message", failure.message, "code", failure.code));
        }
    }

    private void preload() {
        if (config == null || !config.autoStart) return;
        if (notEmpty(config.interstitialId)) interstitial.load(config.interstitialId, null);
        if (notEmpty(config.rewardedId)) rewarded.load(config.rewardedId, null);
    }

    String interstitialId(String explicit) {
        return notEmpty(explicit) ? explicit : (config != null && notEmpty(config.interstitialId) ? config.interstitialId : null);
    }

    String rewardedId(String explicit) {
        return notEmpty(explicit) ? explicit : (config != null && notEmpty(config.rewardedId) ? config.rewardedId : null);
    }

    String bannerId(String explicit) {
        return notEmpty(explicit) ? explicit : (config != null && notEmpty(config.bannerId) ? config.bannerId : null);
    }

    void destroy() {
        banner.destroy();
        interstitial.reset();
        rewarded.reset();
    }

    private static boolean notEmpty(String value) {
        return value != null && !value.isEmpty();
    }
}
