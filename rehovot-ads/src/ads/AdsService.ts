import { AdsEventBus } from "./AdsEventBus";
import { AdsProviderFactory } from "./AdsProviderFactory";
import type { IAdsProvider } from "./IAdsProvider";
import { resolveAdsConfiguration } from "./config";
import type {
  AdsConfiguration,
  AdsEventListener,
  AdsEventName,
  AdsEventPayloadMap,
  AdsFormat,
  AdsFrequencyState,
  AdsOperationResult,
  AdsRewardedResult,
  BannerOptions,
  InterstitialOptions,
  ResolvedAdsConfiguration,
  RewardedOptions,
} from "./types";
import { Logger } from "./utils/Logger";

export class AdsService {
  private static instance: AdsService | null = null;

  public static getInstance(): AdsService {
    if (AdsService.instance === null) {
      AdsService.instance = new AdsService();
    }

    return AdsService.instance;
  }

  private readonly logger = new Logger("AdsService");
  private readonly events = new AdsEventBus();
  private configuration: ResolvedAdsConfiguration | null = null;
  private provider: IAdsProvider | null = null;
  private initialized = false;
  private lastShownAt: Partial<Record<AdsFormat, number>> = {};
  private sessionCounts: Partial<Record<AdsFormat, number>> = {};
  private internetConnected = true;

  private constructor() {}

  public async initialize(
    configuration: AdsConfiguration,
  ): Promise<AdsOperationResult> {
    if (this.provider !== null && this.initialized) {
      await this.provider.destroy();
    }

    this.configuration = resolveAdsConfiguration(configuration);
    this.logger.configure(this.configuration.debug);
    this.provider = AdsProviderFactory.create(this.configuration);

    const gate = this.evaluateGlobalPolicy();
    if (gate !== null) {
      return gate;
    }

    const result = await this.provider.initialize({
      configuration: this.configuration,
      logger: this.logger,
      emit: (eventName, payload) => {
        this.emit(eventName, payload);
      },
    });

    this.initialized = result.success;
    if (!result.success) {
      this.emit("failed", {
        provider: result.provider,
        reason: result.reason ?? "provider-error",
        message: result.message,
        placementId: result.placementId,
      });
    }

    return result;
  }

  public async showBanner(
    options?: BannerOptions,
  ): Promise<AdsOperationResult> {
    const provider = await this.ensureProvider();
    if (this.isResult(provider)) {
      return provider;
    }

    const gate = this.evaluateAdRequest("banner");
    if (gate !== null) {
      return gate;
    }

    const result = await provider.showBanner(options);
    if (result.success) {
      this.recordAdDisplay("banner");
    }

    return result;
  }

  public async hideBanner(): Promise<AdsOperationResult> {
    const provider = await this.ensureProvider();
    if (this.isResult(provider)) {
      return provider;
    }

    return provider.hideBanner();
  }

  public async destroyBanner(): Promise<AdsOperationResult> {
    const provider = await this.ensureProvider();
    if (this.isResult(provider)) {
      return provider;
    }

    return provider.destroyBanner();
  }

  public async showInterstitial(
    options?: InterstitialOptions,
  ): Promise<AdsOperationResult> {
    const provider = await this.ensureProvider();
    if (this.isResult(provider)) {
      return provider;
    }

    const gate = this.evaluateAdRequest("interstitial");
    if (gate !== null) {
      return gate;
    }

    const ready = await provider.isInterstitialReady();
    if (!ready) {
      return this.blocked("not-ready", "Interstitial is not ready yet.");
    }

    const result = await provider.showInterstitial(options);
    if (result.success) {
      this.recordAdDisplay("interstitial");
    }

    return result;
  }

  public async showRewarded(
    options?: RewardedOptions,
  ): Promise<AdsRewardedResult> {
    const provider = await this.ensureProvider();
    if (this.isResult(provider)) {
      return {
        ...provider,
        completed: false,
        rewardGranted: false,
      };
    }

    const gate = this.evaluateAdRequest("rewarded");
    if (gate !== null) {
      return {
        ...gate,
        completed: false,
        rewardGranted: false,
      };
    }

    const ready = await provider.isRewardedReady();
    if (!ready) {
      return {
        ...this.blocked("not-ready", "Rewarded ad is not ready yet."),
        completed: false,
        rewardGranted: false,
      };
    }

    const result = await provider.showRewarded(options);
    if (!result.success || !result.rewardGranted) {
      return result;
    }

    const validation = this.validateReward(result, options);
    if (validation !== null) {
      return {
        ...validation,
        completed: result.completed,
        rewardGranted: false,
      };
    }

    this.recordAdDisplay("rewarded");
    this.emit("rewardGranted", {
      provider: result.provider,
      placementId: result.placementId,
      message: result.message,
      rewardAmount: result.reward?.amount,
      rewardCurrency: result.reward?.currency,
    });
    this.emit("rewardCompleted", {
      provider: result.provider,
      placementId: result.placementId,
      message: result.message,
      rewardAmount: result.reward?.amount,
      rewardCurrency: result.reward?.currency,
    });
    return result;
  }

  public async destroy(): Promise<AdsOperationResult> {
    if (this.provider === null) {
      return this.blocked("not-initialized", "Ads service is not initialized.");
    }

    const result = await this.provider.destroy();
    this.provider = null;
    this.configuration = null;
    this.initialized = false;
    this.lastShownAt = {};
    this.sessionCounts = {};
    return result;
  }

