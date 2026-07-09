import { DEFAULT_ADS_CONFIG, type AdsServiceConfig } from "./types/AdsConfig";
import type {
  AdsFrequencyState,
  AdsFormat,
  AdsOutcome,
  AdsRewardOutcome,
} from "./types/AdsResult";
import type {
  BannerOptions,
  InterstitialOptions,
  RewardedOptions,
} from "./types/AdsOptions";
import { AdsManager } from "./AdsManager";
import { Logger } from "./utils/Logger";

export class AdsService {
  private static instance: AdsService | null = null;

  public static getInstance(): AdsService {
    if (AdsService.instance === null) {
      AdsService.instance = new AdsService();
    }

    return AdsService.instance;
  }

  private readonly manager = new AdsManager();
  private readonly logger = new Logger("AdsService");
  private config: AdsServiceConfig = {};
  private initialized = false;
  private sessionCounts: Partial<Record<AdsFormat, number>> = {};
  private lastShownAt: Partial<Record<AdsFormat, number>> = {};
  private onlineOverride: boolean | null = null;

  private constructor() {}

  public configure(config: AdsServiceConfig): void {
    this.config = {
      ...this.config,
      ...config,
      placements: {
        ...DEFAULT_ADS_CONFIG.placements,
        ...this.config.placements,
        ...config.placements,
      },
      frequencyCap: {
        ...DEFAULT_ADS_CONFIG.frequencyCap,
        ...this.config.frequencyCap,
        ...config.frequencyCap,
      },
      privacy: {
        ...DEFAULT_ADS_CONFIG.privacy,
        ...this.config.privacy,
        ...config.privacy,
      },
    };

    this.logger.configure(this.config.debug ?? DEFAULT_ADS_CONFIG.debug);
  }

  public getConfig(): Readonly<AdsServiceConfig> {
    return this.config;
  }

  public setOnlineState(online: boolean | null): void {
    this.onlineOverride = online;
  }

  public getFrequencyState(): AdsFrequencyState {
    return {
      lastShownAt: { ...this.lastShownAt },
      countThisSession: { ...this.sessionCounts },
    };
  }

  public async initialize(): Promise<AdsOutcome> {
    if (this.initialized) {
      return this.success("Ads bridge already initialized.");
    }

    const decision = this.getGateDecision("initialize");
    if (!decision.allowed) {
      return this.skip(decision.reason, decision.message);
    }

    const initOptions = {
      appKey: this.config.appKey,
      testMode: this.config.testMode ?? DEFAULT_ADS_CONFIG.testMode,
      debug: this.config.debug ?? DEFAULT_ADS_CONFIG.debug,
      autoStart: true,
    };

    this.logger.info("Initializing ads bridge.", initOptions);

    await this.manager.initialize(initOptions);
    this.initialized = true;

    return this.success("Ads bridge initialized.");
  }

  public async showBanner(options?: BannerOptions): Promise<AdsOutcome> {
    const decision = this.getGateDecision("banner");
    if (!decision.allowed) {
      return this.skip(decision.reason, decision.message);
    }

    const initialization = await this.ensureInitialized();
    if (initialization !== null) {
      return initialization;
    }

    await this.manager.showBanner({
      ...options,
      placementId: options?.placementId ?? this.config.placements?.banner,
    });
    this.recordShow("banner");

    return this.success("Banner requested.");
  }

  public async hideBanner(): Promise<AdsOutcome> {
    const initialization = await this.ensureInitialized();
    if (initialization !== null) {
      return initialization;
    }

    await this.manager.hideBanner();
    return this.success("Banner hidden.");
  }

  public async showInterstitial(
    options?: InterstitialOptions,
  ): Promise<AdsOutcome> {
    const decision = this.getGateDecision("interstitial");
    if (!decision.allowed) {
      return this.skip(decision.reason, decision.message);
    }

    const initialization = await this.ensureInitialized();
    if (initialization !== null) {
      return initialization;
    }

    await this.manager.showInterstitial({
      ...options,
      placementId: options?.placementId ?? this.config.placements?.interstitial,
    });
    this.recordShow("interstitial");

    return this.success("Interstitial requested.");
  }

  public async showRewarded(
    options?: RewardedOptions,
  ): Promise<AdsRewardOutcome> {
    const decision = this.getGateDecision("rewarded");
    if (!decision.allowed) {
      return this.skipReward(decision.reason, decision.message, options);
    }

    const initialization = await this.ensureInitialized();
    if (initialization !== null) {
      return this.skipReward(
        initialization.reason,
        initialization.message,
        options,
      );
    }

    const nativeResult = await this.manager.showRewarded({
      ...options,
      placementId: options?.placementId ?? this.config.placements?.rewarded,
    });
    this.recordShow("rewarded");

    return {
      success: nativeResult.success,
      skipped: false,
      reason: nativeResult.success ? undefined : "bridge-error",
      message: nativeResult.message ?? "Rewarded ad completed.",
      rewardGranted: nativeResult.success && nativeResult.completed,
      completed: nativeResult.completed,
      placementId: nativeResult.placementId ?? options?.placementId,
      rewardAmount: nativeResult.rewardAmount ?? options?.rewardAmount,
      rewardCurrency: nativeResult.rewardCurrency ?? options?.rewardCurrency,
    };
  }

