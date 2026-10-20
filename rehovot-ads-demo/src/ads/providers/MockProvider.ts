import type { AdsProviderContext, IAdsProvider } from "../IAdsProvider";
import type {
  AdsOperationResult,
  AdsRewardedResult,
  BannerOptions,
  InterstitialOptions,
  RewardedOptions,
} from "../types";

export class MockProvider implements IAdsProvider {
  public readonly name = "mock";
  private context: AdsProviderContext | null = null;

  public async initialize(
    context: AdsProviderContext,
  ): Promise<AdsOperationResult> {
    this.context = context;
    context.emit("initialized", {
      provider: this.name,
      message: "Mock provider initialized.",
    });

    return this.success("Mock provider initialized.");
  }

  public async showBanner(
    options?: BannerOptions,
  ): Promise<AdsOperationResult> {
    this.emit("bannerLoaded", options?.placementId, "Mock banner loaded.");
    return this.success("Mock banner shown.", options?.placementId);
  }

  public async hideBanner(): Promise<AdsOperationResult> {
    this.emit("bannerHidden", undefined, "Mock banner hidden.");
    return this.success("Mock banner hidden.");
  }

  public async destroyBanner(): Promise<AdsOperationResult> {
    this.emit("bannerHidden", undefined, "Mock banner destroyed.");
    return this.success("Mock banner destroyed.");
  }

  public async showInterstitial(
    options?: InterstitialOptions,
  ): Promise<AdsOperationResult> {
    this.emit(
      "interstitialOpened",
      options?.placementId,
      "Mock interstitial opened.",
    );
    this.emit(
      "interstitialClosed",
      options?.placementId,
      "Mock interstitial closed.",
    );

    return this.success("Mock interstitial shown.", options?.placementId);
  }

  public async showRewarded(
    options?: RewardedOptions,
  ): Promise<AdsRewardedResult> {
    this.emit("rewardedOpened", options?.placementId, "Mock rewarded opened.");
    this.emit("rewardedClosed", options?.placementId, "Mock rewarded closed.");

    return {
      ...this.success("Mock rewarded shown.", options?.placementId),
      completed: true,
      rewardGranted: true,
      reward: {
        amount: options?.expectedRewardAmount,
        currency: options?.expectedRewardCurrency,
      },
    };
  }

  public async isInterstitialReady(): Promise<boolean> {
    return true;
  }

  public async isRewardedReady(): Promise<boolean> {
    return true;
  }

  public async destroy(): Promise<AdsOperationResult> {
    return this.success("Mock provider destroyed.");
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

  private emit(
    eventName:
      | "bannerLoaded"
      | "bannerHidden"
      | "interstitialOpened"
      | "interstitialClosed"
      | "rewardedOpened"
      | "rewardedClosed",
    placementId: string | undefined,
    message: string,
  ): void {
    this.requireContext().emit(eventName, {
      provider: this.name,
      placementId,
      message,
    });
  }

  private requireContext(): AdsProviderContext {
    if (this.context === null) {
      throw new Error("MockProvider is not initialized.");
    }

    return this.context;
  }
}
