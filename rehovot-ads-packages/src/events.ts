import type { RewardResult } from "./models";
import { UnityLevelPlayEventName } from "./enums";

// Error payloads stay small so they can be serialized by Capacitor listeners later.
export interface UnityLevelPlayErrorPayload {
  message: string;
  code?: string;
  details?: Readonly<Record<string, string | number | boolean>>;
}

// Generic event payload for simple lifecycle notifications.
export interface UnityLevelPlayPlacementPayload {
  placementId?: string;
}

// Reward grant payload reuses the public reward result shape.
export type UnityLevelPlayRewardPayload = RewardResult;

// Central event payload map for future strongly typed listener helpers.
export interface UnityLevelPlayEventPayloadMap {
  [UnityLevelPlayEventName.Initialized]: {
    message: string;
  };
  [UnityLevelPlayEventName.Failed]: UnityLevelPlayErrorPayload;
  [UnityLevelPlayEventName.BannerLoaded]: UnityLevelPlayPlacementPayload;
  [UnityLevelPlayEventName.BannerFailed]: UnityLevelPlayErrorPayload & UnityLevelPlayPlacementPayload;
  [UnityLevelPlayEventName.BannerClicked]: UnityLevelPlayPlacementPayload;
  [UnityLevelPlayEventName.BannerShown]: UnityLevelPlayPlacementPayload;
  [UnityLevelPlayEventName.BannerHidden]: UnityLevelPlayPlacementPayload;
  [UnityLevelPlayEventName.InterstitialLoaded]: UnityLevelPlayPlacementPayload;
  [UnityLevelPlayEventName.InterstitialFailed]: UnityLevelPlayErrorPayload & UnityLevelPlayPlacementPayload;
  [UnityLevelPlayEventName.InterstitialOpened]: UnityLevelPlayPlacementPayload;
  [UnityLevelPlayEventName.InterstitialClosed]: UnityLevelPlayPlacementPayload;
  [UnityLevelPlayEventName.RewardedLoaded]: UnityLevelPlayPlacementPayload;
  [UnityLevelPlayEventName.RewardedFailed]: UnityLevelPlayErrorPayload & UnityLevelPlayPlacementPayload;
  [UnityLevelPlayEventName.RewardedOpened]: UnityLevelPlayPlacementPayload;
  [UnityLevelPlayEventName.RewardedClosed]: UnityLevelPlayPlacementPayload;
  [UnityLevelPlayEventName.RewardedCompleted]: UnityLevelPlayPlacementPayload;
  [UnityLevelPlayEventName.RewardedRewardGranted]: UnityLevelPlayRewardPayload;
}

// Re-export the event enum so consumers can import events from one place.
export { UnityLevelPlayEventName };
