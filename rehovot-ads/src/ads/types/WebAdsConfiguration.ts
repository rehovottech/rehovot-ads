export type WebAdsNetwork = "none" | "admaven" | "adsense" | "amazon" | "customHtml";

export interface WebPlacementConfiguration {
  readonly bannerId?: string;
  readonly interstitialId?: string;
  readonly rewardedId?: string;
}

export interface WebAdsConfiguration {
  readonly provider: WebAdsNetwork;
  readonly admaven?: WebPlacementConfiguration;
  readonly adsense?: WebPlacementConfiguration;
  readonly amazon?: WebPlacementConfiguration;
  readonly customHtml?: WebPlacementConfiguration;
}
