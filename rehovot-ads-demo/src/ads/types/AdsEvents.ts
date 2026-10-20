export type AdsEventName =
  | "initialized"
  | "failed"
  | "bannerLoaded"
  | "bannerHidden"
  | "bannerClicked"
  | "interstitialLoaded"
  | "interstitialOpened"
  | "interstitialClosed"
  | "rewardedLoaded"
  | "rewardedOpened"
  | "rewardedClosed"
  | "rewardGranted"
  | "rewardCompleted";

export interface AdsEventBasePayload {
  readonly provider: string;
  readonly placementId?: string;
  readonly message?: string;
}

export interface AdsFailurePayload extends AdsEventBasePayload {
  readonly reason: string;
}

export interface AdsRewardPayload extends AdsEventBasePayload {
  readonly rewardAmount?: number;
  readonly rewardCurrency?: string;
}

export interface AdsEventPayloadMap {
  readonly initialized: AdsEventBasePayload;
  readonly failed: AdsFailurePayload;
  readonly bannerLoaded: AdsEventBasePayload;
  readonly bannerHidden: AdsEventBasePayload;
  readonly bannerClicked: AdsEventBasePayload;
  readonly interstitialLoaded: AdsEventBasePayload;
  readonly interstitialOpened: AdsEventBasePayload;
  readonly interstitialClosed: AdsEventBasePayload;
  readonly rewardedLoaded: AdsEventBasePayload;
  readonly rewardedOpened: AdsEventBasePayload;
  readonly rewardedClosed: AdsEventBasePayload;
  readonly rewardGranted: AdsRewardPayload;
  readonly rewardCompleted: AdsRewardPayload;
}

export type AdsEventListener<TEvent extends AdsEventName> = (
  payload: AdsEventPayloadMap[TEvent],
) => void;
