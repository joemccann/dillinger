"use client";

import { ReactNode } from "react";
import { StoreProvider } from "./StoreProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { I18nProvider } from "@/lib/i18n/I18nProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <I18nProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </I18nProvider>
    </StoreProvider>
  );
}
