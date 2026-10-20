import type { AdsProviderContext, IAdsProvider } from "../IAdsProvider";
import type {
  AdsOperationResult,
  AdsRewardedResult,
  BannerOptions,
  InterstitialOptions,
  RewardedOptions,
  WebAdsNetwork,
} from "../types";
import { AdMavenAdapter } from "./web/AdMavenAdapter";
import type { IWebAdsAdapter } from "./web/IWebAdsAdapter";

export class WebAdsProvider implements IAdsProvider {
  public readonly name = "web";
  private context: AdsProviderContext | null = null;
  private adapter: IWebAdsAdapter | null = null;

  public async initialize(
    context: AdsProviderContext,
  ): Promise<AdsOperationResult> {
    this.context = context;
    this.adapter = this.createAdapter(context.configuration.web.provider);

    const result = await this.adapter.initialize(context);
    if (result.success) {
      context.emit("initialized", {
        provider: this.getProviderName(),
        message: result.message,
      });
    }

    return {
      ...result,
      provider: this.getProviderName(),
    };
  }

  public async showBanner(
    options?: BannerOptions,
  ): Promise<AdsOperationResult> {
    return this.withAdapter((adapter) => adapter.showBanner(options));
  }

  public async hideBanner(): Promise<AdsOperationResult> {
    return this.withAdapter((adapter) => adapter.hideBanner());
  }

  public async destroyBanner(): Promise<AdsOperationResult> {
    return this.withAdapter((adapter) => adapter.destroyBanner());
  }

  public async showInterstitial(
    options?: InterstitialOptions,
  ): Promise<AdsOperationResult> {
    return this.withAdapter((adapter) => adapter.showInterstitial(options));
  }

  public async showRewarded(
    options?: RewardedOptions,
  ): Promise<AdsRewardedResult> {
    return this.withAdapter((adapter) => adapter.showRewarded(options));
  }

  public async isInterstitialReady(): Promise<boolean> {
    return this.requireAdapter().isInterstitialReady();
  }

  public async isRewardedReady(): Promise<boolean> {
    return this.requireAdapter().isRewardedReady();
  }

  public async destroy(): Promise<AdsOperationResult> {
    return this.withAdapter((adapter) => adapter.destroy());
  }

  private createAdapter(network: WebAdsNetwork): IWebAdsAdapter {
    switch (network) {
      case "admaven":
        return new AdMavenAdapter();
      case "adsense":
      case "amazon":
      case "customHtml":
      case "none":
      default:
        return new AdMavenAdapter(
          false,
          `${network} adapter is not implemented yet.`,
        );
    }
  }

  private async withAdapter<TResult extends AdsOperationResult | AdsRewardedResult>(
    operation: (adapter: IWebAdsAdapter) => Promise<TResult>,
  ): Promise<TResult> {
    const result = await operation(this.requireAdapter());
    return {
      ...result,
      provider: this.getProviderName(),
    };
  }

  private getProviderName(): string {
    return this.adapter === null ? this.name : `${this.name}:${this.adapter.name}`;
  }

  private requireAdapter(): IWebAdsAdapter {
    if (this.adapter === null) {
      throw new Error("WebAdsProvider is not initialized.");
    }

    return this.adapter;
  }
}
