# @rehovottech/capacitor-unity-levelplay

Capacitor v7 plugin scaffold for Unity LevelPlay with a provider-ready architecture.

This package is intentionally shipped **without Unity SDK implementation**.
It provides the full public API, typed models, platform-specific native shells, and TODO placeholders so the native SDK layer can be added later without changing the JavaScript contract.

## Features

- Ionic React friendly
- Capacitor v7 compatible
- Android support scaffold in Kotlin
- iOS support scaffold in Swift
- Strongly typed TypeScript API
- Capacitor listener event names defined up front
- No SDK calls yet
- Easy to extend for future providers such as Unity Ads, AppLovin, Chartboost, AdMob, Pangle, InMobi, and Liftoff

## Installation

```bash
npm install @rehovottech/capacitor-unity-levelplay
npx cap sync
```

## Public API

Import the plugin from the package entry point:

```ts
import {
  UnityLevelPlay,
  UnityLevelPlayEventName,
  type InitializeOptions,
  type BannerOptions,
  type InterstitialOptions,
  type RewardedOptions,
  type ConsentOptions,
  type UserOptions,
} from "@rehovottech/capacitor-unity-levelplay";
```

### Methods

- `initialize(options: InitializeOptions): Promise<void>`
- `showBanner(options?: BannerOptions): Promise<void>`
- `hideBanner(): Promise<void>`
- `destroyBanner(): Promise<void>`
- `showInterstitial(options?: InterstitialOptions): Promise<void>`
- `showRewarded(options?: RewardedOptions): Promise<RewardResult>`
- `isInterstitialReady(): Promise<boolean>`
- `isRewardedReady(): Promise<boolean>`
- `setConsent(options: ConsentOptions): Promise<void>`
- `setCOPPA(enabled: boolean): Promise<void>`
- `setUserId(options: UserOptions): Promise<void>`
- `destroy(): Promise<void>`

## Events

Use Capacitor listeners with the exported event enum:

- `initialized`
- `failed`
- `bannerLoaded`
- `bannerFailed`
- `bannerClicked`
- `bannerShown`
- `bannerHidden`
- `interstitialLoaded`
- `interstitialFailed`
- `interstitialOpened`
- `interstitialClosed`
- `rewardedLoaded`
- `rewardedFailed`
- `rewardedOpened`
- `rewardedClosed`
- `rewardedCompleted`
- `rewardedRewardGranted`

### Listener example

```ts
import { UnityLevelPlay, UnityLevelPlayEventName } from "@rehovottech/capacitor-unity-levelplay";

const handle = await UnityLevelPlay.addListener(
  UnityLevelPlayEventName.Initialized,
  (event) => {
    console.log("Unity LevelPlay initialized", event);
  },
);

await handle.remove();
```

The event names are defined now, but native `notifyListeners(...)` calls are intentionally left as TODO placeholders until SDK integration is added.

## Example usage

```ts
import { UnityLevelPlay } from "@rehovottech/capacitor-unity-levelplay";

await UnityLevelPlay.initialize({
  appKey: "your-app-key",
  testMode: true,
  debug: true,
});

await UnityLevelPlay.setUserId({ userId: "player-123" });
await UnityLevelPlay.setCOPPA({ enabled: false });

await UnityLevelPlay.showBanner({
  placementId: "banner-home",
});

const rewardedResult = await UnityLevelPlay.showRewarded({
  placementId: "rewarded-video",
});

if (rewardedResult.rewardGranted) {
  // Grant the in-app reward here.
}
```

## Development status

The native files are architecture only.

TODO placeholders are present for:

- Unity LevelPlay initialization
- Banner loading and display
- Interstitial loading and display
- Rewarded loading and display
- Consent and user metadata propagation
- Future SDK switching logic

## Platform support

- Android
- iOS
- Web fallback stub for Ionic React development

## Native notes

The package is organized so native implementation can later be swapped or expanded for:

- Unity Ads
- Unity LevelPlay
- AppLovin
- Chartboost
- AdMob
- Pangle
- InMobi
- Liftoff

without changing the public TypeScript API.
