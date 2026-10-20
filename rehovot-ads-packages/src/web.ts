import { WebPlugin } from "@capacitor/core";
import type {
  AdsInitializeOptions,
  AdsPlacementOptions,
  BannerOptions,
  CapacitorAdsPlugin,
  ConsentOptions,
  InterstitialOptions,
  InterstitialResult,
  ReadyResult,
  RewardedOptions,
  RewardedResult,
  TrackingStatus,
} from "./definitions";

const WEB_MESSAGE = "CapacitorAds: native ads are not available on web.";

/**
 * Web fallback: nothing is shown, every call resolves safely so games run unchanged in the browser.
 * Set `window.__ADS_SIMULATE__ = true` to fake instant fills (rewarded = completed) while testing UI flows.
 */
export class CapacitorAdsWeb extends WebPlugin implements CapacitorAdsPlugin {
  private get simulate(): boolean {
    return typeof window !== "undefined" && (window as unknown as { __ADS_SIMULATE__?: boolean }).__ADS_SIMULATE__ === true;
  }

  public async initialize(_options: AdsInitializeOptions): Promise<void> {
    if (this.simulate) this.notifyListeners("initialized", { message: "simulated" });
  }

  public async showBanner(_options?: BannerOptions): Promise<void> {}
  public async hideBanner(): Promise<void> {}
  public async destroyBanner(): Promise<void> {}

  public async loadInterstitial(_options?: InterstitialOptions): Promise<void> {
    if (!this.simulate) throw this.unavailable(WEB_MESSAGE);
  }

  public async loadRewarded(_options?: RewardedOptions): Promise<void> {
    if (!this.simulate) throw this.unavailable(WEB_MESSAGE);
  }

  public async isInterstitialReady(_options?: AdsPlacementOptions): Promise<ReadyResult> {
    return { value: this.simulate };
  }

  public async isRewardedReady(_options?: AdsPlacementOptions): Promise<ReadyResult> {
    return { value: this.simulate };
  }

  public async showInterstitial(options?: InterstitialOptions): Promise<InterstitialResult> {
    return { success: this.simulate, message: this.simulate ? "simulated" : WEB_MESSAGE, placementId: options?.placementId };
  }

  public async showRewarded(options?: RewardedOptions): Promise<RewardedResult> {
    return {
      success: this.simulate,
      completed: this.simulate,
      message: this.simulate ? "simulated" : WEB_MESSAGE,
      placementId: options?.placementId,
      rewardAmount: options?.rewardAmount,
      rewardCurrency: options?.rewardCurrency,
    };
  }

  public async setConsent(_options: ConsentOptions): Promise<void> {}

  public async requestTracking(): Promise<{ status: TrackingStatus }> {
    return { status: "unavailable" };
  }

  public async destroy(): Promise<void> {}
}
