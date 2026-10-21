package com.rehovottech.levelplay;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Shared load/show state machine for full-screen formats (interstitial + rewarded).
 * One LevelPlay ad object per ad unit id; subclasses create it and forward its listener callbacks
 * to the handle* methods. All state is touched on the main thread only.
 */
abstract class AdManager {
    final String kind;
    final Logger logger;
    UnityEvents.Sink events;
    UnityLevelPlay facade;
    boolean autoReload = true;

    final Handler main = new Handler(Looper.getMainLooper());
    private final Set<String> loading = new HashSet<>();
    private final Map<String, List<UnityEvents.LoadCallback>> loadWaiters = new HashMap<>();
    private final Map<String, Integer> retries = new HashMap<>();
    private String showing;
    private UnityEvents.ShowCallback showCompletion;

    AdManager(String kind, Logger logger) {
        this.kind = kind;
        this.logger = logger;
    }

    // Subclass hooks

    abstract boolean adReady(String adUnitId);

    abstract void startLoad(String adUnitId);

    abstract void startShow(String adUnitId, Activity activity);

    abstract void dropAds();

    /** Outcome once the ad is closed; rewarded overrides this to report whether the reward was earned. */
    void closedOutcome(String adUnitId, UnityEvents.ShowCallback completion) {
        completion.done(new UnityEvents.ShowOutcome(true, true, "Closed.", adUnitId));
    }

    /** Hook for subclasses (rewarded emits its reward events here). */
    void didFinish(UnityEvents.ShowOutcome outcome) {}

    // Public API

    boolean isReady(String adUnitId) {
        return adReady(adUnitId);
    }

    void load(final String adUnitId, final UnityEvents.LoadCallback completion) {
        if (adReady(adUnitId)) {
            if (completion != null) completion.done(null);
            return;
        }
        if (completion != null) {
            List<UnityEvents.LoadCallback> list = loadWaiters.get(adUnitId);
            if (list == null) {
                list = new ArrayList<>();
                loadWaiters.put(adUnitId, list);
            }
            list.add(completion);
        }
        if (loading.contains(adUnitId) || adUnitId.equals(showing)) return;
        if (facade == null || !facade.isInitialized()) {
            flushLoad(adUnitId, new UnityEvents.Failure("NOT_INITIALIZED", "Call initialize() first."));
            return;
        }
        loading.add(adUnitId);
        logger.debug("load " + kind + " " + adUnitId);
        startLoad(adUnitId);
    }

    void show(final String adUnitId, Activity activity, final UnityEvents.ShowCallback completion) {
        if (showing != null) {
            completion.done(new UnityEvents.ShowOutcome(false, false, "Another ad is already showing.", adUnitId));
            return;
        }
        if (!adReady(adUnitId) || activity == null) {
            completion.done(new UnityEvents.ShowOutcome(false, false, "Ad is not ready yet.", adUnitId));
            load(adUnitId, null);
            return;
        }
        showing = adUnitId;
        showCompletion = completion;
        startShow(adUnitId, activity);
    }

    void reset() {
        dropAds();
        loading.clear();
        loadWaiters.clear();
        retries.clear();
    }

    // Callbacks from the LevelPlay listeners (posted to the main thread by the subclasses)

    void handleLoaded(String adUnitId) {
        loading.remove(adUnitId);
        retries.put(adUnitId, 0);
        flushLoad(adUnitId, null);
        emit(UnityEvents.loaded(kind), UnityEvents.data("placementId", adUnitId));
    }

    void handleLoadFailed(final String adUnitId, String message) {
        logger.warning(kind + " load failed: " + message);
        loading.remove(adUnitId);
        flushLoad(adUnitId, new UnityEvents.Failure("LOAD_FAILED", message));
        emit(UnityEvents.failed(kind), UnityEvents.data("placementId", adUnitId, "message", message, "code", "LOAD_FAILED"));
        if (!autoReload) return;
        Integer prev = retries.get(adUnitId);
        int attempt = prev == null ? 0 : prev;
        retries.put(adUnitId, attempt + 1);
        long delayMs = (long) (Math.min(60.0, 5.0 * Math.pow(2.0, attempt)) * 1000);
        main.postDelayed(() -> load(adUnitId, null), delayMs);
    }

    void handleDisplayed(String adUnitId) {
        emit(UnityEvents.opened(kind), UnityEvents.data("placementId", adUnitId));
    }

    void handleDisplayFailed(String adUnitId, String message) {
        emit(UnityEvents.failed(kind), UnityEvents.data("placementId", adUnitId, "message", message, "code", "SHOW_FAILED"));
        finish(new UnityEvents.ShowOutcome(false, false, message, adUnitId));
    }

    void handleClosed(String adUnitId) {
        closedOutcome(adUnitId, this::finish);
    }

    void emit(String event, Map<String, Object> data) {
        if (events != null) events.emit(event, data);
    }

    static String message(com.unity3d.mediation.LevelPlayAdError error) {
        return error != null ? error.getErrorMessage() : "Unknown error.";
    }

    private void finish(UnityEvents.ShowOutcome outcome) {
        if (showing == null) return;
        showing = null;
        UnityEvents.ShowCallback completion = showCompletion;
        showCompletion = null;
        if (completion != null) completion.done(outcome);
        didFinish(outcome);
        emit(UnityEvents.closed(kind), UnityEvents.data("placementId", outcome.placementId));
        if (autoReload) load(outcome.placementId, null);
    }

    private void flushLoad(String adUnitId, UnityEvents.Failure failure) {
        List<UnityEvents.LoadCallback> waiters = loadWaiters.remove(adUnitId);
        if (waiters == null) return;
        for (UnityEvents.LoadCallback callback : waiters) callback.done(failure);
    }
}
