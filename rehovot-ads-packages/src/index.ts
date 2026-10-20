import { registerPlugin } from "@capacitor/core";
import type { CapacitorAdsPlugin } from "./definitions";

export const CapacitorAds = registerPlugin<CapacitorAdsPlugin>("CapacitorAds", {
  web: () => import("./web").then((m) => new m.CapacitorAdsWeb()),
});

export { UnityLevelPlayEventName as AdsEventName, UnityLevelPlayEventName, BannerPosition } from "./enums";

export type {
  AdsEventPayload,
  AdsInitializeOptions,
  AdsPlacementOptions,
  AdsPlacements,
  AdsMetadataValue,
  BannerOptions,
  ConsentOptions,
  InterstitialOptions,
  InterstitialResult,
  ReadyResult,
  RewardedOptions,
  RewardedResult,
  TrackingStatus,
  CapacitorAdsPlugin,
} from "./definitions";
