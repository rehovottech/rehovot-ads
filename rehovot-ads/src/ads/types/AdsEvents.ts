export type AdsEventName =
  | "initialized"
  | "blocked"
  | "banner-shown"
  | "banner-hidden"
  | "interstitial-shown"
  | "rewarded-shown"
  | "destroyed";

export interface AdsEventPayload {
  readonly message: string;
  readonly reason?: string;
  readonly placementId?: string;
}
