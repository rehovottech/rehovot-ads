import { WebPlugin } from "@capacitor/core";
import type { UnityLevelPlayPlugin } from "./definitions";
import type {
  BannerOptions,
  ConsentOptions,
  InitializeOptions,
  InterstitialOptions,
  RewardResult,
  RewardedOptions,
  UserOptions,
} from "./models";

// The web implementation is a harmless placeholder for Ionic React development.
const WEB_PLACEHOLDER_MESSAGE = "Unity LevelPlay is not implemented on web yet.";

export class UnityLevelPlayWeb extends WebPlugin implements UnityLevelPlayPlugin {
  public async initialize(_options: InitializeOptions): Promise<void> {
    console.warn(WEB_PLACEHOLDER_MESSAGE);
  }

  public async showBanner(_options?: BannerOptions): Promise<void> {
    console.warn(WEB_PLACEHOLDER_MESSAGE);
  }

  public async hideBanner(): Promise<void> {
    console.warn(WEB_PLACEHOLDER_MESSAGE);
  }

  public async destroyBanner(): Promise<void> {
    console.warn(WEB_PLACEHOLDER_MESSAGE);
  }

  public async showInterstitial(_options?: InterstitialOptions): Promise<void> {
    console.warn(WEB_PLACEHOLDER_MESSAGE);
  }

  public async showRewarded(_options?: RewardedOptions): Promise<RewardResult> {
    console.warn(WEB_PLACEHOLDER_MESSAGE);
    return {
      success: false,
      rewardGranted: false,
      message: WEB_PLACEHOLDER_MESSAGE,
    };
  }

  public async isInterstitialReady(): Promise<boolean> {
    return false;
  }

  public async isRewardedReady(): Promise<boolean> {
    return false;
  }

  public async setConsent(_options: ConsentOptions): Promise<void> {
    console.warn(WEB_PLACEHOLDER_MESSAGE);
  }

  public async setCOPPA(_options: { enabled: boolean }): Promise<void> {
    console.warn(WEB_PLACEHOLDER_MESSAGE);
  }

  public async setUserId(_options: UserOptions): Promise<void> {
    console.warn(WEB_PLACEHOLDER_MESSAGE);
  }

  public async destroy(): Promise<void> {
    console.warn(WEB_PLACEHOLDER_MESSAGE);
  }
}
