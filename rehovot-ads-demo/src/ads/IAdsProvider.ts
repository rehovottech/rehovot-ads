import type { Logger } from "./utils/Logger";
import type {
  BannerOptions,
  InterstitialOptions,
  RewardedOptions,
} from "./types/AdsOptions";
import type { AdsEventPayloadMap, AdsEventName } from "./types/AdsEvents";
import type {
  AdsOperationResult,
  AdsRewardedResult,
} from "./types/AdsResult";
import type { ResolvedAdsConfiguration } from "./types/AdsConfiguration";

export interface AdsProviderContext {
  readonly configuration: ResolvedAdsConfiguration;
  readonly logger: Logger;
  readonly emit: <TEvent extends AdsEventName>(
    eventName: TEvent,
    payload: AdsEventPayloadMap[TEvent],
  ) => void;
}

export interface IAdsProvider {
  readonly name: string;
  initialize(context: AdsProviderContext): Promise<AdsOperationResult>;
  showBanner(options?: BannerOptions): Promise<AdsOperationResult>;
  hideBanner(): Promise<AdsOperationResult>;
  destroyBanner(): Promise<AdsOperationResult>;
  showInterstitial(options?: InterstitialOptions): Promise<AdsOperationResult>;
  showRewarded(options?: RewardedOptions): Promise<AdsRewardedResult>;
  isInterstitialReady(): Promise<boolean>;
  isRewardedReady(): Promise<boolean>;
  destroy(): Promise<AdsOperationResult>;
}
