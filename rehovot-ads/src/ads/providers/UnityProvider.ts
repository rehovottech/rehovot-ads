// Unity provider placeholder that keeps all Unity-specific code out of the service.
import type { IAdsProvider } from "../IAdsProvider";
import type { AdsResult } from "../types/AdsResult";
import type {
  BannerOptions,
  InterstitialOptions,
  RewardedOptions,
} from "../types/AdsOptions";

const placeholderResult = (message: string, rewardGranted = false): AdsResult => ({
  success: true,
  skipped: false,
  message,
  rewardGranted,
});

export class UnityProvider implements IAdsProvider {
  // Unity SDK initialization will be inserted here later.
  public initialize(): Promise<AdsResult> {
    console.log("[Ads][Unity] initialize");
    // TODO
    // UnityAds.initialize(...)
    return Promise.resolve(placeholderResult("Unity provider initialized."));
  }

  // Banner display will be delegated to the Unity SDK in a future step.
  public showBanner(options?: BannerOptions): Promise<AdsResult> {
    console.log("[Ads][Unity] showBanner", options);
    // TODO
    // UnityAds.showBanner(...)
    return Promise.resolve(placeholderResult("Unity banner shown."));
  }

  // Banner hiding will be delegated to the Unity SDK in a future step.
  public hideBanner(): Promise<AdsResult> {
    console.log("[Ads][Unity] hideBanner");
    // TODO
    // UnityAds.hideBanner(...)
    return Promise.resolve(placeholderResult("Unity banner hidden."));
  }

  // Interstitial display will be delegated to the Unity SDK in a future step.
  public showInterstitial(
    options?: InterstitialOptions,
  ): Promise<AdsResult> {
    console.log("[Ads][Unity] showInterstitial", options);
    // TODO
    // UnityAds.showInterstitial(...)
    return Promise.resolve(placeholderResult("Unity interstitial shown."));
  }

  // Rewarded display will be delegated to the Unity SDK in a future step.
  public showRewarded(options?: RewardedOptions): Promise<AdsResult> {
    console.log("[Ads][Unity] showRewarded", options);
    // TODO
    // UnityAds.showRewarded(...)
    return Promise.resolve(
      placeholderResult("Unity rewarded ad completed.", true),
    );
  }

  // Loaded-state checks are placeholders until SDK callbacks are wired in.
  public isBannerLoaded(): Promise<boolean> {
    console.log("[Ads][Unity] isBannerLoaded");
    // TODO
    // UnityAds.isBannerLoaded(...)
    return Promise.resolve(false);
  }

  // Loaded-state checks are placeholders until SDK callbacks are wired in.
  public isInterstitialLoaded(): Promise<boolean> {
    console.log("[Ads][Unity] isInterstitialLoaded");
    // TODO
    // UnityAds.isInterstitialLoaded(...)
    return Promise.resolve(false);
  }

  // Loaded-state checks are placeholders until SDK callbacks are wired in.
  public isRewardedLoaded(): Promise<boolean> {
    console.log("[Ads][Unity] isRewardedLoaded");
    // TODO
    // UnityAds.isRewardedLoaded(...)
    return Promise.resolve(false);
  }

  // Unity cleanup will be added once the native bridge exists.
  public destroy(): Promise<AdsResult> {
    console.log("[Ads][Unity] destroy");
    // TODO
    // UnityAds.destroy(...)
    return Promise.resolve(placeholderResult("Unity provider destroyed."));
  }
}
