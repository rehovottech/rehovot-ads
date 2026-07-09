package com.rehovottech.levelplay

// Privacy responsibilities live here so ad code remains focused on presentation.
class ConsentManager(
    private val logger: Logger,
) {
    private var coppaEnabled: Boolean = false

    public fun setConsent(options: ConsentRequest) {
        logger.d("TODO: Apply consent settings to Unity LevelPlay SDK.")
        logger.d("Consent options: $options")
    }

    public fun setCOPPA(enabled: Boolean) {
        coppaEnabled = enabled
        logger.d("TODO: Apply COPPA setting to Unity LevelPlay SDK.")
        logger.d("COPPA enabled: $coppaEnabled")
    }

    public fun setUserId(options: UserRequest) {
        logger.d("TODO: Apply user identity to Unity LevelPlay SDK.")
        logger.d("User options: $options")
    }

    public fun destroy() {
        logger.d("TODO: Reset consent and user identity state.")
        coppaEnabled = false
    }
}
