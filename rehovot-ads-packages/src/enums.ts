// Shared enums avoid magic strings across the plugin surface and native bridge.
export enum UnityLevelPlayEventName {
  Initialized = "initialized",
  Failed = "failed",
  BannerLoaded = "bannerLoaded",
  BannerFailed = "bannerFailed",
  BannerClicked = "bannerClicked",
  BannerShown = "bannerShown",
  BannerHidden = "bannerHidden",
  InterstitialLoaded = "interstitialLoaded",
  InterstitialFailed = "interstitialFailed",
  InterstitialOpened = "interstitialOpened",
  InterstitialClosed = "interstitialClosed",
  RewardedLoaded = "rewardedLoaded",
  RewardedFailed = "rewardedFailed",
  RewardedOpened = "rewardedOpened",
  RewardedClosed = "rewardedClosed",
  RewardedCompleted = "rewardedCompleted",
  RewardedRewardGranted = "rewardedRewardGranted",
}

// Ad formats are kept explicit so future providers can reuse the same public API.
export enum UnityLevelPlayAdFormat {
  Banner = "banner",
  Interstitial = "interstitial",
  Rewarded = "rewarded",
}

// Banner placement is intentionally small and provider-neutral.
export enum BannerPosition {
  Top = "top",
  Bottom = "bottom",
}
