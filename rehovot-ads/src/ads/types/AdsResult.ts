export type AdsFormat = "banner" | "interstitial" | "rewarded";

export type AdsBlockReason =
  | "not-configured"
  | "provider-unsupported"
  | "premium-user"
  | "coppa-restricted"
  | "gdpr-consent-missing"
  | "ccpa-restricted"
  | "offline"
  | "frequency-cap"
  | "not-initialized"
  | "not-ready"
  | "reward-mismatch"
  | "provider-error";

export interface AdsOperationResult {
  readonly success: boolean;
  readonly supported: boolean;
  readonly skipped: boolean;
  readonly provider: string;
  readonly message: string;
  readonly reason?: AdsBlockReason;
  readonly placementId?: string;
}

export interface AdsReward {
  readonly amount?: number;
  readonly currency?: string;
}

export interface AdsRewardedResult extends AdsOperationResult {
  readonly completed: boolean;
  readonly rewardGranted: boolean;
  readonly reward?: AdsReward;
}

export interface AdsFrequencyState {
  readonly lastShownAt: Readonly<Partial<Record<AdsFormat, number>>>;
  readonly countThisSession: Readonly<Partial<Record<AdsFormat, number>>>;
}
