import { CapacitorAds } from "@rehovottech/capacitor-ads";
import type {
  AdsInitializeOptions,
  BannerOptions,
  InterstitialOptions,
  RewardedOptions,
} from "./types/AdsOptions";
import type { AdsNativeRewardResult } from "./types/AdsResult";

// AdsManager is the only class that talks to the Capacitor plugin package.
// It intentionally contains no business rules, caps, or privacy decisions.
export class AdsManager {
  public async initialize(options: AdsInitializeOptions): Promise<void> {
    await CapacitorAds.initialize(options);
  }

  public async showBanner(options?: BannerOptions): Promise<void> {
    await CapacitorAds.showBanner(options);
  }

  public async hideBanner(): Promise<void> {
    await CapacitorAds.hideBanner();
  }

  public async showInterstitial(options?: InterstitialOptions): Promise<void> {
    await CapacitorAds.showInterstitial(options);
  }

  public async showRewarded(
    options?: RewardedOptions,
  ): Promise<AdsNativeRewardResult> {
    return await CapacitorAds.showRewarded(options);
  }

  public async destroy(): Promise<void> {
    await CapacitorAds.destroy();
  }
}
