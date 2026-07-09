export type AdsBridgeName = "capacitor-ads";

export interface AdsPlacementIds {
  readonly banner?: string;
  readonly interstitial?: string;
  readonly rewarded?: string;
}

export interface AdsFrequencyCapConfig {
  readonly bannerCooldownMs?: number;
  readonly interstitialCooldownMs?: number;
  readonly rewardedCooldownMs?: number;
  readonly interstitialMaxPerSession?: number;
  readonly rewardedMaxPerSession?: number;
}

export interface AdsPrivacyConfig {
  readonly coppaEnabled?: boolean;
  readonly gdprConsent?: boolean | null;
  readonly doNotSell?: boolean;
  readonly underAgeOfConsent?: boolean;
}

export interface AdsServiceConfig {
  readonly bridge?: AdsBridgeName;
  readonly appKey?: string;
  readonly testMode?: boolean;
  readonly debug?: boolean;
  readonly premiumUser?: boolean;
  readonly requireInternet?: boolean;
  readonly placements?: AdsPlacementIds;
  readonly frequencyCap?: AdsFrequencyCapConfig;
  readonly privacy?: AdsPrivacyConfig;
}

export const DEFAULT_ADS_CONFIG: Readonly<Required<Pick<AdsServiceConfig, "bridge" | "testMode" | "debug" | "premiumUser" | "requireInternet">> & {
  readonly placements: AdsPlacementIds;
  readonly frequencyCap: Required<AdsFrequencyCapConfig>;
  readonly privacy: Required<AdsPrivacyConfig>;
}> = {
  bridge: "capacitor-ads",
  testMode: false,
  debug: false,
  premiumUser: false,
  requireInternet: true,
  placements: {},
  frequencyCap: {
    bannerCooldownMs: 0,
    interstitialCooldownMs: 60_000,
    rewardedCooldownMs: 0,
    interstitialMaxPerSession: 0,
    rewardedMaxPerSession: 0,
  },
  privacy: {
    coppaEnabled: false,
    gdprConsent: null,
    doNotSell: false,
    underAgeOfConsent: false,
  },
};
