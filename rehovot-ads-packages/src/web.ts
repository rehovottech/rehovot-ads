import { WebPlugin } from "@capacitor/core";
import type {
  AdsInitializeOptions,
  AdsPlacementOptions,
  BannerOptions,
  CapacitorAdsPlugin,
  ConsentOptions,
  InterstitialOptions,
  InterstitialResult,
  ReadyResult,
  RewardedOptions,
  RewardedResult,
  TrackingStatus,
} from "./definitions";

const WEB_MESSAGE = "CapacitorAds: web ads are not configured (initialize with an AdSense ca-pub-… appKey).";
const SCRIPT_SRC = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
/** adBreak() requests just queue until adsbygoogle.js loads; with an ad blocker it never does. */
const DEFAULT_TIMEOUT_MS = 8000;
/** A rewarded video can run well past the interstitial timeout. */
const REWARDED_TIMEOUT_MS = 120000;

/** https://developers.google.com/ad-placement/apis/adbreak (placementInfo.breakStatus) */
type BreakStatus =
  | "notReady" | "timeout" | "invalid" | "error" | "noAdPreloaded" | "frequencyCapped"
  | "ignored" | "other" | "dismissed" | "viewed";

interface PlacementInfo {
  breakType?: string;
  breakName?: string;
  breakFormat?: string;
  breakStatus?: BreakStatus;
}

interface AdBreakParams {
  type: "preroll" | "start" | "pause" | "next" | "browse" | "reward";
  name?: string;
  beforeAd?: () => void;
  afterAd?: () => void;
  beforeReward?: (showAdFn: () => void) => void;
  adDismissed?: () => void;
  adViewed?: () => void;
  adBreakDone?: (placementInfo: PlacementInfo) => void;
}

interface AdConfigParams {
  preloadAdBreaks?: "on" | "auto";
  sound?: "on" | "off";
  onReady?: () => void;
}

type AdsByGoogle = Array<AdBreakParams | AdConfigParams> & { requestNonPersonalizedAds?: number };

interface RewardShowResult {
  shown: boolean;
  completed: boolean;
  status?: BreakStatus;
}

/** A showRewarded() call waiting for its break's callbacks. */
interface RewardShow {
  placementId: string;
  completed: boolean;
  resolve: (result: RewardShowResult) => void;
}

/**
 * Web backend: Google H5 Games Ads (Ad Placement API, https://developers.google.com/ad-placement).
 * - appKey      = the AdSense publisher id ("ca-pub-…"); the site must be approved for H5 Games Ads.
 * - placements  = adBreak() names (reporting labels only), e.g. { interstitial: "level_complete", rewarded: "reward" }.
 * - testMode    = data-adbreak-test="on": Google's test ads, no revenue. Keep it on until the site is approved.
 * Interstitials are `next` breaks. Google applies its own frequency cap on top of the game's pacing,
 * so showInterstitial() can resolve success:false (message = breakStatus, e.g. "frequencyCapped").
 * Banners are not part of H5 Games Ads and stay no-ops.
 *
 * Without a ca-pub appKey every call resolves safely, as before. `window.__ADS_SIMULATE__ = true`
 * still fakes instant fills (rewarded = completed) for testing UI flows.
 */
export class CapacitorAdsWeb extends WebPlugin implements CapacitorAdsPlugin {
  private publisherId = "";
  private testMode = false;
  private debug = false;
  private autoStart = true;
  private placements = { interstitial: "interstitial", rewarded: "reward" };
  private nonPersonalized = false;
  private scriptFailed = false;
  private apiReady = false;
  private showing = false;
  /** showAdFn of the rewarded break the API is currently offering (valid until the next adBreak()). */
  private offer?: () => void;
  private pendingShow?: RewardShow;
  /** In-flight reward probe: resolves true once an ad is offered, false with the reason it isn't. */
  private probe?: Promise<boolean>;

  private get simulate(): boolean {
    return typeof window !== "undefined" && (window as unknown as { __ADS_SIMULATE__?: boolean }).__ADS_SIMULATE__ === true;
  }

  private get enabled(): boolean {
    return !!this.publisherId && !this.scriptFailed;
  }

  private get adsbygoogle(): AdsByGoogle {
    const w = window as unknown as { adsbygoogle?: AdsByGoogle };
    return (w.adsbygoogle = w.adsbygoogle || ([] as unknown as AdsByGoogle));
  }

  private adBreak(params: AdBreakParams): void {
    this.adsbygoogle.push(params);
  }

