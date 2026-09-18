"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface DriveFile {
  id: string;
  name: string;
  isFolder: boolean;
}

interface FileContent {
  name: string;
  content: string;
}

interface GoogleDriveState {
  isConnected: boolean;
  files: DriveFile[];
  currentFolderId: string;
  pathHistory: string[];
}

export function useGoogleDrive() {
  const { notify } = useToast();
  const { t } = useI18n();
  const [state, setState] = useState<GoogleDriveState>({
    isConnected: false,
    files: [],
    currentFolderId: "root",
    pathHistory: [],
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Check connection status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/google-drive/status");
        const data = await response.json();
        setState((prev) => ({ ...prev, isConnected: data.connected }));
      } catch (error) {
        console.error("Failed to check Google Drive status:", error);
      }
    };
    checkStatus();
  }, []);

  const connect = useCallback(() => {
    window.location.href = "/api/google-drive/oauth";
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await fetch("/api/google-drive/unlink", { method: "POST" });
      setState({
        isConnected: false,
        files: [],
        currentFolderId: "root",
        pathHistory: [],
      });
      notify(t("toast.disconnected", { service: "Google Drive" }));
    } catch (error) {
      console.error("Failed to disconnect Google Drive:", error);
      notify(t("toast.disconnectFailed"));
    }
  }, [notify, t]);

  const fetchFiles = useCallback(async (folderId?: string) => {
    const targetFolderId = folderId || stateRef.current.currentFolderId;
    try {
      const response = await fetch(`/api/google-drive/files?folderId=${targetFolderId}`);
      if (!response.ok) throw new Error("Failed to fetch files");

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        files: data.files,
        currentFolderId: targetFolderId,
      }));
    } catch (error) {
      console.error("Failed to fetch Google Drive files:", error);
      notify(t("toast.fetchFailed"));
    }
  }, [notify, t]);

  const fetchFileContent = useCallback(async (fileId: string): Promise<FileContent | null> => {
    try {
      const response = await fetch("/api/google-drive/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });

      if (!response.ok) throw new Error("Failed to fetch file content");

      return await response.json();
    } catch (error) {
      console.error("Failed to fetch file content:", error);
      notify(t("toast.fetchFailed"));
      return null;
    }
  }, [notify, t]);

  const saveFile = useCallback(async (
    name: string,
    content: string,
    folderId?: string,
    fileId?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/google-drive/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          content,
          folderId: folderId || stateRef.current.currentFolderId,
          fileId,
        }),
      });

      if (!response.ok) throw new Error("Failed to save file");

      notify(t("toast.fileSaved", { service: "Google Drive" }));
      return true;
    } catch (error) {
      console.error("Failed to save to Google Drive:", error);
      notify(t("toast.saveFailed", { error: t("toast.unknownError") }));
      return false;
    }
  }, [notify, t]);

  const navigateToFolder = useCallback((folderId: string) => {
    setState((prev) => ({
      ...prev,
      pathHistory: [...prev.pathHistory, prev.currentFolderId],
    }));
    fetchFiles(folderId);
  }, [fetchFiles]);

  const navigateBack = useCallback(() => {
    const { pathHistory } = stateRef.current;
    if (pathHistory.length === 0) return;

    const newHistory = [...pathHistory];
    const previousFolderId = newHistory.pop() || "root";

    setState((prev) => ({
      ...prev,
      pathHistory: newHistory,
    }));
    fetchFiles(previousFolderId);
  }, [fetchFiles]);

  return {
    isConnected: state.isConnected,
    files: state.files,
    currentFolderId: state.currentFolderId,
    pathHistory: state.pathHistory,
    connect,
    disconnect,
    fetchFiles,
    fetchFileContent,
    saveFile,
    navigateToFolder,
    navigateBack,
  };
}
