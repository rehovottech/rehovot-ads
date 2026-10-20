import Foundation

// Rewarded format. A reward is earned only when the player watches to the end (outcome.completed).
final class RewardedManager: FullscreenAdManager {
    init(logger: Logger) {
        super.init(kind: "rewarded", logger: logger)
    }

    override func didFinish(_ outcome: ShowOutcome) {
        guard outcome.completed else { return }
        events?.emit("rewardedCompleted", ["placementId": outcome.placementId])
        events?.emit("rewardedRewardGranted", ["placementId": outcome.placementId])
    }
}