  private log(...args: unknown[]): void {
    if (this.debug) console.log("[CapacitorAds:web]", ...args);
  }

  public async initialize(options: AdsInitializeOptions): Promise<void> {
    if (this.simulate) {
      this.notifyListeners("initialized", { message: "simulated" });
      return;
    }
    const appKey = options.appKey ?? "";
    if (!appKey.startsWith("ca-pub-")) {
      this.log("no AdSense publisher id, web ads disabled");
      return;
    }
    if (this.publisherId) return;   // the tag goes on the page once
    this.publisherId = appKey;
    this.testMode = options.testMode === true;
    this.debug = options.debug === true;
    this.autoStart = options.autoStart !== false;
    this.placements = {
      interstitial: options.placements?.interstitial || this.placements.interstitial,
      rewarded: options.placements?.rewarded || this.placements.rewarded,
    };

    // Consent has to be set before the first ad request.
    if (this.nonPersonalized) this.adsbygoogle.requestNonPersonalizedAds = 1;
    this.injectScript();
    this.adsbygoogle.push({
      preloadAdBreaks: "on",
      onReady: () => {
        this.apiReady = true;
        this.log("ready", { testMode: this.testMode });
        this.notifyListeners("initialized", { message: "h5" });
        this.notifyListeners("interstitialLoaded", { placementId: this.placements.interstitial });
        if (this.autoStart) void this.probeRewarded();
      },
    });
  }

  private injectScript(): void {
    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `${SCRIPT_SRC}?client=${encodeURIComponent(this.publisherId)}`;
    script.setAttribute("data-ad-client", this.publisherId);
    if (this.testMode) script.setAttribute("data-adbreak-test", "on");
    script.onerror = () => {
      // Usually an ad blocker: from here on every call resolves as "no fill".
      this.scriptFailed = true;
      this.notifyListeners("failed", { message: "adsbygoogle.js failed to load", code: "SCRIPT_BLOCKED" });
    };
    document.head.appendChild(script);
  }

  public async showBanner(_options?: BannerOptions): Promise<void> {}
  public async hideBanner(): Promise<void> {}
  public async destroyBanner(): Promise<void> {}

  public async loadInterstitial(_options?: InterstitialOptions): Promise<void> {
    if (this.simulate) return;
    if (!this.enabled) throw this.unavailable(WEB_MESSAGE);
    // H5 Games Ads preloads by itself (preloadAdBreaks: "on").
  }

  public async loadRewarded(_options?: RewardedOptions): Promise<void> {
    if (this.simulate) return;
    if (!this.enabled) throw this.unavailable(WEB_MESSAGE);
    if (!(await this.probeRewarded())) throw new Error("No rewarded ad available.");
  }

  public async isInterstitialReady(_options?: AdsPlacementOptions): Promise<ReadyResult> {
    return { value: this.simulate || (this.enabled && this.apiReady && !this.showing) };
  }

  public async isRewardedReady(_options?: AdsPlacementOptions): Promise<ReadyResult> {
    if (this.simulate) return { value: true };
    if (this.enabled && this.apiReady && !this.offer && !this.showing) void this.probeRewarded();
    return { value: !!this.offer && !this.showing };
  }

  public async showInterstitial(options?: InterstitialOptions): Promise<InterstitialResult> {
    const placementId = options?.placementId || this.placements.interstitial;
    if (this.simulate) return { success: true, message: "simulated", placementId };
    if (!this.enabled) return { success: false, message: WEB_MESSAGE, placementId };
    if (this.showing) return { success: false, message: "Another ad is showing.", placementId };

    this.showing = true;
    this.offer = undefined;   // any non-reward break cancels the offered reward
    let opened = false;
    const status = await this.withTimeout<BreakStatus | undefined>(options?.timeoutMs ?? DEFAULT_TIMEOUT_MS, "timeout", (done) => {
      this.adBreak({
        type: "next",
        name: placementId,
        beforeAd: () => { opened = true; this.notifyListeners("interstitialOpened", { placementId }); },
        afterAd: () => this.notifyListeners("interstitialClosed", { placementId }),
        adBreakDone: (info) => done(info.breakStatus),
      });
    });
    this.showing = false;
    this.log("interstitial", placementId, status);
    if (this.autoStart) void this.probeRewarded();

    const success = opened || status === "viewed";
    if (!success) this.notifyListeners("interstitialFailed", { placementId, message: status ?? "unknown", code: status });
    return { success, message: status, placementId };
  }

