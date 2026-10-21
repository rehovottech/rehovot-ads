package com.rehovottech.levelplay;

import android.app.Activity;
import com.unity3d.mediation.LevelPlayAdError;
import com.unity3d.mediation.LevelPlayAdInfo;
import com.unity3d.mediation.interstitial.LevelPlayInterstitialAd;
import com.unity3d.mediation.interstitial.LevelPlayInterstitialAdListener;
import java.util.HashMap;
import java.util.Map;

/** Interstitial format: one LevelPlayInterstitialAd per ad unit; state lives in AdManager. */
final class InterstitialManager extends AdManager {
    private final Map<String, LevelPlayInterstitialAd> ads = new HashMap<>();

    InterstitialManager(Logger logger) {
        super("interstitial", logger);
    }

    private LevelPlayInterstitialAd ad(final String adUnitId) {
        LevelPlayInterstitialAd ad = ads.get(adUnitId);
        if (ad != null) return ad;
        ad = new LevelPlayInterstitialAd(adUnitId);
        ad.setListener(new LevelPlayInterstitialAdListener() {
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
        LevelPlayInterstitialAd ad = ads.get(adUnitId);
        return ad != null && ad.isAdReady();
    }

    @Override
    void startLoad(String adUnitId) {
        ad(adUnitId).loadAd();
    }

    @Override
    void startShow(String adUnitId, Activity activity) {
        ad(adUnitId).showAd(activity);
    }

    @Override
    void dropAds() {
        ads.clear();
    }
}
