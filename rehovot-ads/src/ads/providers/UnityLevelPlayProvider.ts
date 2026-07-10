import { CapacitorAds } from "@rehovottech/capacitor-ads";
import type { AdsProviderContext, IAdsProvider } from "../IAdsProvider";
import type {
  AdsOperationResult,
  AdsRewardedResult,
  BannerOptions,
  InterstitialOptions,
  RewardedOptions,
} from "../types";
import { Platform } from "../utils/Platform";

export class UnityLevelPlayProvider implements IAdsProvider {
  public readonly name = "unity-levelplay";
  private context: AdsProviderContext | null = null;

  public async initialize(
    context: AdsProviderContext,
  ): Promise<AdsOperationResult> {
    this.context = context;
    const runtimePlatform = Platform.getRuntimePlatform();
    const platformConfig =
      runtimePlatform === "android"
        ? context.configuration.android.unityLevelPlay
        : context.configuration.ios.unityLevelPlay;

    await CapacitorAds.initialize({
      appKey: platformConfig?.appKey,
      testMode: context.configuration.testMode,
      debug: context.configuration.debug,
      autoStart: true,
    });

    context.emit("initialized", {
      provider: this.name,
      message: "Unity LevelPlay provider initialized.",
    });

    return {
      success: true,
      supported: true,
      skipped: false,
      provider: this.name,
      message: "Unity LevelPlay provider initialized.",
    };
  }

  public async showBanner(
    options?: BannerOptions,
  ): Promise<AdsOperationResult> {
    const placementId = options?.placementId ?? this.getPlacementId("banner");
    await CapacitorAds.showBanner({
      placementId,
      position: options?.position,
      metadata: options?.metadata,
    });

    this.emit("bannerLoaded", placementId, "Banner placeholder requested.");
    return this.success("Banner requested from native bridge.", placementId);
  }

  public async hideBanner(): Promise<AdsOperationResult> {
    await CapacitorAds.hideBanner();
    this.emit("bannerHidden", undefined, "Banner hidden.");
    return this.success("Banner hidden.", undefined);
  }

  public async destroyBanner(): Promise<AdsOperationResult> {
    await CapacitorAds.destroyBanner();
    this.emit("bannerHidden", undefined, "Banner destroyed.");
    return this.success("Banner destroyed.", undefined);
  }

  public async showInterstitial(
    options?: InterstitialOptions,
  ): Promise<AdsOperationResult> {
    const placementId =
      options?.placementId ?? this.getPlacementId("interstitial");
    await CapacitorAds.showInterstitial({
      placementId,
      timeoutMs: options?.timeoutMs,
      metadata: options?.metadata,
    });

    this.emit(
      "interstitialOpened",
      placementId,
      "Interstitial placeholder requested.",
    );

    return this.success(
      "Interstitial requested from native bridge.",
      placementId,
    );
  }

  public async showRewarded(
    options?: RewardedOptions,
  ): Promise<AdsRewardedResult> {
    const placementId = options?.placementId ?? this.getPlacementId("rewarded");
    const result = await CapacitorAds.showRewarded({
      placementId,
      rewardAmount: options?.expectedRewardAmount,
      rewardCurrency: options?.expectedRewardCurrency,
      metadata: options?.metadata,
    });

    if (result.completed) {
      this.emit("rewardedClosed", placementId, result.message);
    }

    return {
      success: result.success,
      supported: true,
      skipped: false,
      provider: this.name,
      message: result.message ?? "Rewarded placeholder completed.",
      placementId,
      completed: result.completed,
      rewardGranted: result.success && result.completed,
      reward: {
        amount: result.rewardAmount,
        currency: result.rewardCurrency,
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
    await CapacitorAds.destroy();
    return this.success("Provider destroyed.", undefined);
  }

  private getPlacementId(format: "banner" | "interstitial" | "rewarded"): string {
    const context = this.requireContext();
    const runtimePlatform = Platform.getRuntimePlatform();
    const placementConfig =
      runtimePlatform === "android"
        ? context.configuration.android.unityLevelPlay
        : context.configuration.ios.unityLevelPlay;

    switch (format) {
      case "banner":
        return placementConfig?.bannerId ?? "";
      case "interstitial":
        return placementConfig?.interstitialId ?? "";
      case "rewarded":
        return placementConfig?.rewardedId ?? "";
    }
  }

  private emit(
    eventName: "bannerLoaded" | "bannerHidden" | "interstitialOpened" | "rewardedClosed",
    placementId: string | undefined,
    message?: string,
  ): void {
    this.requireContext().emit(eventName, {
      provider: this.name,
      placementId,
      message,
    });
  }

  private success(
    message: string,
    placementId: string | undefined,
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

  private requireContext(): AdsProviderContext {
    if (this.context === null) {
      throw new Error("UnityLevelPlayProvider is not initialized.");
    }

    return this.context;
  }
}
