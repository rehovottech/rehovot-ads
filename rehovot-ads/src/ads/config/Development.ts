// Development configuration uses test-friendly settings and the mock provider by default.
import type { AdsConfig } from "./AdsConfig";

export const DevelopmentAdsConfig = {
  provider: "mock",
  testMode: true,
  debug: true,
  android: {
    gameId: "android-dev-game-id",
    banner: "android-dev-banner-id",
    interstitial: "android-dev-interstitial-id",
    rewarded: "android-dev-rewarded-id",
  },
  ios: {
    gameId: "ios-dev-game-id",
    banner: "ios-dev-banner-id",
    interstitial: "ios-dev-interstitial-id",
    rewarded: "ios-dev-rewarded-id",
  },
} satisfies AdsConfig;
