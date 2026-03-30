"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/Toast";

interface Workspace {
  slug: string;
  name: string;
}

interface Repo {
  slug: string;
  name: string;
}

interface Branch {
  name: string;
}

interface FileItem {
  path: string;
  name: string;
  isFolder: boolean;
}

interface FileContent {
  name: string;
  content: string;
  path: string;
}

interface BitbucketState {
  isConnected: boolean;
  workspaces: Workspace[];
  repos: Repo[];
  branches: Branch[];
  files: FileItem[];
  selectedWorkspace: string | null;
  selectedRepo: string | null;
  selectedBranch: string | null;
  currentPath: string;
  pathHistory: string[];
}

export function useBitbucket() {
  const { notify } = useToast();
  const [state, setState] = useState<BitbucketState>({
    isConnected: false,
    workspaces: [],
    repos: [],
    branches: [],
    files: [],
    selectedWorkspace: null,
    selectedRepo: null,
    selectedBranch: null,
    currentPath: "",
    pathHistory: [],
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Check connection status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/bitbucket/status");
        const data = await response.json();
        setState((prev) => ({ ...prev, isConnected: data.connected }));
      } catch (error) {
        console.error("Failed to check Bitbucket status:", error);
      }
    };
    checkStatus();
  }, []);

  const connect = useCallback(() => {
    window.location.href = "/api/bitbucket/oauth";
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await fetch("/api/bitbucket/unlink", { method: "POST" });
      setState({
        isConnected: false,
        workspaces: [],
        repos: [],
        branches: [],
        files: [],
        selectedWorkspace: null,
        selectedRepo: null,
        selectedBranch: null,
        currentPath: "",
        pathHistory: [],
      });
      notify("Bitbucket disconnected");
    } catch (error) {
      console.error("Failed to disconnect Bitbucket:", error);
      notify("Failed to disconnect Bitbucket");
    }
  }, [notify]);

  const fetchWorkspaces = useCallback(async () => {
    try {
      const response = await fetch("/api/bitbucket/workspaces");
      if (!response.ok) throw new Error("Failed to fetch workspaces");

      const data = await response.json();
      setState((prev) => ({ ...prev, workspaces: data.workspaces }));
    } catch (error) {
      console.error("Failed to fetch workspaces:", error);
      notify("Failed to fetch workspaces");
    }
  }, [notify]);

  const selectWorkspace = useCallback(async (workspace: string) => {
    try {
      const response = await fetch(`/api/bitbucket/repos?workspace=${workspace}`);
      if (!response.ok) throw new Error("Failed to fetch repos");

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        selectedWorkspace: workspace,
        selectedRepo: null,
        selectedBranch: null,
        repos: data.repos,
        branches: [],
        files: [],
        currentPath: "",
        pathHistory: [],
      }));
    } catch (error) {
      console.error("Failed to fetch repos:", error);
      notify("Failed to fetch repos");
    }
  }, [notify]);

  const selectRepo = useCallback(async (repo: string) => {
    const { selectedWorkspace } = stateRef.current;
    if (!selectedWorkspace) return;

    try {
      const response = await fetch(
        `/api/bitbucket/branches?workspace=${selectedWorkspace}&repo=${repo}`
      );
      if (!response.ok) throw new Error("Failed to fetch branches");

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        selectedRepo: repo,
        selectedBranch: null,
        branches: data.branches,
        files: [],
        currentPath: "",
        pathHistory: [],
      }));
    } catch (error) {
      console.error("Failed to fetch branches:", error);
      notify("Failed to fetch branches");
    }
  }, [notify]);

  const selectBranch = useCallback(async (branch: string) => {
    const { selectedWorkspace, selectedRepo } = stateRef.current;
    if (!selectedWorkspace || !selectedRepo) return;

    try {
      const response = await fetch(
        `/api/bitbucket/files?workspace=${selectedWorkspace}&repo=${selectedRepo}&branch=${branch}`
      );
      if (!response.ok) throw new Error("Failed to fetch files");

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        selectedBranch: branch,
        files: data.files,
        currentPath: "",
        pathHistory: [],
      }));
    } catch (error) {
      console.error("Failed to fetch files:", error);
      notify("Failed to fetch files");
    }
  }, [notify]);

  const navigateToFolder = useCallback(async (path: string) => {
    const { selectedWorkspace, selectedRepo, selectedBranch, currentPath } = stateRef.current;
    if (!selectedWorkspace || !selectedRepo || !selectedBranch) return;

    try {
      const response = await fetch(
        `/api/bitbucket/files?workspace=${selectedWorkspace}&repo=${selectedRepo}&branch=${selectedBranch}&path=${path}`
      );
      if (!response.ok) throw new Error("Failed to fetch files");

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        files: data.files,
        currentPath: path,
        pathHistory: [...prev.pathHistory, currentPath],
      }));
    } catch (error) {
      console.error("Failed to navigate folder:", error);
      notify("Failed to navigate folder");
    }
  }, [notify]);

  const navigateBack = useCallback(async () => {
    const { selectedWorkspace, selectedRepo, selectedBranch, pathHistory } = stateRef.current;
    if (!selectedWorkspace || !selectedRepo || !selectedBranch || pathHistory.length === 0) return;

    const newHistory = [...pathHistory];
    const previousPath = newHistory.pop() || "";

    try {
      const response = await fetch(
        `/api/bitbucket/files?workspace=${selectedWorkspace}&repo=${selectedRepo}&branch=${selectedBranch}&path=${previousPath}`
      );
      if (!response.ok) throw new Error("Failed to fetch files");

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        files: data.files,
        currentPath: previousPath,
        pathHistory: newHistory,
      }));
    } catch (error) {
      console.error("Failed to navigate back:", error);
      notify("Failed to navigate back");
    }
  }, [notify]);

  const fetchFileContent = useCallback(async (path: string): Promise<FileContent | null> => {
    const { selectedWorkspace, selectedRepo, selectedBranch } = stateRef.current;
    if (!selectedWorkspace || !selectedRepo || !selectedBranch) return null;

    try {
      const response = await fetch("/api/bitbucket/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace: selectedWorkspace,
          repo: selectedRepo,
          branch: selectedBranch,
          path,
        }),
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
    path: string,
    content: string,
    message?: string
  ): Promise<boolean> => {
    const { selectedWorkspace, selectedRepo, selectedBranch } = stateRef.current;
    if (!selectedWorkspace || !selectedRepo || !selectedBranch) return false;

    try {
      const response = await fetch("/api/bitbucket/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace: selectedWorkspace,
          repo: selectedRepo,
          branch: selectedBranch,
          path,
          content,
          message,
        }),
      });

      if (!response.ok) throw new Error("Failed to save file");

      notify("File saved to Bitbucket");
      return true;
    } catch (error) {
      console.error("Failed to save to Bitbucket:", error);
      notify("Failed to save file");
      return false;
    }
  }, [notify]);

  return {
    isConnected: state.isConnected,
    workspaces: state.workspaces,
    repos: state.repos,
    branches: state.branches,
    files: state.files,
    selectedWorkspace: state.selectedWorkspace,
    selectedRepo: state.selectedRepo,
    selectedBranch: state.selectedBranch,
    currentPath: state.currentPath,
    pathHistory: state.pathHistory,
    connect,
    disconnect,
    fetchWorkspaces,
    selectWorkspace,
    selectRepo,
    selectBranch,
    navigateToFolder,
    navigateBack,
    fetchFileContent,
    saveFile,
  };
}
