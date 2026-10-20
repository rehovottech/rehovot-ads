import { Capacitor } from "@capacitor/core";

export type RuntimePlatform = "android" | "ios" | "web" | "desktop" | "unknown";

export class Platform {
  public static isAndroid(): boolean {
    return Capacitor.getPlatform() === "android";
  }

  public static isIOS(): boolean {
    return Capacitor.getPlatform() === "ios";
  }

  public static isWeb(): boolean {
    return Capacitor.getPlatform() === "web";
  }

  public static isDevelopment(): boolean {
    return Boolean(import.meta.env.DEV);
  }

  public static getRuntimePlatform(): RuntimePlatform {
    if (Platform.isAndroid()) {
      return "android";
    }

    if (Platform.isIOS()) {
      return "ios";
    }

    if (Platform.isWeb()) {
      return Platform.isDesktopBrowser() ? "desktop" : "web";
    }

    return "unknown";
  }

  private static isDesktopBrowser(): boolean {
    if (typeof navigator === "undefined") {
      return false;
    }

    return /(macintosh|windows|linux)/i.test(navigator.userAgent);
  }
}
