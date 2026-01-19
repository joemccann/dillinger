"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/Toast";

interface DropboxUser {
  name: string;
  email: string;
}

interface DropboxFile {
  name: string;
  path: string;
  isFolder: boolean;
}

interface DropboxState {
  isConnected: boolean;
  isLoading: boolean;
  user: DropboxUser | null;
  files: DropboxFile[];
  currentPath: string;
  pathHistory: string[];
}

export function useDropbox() {
  const [state, setState] = useState<DropboxState>({
    isConnected: false,
    isLoading: true,
    user: null,
    files: [],
    currentPath: "",
    pathHistory: [],
  });

  const { notify } = useToast();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/dropbox/status");
      const data = await response.json();

      setState((s) => ({
        ...s,
        isConnected: data.connected,
        user: data.user || null,
        isLoading: false,
      }));
    } catch (error) {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const connect = useCallback(() => {
    window.location.href = "/api/dropbox/oauth";
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await fetch("/api/dropbox/unlink", { method: "POST" });
      setState((s) => ({
        ...s,
        isConnected: false,
        user: null,
        files: [],
        currentPath: "",
        pathHistory: [],
      }));
      notify("Disconnected from Dropbox");
    } catch (error) {
      notify("Failed to disconnect");
    }
  }, [notify]);

  const fetchFiles = useCallback(
    async (path: string = "") => {
      try {
        notify("Fetching files...", 2000);
        const response = await fetch(`/api/dropbox/files?path=${encodeURIComponent(path)}`);
        const data = await response.json();

        if (response.ok) {
          setState((s) => ({
            ...s,
            files: data,
            currentPath: path,
          }));
        }
      } catch (error) {
        notify("Failed to fetch files");
      }
    },
    [notify]
  );

  const navigateToFolder = useCallback(
    async (path: string) => {
      setState((s) => ({
        ...s,
        pathHistory: [...s.pathHistory, s.currentPath],
      }));
      await fetchFiles(path);
    },
    [fetchFiles]
  );

  const navigateBack = useCallback(async () => {
    setState((s) => {
      const newHistory = [...s.pathHistory];
      const previousPath = newHistory.pop() || "";
      return {
        ...s,
        pathHistory: newHistory,
        currentPath: previousPath,
      };
    });

    const previousPath = state.pathHistory[state.pathHistory.length - 1] || "";
    await fetchFiles(previousPath);
  }, [fetchFiles, state.pathHistory]);

  const fetchFileContent = useCallback(
    async (path: string): Promise<{ content: string; name: string } | null> => {
      try {
        notify("Fetching file...", 2000);
        const response = await fetch("/api/dropbox/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path }),
        });
        const data = await response.json();

        if (response.ok) {
          return { content: data.content, name: data.name };
        }
        return null;
      } catch (error) {
        notify("Failed to fetch file");
        return null;
      }
    },
    [notify]
  );

  const saveFile = useCallback(
    async (path: string, content: string): Promise<boolean> => {
      try {
        notify("Saving to Dropbox...", 3000);
        const response = await fetch("/api/dropbox/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path, content }),
        });

        if (response.ok) {
          notify("Successfully saved to Dropbox!");
          return true;
        } else {
          const data = await response.json();
          throw new Error(data.error);
        }
      } catch (error: any) {
        notify(`Failed to save: ${error.message}`);
        return false;
      }
    },
    [notify]
  );

  const reset = useCallback(() => {
    setState((s) => ({
      ...s,
      files: [],
      currentPath: "",
      pathHistory: [],
    }));
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    fetchFiles,
    navigateToFolder,
    navigateBack,
    fetchFileContent,
    saveFile,
    reset,
  };
}
