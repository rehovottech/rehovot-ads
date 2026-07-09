import Foundation

// Privacy management stays isolated from ad presentation logic.
final class ConsentManager {
    private let logger: Logger
    private var coppaEnabled: Bool = false

    init(logger: Logger) {
        self.logger = logger
    }

    func setConsent(_ options: ConsentRequest) {
        logger.debug("TODO: Apply consent settings to Unity LevelPlay SDK.")
        logger.debug("Consent options: \(options)")
    }

    func setCOPPA(_ enabled: Bool) {
        coppaEnabled = enabled
        logger.debug("TODO: Apply COPPA setting to Unity LevelPlay SDK.")
        logger.debug("COPPA enabled: \(coppaEnabled)")
    }

    func setUserId(_ options: UserRequest) {
        logger.debug("TODO: Apply user identity to Unity LevelPlay SDK.")
        logger.debug("User options: \(options)")
    }

    func destroy() {
        logger.debug("TODO: Reset consent and user identity state.")
        coppaEnabled = false
    }
}
