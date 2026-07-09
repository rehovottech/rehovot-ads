import { DEFAULT_ADS_CONFIG, type AdsServiceConfig } from "./AdsConfig";

export const ProductionAdsConfig: AdsServiceConfig = {
  ...DEFAULT_ADS_CONFIG,
  debug: false,
  testMode: false,
  appKey: "TODO_REPLACE_WITH_PRODUCTION_APP_KEY",
  placements: {
    banner: "TODO_PROD_BANNER_PLACEMENT",
    interstitial: "TODO_PROD_INTERSTITIAL_PLACEMENT",
    rewarded: "TODO_PROD_REWARDED_PLACEMENT",
  },
};
