import type {
    AdsConfiguration,
    ResolvedAdsConfiguration,
} from "../types/AdsConfiguration";
import type {
    AndroidAdsConfiguration,
    IOSAdsConfiguration,
    UnityLevelPlayPlacementConfiguration,
    WebAdsConfiguration,
} from "../types";

const DEFAULT_ANDROID_CONFIG: AndroidAdsConfiguration = {
    unityLevelPlay: {
        appKey: "",
        bannerId: "",
        interstitialId: "",
        rewardedId: "",
    },
};

const DEFAULT_IOS_CONFIG: IOSAdsConfiguration = {
    unityLevelPlay: {
        appKey: "",
        bannerId: "",
        interstitialId: "",
        rewardedId: "",
    },
};

const DEFAULT_WEB_CONFIG: WebAdsConfiguration = {
    provider: "none",
};

export const DEFAULT_ADS_CONFIGURATION: ResolvedAdsConfiguration = {
    provider: "auto",
    debug: false,
    testMode: false,
    premiumUser: false,
    requireInternet: true,
    coppa: false,
    gdpr: false,
    gdprConsentGranted: null,
    ccpa: false,
    ccpaOptOut: false,
    frequency: {
        interstitialCooldownMs: 60_000,
        rewardedCooldownMs: 0,
        interstitialMaxPerSession: 0,
        rewardedMaxPerSession: 0,
    },
    android: DEFAULT_ANDROID_CONFIG,
    ios: DEFAULT_IOS_CONFIG,
    web: DEFAULT_WEB_CONFIG,
};

export function resolveAdsConfiguration(
    configuration: AdsConfiguration,
): ResolvedAdsConfiguration {
    return {
        ...DEFAULT_ADS_CONFIGURATION,
        ...configuration,
        frequency: {
            ...DEFAULT_ADS_CONFIGURATION.frequency,
            ...configuration.frequency,
        },
        android: {
            ...DEFAULT_ANDROID_CONFIG,
            ...configuration.android,
            unityLevelPlay: resolveUnityLevelPlayConfiguration(
                DEFAULT_ANDROID_CONFIG.unityLevelPlay,
                configuration.android?.unityLevelPlay,
            ),
        },
        ios: {
            ...DEFAULT_IOS_CONFIG,
            ...configuration.ios,
            unityLevelPlay: resolveUnityLevelPlayConfiguration(
                DEFAULT_IOS_CONFIG.unityLevelPlay,
                configuration.ios?.unityLevelPlay,
            ),
        },
        web: {
            ...DEFAULT_WEB_CONFIG,
            ...configuration.web,
            admaven: {
                ...configuration.web?.admaven,
            },
            adsense: {
                ...configuration.web?.adsense,
            },
            amazon: {
                ...configuration.web?.amazon,
            },
            customHtml: {
                ...configuration.web?.customHtml,
            },
        },
    };
}

const AdsConfig: ResolvedAdsConfiguration = DEFAULT_ADS_CONFIGURATION;

export default AdsConfig;

function resolveUnityLevelPlayConfiguration(
    defaults: UnityLevelPlayPlacementConfiguration | undefined,
    overrides: Partial<UnityLevelPlayPlacementConfiguration> | undefined,
): UnityLevelPlayPlacementConfiguration | undefined {
    if (defaults === undefined && overrides === undefined) {
        return undefined;
    }

    return {
        appKey: overrides?.appKey ?? defaults?.appKey ?? "",
        bannerId: overrides?.bannerId ?? defaults?.bannerId ?? "",
        interstitialId:
            overrides?.interstitialId ?? defaults?.interstitialId ?? "",
        rewardedId: overrides?.rewardedId ?? defaults?.rewardedId ?? "",
    };
}
