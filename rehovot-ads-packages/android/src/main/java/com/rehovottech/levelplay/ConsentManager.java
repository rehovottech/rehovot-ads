package com.rehovottech.levelplay;

import com.unity3d.mediation.LevelPlayPrivacySettings;

/**
 * Privacy choices go to LevelPlay, which forwards them to every mediated network.
 * Set them before initialize(); later calls apply to the next ad requests.
 */
final class ConsentManager {
    private final Logger logger;

    ConsentManager(Logger logger) {
        this.logger = logger;
    }

    void setConsent(UnityEvents.ConsentRequest request) {
        logger.debug("setConsent " + request);
        if (request.gdprConsent != null) LevelPlayPrivacySettings.setGDPRConsent(request.gdprConsent);
        // CCPA: true = the user opted OUT of the sale of personal data.
        if (request.doNotSell != null) LevelPlayPrivacySettings.setCCPA(request.doNotSell);
        if (request.childDirected != null) LevelPlayPrivacySettings.setCOPPA(request.childDirected);
    }
}
