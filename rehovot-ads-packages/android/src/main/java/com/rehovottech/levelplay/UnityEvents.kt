package com.rehovottech.levelplay

// Event names are centralized so future listener emission can stay consistent.
object UnityEvents {
    const val INITIALIZED = "initialized"
    const val FAILED = "failed"
    const val BANNER_LOADED = "bannerLoaded"
    const val BANNER_FAILED = "bannerFailed"
    const val BANNER_CLICKED = "bannerClicked"
    const val BANNER_SHOWN = "bannerShown"
    const val BANNER_HIDDEN = "bannerHidden"
    const val INTERSTITIAL_LOADED = "interstitialLoaded"
    const val INTERSTITIAL_FAILED = "interstitialFailed"
    const val INTERSTITIAL_OPENED = "interstitialOpened"
    const val INTERSTITIAL_CLOSED = "interstitialClosed"
    const val REWARDED_LOADED = "rewardedLoaded"
    const val REWARDED_FAILED = "rewardedFailed"
    const val REWARDED_OPENED = "rewardedOpened"
    const val REWARDED_CLOSED = "rewardedClosed"
    const val REWARDED_COMPLETED = "rewardedCompleted"
    const val REWARDED_REWARD_GRANTED = "rewardedRewardGranted"
}
