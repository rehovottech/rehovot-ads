package com.rehovottech.levelplay;

import android.app.Activity;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Map;

/** Capacitor bridge only; all native behaviour stays behind UnityLevelPlay. JS name: "CapacitorAds". */
@CapacitorPlugin(name = "CapacitorAds")
public class UnityLevelPlayPlugin extends Plugin {
    private UnityLevelPlay ads;

    @Override
    public void load() {
        ads = new UnityLevelPlay(new Logger("CapacitorAds"));
        ads.setEvents((event, data) -> {
            JSObject payload = new JSObject();
            for (Map.Entry<String, Object> entry : data.entrySet()) payload.put(entry.getKey(), entry.getValue());
            notifyListeners(event, payload);
        });
    }

    private void onMain(Runnable task) {
        Activity activity = getActivity();
        if (activity != null) activity.runOnUiThread(task);
        else ads.interstitial.main.post(task);
    }

    @PluginMethod
    public void initialize(final PluginCall call) {
        JSObject placements = call.getObject("placements", new JSObject());
        final UnityEvents.InitializeRequest request = new UnityEvents.InitializeRequest();
        request.appKey = call.getString("appKey");
        request.testMode = Boolean.TRUE.equals(call.getBoolean("testMode", false));
        request.debug = Boolean.TRUE.equals(call.getBoolean("debug", false));
        request.autoStart = !Boolean.FALSE.equals(call.getBoolean("autoStart", true));
        if (placements != null) {
            request.bannerId = placements.getString("banner");
            request.interstitialId = placements.getString("interstitial");
            request.rewardedId = placements.getString("rewarded");
        }
        onMain(() -> ads.initialize(getContext(), request, failure -> {
            if (failure != null) call.reject(failure.message, failure.code);
            else call.resolve();
        }));
    }

    // Banner

    @PluginMethod
    public void showBanner(final PluginCall call) {
        final String placementId = ads.bannerId(call.getString("placementId"));
        if (placementId == null) {
            call.reject("placementId is required (or set placements.banner in initialize).", "INVALID_CONFIGURATION");
            return;
        }
        final String position = call.getString("position", "bottom");
        onMain(() -> {
            if (getActivity() != null) ads.banner.show(getActivity(), placementId, position);
            call.resolve();
        });
    }

    @PluginMethod
    public void hideBanner(final PluginCall call) {
        onMain(() -> {
            ads.banner.hide();
            call.resolve();
        });
    }

    @PluginMethod
    public void destroyBanner(final PluginCall call) {
        onMain(() -> {
            ads.banner.destroy();
            call.resolve();
        });
    }

    // Full-screen

    @PluginMethod
    public void loadInterstitial(PluginCall call) {
        load(call, ads.interstitial, ads.interstitialId(call.getString("placementId")));
    }

    @PluginMethod
    public void loadRewarded(PluginCall call) {
        load(call, ads.rewarded, ads.rewardedId(call.getString("placementId")));
    }

    @PluginMethod
    public void isInterstitialReady(final PluginCall call) {
        final String id = ads.interstitialId(call.getString("placementId"));
        onMain(() -> resolveValue(call, id != null && ads.interstitial.isReady(id)));
    }

    @PluginMethod
    public void isRewardedReady(final PluginCall call) {
        final String id = ads.rewardedId(call.getString("placementId"));
        onMain(() -> resolveValue(call, id != null && ads.rewarded.isReady(id)));
    }

    @PluginMethod
    public void showInterstitial(final PluginCall call) {
        final String placementId = ads.interstitialId(call.getString("placementId"));
        if (placementId == null) {
            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("message", "No interstitial placement configured.");
            call.resolve(ret);
            return;
        }
        onMain(() -> ads.interstitial.show(placementId, getActivity(), outcome -> {
            JSObject ret = new JSObject();
            ret.put("success", outcome.shown);
            ret.put("message", outcome.message);
            ret.put("placementId", outcome.placementId);
            call.resolve(ret);
        }));
    }

    @PluginMethod
    public void showRewarded(final PluginCall call) {
        final Integer amount = call.getInt("rewardAmount");
        final String currency = call.getString("rewardCurrency");
        final String placementId = ads.rewardedId(call.getString("placementId"));
        if (placementId == null) {
            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("completed", false);
            ret.put("message", "No rewarded placement configured.");
            call.resolve(ret);
            return;
        }
        onMain(() -> ads.rewarded.show(placementId, getActivity(), outcome -> {
            JSObject ret = new JSObject();
            ret.put("success", outcome.shown);
            ret.put("completed", outcome.completed);
            ret.put("message", outcome.message);
            ret.put("placementId", outcome.placementId);
            if (amount != null) ret.put("rewardAmount", amount);
            if (currency != null) ret.put("rewardCurrency", currency);
            call.resolve(ret);
        }));
    }

    private void load(final PluginCall call, final AdManager manager, final String placementId) {
        if (placementId == null) {
            call.reject("placementId is required (or set placements in initialize).", "INVALID_CONFIGURATION");
            return;
        }
        onMain(() -> manager.load(placementId, failure -> {
            if (failure != null) call.reject(failure.message, failure.code);
            else call.resolve();
        }));
    }

    private void resolveValue(PluginCall call, boolean value) {
        JSObject ret = new JSObject();
        ret.put("value", value);
        call.resolve(ret);
    }

    // Privacy

    @PluginMethod
    public void setConsent(PluginCall call) {
        UnityEvents.ConsentRequest request = new UnityEvents.ConsentRequest();
        request.gdprConsent = call.getBoolean("gdprConsent");
        request.doNotSell = call.getBoolean("doNotSell");
        request.childDirected = call.getBoolean("childDirected");
        ads.consent.setConsent(getContext(), request);
        call.resolve();
    }

    @PluginMethod
    public void requestTracking(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("status", "unavailable");
        call.resolve(ret);
    }

    @PluginMethod
    public void destroy(final PluginCall call) {
        onMain(() -> {
            ads.destroy();
            call.resolve();
        });
    }
}
