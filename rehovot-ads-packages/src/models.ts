import { BannerPosition } from "./enums";

// Shared metadata values intentionally keep the contract strongly typed.
export type UnityLevelPlayMetadataValue = string | number | boolean;

// A small, reusable base for request models that need placement identifiers.
export interface PlacementOptions {
  placementId?: string;
  metadata?: Readonly<Record<string, UnityLevelPlayMetadataValue>>;
}

// Initialization is generic enough to support mediation and single-network adapters.
export interface InitializeOptions {
  appKey?: string;
  testMode?: boolean;
  debug?: boolean;
  autoStart?: boolean;
  metadata?: Readonly<Record<string, UnityLevelPlayMetadataValue>>;
}

// Banner placement is provider-neutral and keeps room for future SDK specifics.
export interface BannerOptions extends PlacementOptions {
  position?: BannerPosition;
}

// Interstitial options keep the public API narrow while still extensible.
export interface InterstitialOptions extends PlacementOptions {
  timeoutMs?: number;
}

// Rewarded options keep the same shape as other placement-based ad requests.
export interface RewardedOptions extends PlacementOptions {
  rewardAmount?: number;
  rewardCurrency?: string;
}

// Reward results are returned from the rewarded flow only.
export interface RewardResult {
  success: boolean;
  rewardGranted: boolean;
  rewardAmount?: number;
  rewardCurrency?: string;
  placementId?: string;
  message?: string;
}

// Consent settings are intentionally generic for multiple ad networks and regions.
export interface ConsentOptions {
  gdprConsent?: boolean;
  doNotSell?: boolean;
  childDirected?: boolean;
  underAgeOfConsent?: boolean;
  consentString?: string;
}

// User settings are separated from consent so each concern stays independently testable.
export interface UserOptions {
  userId?: string;
  ageRestrictedUser?: boolean;
  metadata?: Readonly<Record<string, UnityLevelPlayMetadataValue>>;
}
