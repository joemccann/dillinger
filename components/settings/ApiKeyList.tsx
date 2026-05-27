"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export function ApiKeyList({ initialKeys }: { initialKeys: ApiKeyItem[] }) {
  const [keys, setKeys] = useState(initialKeys);

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;

    const res = await fetch(`/api/v1/keys/${id}`, { method: "DELETE" });
    if (res.ok) {
      setKeys((prev) => prev.filter((k) => k.id !== id));
    }
  };

  if (keys.length === 0) {
    return (
      <p className="text-text-muted text-sm py-4">
        No active API keys. Create one above to get started.
      </p>
    );
  }

  return (
    <div className="border border-border-light rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-bg-highlight/30 border-b border-border-light">
            <th className="text-left py-3 px-4 font-medium text-text-muted">
              Name
            </th>
            <th className="text-left py-3 px-4 font-medium text-text-muted">
              Key
            </th>
            <th className="text-left py-3 px-4 font-medium text-text-muted hidden sm:table-cell">
              Created
            </th>
            <th className="text-left py-3 px-4 font-medium text-text-muted hidden sm:table-cell">
              Last Used
            </th>
            <th className="py-3 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => (
            <tr
              key={key.id}
              className="border-b border-border-light/50 last:border-0"
            >
              <td className="py-3 px-4">{key.name}</td>
              <td className="py-3 px-4 font-mono text-text-muted text-xs">
                dk_{key.keyPrefix}...
              </td>
              <td className="py-3 px-4 text-text-muted hidden sm:table-cell">
                {new Date(key.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3 px-4 text-text-muted hidden sm:table-cell">
                {key.lastUsedAt
                  ? new Date(key.lastUsedAt).toLocaleDateString()
                  : "Never"}
              </td>
              <td className="py-3 px-4 text-right">
                <button
                  onClick={() => handleRevoke(key.id)}
                  className="text-red-400 hover:text-red-300 transition-colors p-1 rounded
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  title="Revoke key"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
