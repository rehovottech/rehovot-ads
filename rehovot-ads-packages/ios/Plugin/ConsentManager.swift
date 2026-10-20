import Foundation
import UnityAds

// Privacy choices are forwarded to the Unity Ads SDK as metadata.
// Docs: https://docs.unity.com/en-us/grow/ads/privacy (gdpr.consent, privacy.consent, user.nonbehavioral)
final class ConsentManager {
    private let logger: Logger

    init(logger: Logger) {
        self.logger = logger
    }

    func setConsent(_ options: ConsentRequest) {
        logger.debug("setConsent \(options)")
        if let gdpr = options.gdprConsent {
            commit("gdpr.consent", gdpr)
        }
        if let doNotSell = options.doNotSell {
            // Unity expects "privacy.consent" = true when the user ALLOWS the sale of data.
            commit("privacy.consent", !doNotSell)
        }
        if let child = options.childDirected {
            commit("user.nonbehavioral", child)
        }
    }

    private func commit(_ key: String, _ value: Bool) {
        let metadata = UADSMetaData()
        metadata.set(key, value: value)
        metadata.commit()
    }
}
