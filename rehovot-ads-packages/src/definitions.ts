import type { PluginListenerHandle } from "@capacitor/core";
import type { UnityLevelPlayEventName } from "./enums";

export type AdsMetadataValue = string | number | boolean | null;

/** Default placement (ad unit) ids, used when a show/load call does not pass one. */
export interface AdsPlacements {
  readonly banner?: string;
  readonly interstitial?: string;
  readonly rewarded?: string;
}

export interface AdsInitializeOptions {
  /**
   * SDK app identifier for the current platform.
   * Unity Ads backend: the Unity **Game ID** (Unity Dashboard > Monetization > Ad units).
   */
  readonly appKey?: string;
  /** Serve test ads only. Keep true until the store build is approved. */
  readonly testMode?: boolean;
  /** Verbose native logging. */
  readonly debug?: boolean;
  /** Preload interstitial + rewarded after init and reload after each show. Default true. */
  readonly autoStart?: boolean;
  /** Default ad units for this platform. */
  readonly placements?: AdsPlacements;
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

/** Result of showing a full-screen ad. Resolves when the ad is closed (or could not be shown). */
export interface InterstitialResult {
  /** true when the ad was actually displayed. */
  readonly success: boolean;
  readonly message?: string;
  readonly placementId?: string;
}

export interface RewardedResult {
  /** true when the ad was actually displayed. */
  readonly success: boolean;
  /** true only when the player watched to the end - grant the reward on this. */
  readonly completed: boolean;
  readonly message?: string;
  readonly placementId?: string;
  readonly rewardAmount?: number;
  readonly rewardCurrency?: string;
}

export interface ReadyResult {
  readonly value: boolean;
}

export interface ConsentOptions {
  /** GDPR: user consented to personalised ads. */
  readonly gdprConsent?: boolean;
  /** CCPA / US privacy: true = user opted OUT of sale of data. */
  readonly doNotSell?: boolean;
  /** COPPA / child-directed treatment. */
  readonly childDirected?: boolean;
}

export type TrackingStatus = "authorized" | "denied" | "restricted" | "notDetermined" | "unavailable";

export interface AdsEventPayload {
  readonly placementId?: string;
  readonly message?: string;
  readonly code?: string;
}

export interface CapacitorAdsPlugin {
  initialize(options: AdsInitializeOptions): Promise<void>;

  showBanner(options?: BannerOptions): Promise<void>;
  hideBanner(): Promise<void>;
  destroyBanner(): Promise<void>;

  /** Load explicitly (not needed with autoStart). Rejects if the ad cannot be filled. */
  loadInterstitial(options?: InterstitialOptions): Promise<void>;
  loadRewarded(options?: RewardedOptions): Promise<void>;
  isInterstitialReady(options?: AdsPlacementOptions): Promise<ReadyResult>;
  isRewardedReady(options?: AdsPlacementOptions): Promise<ReadyResult>;

  showInterstitial(options?: InterstitialOptions): Promise<InterstitialResult>;
  showRewarded(options?: RewardedOptions): Promise<RewardedResult>;

  /** Apply privacy choices. Call before initialize when known; safe to call again later. */
  setConsent(options: ConsentOptions): Promise<void>;
  /** iOS 14+: Apple's App Tracking Transparency prompt. Other platforms resolve "unavailable". */
  requestTracking(): Promise<{ status: TrackingStatus }>;

  destroy(): Promise<void>;

  addListener(
    eventName: `${UnityLevelPlayEventName}`,
    listenerFunc: (event: AdsEventPayload) => void,
  ): Promise<PluginListenerHandle>;
  removeAllListeners(): Promise<void>;
}
