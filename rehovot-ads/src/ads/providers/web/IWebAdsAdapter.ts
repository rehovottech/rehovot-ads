import type { AdsProviderContext } from "../../IAdsProvider";
import type {
  AdsOperationResult,
  AdsRewardedResult,
  BannerOptions,
  InterstitialOptions,
  RewardedOptions,
} from "../../types";

export interface IWebAdsAdapter {
  readonly name: string;
  initialize(context: AdsProviderContext): Promise<AdsOperationResult>;
  showBanner(options?: BannerOptions): Promise<AdsOperationResult>;
  hideBanner(): Promise<AdsOperationResult>;
  destroyBanner(): Promise<AdsOperationResult>;
  showInterstitial(options?: InterstitialOptions): Promise<AdsOperationResult>;
  showRewarded(options?: RewardedOptions): Promise<AdsRewardedResult>;
  isInterstitialReady(): Promise<boolean>;
  isRewardedReady(): Promise<boolean>;
  destroy(): Promise<AdsOperationResult>;
}
