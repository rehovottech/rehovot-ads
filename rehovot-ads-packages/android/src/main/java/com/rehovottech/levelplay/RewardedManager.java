package com.rehovottech.levelplay;

import android.app.Activity;
import com.unity3d.mediation.LevelPlayAdError;
import com.unity3d.mediation.LevelPlayAdInfo;
import com.unity3d.mediation.rewarded.LevelPlayReward;
import com.unity3d.mediation.rewarded.LevelPlayRewardedAd;
import com.unity3d.mediation.rewarded.LevelPlayRewardedAdListener;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Rewarded format. A reward is earned only when LevelPlay reports onAdRewarded (outcome.completed).
 * That callback can arrive just after onAdClosed, so the close outcome waits briefly for it.
 */
final class RewardedManager extends AdManager {
    private static final long REWARD_GRACE_MS = 500;
    private final Map<String, LevelPlayRewardedAd> ads = new HashMap<>();
    private final Set<String> rewardedUnits = new HashSet<>();

    RewardedManager(Logger logger) {
        super("rewarded", logger);
    }

    private LevelPlayRewardedAd ad(final String adUnitId) {
        LevelPlayRewardedAd ad = ads.get(adUnitId);
        if (ad != null) return ad;
        ad = new LevelPlayRewardedAd(adUnitId);
        ad.setListener(new LevelPlayRewardedAdListener() {
            @Override
            public void onAdLoaded(LevelPlayAdInfo info) {
                main.post(() -> handleLoaded(adUnitId));
            }

            @Override
            public void onAdLoadFailed(LevelPlayAdError error) {
                main.post(() -> handleLoadFailed(adUnitId, message(error)));
            }

            @Override
            public void onAdDisplayed(LevelPlayAdInfo info) {
                main.post(() -> handleDisplayed(adUnitId));
            }

            @Override
            public void onAdRewarded(LevelPlayReward reward, LevelPlayAdInfo info) {
                main.post(() -> rewardedUnits.add(adUnitId));
            }

            @Override
            public void onAdDisplayFailed(LevelPlayAdError error, LevelPlayAdInfo info) {
                main.post(() -> handleDisplayFailed(adUnitId, message(error)));
            }

            @Override
            public void onAdClosed(LevelPlayAdInfo info) {
                main.post(() -> handleClosed(adUnitId));
            }
        });
        ads.put(adUnitId, ad);
        return ad;
    }

    @Override
    boolean adReady(String adUnitId) {
        LevelPlayRewardedAd ad = ads.get(adUnitId);
        return ad != null && ad.isAdReady();
    }

    @Override
    void startLoad(String adUnitId) {
        ad(adUnitId).loadAd();
    }

    @Override
    void startShow(String adUnitId, Activity activity) {
        rewardedUnits.remove(adUnitId);
        ad(adUnitId).showAd(activity);
    }

    @Override
    void dropAds() {
        ads.clear();
        rewardedUnits.clear();
    }

    @Override
    void closedOutcome(final String adUnitId, final UnityEvents.ShowCallback completion) {
        Runnable resolve = () -> {
            boolean completed = rewardedUnits.remove(adUnitId);
            completion.done(new UnityEvents.ShowOutcome(true, completed, completed ? "Completed." : "Skipped.", adUnitId));
        };
        if (rewardedUnits.contains(adUnitId)) resolve.run();
        else main.postDelayed(resolve, REWARD_GRACE_MS);
    }

    @Override
    void didFinish(UnityEvents.ShowOutcome outcome) {
        if (!outcome.completed) return;
        emit(UnityEvents.REWARDED_COMPLETED, UnityEvents.data("placementId", outcome.placementId));
        emit(UnityEvents.REWARDED_REWARD_GRANTED, UnityEvents.data("placementId", outcome.placementId));
    }
}
