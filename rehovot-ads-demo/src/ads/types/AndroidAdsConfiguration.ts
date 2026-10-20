export interface UnityLevelPlayPlacementConfiguration {
  readonly appKey: string;
  readonly bannerId: string;
  readonly interstitialId: string;
  readonly rewardedId: string;
}

export interface AndroidAdsConfiguration {
  readonly unityLevelPlay?: UnityLevelPlayPlacementConfiguration;
}
