package com.rehovottech.levelplay;

import java.util.HashMap;
import java.util.Map;

/** Event names delivered to JS listeners. Must match src/enums.ts (UnityLevelPlayEventName). */
final class UnityEvents {
    static final String INITIALIZED = "initialized";
    static final String FAILED = "failed";
    static final String BANNER_LOADED = "bannerLoaded";
    static final String BANNER_FAILED = "bannerFailed";
    static final String BANNER_CLICKED = "bannerClicked";
    static final String BANNER_SHOWN = "bannerShown";
    static final String BANNER_HIDDEN = "bannerHidden";
    static final String REWARDED_COMPLETED = "rewardedCompleted";
    static final String REWARDED_REWARD_GRANTED = "rewardedRewardGranted";

    private UnityEvents() {}

    static String loaded(String kind) { return kind + "Loaded"; }
    static String failed(String kind) { return kind + "Failed"; }
    static String opened(String kind) { return kind + "Opened"; }
    static String closed(String kind) { return kind + "Closed"; }

    /** Small helper: data("placementId", id, "message", msg). Null values are skipped. */
    static Map<String, Object> data(Object... keyValues) {
        Map<String, Object> map = new HashMap<>();
        for (int i = 0; i + 1 < keyValues.length; i += 2) {
            if (keyValues[i + 1] != null) map.put(String.valueOf(keyValues[i]), keyValues[i + 1]);
        }
        return map;
    }

    /** Receives native events and forwards them to Capacitor listeners. */
    interface Sink {
        void emit(String event, Map<String, Object> data);
    }

    static final class Failure {
        final String code;
        final String message;

        Failure(String code, String message) {
            this.code = code;
            this.message = message;
        }
    }

    static final class ShowOutcome {
        final boolean shown;
        final boolean completed;
        final String message;
        final String placementId;

        ShowOutcome(boolean shown, boolean completed, String message, String placementId) {
            this.shown = shown;
            this.completed = completed;
            this.message = message;
            this.placementId = placementId;
        }
    }

    interface LoadCallback {
        void done(Failure failure);
    }

    interface ShowCallback {
        void done(ShowOutcome outcome);
    }

    static final class InitializeRequest {
        String appKey;
        boolean testMode;
        boolean debug;
        boolean autoStart = true;
        String bannerId;
        String interstitialId;
        String rewardedId;

        @Override
        public String toString() {
            return "InitializeRequest(appKey=" + appKey + ", testMode=" + testMode + ", debug=" + debug + ", autoStart=" + autoStart + ")";
        }
    }

    static final class ConsentRequest {
        Boolean gdprConsent;
        Boolean doNotSell;
        Boolean childDirected;

        @Override
        public String toString() {
            return "ConsentRequest(gdpr=" + gdprConsent + ", doNotSell=" + doNotSell + ", childDirected=" + childDirected + ")";
        }
    }
}
