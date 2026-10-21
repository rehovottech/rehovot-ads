# @rehovottech/capacitor-ads

Reusable Capacitor 8 ad bridge for Rehovot games.
Native backend: **Unity LevelPlay mediation SDK 9.x** (interstitial, rewarded, banner) on Android and iOS, with a silent web fallback.

The plugin ships only the mediation SDK. Each game picks its ad networks by adding LevelPlay adapters
(e.g. Unity Ads + AdMob) to its own native projects. The JavaScript contract (`src/definitions.ts`) is provider-neutral.

## Install

```bash
npm install file:../../plugins/rehovot-ads/rehovot-ads-packages   # from a game folder
npx cap sync
```

- **iOS** pulls `IronSourceSDK/Ads ~> 9.6` (CocoaPods). The game's Podfile needs `use_frameworks! :linkage => :static`
  and the adapters it wants, e.g. `pod 'IronSourceUnityAdsAdapter'`, `pod 'IronSourceAdMobAdapter'`.
  `Info.plist` needs `NSUserTrackingUsageDescription`, the `SKAdNetworkItems` list from LevelPlay and, with AdMob,
  `GADApplicationIdentifier`.
- **Android** pulls `com.unity3d.ads-mediation:mediation-sdk:9.6.1`. Override with `levelPlayVersion` in `variables.gradle`.
  The game's `app/build.gradle` adds the adapters, e.g. `com.unity3d.ads-mediation:unityads-adapter` and `admob-adapter`.
  With AdMob, the Android AdMob App ID is entered in the LevelPlay dashboard.

Full walkthrough (dashboard, IDs, testing, release): `turns/exclude/doc/levelplay-ads-setup.md`.

## Usage

```ts
import { CapacitorAds } from "@rehovottech/capacitor-ads";

await CapacitorAds.setConsent({ gdprConsent: true, doNotSell: false });
await CapacitorAds.requestTracking();                // iOS ATT prompt; "unavailable" elsewhere

await CapacitorAds.initialize({
  appKey: "1f2e3d4c5",                               // LevelPlay App Key for this platform
  testMode: true,
  placements: { interstitial: "<ad unit id>", rewarded: "<ad unit id>" },
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
| `openTestSuite()` | LevelPlay Test Suite (needs `testMode: true`) |
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

## LevelPlay notes

- `appKey` is the LevelPlay **App Key**. Placement ids passed to `placements` / `placementId` are LevelPlay **ad unit ids**.
- One `LevelPlayInterstitialAd` / `LevelPlayRewardedAd` (iOS `LPMInterstitialAd` / `LPMRewardedAd`) is kept per ad unit and
  reloaded after each show.
- `showRewarded` resolves `completed: true` only when `onAdRewarded` / `didRewardAd` fired. That callback may arrive just
  after close, so the plugin waits 500 ms for it.
- `setConsent` maps to `LevelPlayPrivacySettings` (GDPR, CCPA, COPPA). Call it before `initialize`.
- `testMode: true` enables the LevelPlay Test Suite (`openTestSuite()`). Test ads come from registering devices under
  LevelPlay > Setup > Test devices.
