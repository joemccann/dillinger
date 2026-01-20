"use client";

import { ReactNode } from "react";
import { StoreProvider } from "./StoreProvider";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </StoreProvider>
  );
}
