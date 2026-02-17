"use client";

import { useEffect } from "react";
import { logEvent } from "firebase/analytics";

import { getFirebaseAnalytics } from "@/lib/firebase/client";

export function FirebaseAnalytics() {
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const analytics = await getFirebaseAnalytics();

      if (!analytics || !isMounted) {
        return;
      }

      logEvent(analytics, "jotlinks_app_loaded");
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  return null;
}
