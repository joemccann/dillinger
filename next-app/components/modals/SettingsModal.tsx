"use client";

import { useStore } from "@/stores/store";
import { X } from "lucide-react";

export function SettingsModal() {
  const settingsOpen = useStore((state) => state.settingsOpen);
  const settings = useStore((state) => state.settings);
  const toggleSettings = useStore((state) => state.toggleSettings);
  const updateSettings = useStore((state) => state.updateSettings);

  if (!settingsOpen) return null;

  return (
    <div className="fixed inset-0 z-settings">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={toggleSettings}
      />

      {/* Modal */}
      <div className="absolute right-0 top-0 h-full w-80 bg-bg-navbar shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border-settings">
          <h2 className="text-text-invert font-semibold">Settings</h2>
          <button
            onClick={toggleSettings}
            className="text-text-invert hover:text-plum transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Auto Save */}
          <SettingToggle
            label="Auto Save"
            checked={settings.enableAutoSave}
            onChange={(v) => updateSettings({ enableAutoSave: v })}
          />

          {/* Word Count */}
          <SettingToggle
            label="Word Count"
            checked={settings.enableWordsCount}
            onChange={(v) => updateSettings({ enableWordsCount: v })}
          />

          {/* Character Count */}
          <SettingToggle
            label="Character Count"
            checked={settings.enableCharactersCount}
            onChange={(v) => updateSettings({ enableCharactersCount: v })}
          />

          {/* Night Mode */}
          <SettingToggle
            label="Night Mode"
            checked={settings.enableNightMode}
            onChange={(v) => updateSettings({ enableNightMode: v })}
          />

          {/* Tab Size */}
          <div className="flex items-center justify-between">
            <span className="text-text-invert text-sm">Tab Size</span>
            <select
              value={settings.tabSize}
              onChange={(e) => updateSettings({ tabSize: Number(e.target.value) })}
              className="bg-bg-highlight text-text-invert px-2 py-1 rounded text-sm"
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={8}>8</option>
            </select>
          </div>

          {/* Keybindings */}
          <div className="flex items-center justify-between">
            <span className="text-text-invert text-sm">Keybindings</span>
            <select
              value={settings.keybindings}
              onChange={(e) =>
                updateSettings({
                  keybindings: e.target.value as "default" | "vim" | "emacs",
                })
              }
              className="bg-bg-highlight text-text-invert px-2 py-1 rounded text-sm"
            >
              <option value="default">Default</option>
              <option value="vim">Vim</option>
              <option value="emacs">Emacs</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-invert text-sm">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full relative transition-colors ${
          checked ? "bg-plum" : "bg-switchery"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? "left-7" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
