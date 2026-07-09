import type { Plugin } from "@capacitor/core";
import type {
  BannerOptions,
  ConsentOptions,
  InitializeOptions,
  InterstitialOptions,
  RewardResult,
  RewardedOptions,
  UserOptions,
} from "./models";

// The public plugin contract remains stable even when native SDKs change underneath.
export interface UnityLevelPlayPlugin extends Plugin {
  initialize(options: InitializeOptions): Promise<void>;
  showBanner(options?: BannerOptions): Promise<void>;
  hideBanner(): Promise<void>;
  destroyBanner(): Promise<void>;
  showInterstitial(options?: InterstitialOptions): Promise<void>;
  showRewarded(options?: RewardedOptions): Promise<RewardResult>;
  isInterstitialReady(): Promise<boolean>;
  isRewardedReady(): Promise<boolean>;
  setConsent(options: ConsentOptions): Promise<void>;
  setCOPPA(options: { enabled: boolean }): Promise<void>;
  setUserId(options: UserOptions): Promise<void>;
  destroy(): Promise<void>;
}

// Re-export models so app code can import the contract from a single module.
export type {
  BannerOptions,
  ConsentOptions,
  InitializeOptions,
  InterstitialOptions,
  RewardResult,
  RewardedOptions,
  UserOptions,
};
