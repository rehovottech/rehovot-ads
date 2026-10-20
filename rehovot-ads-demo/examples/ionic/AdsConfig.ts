import type { AdsConfiguration } from "../../src/ads";

const AdsConfig: AdsConfiguration = {
  provider: "auto",
  debug: true,
  testMode: true,
  coppa: false,
  gdpr: true,
  gdprConsentGranted: true,
  ccpa: false,
  android: {
    unityLevelPlay: {
      appKey: "DUMMY_ANDROID_APP_KEY",
      bannerId: "Banner_Android",
      interstitialId: "Interstitial_Android",
      rewardedId: "Rewarded_Android",
    },
  },
  ios: {
    unityLevelPlay: {
      appKey: "DUMMY_IOS_APP_KEY",
      bannerId: "Banner_iOS",
      interstitialId: "Interstitial_iOS",
      rewardedId: "Rewarded_iOS",
    },
  },
  web: {
    provider: "admaven",
    admaven: {
      bannerId: "DUMMY_WEB_BANNER_ID",
      interstitialId: "DUMMY_WEB_INTERSTITIAL_ID",
      rewardedId: "",
    },
  },
};

export default AdsConfig;
