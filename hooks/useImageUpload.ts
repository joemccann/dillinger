"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface UploadResult {
  url: string;
  markdown: string;
  filename: string;
  size: number;
  type: string;
}

export function useImageUpload() {
  const { notify } = useToast();
  const { t } = useI18n();
  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.error || "Upload failed");
        }

        const result = await response.json();
        notify(t("toast.uploaded", { name: file.name }));
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : t("toast.uploadFailed");
        notify(message);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [notify, t]
  );

  const uploadFromClipboard = useCallback(
    async (items: DataTransferItemList): Promise<UploadResult | null> => {
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            return upload(file);
          }
        }
      }
      return null;
    },
    [upload]
  );

  return {
    upload,
    uploadFromClipboard,
    isUploading,
  };
}
