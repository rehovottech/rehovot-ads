// Thin wrapper around Capacitor platform detection.
import { Capacitor } from "@capacitor/core";

export class Platform {
  // Returns true when running on Android.
  public static isAndroid(): boolean {
    return Capacitor.getPlatform() === "android";
  }

  // Returns true when running on iOS.
  public static isIOS(): boolean {
    return Capacitor.getPlatform() === "ios";
  }

  // Returns true when running in a browser.
  public static isWeb(): boolean {
    return Capacitor.getPlatform() === "web";
  }
}
