import type { AdsProviderContext } from "../../IAdsProvider";
import type {
  AdsOperationResult,
  AdsRewardedResult,
  BannerOptions,
  InterstitialOptions,
  RewardedOptions,
} from "../../types";
import type { IWebAdsAdapter } from "./IWebAdsAdapter";

export class AdMavenAdapter implements IWebAdsAdapter {
  public readonly name = "admaven";
  private context: AdsProviderContext | null = null;

  public constructor(
    private readonly enabled = true,
    private readonly disabledMessage = "AdMaven adapter is not configured.",
  ) {}

  public async initialize(
    context: AdsProviderContext,
  ): Promise<AdsOperationResult> {
    this.context = context;

    if (!this.enabled) {
      return this.unsupported(this.disabledMessage);
    }

    return this.success("AdMaven adapter initialized.");
  }

  public async showBanner(
    options?: BannerOptions,
  ): Promise<AdsOperationResult> {
    if (!this.enabled) {
      return this.unsupported(this.disabledMessage, options?.placementId);
    }

    this.emit("bannerLoaded", options?.placementId, "TODO: render web banner.");
    return this.success("Web banner placeholder displayed.", options?.placementId);
  }

  public async hideBanner(): Promise<AdsOperationResult> {
    if (!this.enabled) {
      return this.unsupported(this.disabledMessage);
    }

    this.emit("bannerHidden", undefined, "TODO: hide web banner.");
    return this.success("Web banner placeholder hidden.");
  }

  public async destroyBanner(): Promise<AdsOperationResult> {
    if (!this.enabled) {
      return this.unsupported(this.disabledMessage);
    }

    this.emit("bannerHidden", undefined, "TODO: destroy web banner.");
    return this.success("Web banner placeholder destroyed.");
  }

  public async showInterstitial(
    options?: InterstitialOptions,
  ): Promise<AdsOperationResult> {
    if (!this.enabled) {
      return this.unsupported(this.disabledMessage, options?.placementId);
    }

    this.emit(
      "interstitialOpened",
      options?.placementId,
      "TODO: show web interstitial.",
    );

    return this.success(
      "Web interstitial placeholder displayed.",
      options?.placementId,
    );
  }

  public async showRewarded(
    options?: RewardedOptions,
  ): Promise<AdsRewardedResult> {
    if (!this.enabled) {
      return this.unsupportedRewarded(this.disabledMessage, options?.placementId);
    }

    return {
      success: false,
      supported: false,
      skipped: true,
      provider: this.name,
      reason: "provider-unsupported",
      message: "Rewarded ads are not implemented for AdMaven yet.",
      placementId: options?.placementId,
      completed: false,
      rewardGranted: false,
    };
  }

  public async isInterstitialReady(): Promise<boolean> {
    return this.enabled;
  }

  public async isRewardedReady(): Promise<boolean> {
    return false;
  }

  public async destroy(): Promise<AdsOperationResult> {
    if (!this.enabled) {
      return this.unsupported(this.disabledMessage);
    }

    return this.success("AdMaven adapter destroyed.");
  }

  private emit(
    eventName: "bannerLoaded" | "bannerHidden" | "interstitialOpened",
    placementId: string | undefined,
    message: string,
  ): void {
    const context = this.requireContext();
    context.emit(eventName, {
      provider: this.name,
      placementId,
      message,
    });
  }

  private success(
    message: string,
    placementId?: string,
  ): AdsOperationResult {
    return {
      success: true,
      supported: true,
      skipped: false,
      provider: this.name,
      message,
      placementId,
    };
  }

  private unsupported(
    message: string,
    placementId?: string,
  ): AdsOperationResult {
    return {
      success: false,
      supported: false,
      skipped: true,
      provider: this.name,
      reason: "provider-unsupported",
      message,
      placementId,
    };
  }

  private unsupportedRewarded(
    message: string,
    placementId?: string,
  ): AdsRewardedResult {
    return {
      ...this.unsupported(message, placementId),
      completed: false,
      rewardGranted: false,
    };
  }

  private requireContext(): AdsProviderContext {
    if (this.context === null) {
      throw new Error("AdMavenAdapter is not initialized.");
    }

    return this.context;
  }
}
