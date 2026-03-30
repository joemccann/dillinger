"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/stores/store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (!hasHydrated.current) {
      useStore.getState().hydrate();
      hasHydrated.current = true;
    }
  }, []);

  return <>{children}</>;
}
