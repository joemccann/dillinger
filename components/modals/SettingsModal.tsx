"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/stores/store";
import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function SettingsModal() {
  const settingsOpen = useStore((state) => state.settingsOpen);
  const settings = useStore((state) => state.settings);
  const toggleSettings = useStore((state) => state.toggleSettings);
  const updateSettings = useStore((state) => state.updateSettings);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { t } = useI18n();

  // Handle Escape key
  useEffect(() => {
    if (!settingsOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        toggleSettings();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [settingsOpen, toggleSettings]);

  return (
    <div
      className={`fixed inset-0 z-settings transition-opacity duration-300
                  ${settingsOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      style={{ transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={toggleSettings}
        aria-hidden="true"
      />

      <div
        className={`absolute right-0 top-0 h-full w-80 bg-bg-navbar shadow-xl
                    transition-transform duration-300
                    ${settingsOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)" }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border-settings">
          <h2 id="settings-title" className="text-text-invert font-semibold text-balance">{t("settings.title")}</h2>
          <button
            ref={closeButtonRef}
            onClick={toggleSettings}
            aria-label={t("settings.close")}
            className="text-text-invert hover:text-plum transition-colors rounded
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Auto Save */}
          <SettingToggle
            id="auto-save"
            label={t("settings.autoSave")}
            checked={settings.enableAutoSave}
            onChange={(v) => updateSettings({ enableAutoSave: v })}
          />

          {/* Word Count */}
          <SettingToggle
            id="word-count"
            label={t("settings.wordCount")}
            checked={settings.enableWordsCount}
            onChange={(v) => updateSettings({ enableWordsCount: v })}
          />

          {/* Character Count */}
          <SettingToggle
            id="char-count"
            label={t("settings.characterCount")}
            checked={settings.enableCharactersCount}
            onChange={(v) => updateSettings({ enableCharactersCount: v })}
          />

          {/* Night Mode */}
          <SettingToggle
            id="night-mode"
            label={t("settings.nightMode")}
            checked={settings.enableNightMode}
            onChange={(v) => updateSettings({ enableNightMode: v })}
          />

          {/* Scroll Sync */}
          <SettingToggle
            id="scroll-sync"
            label={t("settings.scrollSync")}
            checked={settings.enableScrollSync}
            onChange={(v) => updateSettings({ enableScrollSync: v })}
          />

          {/* Tab Size */}
          <div className="flex items-center justify-between">
            <label htmlFor="tab-size" className="text-text-invert text-sm">{t("settings.tabSize")}</label>
            <select
              id="tab-size"
              value={settings.tabSize}
              onChange={(e) => updateSettings({ tabSize: Number(e.target.value) })}
              className="bg-bg-highlight text-text-invert px-2 py-1 rounded text-sm
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={8}>8</option>
            </select>
          </div>

          {/* Keybindings */}
          <div className="flex items-center justify-between">
            <label htmlFor="keybindings" className="text-text-invert text-sm">{t("settings.keybindings")}</label>
            <select
              id="keybindings"
              value={settings.keybindings}
              onChange={(e) =>
                updateSettings({
                  keybindings: e.target.value as "default" | "vim" | "emacs",
                })
              }
              className="bg-bg-highlight text-text-invert px-2 py-1 rounded text-sm
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
            >
              <option value="default">{t("settings.default")}</option>
              <option value="vim">{t("settings.vim")}</option>
              <option value="emacs">{t("settings.emacs")}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingToggle({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-text-invert text-sm">{label}</label>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full relative transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar ${
          checked ? "bg-plum" : "bg-switchery"
        }`}
      >
        <span
          className={`absolute top-1 size-4 rounded-full bg-white transition-transform ${
            checked ? "left-7" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
