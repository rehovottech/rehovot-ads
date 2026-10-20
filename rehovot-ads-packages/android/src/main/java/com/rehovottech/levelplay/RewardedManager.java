package com.rehovottech.levelplay;

/** Rewarded format. A reward is earned only when the player watches to the end (outcome.completed). */
final class RewardedManager extends AdManager {
    RewardedManager(Logger logger) {
        super("rewarded", logger);
    }

    @Override
    void didFinish(UnityEvents.ShowOutcome outcome) {
        if (!outcome.completed) return;
        emit(UnityEvents.REWARDED_COMPLETED, UnityEvents.data("placementId", outcome.placementId));
        emit(UnityEvents.REWARDED_REWARD_GRANTED, UnityEvents.data("placementId", outcome.placementId));
    }
}
