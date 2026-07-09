import { registerPlugin } from "@capacitor/core";
import type { CapacitorAdsPlugin } from "./definitions";

export const CapacitorAds = registerPlugin<CapacitorAdsPlugin>("CapacitorAds", {
  web: () => import("./web").then((m) => new m.CapacitorAdsWeb()),
});

export type {
  AdsInitializeOptions,
  AdsPlacementOptions,
  AdsMetadataValue,
  BannerOptions,
  InterstitialOptions,
  RewardedOptions,
  RewardedResult,
  CapacitorAdsPlugin,
} from "./definitions";
