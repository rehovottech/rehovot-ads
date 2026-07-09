export type AdsMetadataValue = string | number | boolean | null;

export interface AdsBaseRequest {
  readonly placementId?: string;
  readonly metadata?: Readonly<Record<string, AdsMetadataValue>>;
}

export interface BannerOptions extends AdsBaseRequest {
  readonly position?: "top" | "bottom";
}

export interface InterstitialOptions extends AdsBaseRequest {
  readonly timeoutMs?: number;
}

export interface RewardedOptions extends AdsBaseRequest {
  readonly rewardAmount?: number;
  readonly rewardCurrency?: string;
}

export interface AdsInitializeOptions {
  readonly appKey?: string;
  readonly testMode?: boolean;
  readonly debug?: boolean;
  readonly autoStart?: boolean;
  readonly metadata?: Readonly<Record<string, AdsMetadataValue>>;
}
