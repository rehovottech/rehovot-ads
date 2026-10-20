package com.rehovottech.levelplay;

/** Interstitial format: load / show handled by the shared AdManager. */
final class InterstitialManager extends AdManager {
    InterstitialManager(Logger logger) {
        super("interstitial", logger);
    }
}