  public async destroy(): Promise<AdsOutcome> {
    await this.manager.destroy();
    this.initialized = false;
    this.lastShownAt = {};
    this.sessionCounts = {};

    return this.success("Ads bridge destroyed.");
  }

  private async ensureInitialized(): Promise<AdsOutcome | null> {
    if (this.initialized) {
      return null;
    }

    const result = await this.initialize();
    return result.skipped || !result.success ? result : null;
  }

  private getGateDecision(format: "initialize" | AdsFormat): {
    allowed: boolean;
    reason?: AdsOutcome["reason"];
    message: string;
  } {
    if ((this.config.premiumUser ?? DEFAULT_ADS_CONFIG.premiumUser) === true) {
      return {
        allowed: false,
        reason: "premium-user",
        message: "Ads are disabled for premium users.",
      };
    }

    if (!this.config.appKey) {
      return {
        allowed: false,
        reason: "not-configured",
        message: "Ads configuration is missing an app key.",
      };
    }

    if (this.isCoppaBlocked()) {
      return {
        allowed: false,
        reason: "coppa",
        message: "Ads are blocked by COPPA policy.",
      };
    }

    if (this.isGdprBlocked()) {
      return {
        allowed: false,
        reason: "gdpr",
        message: "Ads are blocked because GDPR consent is missing.",
      };
    }

    if (this.isOffline() && (this.config.requireInternet ?? DEFAULT_ADS_CONFIG.requireInternet)) {
      return {
        allowed: false,
        reason: "offline",
        message: "Ads are unavailable while the device is offline.",
      };
    }

    if (format !== "initialize" && !this.initialized) {
      return {
        allowed: false,
        reason: "not-initialized",
        message: "Ads must be initialized before showing placements.",
      };
    }

    if (format === "interstitial" || format === "rewarded") {
      const frequencyDecision = this.isFrequencyBlocked(format);
      if (!frequencyDecision.allowed) {
        return frequencyDecision;
      }
    }

    return {
      allowed: true,
      message: "Allowed.",
    };
  }

  private isFrequencyBlocked(
    format: Exclude<AdsFormat, "banner">,
  ): { allowed: boolean; reason?: AdsOutcome["reason"]; message: string } {
    const caps = this.config.frequencyCap ?? DEFAULT_ADS_CONFIG.frequencyCap;
    const lastShownAt = this.lastShownAt[format];
    const countThisSession = this.sessionCounts[format] ?? 0;
    const cooldownMs =
      format === "interstitial"
        ? caps.interstitialCooldownMs ?? 0
        : caps.rewardedCooldownMs ?? 0;
    const maxPerSession =
      format === "interstitial"
        ? caps.interstitialMaxPerSession ?? 0
        : caps.rewardedMaxPerSession ?? 0;

    if (maxPerSession > 0 && countThisSession >= maxPerSession) {
      return {
        allowed: false,
        reason: "frequency-cap",
        message: `${format} frequency cap reached for this session.`,
      };
    }

    if (lastShownAt !== undefined && cooldownMs > 0) {
      const elapsed = Date.now() - lastShownAt;
      if (elapsed < cooldownMs) {
        return {
          allowed: false,
          reason: "frequency-cap",
          message: `${format} cooldown is still active.`,
        };
      }
    }

    return {
      allowed: true,
      message: "Allowed.",
    };
  }

  private isCoppaBlocked(): boolean {
    return this.config.privacy?.coppaEnabled === true;
  }

  private isGdprBlocked(): boolean {
    const consent = this.config.privacy?.gdprConsent;
    return consent === false;
  }

  private isOffline(): boolean {
    if (this.onlineOverride !== null) {
      return !this.onlineOverride;
    }

    if (typeof navigator === "undefined") {
      return false;
    }

    return navigator.onLine === false;
  }

  private recordShow(format: AdsFormat): void {
    this.lastShownAt[format] = Date.now();
    this.sessionCounts[format] = (this.sessionCounts[format] ?? 0) + 1;
  }

  private success(message: string): AdsOutcome {
    this.logger.info(message);
    return {
      success: true,
      skipped: false,
      message,
    };
  }

  private skip(
    reason: NonNullable<AdsOutcome["reason"]> | undefined,
    message: string,
  ): AdsOutcome {
    this.logger.warn(message, { reason });
    return {
      success: false,
      skipped: true,
      reason,
      message,
    };
  }

  private skipReward(
    reason: NonNullable<AdsOutcome["reason"]> | undefined,
    message: string,
    options?: RewardedOptions,
  ): AdsRewardOutcome {
    return {
      ...this.skip(reason, message),
      rewardGranted: false,
      completed: false,
      placementId: options?.placementId ?? this.config.placements?.rewarded,
      rewardAmount: options?.rewardAmount,
      rewardCurrency: options?.rewardCurrency,
    };
  }
}
