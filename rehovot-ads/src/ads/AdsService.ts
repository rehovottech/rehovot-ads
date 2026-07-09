// Singleton service that delegates ad work to the selected provider.
import type { IAdsProvider } from "./IAdsProvider";
import type { AdsResult } from "./types/AdsResult";
import type {
    BannerOptions,
    InterstitialOptions,
    RewardedOptions,
} from "./types/AdsOptions";

export class AdsService {
    private static instance: AdsService | null = null;
    private provider: IAdsProvider | null = null;

    // The constructor is private so callers must use the singleton accessor.
    private constructor(provider?: IAdsProvider) {
        this.provider = provider ?? null;
    }

    // Returns the single service instance and optionally seeds a provider.
    public static getInstance(provider?: IAdsProvider): AdsService {
        if (AdsService.instance === null) {
            AdsService.instance = new AdsService(provider);
        } else if (provider !== undefined) {
            AdsService.instance.provider = provider;
        }

        return AdsService.instance;
    }

    // Allows swapping providers at runtime without changing the app surface.
    public setProvider(provider: IAdsProvider): void {
        this.provider = provider;
    }

    // Ensures the service never silently operates without a provider.
    private requireProvider(): IAdsProvider {
        if (this.provider === null) {
            throw new Error("AdsService provider has not been configured.");
        }

        return this.provider;
    }

    // Delegates initialization to the selected provider.
    public async initialize(): Promise<AdsResult> {
        return await this.requireProvider().initialize();
    }

    // Delegates banner display to the selected provider.
    public async showBanner(options?: BannerOptions): Promise<AdsResult> {
        return await this.requireProvider().showBanner(options);
    }

    // Delegates banner hiding to the selected provider.
    public async hideBanner(): Promise<AdsResult> {
        return await this.requireProvider().hideBanner();
    }

    // Delegates interstitial display to the selected provider.
    public async showInterstitial(
        options?: InterstitialOptions,
    ): Promise<AdsResult> {
        return await this.requireProvider().showInterstitial(options);
    }

    // Delegates rewarded ad display to the selected provider.
    public async showRewarded(options?: RewardedOptions): Promise<AdsResult> {
        return await this.requireProvider().showRewarded(options);
    }

    // Delegates provider cleanup to the selected provider.
    public async destroy(): Promise<AdsResult> {
        return await this.requireProvider().destroy();
    }

    // Delegates the banner loaded check to the selected provider.
    public async isBannerLoaded(): Promise<boolean> {
        return await this.requireProvider().isBannerLoaded();
    }

    // Delegates the interstitial loaded check to the selected provider.
    public async isInterstitialLoaded(): Promise<boolean> {
        return await this.requireProvider().isInterstitialLoaded();
    }

    // Delegates the rewarded loaded check to the selected provider.
    public async isRewardedLoaded(): Promise<boolean> {
        return await this.requireProvider().isRewardedLoaded();
    }
}
