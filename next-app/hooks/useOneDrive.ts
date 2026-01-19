"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/Toast";

interface DriveFile {
  id: string;
  name: string;
  isFolder: boolean;
}

interface FileContent {
  name: string;
  content: string;
}

interface OneDriveState {
  isConnected: boolean;
  files: DriveFile[];
  currentFolderId: string;
  pathHistory: string[];
}

export function useOneDrive() {
  const { notify } = useToast();
  const [state, setState] = useState<OneDriveState>({
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
        const response = await fetch("/api/onedrive/status");
        const data = await response.json();
        setState((prev) => ({ ...prev, isConnected: data.connected }));
      } catch (error) {
        console.error("Failed to check OneDrive status:", error);
      }
    };
    checkStatus();
  }, []);

  const connect = useCallback(() => {
    window.location.href = "/api/onedrive/oauth";
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await fetch("/api/onedrive/unlink", { method: "POST" });
      setState({
        isConnected: false,
        files: [],
        currentFolderId: "root",
        pathHistory: [],
      });
      notify("OneDrive disconnected");
    } catch (error) {
      console.error("Failed to disconnect OneDrive:", error);
      notify("Failed to disconnect OneDrive");
    }
  }, [notify]);

  const fetchFiles = useCallback(async (folderId?: string) => {
    const targetFolderId = folderId || stateRef.current.currentFolderId;
    try {
      const response = await fetch(`/api/onedrive/files?folderId=${targetFolderId}`);
      if (!response.ok) throw new Error("Failed to fetch files");

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        files: data.files,
        currentFolderId: targetFolderId,
      }));
    } catch (error) {
      console.error("Failed to fetch OneDrive files:", error);
      notify("Failed to fetch files");
    }
  }, [notify]);

  const fetchFileContent = useCallback(async (fileId: string): Promise<FileContent | null> => {
    try {
      const response = await fetch("/api/onedrive/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });

      if (!response.ok) throw new Error("Failed to fetch file content");

      return await response.json();
    } catch (error) {
      console.error("Failed to fetch file content:", error);
      notify("Failed to fetch file content");
      return null;
    }
  }, [notify]);

  const saveFile = useCallback(async (
    name: string,
    content: string,
    folderId?: string,
    fileId?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/onedrive/save", {
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

      notify("File saved to OneDrive");
      return true;
    } catch (error) {
      console.error("Failed to save to OneDrive:", error);
      notify("Failed to save file");
      return false;
    }
  }, [notify]);

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
