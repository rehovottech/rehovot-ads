import type {
  AdsEventListener,
  AdsEventName,
  AdsEventPayloadMap,
} from "./types";

type AnyAdsEventListener = (
  payload: AdsEventPayloadMap[AdsEventName],
) => void;

export class AdsEventBus {
  private readonly listeners = new Map<AdsEventName, Set<AnyAdsEventListener>>();

  public on<TEvent extends AdsEventName>(
    eventName: TEvent,
    listener: AdsEventListener<TEvent>,
  ): () => void {
    const listeners =
      this.listeners.get(eventName) ?? new Set<AnyAdsEventListener>();
    listeners.add(listener as AnyAdsEventListener);
    this.listeners.set(eventName, listeners);

    return () => {
      listeners.delete(listener as AnyAdsEventListener);
      if (listeners.size === 0) {
        this.listeners.delete(eventName);
      }
    };
  }

  public emit<TEvent extends AdsEventName>(
    eventName: TEvent,
    payload: AdsEventPayloadMap[TEvent],
  ): void {
    const listeners = this.listeners.get(eventName);
    if (listeners === undefined) {
      return;
    }

    for (const listener of listeners) {
      (listener as AdsEventListener<TEvent>)(payload);
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}
