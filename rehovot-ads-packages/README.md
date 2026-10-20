# @rehovottech/capacitor-ads

Reusable Capacitor 8 ad bridge for Rehovot games.
Native backend: **Unity Ads SDK 4.20** (interstitial, rewarded, banner) on Android and iOS, with a silent web fallback.

The JavaScript contract (`src/definitions.ts`) is provider-neutral, so the native backend can later move to
Unity LevelPlay mediation (or another network) without changing game code.

## Install

```bash
npm install file:../../plugins/rehovot-ads/rehovot-ads-packages   # from a game folder
npx cap sync
```

- **iOS** pulls the `UnityAds` pod (CocoaPods). Xcode 26+ is required by Unity Ads 4.18+.
  Add `NSUserTrackingUsageDescription` and Unity's `SKAdNetworkItems` to the app's `Info.plist`.
- **Android** pulls `com.unity3d.ads:unity-ads:4.20.1`. Override with `unityAdsVersion` in `variables.gradle`.

## Usage

```ts
import { CapacitorAds } from "@rehovottech/capacitor-ads";

await CapacitorAds.setConsent({ gdprConsent: true, doNotSell: false });
await CapacitorAds.requestTracking();                // iOS ATT prompt; "unavailable" elsewhere

await CapacitorAds.initialize({
  appKey: "1234567",                                 // Unity Game ID for this platform
  testMode: true,
  placements: { interstitial: "Interstitial_Android", rewarded: "Rewarded_Android" },
});                                                   // autoStart (default) preloads both formats

if ((await CapacitorAds.isRewardedReady()).value) {
  const r = await CapacitorAds.showRewarded();
  if (r.completed) {
    // grant the reward
  }
}

const i = await CapacitorAds.showInterstitial();     // resolves when closed; i.success = was shown
```

After each show the plugin reloads that placement automatically. Failed loads retry with a back-off of 5 s, 10 s, 20 s … up to 60 s.

## Methods

| Method | Notes |
|---|---|
| `initialize({ appKey, testMode, debug, autoStart, placements })` | Rejects with `INVALID_CONFIGURATION` or `INIT_FAILED` |
| `loadInterstitial / loadRewarded({ placementId? })` | Optional; resolves once filled |
| `isInterstitialReady / isRewardedReady({ placementId? })` | `{ value: boolean }` |
| `showInterstitial({ placementId? })` | `{ success, message }` |
| `showRewarded({ placementId? })` | `{ success, completed }`; grant the reward only when `completed` |
| `showBanner({ placementId?, position })`, `hideBanner()`, `destroyBanner()` | 320×50, top or bottom safe area |
| `setConsent({ gdprConsent?, doNotSell?, childDirected? })` | Unity metadata `gdpr.consent`, `privacy.consent`, `user.nonbehavioral` |
| `requestTracking()` | iOS 14+ App Tracking Transparency |
| `destroy()` | |

## Events

`initialized`, `failed`, `interstitialLoaded|Failed|Opened|Closed`, `rewardedLoaded|Failed|Opened|Closed`,
`rewardedCompleted`, `rewardedRewardGranted`, `bannerLoaded|Failed|Shown|Hidden|Clicked`.
Payload: `{ placementId?, message?, code? }`.

```ts
const handle = await CapacitorAds.addListener("rewardedRewardGranted", (e) => console.log(e.placementId));
```

## Native layout

- `ios/Plugin/` (Swift): `UnityLevelPlayPlugin.swift` is the bridge. `UnityLevelPlay.swift` holds the facade and the shared full-screen state machine. Each format has its own manager.
- `android/src/main/java/com/rehovottech/levelplay/` (Java), same structure. The old `.kt` stubs are now empty and can be deleted.

## Unity SDK note

Unity deprecated the classic `UnityAds.load` / `UnityAds.show` API in 4.19 and removes it in **5.0**.
The plugin uses the classic API and pins the 4.x range: Android uses `4.20.1` and the iOS pod is `~> 4.20`.
Before moving to Unity Ads 5, port the full-screen managers to `InterstitialAd` and `RewardedAd`. The JavaScript API stays the same.
