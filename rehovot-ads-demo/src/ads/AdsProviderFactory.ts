import { MockProvider } from "./providers/MockProvider";
import { UnityLevelPlayProvider } from "./providers/UnityLevelPlayProvider";
import { WebAdsProvider } from "./providers/WebAdsProvider";
import type { IAdsProvider } from "./IAdsProvider";
import type { ResolvedAdsConfiguration } from "./types";
import { Platform } from "./utils/Platform";

export class AdsProviderFactory {
  public static create(configuration: ResolvedAdsConfiguration): IAdsProvider {
    switch (configuration.provider) {
      case "mock":
        return new MockProvider();
      case "unityLevelPlay":
        return new UnityLevelPlayProvider();
      case "web":
        return new WebAdsProvider();
      case "auto":
      default:
        return AdsProviderFactory.createAutomaticProvider(configuration);
    }
  }

  private static createAutomaticProvider(
    configuration: ResolvedAdsConfiguration,
  ): IAdsProvider {
    if (Platform.isDevelopment()) {
      return new MockProvider();
    }

    if (Platform.isAndroid() || Platform.isIOS()) {
      return new UnityLevelPlayProvider();
    }

    if (Platform.isWeb()) {
      return new WebAdsProvider();
    }

    if (configuration.web.provider !== "none") {
      return new WebAdsProvider();
    }

    return new MockProvider();
  }
}
