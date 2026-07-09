import { registerPlugin } from "@capacitor/core";
import type { UnityLevelPlayPlugin } from "./definitions";

// The exported singleton keeps the public JS API stable for all future native SDK swaps.
export const UnityLevelPlay = registerPlugin<UnityLevelPlayPlugin>("UnityLevelPlay", {
  web: () => import("./web").then((m) => new m.UnityLevelPlayWeb()),
});

// Re-export the public contract from the package root.
export * from "./definitions";
export * from "./enums";
export * from "./events";
export * from "./models";
