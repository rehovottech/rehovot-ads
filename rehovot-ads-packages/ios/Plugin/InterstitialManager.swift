import Foundation

// Interstitial format: load / show handled by the shared FullscreenAdManager (UnityLevelPlay.swift).
final class InterstitialManager: FullscreenAdManager {
    init(logger: Logger) {
        super.init(kind: "interstitial", logger: logger)
    }
}
