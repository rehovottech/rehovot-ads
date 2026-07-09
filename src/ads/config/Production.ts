// Production configuration is wired for Unity and disables test mode.
import type { AdsConfig } from "./AdsConfig";

export const ProductionAdsConfig = {
  provider: "unity",
  testMode: false,
  debug: false,
  android: {
    gameId: "android-prod-game-id",
    banner: "android-prod-banner-id",
    interstitial: "android-prod-interstitial-id",
    rewarded: "android-prod-rewarded-id",
  },
  ios: {
    gameId: "ios-prod-game-id",
    banner: "ios-prod-banner-id",
    interstitial: "ios-prod-interstitial-id",
    rewarded: "ios-prod-rewarded-id",
  },
} satisfies AdsConfig;