  public async showRewarded(options?: RewardedOptions): Promise<RewardedResult> {
    const placementId = options?.placementId || this.placements.rewarded;
    const base = { placementId, rewardAmount: options?.rewardAmount, rewardCurrency: options?.rewardCurrency };
    if (this.simulate) return { ...base, success: true, completed: true, message: "simulated" };
    if (!this.enabled) return { ...base, success: false, completed: false, message: WEB_MESSAGE };
    if (this.showing) return { ...base, success: false, completed: false, message: "Another ad is showing." };

    if (!(await this.probeRewarded()) || !this.offer) {
      return { ...base, success: false, completed: false, message: "No rewarded ad available." };
    }
    const showAdFn = this.offer;
    this.offer = undefined;
    this.showing = true;
    const result = await this.withTimeout<RewardShowResult>(REWARDED_TIMEOUT_MS, { shown: false, completed: false, status: "timeout" }, (done) => {
      this.pendingShow = { placementId, completed: false, resolve: done };
      showAdFn();
    });
    this.pendingShow = undefined;
    this.showing = false;
    this.log("rewarded", placementId, result);
    if (this.autoStart) void this.probeRewarded();
    return { ...base, success: result.shown, completed: result.completed, message: result.status };
  }

  /**
   * Asks the API whether a rewarded ad can be offered: it calls beforeReward(showAdFn) right away
   * if one is preloaded, otherwise adBreakDone with the reason. The same break's callbacks then
   * report the show itself, routed to pendingShow.
   */
  private probeRewarded(): Promise<boolean> {
    if (!this.enabled || this.showing) return Promise.resolve(false);
    if (this.offer) return Promise.resolve(true);
    if (this.probe) return this.probe;

    const name = this.placements.rewarded;
    let offered: (() => void) | undefined;
    this.probe = this.withTimeout(DEFAULT_TIMEOUT_MS, false, (settle) => {
      this.adBreak({
        type: "reward",
        name,
        beforeReward: (showAdFn) => {
          offered = showAdFn;
          this.offer = showAdFn;
          this.notifyListeners("rewardedLoaded", { placementId: name });
          settle(true);
        },
        beforeAd: () => {
          if (this.pendingShow) this.notifyListeners("rewardedOpened", { placementId: this.pendingShow.placementId });
        },
        afterAd: () => {
          if (this.pendingShow) this.notifyListeners("rewardedClosed", { placementId: this.pendingShow.placementId });
        },
        adViewed: () => {
          const show = this.pendingShow;
          if (!show) return;
          show.completed = true;
          this.notifyListeners("rewardedCompleted", { placementId: show.placementId });
          this.notifyListeners("rewardedRewardGranted", { placementId: show.placementId, success: true, rewardGranted: true });
        },
        adDismissed: () => this.log("rewarded dismissed before the end"),
        adBreakDone: (info) => {
          const status = info.breakStatus;
          if (offered && this.offer === offered) this.offer = undefined;   // superseded ("ignored") or used up
          const show = this.pendingShow;
          if (show && offered) {
            show.resolve({ shown: status === "viewed" || status === "dismissed", completed: show.completed, status });
          } else if (!offered) {
            this.notifyListeners("rewardedFailed", { placementId: name, message: status ?? "unknown", code: status });
          }
          settle(false);
        },
      });
    }).finally(() => { this.probe = undefined; });
    return this.probe;
  }

  /** Runs `start` and resolves with what it reports, or with `fallback` after `ms` (blocked script, lost callback). */
  private withTimeout<T>(ms: number, fallback: T, start: (done: (value: T) => void) => void): Promise<T> {
    return new Promise<T>((resolve) => {
      let settled = false;
      const timer = setTimeout(() => done(fallback), ms);
      function done(value: T) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(value);
      }
      try {
        start(done);
      } catch (e) {
        this.log("adBreak threw", e);
        done(fallback);
      }
    });
  }

  public async setConsent(options: ConsentOptions): Promise<void> {
    // Personalised ads only with consent; child-directed is always non-personalised.
    this.nonPersonalized = options.childDirected === true || options.gdprConsent === false || options.doNotSell === true;
    if (this.publisherId && this.nonPersonalized) this.adsbygoogle.requestNonPersonalizedAds = 1;
  }

  public async requestTracking(): Promise<{ status: TrackingStatus }> {
    return { status: "unavailable" };
  }

  public async openTestSuite(): Promise<void> {}

  public async destroy(): Promise<void> {
    this.offer = undefined;
  }
}
