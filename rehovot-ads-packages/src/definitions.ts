import type { Plugin } from "@capacitor/core";

export type AdsMetadataValue = string | number | boolean | null;

export interface AdsInitializeOptions {
  readonly appKey?: string;
  readonly testMode?: boolean;
  readonly debug?: boolean;
  readonly autoStart?: boolean;
  readonly metadata?: Readonly<Record<string, AdsMetadataValue>>;
}

export interface AdsPlacementOptions {
  readonly placementId?: string;
  readonly metadata?: Readonly<Record<string, AdsMetadataValue>>;
}

export interface BannerOptions extends AdsPlacementOptions {
  readonly position?: "top" | "bottom";
}

export interface InterstitialOptions extends AdsPlacementOptions {
  readonly timeoutMs?: number;
}

export interface RewardedOptions extends AdsPlacementOptions {
  readonly rewardAmount?: number;
  readonly rewardCurrency?: string;
}

export interface RewardedResult {
  readonly success: boolean;
  readonly completed: boolean;
  readonly message?: string;
  readonly placementId?: string;
  readonly rewardAmount?: number;
  readonly rewardCurrency?: string;
}

export interface CapacitorAdsPlugin extends Plugin {
  initialize(options: AdsInitializeOptions): Promise<void>;
  showBanner(options?: BannerOptions): Promise<void>;
  hideBanner(): Promise<void>;
  showInterstitial(options?: InterstitialOptions): Promise<void>;
  showRewarded(options?: RewardedOptions): Promise<RewardedResult>;
  destroy(): Promise<void>;
}
