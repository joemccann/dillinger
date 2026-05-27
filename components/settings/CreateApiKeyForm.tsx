"use client";

import { useState } from "react";
import { Copy, Check, Plus } from "lucide-react";

export function CreateApiKeyForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "Default" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setNewKey(data.key.plaintext);
      setName("");
    } catch {
      setError("Failed to create key");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {newKey && (
        <div className="mb-6 p-4 bg-plum/10 border border-plum/30 rounded-lg">
          <p className="text-sm font-medium mb-2">
            Your new API key (shown once):
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-bg-highlight text-text-primary px-3 py-2 rounded text-sm font-mono break-all">
              {newKey}
            </code>
            <button
              onClick={handleCopy}
              className="shrink-0 p-2 text-plum hover:opacity-70 transition-opacity"
              title="Copy to clipboard"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
          <p className="text-xs text-text-muted mt-2">
            Copy this key now. You will not be able to see it again.
          </p>
          <button
            onClick={() => {
              setNewKey(null);
              window.location.reload();
            }}
            className="text-xs text-plum mt-2 hover:underline"
          >
            Done
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Key name (optional)"
          className="flex-1 px-3 py-2 rounded border border-border-light text-sm
                     focus:border-plum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
        />
        <button
          onClick={handleCreate}
          disabled={loading}
          className="flex items-center gap-2 bg-plum text-bg-sidebar px-4 py-2 rounded font-medium text-sm
                     hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Plus size={16} />
          {loading ? "Creating..." : "Create Key"}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
