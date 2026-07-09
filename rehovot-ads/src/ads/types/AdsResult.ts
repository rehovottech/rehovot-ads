export type AdsFormat = "banner" | "interstitial" | "rewarded";

export type AdsBlockReason =
  | "not-configured"
  | "premium-user"
  | "coppa"
  | "gdpr"
  | "offline"
  | "frequency-cap"
  | "not-initialized"
  | "bridge-error";

export interface AdsOutcome {
  readonly success: boolean;
  readonly skipped: boolean;
  readonly reason?: AdsBlockReason;
  readonly message: string;
  readonly rewardGranted?: boolean;
}

export interface AdsRewardOutcome extends AdsOutcome {
  readonly rewardGranted: boolean;
  readonly completed: boolean;
  readonly placementId?: string;
  readonly rewardAmount?: number;
  readonly rewardCurrency?: string;
}

export interface AdsNativeRewardResult {
  readonly success: boolean;
  readonly completed: boolean;
  readonly message?: string;
  readonly placementId?: string;
  readonly rewardAmount?: number;
  readonly rewardCurrency?: string;
}

export interface AdsFrequencyState {
  readonly lastShownAt: Readonly<Partial<Record<AdsFormat, number>>>;
  readonly countThisSession: Readonly<Partial<Record<AdsFormat, number>>>;
}

// Compatibility alias for the older provider layer that still exists in this tree.
export type AdsResult = AdsOutcome;
