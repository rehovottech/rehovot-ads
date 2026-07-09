// Provider registry and factory keep provider selection out of AdsService.
import type { AdsConfig } from "../config/AdsConfig";
import type { IAdsProvider } from "../IAdsProvider";
import { MockProvider } from "./MockProvider";
import { UnityProvider } from "./UnityProvider";

export { MockProvider } from "./MockProvider";
export { UnityProvider } from "./UnityProvider";

// Creates the provider requested by configuration.
export function createAdsProvider(config: AdsConfig): IAdsProvider {
  switch (config.provider) {
    case "mock":
      return new MockProvider();
    case "unity":
      return new UnityProvider();
    default:
      // Future providers should be added here without touching AdsService.
      throw new Error(`Unsupported ads provider: ${config.provider}`);
  }
}
