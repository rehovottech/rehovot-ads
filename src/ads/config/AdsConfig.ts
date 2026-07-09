// Supported provider names for the ad framework.
export type AdsProviderName =
  | "mock"
  | "unity"
  | "unity-levelplay"
  | "applovin"
  | "admob"
  | "chartboost";

// Platform-specific IDs used by a provider.
export interface AdsPlatformConfig {
  gameId: string;
  banner: string;
  interstitial: string;
  rewarded: string;
}

// Root configuration for the ads framework.
export interface AdsConfig {
  provider: AdsProviderName;
  testMode: boolean;
  debug: boolean;
  android: AdsPlatformConfig;
  ios: AdsPlatformConfig;
}
