// Development provider that always succeeds without touching any SDK.
import type { IAdsProvider } from "../IAdsProvider";
import type { AdsResult } from "../types/AdsResult";
import type {
  BannerOptions,
  InterstitialOptions,
  RewardedOptions,
} from "../types/AdsOptions";

const successResult = (message: string, rewardGranted = false): AdsResult => ({
  success: true,
  message,
  rewardGranted,
});

export class MockProvider implements IAdsProvider {
  // No SDK initialization is required for the mock provider.
  public async initialize(): Promise<AdsResult> {
    console.log("[Ads][Mock] initialize");
    return successResult("Mock ads initialized.");
  }

  // Banner calls only log the action and report success.
  public async showBanner(options?: BannerOptions): Promise<AdsResult> {
    console.log("[Ads][Mock] showBanner", options);
    return successResult("Mock banner shown.");
  }

  // Banner hide always succeeds in the mock provider.
  public async hideBanner(): Promise<AdsResult> {
    console.log("[Ads][Mock] hideBanner");
    return successResult("Mock banner hidden.");
  }

  // Interstitials are simulated as successful and immediate.
  public async showInterstitial(
    options?: InterstitialOptions,
  ): Promise<AdsResult> {
    console.log("[Ads][Mock] showInterstitial", options);
    return successResult("Mock interstitial shown.");
  }

  // Rewarded ads always grant the reward in development.
  public async showRewarded(options?: RewardedOptions): Promise<AdsResult> {
    console.log("[Ads][Mock] showRewarded", options);
    return successResult("Mock rewarded ad completed.", true);
  }

  // The mock provider treats all ad formats as loaded.
  public async isBannerLoaded(): Promise<boolean> {
    return true;
  }

  // The mock provider treats all ad formats as loaded.
  public async isInterstitialLoaded(): Promise<boolean> {
    return true;
  }

  // The mock provider treats all ad formats as loaded.
  public async isRewardedLoaded(): Promise<boolean> {
    return true;
  }

  // Cleanup is a no-op for the mock provider.
  public async destroy(): Promise<AdsResult> {
    console.log("[Ads][Mock] destroy");
    return successResult("Mock ads destroyed.");
  }
}
