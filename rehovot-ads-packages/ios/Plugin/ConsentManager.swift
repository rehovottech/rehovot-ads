import Foundation
import IronSource

// Privacy choices go to LevelPlay, which forwards them to every mediated network.
// Set them before initialize(); later calls apply to the next ad requests.
final class ConsentManager {
    private let logger: Logger

    init(logger: Logger) {
        self.logger = logger
    }

    func setConsent(_ options: ConsentRequest) {
        logger.debug("setConsent \(options)")
        if let gdpr = options.gdprConsent { LPMPrivacySettings.setGDPRConsent(gdpr) }
        // CCPA: true = the user opted OUT of the sale of personal data.
        if let doNotSell = options.doNotSell { LPMPrivacySettings.setCCPA(doNotSell) }
        if let child = options.childDirected { LPMPrivacySettings.setCOPPA(child) }
    }
}
