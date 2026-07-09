export type {
  AdsBridgeName,
  AdsFrequencyCapConfig,
  AdsPlacementIds,
  AdsPrivacyConfig,
  AdsServiceConfig,
} from "../types/AdsConfig";

export {
  DEFAULT_ADS_CONFIG,
} from "../types/AdsConfig";

// Compatibility types for the older provider-scaffold files still present in this repo.
export type AdsProviderName =
  | "mock"
  | "unity"
  | "unity-levelplay"
  | "applovin"
  | "admob"
  | "chartboost";

export interface AdsPlatformConfig {
  readonly gameId: string;
  readonly banner: string;
  readonly interstitial: string;
  readonly rewarded: string;
}

export interface AdsConfig {
  readonly provider: AdsProviderName;
  readonly testMode: boolean;
  readonly debug: boolean;
  readonly android: AdsPlatformConfig;
  readonly ios: AdsPlatformConfig;
}
