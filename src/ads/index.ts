// Public entry point for the ads framework.
export { AdsService } from "./AdsService";
export type { IAdsProvider } from "./IAdsProvider";
export type { AdsConfig, AdsPlatformConfig, AdsProviderName } from "./config";
export { DevelopmentAdsConfig, ProductionAdsConfig } from "./config";
export { createAdsProvider, MockProvider, UnityProvider } from "./providers";
export type {
  BannerOptions,
  BaseAdOptions,
  InterstitialOptions,
  RewardedOptions,
} from "./types/AdsOptions";
export { AdsEvents } from "./types/AdsEvents";
export type { AdsResult } from "./types/AdsResult";
export { Logger } from "./utils/Logger";
export { Platform } from "./utils/Platform";
