"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/Toast";

interface MediumUser {
  username: string;
  name: string;
  userId: string;
}

interface PublishResult {
  url: string;
  id: string;
}

export function useMedium() {
  const { notify } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<MediumUser | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Check connection status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/medium/status");
        const data = await response.json();
        setIsConnected(data.connected);
        if (data.connected) {
          setUser({
            username: data.username,
            name: data.name,
            userId: data.userId,
          });
        }
      } catch (error) {
        console.error("Failed to check Medium status:", error);
      }
    };
    checkStatus();
  }, []);

  const connect = useCallback(() => {
    window.location.href = "/api/medium/oauth";
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await fetch("/api/medium/unlink", { method: "POST" });
      setIsConnected(false);
      setUser(null);
      notify("Medium disconnected");
    } catch (error) {
      console.error("Failed to disconnect Medium:", error);
      notify("Failed to disconnect Medium");
    }
  }, [notify]);

  const publish = useCallback(async (
    title: string,
    content: string,
    tags?: string[],
    publishStatus: "public" | "draft" | "unlisted" = "draft"
  ): Promise<PublishResult | null> => {
    setIsPublishing(true);
    try {
      const response = await fetch("/api/medium/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          tags,
          publishStatus,
        }),
      });

      if (!response.ok) throw new Error("Failed to publish");

      const data = await response.json();
      notify(`Published to Medium as ${publishStatus}`);
      return { url: data.url, id: data.id };
    } catch (error) {
      console.error("Failed to publish to Medium:", error);
      notify("Failed to publish to Medium");
      return null;
    } finally {
      setIsPublishing(false);
    }
  }, [notify]);

  return {
    isConnected,
    user,
    isPublishing,
    connect,
    disconnect,
    publish,
  };
}
