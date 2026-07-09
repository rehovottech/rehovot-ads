package com.rehovottech.levelplay

// Banner concerns stay isolated so future SDK adapters can replace only this file.
class BannerManager(
    private val logger: Logger,
) {
    private var isLoaded: Boolean = false

    public fun show(options: BannerRequest) {
        logger.d("TODO: Show Banner")
        logger.d("Banner options: $options")
        isLoaded = false
    }

    public fun hide() {
        logger.d("TODO: Hide Banner")
    }

    public fun destroy() {
        logger.d("TODO: Destroy Banner")
        isLoaded = false
    }

    public fun isLoaded(): Boolean {
        return isLoaded
    }
}
