"use client";

import { useSyncExternalStore } from "react";
import {
  CAMPUS_ATTRIBUTION_EVENT,
  readCampusAttribution,
  type CampusAttribution,
} from "./campus-attribution";

/** Stable null for server snapshot and empty client reads. */
const NULL_ATTRIBUTION: CampusAttribution | null = null;

let cachedKey = "";
let cachedAttribution: CampusAttribution | null = NULL_ATTRIBUTION;

function getSnapshot(): CampusAttribution | null {
  const value = readCampusAttribution();
  if (value === null) {
    cachedKey = "";
    cachedAttribution = NULL_ATTRIBUTION;
    return NULL_ATTRIBUTION;
  }
  const key = `${value.slug}\0${value.capturedAt}`;
  if (key === cachedKey) {
    return cachedAttribution;
  }
  cachedKey = key;
  cachedAttribution = value;
  return value;
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CAMPUS_ATTRIBUTION_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CAMPUS_ATTRIBUTION_EVENT, onStoreChange);
  };
}

/**
 * Subscribe to campus attribution in localStorage (first-touch campaign data).
 * Returns null on the server and before hydration matches client.
 */
export function useCampusAttribution(): CampusAttribution | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => NULL_ATTRIBUTION);
}
