"use client";

import { useEffect } from "react";
import { useStore } from "@/stores/store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
