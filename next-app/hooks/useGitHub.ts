"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/Toast";

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
}

interface GitHubOrg {
  login: string;
  type?: string;
}

interface GitHubRepo {
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
}

interface GitHubBranch {
  name: string;
  sha: string;
}

interface GitHubFile {
  path: string;
  sha: string;
  url: string;
}

interface GitHubState {
  isConnected: boolean;
  isLoading: boolean;
  user: GitHubUser | null;
  orgs: GitHubOrg[];
  repos: GitHubRepo[];
  branches: GitHubBranch[];
  files: GitHubFile[];
  current: {
    owner: string;
    repo: string;
    branch: string;
    path: string;
    sha: string;
  };
}

const initialCurrent = {
  owner: "",
  repo: "",
  branch: "",
  path: "",
  sha: "",
};

export function useGitHub() {
  const [state, setState] = useState<GitHubState>({
    isConnected: false,
    isLoading: true,
    user: null,
    orgs: [],
    repos: [],
    branches: [],
    files: [],
    current: initialCurrent,
  });

  const { notify } = useToast();

  // Check connection status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/github/status");
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
    window.location.href = "/api/github/oauth";
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await fetch("/api/github/unlink", { method: "POST" });
      setState((s) => ({
        ...s,
        isConnected: false,
        user: null,
        orgs: [],
        repos: [],
        branches: [],
        files: [],
        current: initialCurrent,
      }));
      notify("Disconnected from GitHub");
    } catch (error) {
      notify("Failed to disconnect");
    }
  }, [notify]);

  const fetchOrgs = useCallback(async () => {
    try {
      notify("Fetching organizations...", 2000);
      const response = await fetch("/api/github/orgs");
      const data = await response.json();

      if (response.ok) {
        setState((s) => ({ ...s, orgs: data }));
      }
    } catch (error) {
      notify("Failed to fetch organizations");
    }
  }, [notify]);

  const fetchRepos = useCallback(
    async (owner: string) => {
      try {
        notify("Fetching repositories...", 2000);
        const response = await fetch(`/api/github/repos?owner=${owner}`);
        const data = await response.json();

        if (response.ok) {
          setState((s) => ({
            ...s,
            repos: data.items,
            branches: [],
            files: [],
            current: { ...initialCurrent, owner },
          }));
        }
      } catch (error) {
        notify("Failed to fetch repositories");
      }
    },
    [notify]
  );

  const fetchBranches = useCallback(
    async (repo: string) => {
      const { owner } = state.current;
      try {
        notify("Fetching branches...", 2000);
        const response = await fetch(
          `/api/github/branches?owner=${owner}&repo=${repo}`
        );
        const data = await response.json();

        if (response.ok) {
          setState((s) => ({
            ...s,
            branches: data,
            files: [],
            current: { ...s.current, repo, branch: "", path: "", sha: "" },
          }));
        }
      } catch (error) {
        notify("Failed to fetch branches");
      }
    },
    [state.current.owner, notify]
  );

  const fetchFiles = useCallback(
    async (branch: string) => {
      const { owner, repo } = state.current;
      try {
        notify("Fetching files...", 2000);
        const response = await fetch(
          `/api/github/files?owner=${owner}&repo=${repo}&branch=${branch}`
        );
        const data = await response.json();

        if (response.ok) {
          setState((s) => ({
            ...s,
            files: data,
            current: { ...s.current, branch, path: "", sha: "" },
          }));
        }
      } catch (error) {
        notify("Failed to fetch files");
      }
    },
    [state.current.owner, state.current.repo, notify]
  );

  const fetchFileContent = useCallback(
    async (path: string): Promise<{ content: string; sha: string } | null> => {
      const { owner, repo } = state.current;
      try {
        notify("Fetching file...", 2000);
        const response = await fetch("/api/github/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, path }),
        });
        const data = await response.json();

        if (response.ok) {
          setState((s) => ({
            ...s,
            current: { ...s.current, path, sha: data.sha },
          }));
          return { content: data.content, sha: data.sha };
        }
        return null;
      } catch (error) {
        notify("Failed to fetch file");
        return null;
      }
    },
    [state.current.owner, state.current.repo, notify]
  );

  const saveFile = useCallback(
    async (content: string, message?: string): Promise<boolean> => {
      const { owner, repo, branch, path, sha } = state.current;

      if (!owner || !repo || !branch || !path) {
        notify("No file selected for saving");
        return false;
      }

      try {
        notify("Saving to GitHub...", 3000);
        const response = await fetch("/api/github/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            owner,
            repo,
            branch,
            path,
            content,
            sha,
            message: message || `Update ${path}`,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setState((s) => ({
            ...s,
            current: { ...s.current, sha: data.content.sha },
          }));
          notify("Successfully saved to GitHub!");
          return true;
        } else {
          throw new Error(data.error);
        }
      } catch (error: any) {
        notify(`Failed to save: ${error.message}`);
        return false;
      }
    },
    [state.current, notify]
  );

  const setCurrent = useCallback(
    (updates: Partial<typeof state.current>) => {
      setState((s) => ({
        ...s,
        current: { ...s.current, ...updates },
      }));
    },
    []
  );

  const reset = useCallback(() => {
    setState((s) => ({
      ...s,
      repos: [],
      branches: [],
      files: [],
      current: initialCurrent,
    }));
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    fetchOrgs,
    fetchRepos,
    fetchBranches,
    fetchFiles,
    fetchFileContent,
    saveFile,
    setCurrent,
    reset,
  };
}
