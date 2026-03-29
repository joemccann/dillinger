import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { useStore } from "@/stores/store";

const initialState = useStore.getState();

function resetStore() {
  useStore.setState(
    {
      ...initialState,
      documents: [],
      currentDocument: null,
      editorInstance: null,
      settings: { ...initialState.settings },
      sidebarOpen: true,
      settingsOpen: false,
      previewVisible: true,
      zenMode: false,
      editorScrollPercent: 0,
      editorTopLine: 1,
    },
    true
  );
}

describe("SettingsModal", () => {
  beforeEach(() => {
    resetStore();
  });

  it("renders current settings and updates the store via accessible controls", async () => {
    const user = userEvent.setup();

    useStore.setState(
      {
        ...useStore.getState(),
        settingsOpen: true,
      },
      true
    );

    render(<SettingsModal />);

    expect(screen.getByRole("dialog", { name: "Settings" })).toBeVisible();

    const nightModeSwitch = screen.getByRole("switch", { name: "Night Mode" });
    expect(nightModeSwitch).toHaveAttribute("aria-checked", "false");

    await user.click(nightModeSwitch);

    expect(useStore.getState().settings.enableNightMode).toBe(true);
    expect(nightModeSwitch).toHaveAttribute("aria-checked", "true");
  });
});
