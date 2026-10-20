import { AdsService } from "./AdsService";

export const Ads = AdsService.getInstance();

export { AdsService } from "./AdsService";
export { DevelopmentAdsConfig, ProductionAdsConfig } from "./config";
export {
  DEFAULT_ADS_CONFIGURATION,
  resolveAdsConfiguration,
} from "./config";
export type {
  AdsConfiguration,
  ResolvedAdsConfiguration,
  AndroidAdsConfiguration,
  IOSAdsConfiguration,
  WebAdsConfiguration,
  AdsEventName,
  AdsEventPayloadMap,
  AdsOperationResult,
  AdsRewardedResult,
  BannerOptions,
  InterstitialOptions,
  RewardedOptions,
} from "./types";
