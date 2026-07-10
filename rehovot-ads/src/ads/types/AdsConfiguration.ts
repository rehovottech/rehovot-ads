import type { AndroidAdsConfiguration } from "./AndroidAdsConfiguration";
import type { IOSAdsConfiguration } from "./IOSAdsConfiguration";
import type { WebAdsConfiguration } from "./WebAdsConfiguration";

export type AdsProviderMode = "auto" | "mock" | "unityLevelPlay" | "web";

export interface AdsFrequencyConfiguration {
  readonly interstitialCooldownMs?: number;
  readonly rewardedCooldownMs?: number;
  readonly interstitialMaxPerSession?: number;
  readonly rewardedMaxPerSession?: number;
}

export interface AdsConfiguration {
  readonly provider: AdsProviderMode;
  readonly debug?: boolean;
  readonly testMode?: boolean;
  readonly premiumUser?: boolean;
  readonly requireInternet?: boolean;
  readonly coppa?: boolean;
  readonly gdpr?: boolean;
  readonly gdprConsentGranted?: boolean | null;
  readonly ccpa?: boolean;
  readonly ccpaOptOut?: boolean;
  readonly frequency?: AdsFrequencyConfiguration;
  readonly android?: AndroidAdsConfiguration;
  readonly ios?: IOSAdsConfiguration;
  readonly web?: WebAdsConfiguration;
}

export interface ResolvedAdsConfiguration {
  readonly provider: AdsProviderMode;
  readonly debug: boolean;
  readonly testMode: boolean;
  readonly premiumUser: boolean;
  readonly requireInternet: boolean;
  readonly coppa: boolean;
  readonly gdpr: boolean;
  readonly gdprConsentGranted: boolean | null;
  readonly ccpa: boolean;
  readonly ccpaOptOut: boolean;
  readonly frequency: Required<AdsFrequencyConfiguration>;
  readonly android: AndroidAdsConfiguration;
  readonly ios: IOSAdsConfiguration;
  readonly web: WebAdsConfiguration;
}
