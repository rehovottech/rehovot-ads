package com.rehovottech.levelplay;

import android.app.Activity;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import com.unity3d.mediation.LevelPlay;
import com.unity3d.mediation.LevelPlayConfiguration;
import com.unity3d.mediation.LevelPlayInitError;
import com.unity3d.mediation.LevelPlayInitListener;
import com.unity3d.mediation.LevelPlayInitRequest;
import java.util.ArrayList;
import java.util.List;

/**
 * Native facade over the Unity LevelPlay mediation SDK (com.unity3d.ads-mediation:mediation-sdk, 9.x).
 * Ad networks (Unity Ads, AdMob, ...) are adapters the game adds to its own app/build.gradle.
 * The JavaScript contract in src/definitions.ts stays the same.
 * Call everything on the main thread.
 */
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
    private boolean initialized;

    UnityLevelPlay(Logger logger) {
        this.logger = logger;
        this.consent = new ConsentManager(logger);
        this.interstitial = new InterstitialManager(logger);
        this.rewarded = new RewardedManager(logger);
        this.banner = new BannerManager(logger);
        interstitial.facade = this;
        rewarded.facade = this;
    }

    boolean isInitialized() {
        return initialized;
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
            completion.done(new UnityEvents.Failure("INVALID_CONFIGURATION", "appKey (LevelPlay App Key) is required."));
            return;
        }
        config = request;
        interstitial.autoReload = request.autoStart;
        rewarded.autoReload = request.autoStart;

        if (initialized) {
            completion.done(null);
            preload();
            return;
        }
        pendingInit.add(completion);
        if (pendingInit.size() > 1) return;
        LevelPlay.setAdaptersDebug(request.debug);
        // Test mode enables the LevelPlay Test Suite (openTestSuite). Test ads themselves come from
        // registering the device under LevelPlay > Setup > Test devices.
        if (request.testMode) LevelPlay.setMetaData("is_test_suite", "enable");
        LevelPlay.init(context.getApplicationContext(), new LevelPlayInitRequest.Builder(request.appKey).build(), new LevelPlayInitListener() {
            @Override
            public void onInitSuccess(LevelPlayConfiguration configuration) {
                main.post(() -> onInitialized(null));
            }

            @Override
            public void onInitFailed(LevelPlayInitError error) {
                main.post(() -> onInitialized(new UnityEvents.Failure("INIT_FAILED", error.getErrorMessage())));
            }
        });
    }

    private void onInitialized(UnityEvents.Failure failure) {
        if (failure == null) initialized = true;
        List<UnityEvents.LoadCallback> waiters = new ArrayList<>(pendingInit);
        pendingInit.clear();
        for (UnityEvents.LoadCallback callback : waiters) callback.done(failure);
        if (failure == null) {
            logger.info("LevelPlay initialized (SDK " + LevelPlay.getSdkVersion() + ")");
            if (events != null) events.emit(UnityEvents.INITIALIZED, UnityEvents.data("message", "LevelPlay initialized."));
            preload();
        } else {
            logger.error("LevelPlay init failed: " + failure.message);
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

    void openTestSuite(Activity activity) {
        if (activity != null) LevelPlay.launchTestSuite(activity);
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