  public on<TEvent extends AdsEventName>(
    eventName: TEvent,
    listener: AdsEventListener<TEvent>,
  ): () => void {
    return this.events.on(eventName, listener);
  }

  public getConfiguration(): ResolvedAdsConfiguration | null {
    return this.configuration;
  }

  public getFrequencyState(): AdsFrequencyState {
    return {
      lastShownAt: { ...this.lastShownAt },
      countThisSession: { ...this.sessionCounts },
    };
  }

  public setInternetConnected(connected: boolean): void {
    this.internetConnected = connected;
  }

  private async ensureProvider(): Promise<IAdsProvider | AdsOperationResult> {
    if (this.provider === null || !this.initialized) {
      return this.blocked("not-initialized", "Ads service is not initialized.");
    }

    return this.provider;
  }

  private isResult(
    value: IAdsProvider | AdsOperationResult,
  ): value is AdsOperationResult {
    return "success" in value;
  }

  private evaluateGlobalPolicy(): AdsOperationResult | null {
    const configuration = this.requireConfiguration();

    if (configuration.premiumUser) {
      return this.blocked("premium-user", "Ads are disabled for premium users.");
    }

    if (configuration.gdpr && configuration.gdprConsentGranted !== true) {
      return this.blocked(
        "gdpr-consent-missing",
        "GDPR consent is required before initializing ads.",
      );
    }

    if (configuration.ccpa && configuration.ccpaOptOut) {
      return this.blocked(
        "ccpa-restricted",
        "CCPA opt-out prevents ads from being initialized.",
      );
    }

    return null;
  }

  private evaluateAdRequest(format: AdsFormat): AdsOperationResult | null {
    const configuration = this.requireConfiguration();

    if (configuration.premiumUser) {
      return this.blocked("premium-user", "Ads are disabled for premium users.");
    }

    if (configuration.coppa && format === "rewarded") {
      return this.blocked(
        "coppa-restricted",
        "Rewarded ads are disabled for COPPA-restricted users.",
      );
    }

    if (configuration.requireInternet && !this.internetConnected) {
      return this.blocked("offline", "Ads are unavailable while offline.");
    }

    if (this.isFrequencyCapped(format)) {
      return this.blocked(
        "frequency-cap",
        `${format} request blocked by frequency capping.`,
      );
    }

    return null;
  }

  private isFrequencyCapped(format: AdsFormat): boolean {
    const configuration = this.requireConfiguration();
    const cooldown = this.getCooldownMs(configuration, format);
    const maxPerSession = this.getMaxPerSession(configuration, format);
    const lastShownAt = this.lastShownAt[format];
    const shownCount = this.sessionCounts[format] ?? 0;

    if (cooldown > 0 && lastShownAt !== undefined) {
      if (Date.now() - lastShownAt < cooldown) {
        return true;
      }
    }

    if (maxPerSession > 0 && shownCount >= maxPerSession) {
      return true;
    }

    return false;
  }

  private getCooldownMs(
    configuration: ResolvedAdsConfiguration,
    format: AdsFormat,
  ): number {
    switch (format) {
      case "banner":
        return 0;
      case "interstitial":
        return configuration.frequency.interstitialCooldownMs;
      case "rewarded":
        return configuration.frequency.rewardedCooldownMs;
    }
  }

  private getMaxPerSession(
    configuration: ResolvedAdsConfiguration,
    format: AdsFormat,
  ): number {
    switch (format) {
      case "banner":
        return 0;
      case "interstitial":
        return configuration.frequency.interstitialMaxPerSession;
      case "rewarded":
        return configuration.frequency.rewardedMaxPerSession;
    }
  }

  private recordAdDisplay(format: AdsFormat): void {
    this.lastShownAt[format] = Date.now();
    this.sessionCounts[format] = (this.sessionCounts[format] ?? 0) + 1;
  }

  private validateReward(
    result: AdsRewardedResult,
    options?: RewardedOptions,
  ): AdsOperationResult | null {
    if (!result.rewardGranted) {
      return null;
    }

    if (
      options?.expectedRewardAmount !== undefined &&
      result.reward?.amount !== undefined &&
      options.expectedRewardAmount !== result.reward.amount
    ) {
      return this.blocked(
        "reward-mismatch",
        "Reward amount does not match the expected value.",
        result.provider,
        result.placementId,
      );
    }

    if (
      options?.expectedRewardCurrency !== undefined &&
      result.reward?.currency !== undefined &&
      options.expectedRewardCurrency !== result.reward.currency
    ) {
      return this.blocked(
        "reward-mismatch",
        "Reward currency does not match the expected value.",
        result.provider,
        result.placementId,
      );
    }

    return null;
  }

  private blocked(
    reason: AdsOperationResult["reason"],
    message: string,
    provider?: string,
    placementId?: string,
  ): AdsOperationResult {
    const result: AdsOperationResult = {
      success: false,
      supported: true,
      skipped: true,
      provider: provider ?? this.provider?.name ?? "unresolved",
      reason,
      message,
      placementId,
    };

    this.emit("failed", {
      provider: result.provider,
      reason: reason ?? "provider-error",
      message,
      placementId,
    });

    this.logger.warn(message, { reason, placementId });
    return result;
  }

  private emit<TEvent extends AdsEventName>(
    eventName: TEvent,
    payload: AdsEventPayloadMap[TEvent],
  ): void {
    this.events.emit(eventName, payload);
  }

  private requireConfiguration(): ResolvedAdsConfiguration {
    if (this.configuration === null) {
      throw new Error("Ads configuration is not available.");
    }

    return this.configuration;
  }
}
