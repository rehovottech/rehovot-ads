package com.rehovottech.levelplay;

import android.content.Context;
import com.unity3d.ads.metadata.MetaData;

/**
 * Privacy choices are forwarded to the Unity Ads SDK as metadata
 * (gdpr.consent, privacy.consent, user.nonbehavioral).
 */
@SuppressWarnings("deprecation")
final class ConsentManager {
    private final Logger logger;

    ConsentManager(Logger logger) {
        this.logger = logger;
    }

    void setConsent(Context context, UnityEvents.ConsentRequest request) {
        logger.debug("setConsent " + request);
        if (request.gdprConsent != null) commit(context, "gdpr.consent", request.gdprConsent);
        // Unity expects "privacy.consent" = true when the user ALLOWS the sale of data.
        if (request.doNotSell != null) commit(context, "privacy.consent", !request.doNotSell);
        if (request.childDirected != null) commit(context, "user.nonbehavioral", request.childDirected);
    }

    private void commit(Context context, String key, boolean value) {
        MetaData metaData = new MetaData(context);
        metaData.set(key, value);
        metaData.commit();
    }
}
