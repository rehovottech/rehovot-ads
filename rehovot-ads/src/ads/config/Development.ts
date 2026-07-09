import { DEFAULT_ADS_CONFIG, type AdsServiceConfig } from "./AdsConfig";

export const DevelopmentAdsConfig: AdsServiceConfig = {
  ...DEFAULT_ADS_CONFIG,
  debug: true,
  testMode: true,
  appKey: "TODO_REPLACE_WITH_DEVELOPMENT_APP_KEY",
  placements: {
    banner: "TODO_DEV_BANNER_PLACEMENT",
    interstitial: "TODO_DEV_INTERSTITIAL_PLACEMENT",
    rewarded: "TODO_DEV_REWARDED_PLACEMENT",
  },
};
