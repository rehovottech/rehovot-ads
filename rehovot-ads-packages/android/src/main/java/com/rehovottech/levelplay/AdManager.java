package com.rehovottech.levelplay;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;
import com.unity3d.ads.IUnityAdsLoadListener;
import com.unity3d.ads.IUnityAdsShowListener;
import com.unity3d.ads.UnityAds;
import com.unity3d.ads.UnityAdsShowOptions;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Shared load/show state machine for full-screen formats (interstitial + rewarded).
 * Uses the classic Unity Ads API (UnityAds.load / UnityAds.show), which is deprecated from 4.19
 * and removed in 5.0 - keep the dependency on 4.x until this class moves to InterstitialAd / RewardedAd.
 * All state is touched on the main thread only.
 */
@SuppressWarnings("deprecation")
class AdManager {
    final String kind;
    final Logger logger;
    UnityEvents.Sink events;
    boolean autoReload = true;

    final Handler main = new Handler(Looper.getMainLooper());
    private final Set<String> ready = new HashSet<>();
    private final Set<String> loading = new HashSet<>();
    private final Map<String, List<UnityEvents.LoadCallback>> loadWaiters = new HashMap<>();
    private final Map<String, Integer> retries = new HashMap<>();
    private String showing;

    AdManager(String kind, Logger logger) {
        this.kind = kind;
        this.logger = logger;
    }

    boolean isReady(String placementId) {
        return ready.contains(placementId);
    }

    void load(final String placementId, final UnityEvents.LoadCallback completion) {
        if (ready.contains(placementId)) {
            if (completion != null) completion.done(null);
            return;
        }
        if (completion != null) {
            List<UnityEvents.LoadCallback> list = loadWaiters.get(placementId);
            if (list == null) {
                list = new ArrayList<>();
                loadWaiters.put(placementId, list);
            }
            list.add(completion);
        }
        if (loading.contains(placementId)) return;
        if (!UnityAds.isInitialized()) {
            flushLoad(placementId, new UnityEvents.Failure("NOT_INITIALIZED", "Call initialize() first."));
            return;
        }
        loading.add(placementId);
        logger.debug("load " + kind + " " + placementId);
        UnityAds.load(placementId, new IUnityAdsLoadListener() {
            @Override
            public void onUnityAdsAdLoaded(final String id) {
                main.post(() -> {
                    loading.remove(id);
                    ready.add(id);
                    retries.put(id, 0);
                    flushLoad(id, null);
                    emit(UnityEvents.loaded(kind), UnityEvents.data("placementId", id));
                });
            }

            @Override
            public void onUnityAdsFailedToLoad(final String id, UnityAds.UnityAdsLoadError error, final String message) {
                main.post(() -> {
                    logger.warning(kind + " load failed: " + message);
                    loading.remove(id);
                    ready.remove(id);
                    flushLoad(id, new UnityEvents.Failure("LOAD_FAILED", message));
                    emit(UnityEvents.failed(kind), UnityEvents.data("placementId", id, "message", message, "code", "LOAD_FAILED"));
                    if (autoReload) {
                        Integer prev = retries.get(id);
                        int attempt = prev == null ? 0 : prev;
                        retries.put(id, attempt + 1);
                        long delayMs = (long) (Math.min(60.0, 5.0 * Math.pow(2.0, attempt)) * 1000);
                        main.postDelayed(() -> load(id, null), delayMs);
                    }
                });
            }
        });
    }

    void show(final String placementId, Activity activity, final UnityEvents.ShowCallback completion) {
        if (showing != null) {
            completion.done(new UnityEvents.ShowOutcome(false, false, "Another ad is already showing.", placementId));
            return;
        }
        if (!ready.contains(placementId) || activity == null) {
            completion.done(new UnityEvents.ShowOutcome(false, false, "Ad is not ready yet.", placementId));
            load(placementId, null);
            return;
        }
        ready.remove(placementId);
        showing = placementId;
        UnityAds.show(activity, placementId, new UnityAdsShowOptions(), new IUnityAdsShowListener() {
            @Override
            public void onUnityAdsShowFailure(final String id, UnityAds.UnityAdsShowError error, final String message) {
                main.post(() -> {
                    emit(UnityEvents.failed(kind), UnityEvents.data("placementId", id, "message", message, "code", "SHOW_FAILED"));
                    finish(new UnityEvents.ShowOutcome(false, false, message, id), completion);
                });
            }

            @Override
            public void onUnityAdsShowStart(final String id) {
                main.post(() -> emit(UnityEvents.opened(kind), UnityEvents.data("placementId", id)));
            }

            @Override
            public void onUnityAdsShowClick(String id) {}

            @Override
            public void onUnityAdsShowComplete(final String id, final UnityAds.UnityAdsShowCompletionState state) {
                main.post(() -> {
                    boolean completed = state == UnityAds.UnityAdsShowCompletionState.COMPLETED;
                    finish(new UnityEvents.ShowOutcome(true, completed, completed ? "Completed." : "Skipped.", id), completion);
                });
            }
        });
    }

    void reset() {
        ready.clear();
        loading.clear();
        loadWaiters.clear();
        retries.clear();
    }

    /** Hook for subclasses (rewarded emits its reward events here). */
    void didFinish(UnityEvents.ShowOutcome outcome) {}

    void emit(String event, Map<String, Object> data) {
        if (events != null) events.emit(event, data);
    }

    private void finish(UnityEvents.ShowOutcome outcome, UnityEvents.ShowCallback completion) {
        showing = null;
        completion.done(outcome);
        didFinish(outcome);
        emit(UnityEvents.closed(kind), UnityEvents.data("placementId", outcome.placementId));
        if (autoReload) load(outcome.placementId, null);
    }

    private void flushLoad(String placementId, UnityEvents.Failure failure) {
        List<UnityEvents.LoadCallback> waiters = loadWaiters.remove(placementId);
        if (waiters == null) return;
        for (UnityEvents.LoadCallback callback : waiters) callback.done(failure);
    }
}
