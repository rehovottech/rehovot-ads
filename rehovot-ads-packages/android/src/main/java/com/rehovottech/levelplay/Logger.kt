package com.rehovottech.levelplay

import android.util.Log

// Small logging wrapper so debug output can be enabled without touching business logic.
class Logger(
    private val tag: String,
    private var debugEnabled: Boolean = false,
) {
    public fun setDebugEnabled(enabled: Boolean) {
        debugEnabled = enabled
    }

    public fun d(message: String) {
        if (debugEnabled) {
            Log.d(tag, message)
        }
    }

    public fun i(message: String) {
        if (debugEnabled) {
            Log.i(tag, message)
        }
    }

    public fun w(message: String) {
        if (debugEnabled) {
            Log.w(tag, message)
        }
    }

    public fun e(message: String, throwable: Throwable? = null) {
        if (debugEnabled) {
            Log.e(tag, message, throwable)
        }
    }
}
