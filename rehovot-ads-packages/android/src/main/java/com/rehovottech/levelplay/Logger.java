package com.rehovottech.levelplay;

import android.util.Log;

/** Lightweight logger; debug output only when enabled from JS (initialize({ debug: true })). */
final class Logger {
    private final String tag;
    private volatile boolean debugEnabled;

    Logger(String tag) {
        this.tag = tag;
    }

    void setDebugEnabled(boolean enabled) {
        debugEnabled = enabled;
    }

    void debug(String message) {
        if (debugEnabled) Log.d(tag, message);
    }

    void info(String message) {
        if (debugEnabled) Log.i(tag, message);
    }

    void warning(String message) {
        Log.w(tag, message);
    }

    void error(String message) {
        Log.e(tag, message);
    }
}
