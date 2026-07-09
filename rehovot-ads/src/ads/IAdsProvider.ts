// Provider contract shared by all ad SDK adapters.
import type { AdsResult } from "./types/AdsResult";
import type {
    BannerOptions,
    InterstitialOptions,
    RewardedOptions,
} from "./types/AdsOptions";

export interface IAdsProvider {
    initialize(): Promise<AdsResult>;
    showBanner(options?: BannerOptions): Promise<AdsResult>;
    hideBanner(): Promise<AdsResult>;
    showInterstitial(options?: InterstitialOptions): Promise<AdsResult>;
    showRewarded(options?: RewardedOptions): Promise<AdsResult>;
    isBannerLoaded(): Promise<boolean>;
    isInterstitialLoaded(): Promise<boolean>;
    isRewardedLoaded(): Promise<boolean>;
    destroy(): Promise<AdsResult>;
}
