package com.rehovottech.levelplay

// Interstitial concerns stay isolated so the native SDK can be swapped later.
class InterstitialManager(
    private val logger: Logger,
) {
    private var ready: Boolean = false

    public fun load(options: InterstitialRequest) {
        logger.d("TODO: Load Interstitial")
        logger.d("Interstitial options: $options")
        ready = false
    }

    public fun show(options: InterstitialRequest) {
        logger.d("TODO: Show Interstitial")
        logger.d("Interstitial options: $options")
    }

    public fun isReady(): Boolean {
        return ready
    }

    public fun destroy() {
        logger.d("TODO: Destroy Interstitial")
        ready = false
    }
}
