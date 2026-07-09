// Shared base options that future providers can extend without changing the service API.
export interface BaseAdOptions {
    adUnitId?: string;
    placementId?: string;
    metadata?: Readonly<Record<string, string | number | boolean>>;
}

// Banner-specific options.
export interface BannerOptions extends BaseAdOptions {
    position?: "top" | "bottom";
    format?: "banner" | "largeBanner" | "mediumRectangle" | "adaptive";
}

// Interstitial-specific options.
export interface InterstitialOptions extends BaseAdOptions {
    timeoutMs?: number;
}

// Rewarded-specific options.
export interface RewardedOptions extends BaseAdOptions {
    rewardAmount?: number;
    rewardType?: string;
}
