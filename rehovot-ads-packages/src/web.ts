import { WebPlugin } from "@capacitor/core";
import type {
  AdsInitializeOptions,
  BannerOptions,
  CapacitorAdsPlugin,
  InterstitialOptions,
  RewardedOptions,
  RewardedResult,
} from "./definitions";

const WEB_PLACEHOLDER_MESSAGE = "CapacitorAds is not implemented on web.";

export class CapacitorAdsWeb extends WebPlugin implements CapacitorAdsPlugin {
  public async initialize(_options: AdsInitializeOptions): Promise<void> {
    console.warn(WEB_PLACEHOLDER_MESSAGE);
  }

  public async showBanner(_options?: BannerOptions): Promise<void> {
    console.warn(WEB_PLACEHOLDER_MESSAGE);
  }

  public async hideBanner(): Promise<void> {
    console.warn(WEB_PLACEHOLDER_MESSAGE);
  }

  public async showInterstitial(_options?: InterstitialOptions): Promise<void> {
    console.warn(WEB_PLACEHOLDER_MESSAGE);
  }

  public async showRewarded(_options?: RewardedOptions): Promise<RewardedResult> {
    console.warn(WEB_PLACEHOLDER_MESSAGE);
    return {
      success: false,
      completed: false,
      message: WEB_PLACEHOLDER_MESSAGE,
    };
  }

  public async destroy(): Promise<void> {
    console.warn(WEB_PLACEHOLDER_MESSAGE);
  }
}
