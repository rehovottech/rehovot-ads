import { DEFAULT_ADS_CONFIGURATION } from "./AdsConfig";
import type { AdsConfiguration } from "../types";

export const DevelopmentAdsConfig: AdsConfiguration = {
    ...DEFAULT_ADS_CONFIGURATION,
    provider: "auto",
    debug: true,
    testMode: true,
    android: {
        unityLevelPlay: {
            appKey: "TODO_ANDROID_LEVELPLAY_APP_KEY",
            bannerId: "TODO_ANDROID_BANNER_ID",
            interstitialId: "TODO_ANDROID_INTERSTITIAL_ID",
            rewardedId: "TODO_ANDROID_REWARDED_ID",
        },
    },
    ios: {
        unityLevelPlay: {
            appKey: "TODO_IOS_LEVELPLAY_APP_KEY",
            bannerId: "TODO_IOS_BANNER_ID",
            interstitialId: "TODO_IOS_INTERSTITIAL_ID",
            rewardedId: "TODO_IOS_REWARDED_ID",
        },
    },
    web: {
        provider: "admaven",
        admaven: {
            bannerId: "TODO_WEB_BANNER_ID",
            interstitialId: "TODO_WEB_INTERSTITIAL_ID",
            rewardedId: "",
        },
    },
};
