import { useEffect, useState } from "react";
import { Ads } from "../../src/ads";
import AdsConfig from "./AdsConfig";

export function AdsExample(): JSX.Element {
  const [status, setStatus] = useState("Idle");

  useEffect(() => {
    void (async () => {
      const result = await Ads.initialize(AdsConfig);
      setStatus(result.message);
    })();
  }, []);

  return (
    <div>
      <p>{status}</p>
      <button
        type="button"
        onClick={() => {
          void Ads.showBanner();
        }}
      >
        Show Banner
      </button>
      <button
        type="button"
        onClick={() => {
          void Ads.showInterstitial();
        }}
      >
        Show Interstitial
      </button>
      <button
        type="button"
        onClick={() => {
          void (async () => {
            const reward = await Ads.showRewarded();
            setStatus(reward.message);
          })();
        }}
      >
        Show Rewarded
      </button>
    </div>
  );
}
