import { useCallback } from "react";
import type { PlausibleEventOptions as TrackerEventOptions } from "@plausible-analytics/tracker";

import { type FoobarFlag } from "@/lib/domains/foobar/flags";

export type PlausibleEventsType = {
  foobar: { achievement: FoobarFlag };
};

const PLAUSIBLE_DOMAIN = "sreetamdas.com";
const PLAUSIBLE_PROXY_ENDPOINT = "/prxy/plsbl/api/event";

let isPlausibleInitialized = false;
let trackerModulePromise: Promise<
  typeof import("@plausible-analytics/tracker")
> | null = null;

function getTrackerModule() {
  if (trackerModulePromise) {
    return trackerModulePromise;
  }

  trackerModulePromise = import("@plausible-analytics/tracker");
  return trackerModulePromise;
}

export async function initCustomPlausible() {
  if (typeof window === "undefined" || isPlausibleInitialized) {
    return;
  }

  const { init } = await getTrackerModule();

  init({
    domain: PLAUSIBLE_DOMAIN,
    endpoint: PLAUSIBLE_PROXY_ENDPOINT,
    fileDownloads: true,
    outboundLinks: true,
    logging: import.meta.env.DEV,
  });

  isPlausibleInitialized = true;
}

type PlausibleEventOptions<EventName extends keyof PlausibleEventsType> = {
  props?: PlausibleEventsType[EventName];
  revenue?: {
    currency: string;
    amount: number;
  };
  url?: string;
  u?: string;
};

type PlausibleFn = <EventName extends keyof PlausibleEventsType>(
  eventName: EventName,
  options?: PlausibleEventOptions<EventName>,
) => void;

export function useCustomPlausible() {
  return useCallback<PlausibleFn>((eventName, options) => {
    if (typeof window === "undefined" || !isPlausibleInitialized) {
      return;
    }

    const trackerOptions =
      typeof options === "undefined"
        ? undefined
        : {
            ...options,
            url: options.url ?? options.u,
          };

    void getTrackerModule().then(({ track }) => {
      track(
        eventName as string,
        trackerOptions as unknown as TrackerEventOptions,
      );
    });
  }, []);
}
