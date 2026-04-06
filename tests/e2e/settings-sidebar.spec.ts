import { test, expect } from "@playwright/test";

const seededDocuments = [
  {
    id: "doc-alpha",
    title: "Alpha.md",
    body: "# Alpha\n\nFirst document body.",
    createdAt: "2026-03-10T00:00:00.000Z",
  },
  {
    id: "doc-beta",
    title: "Beta.md",
    body: "# Beta\n\nSecond document body.",
    createdAt: "2026-03-11T00:00:00.000Z",
  },
];

const defaultProfile = {
  enableAutoSave: true,
  enableWordsCount: true,
  enableCharactersCount: true,
  enableScrollSync: true,
  tabSize: 4,
  keybindings: "default",
  enableNightMode: false,
  enableGitHubComment: true,
};

function seedLocalStorage(
  documents = seededDocuments,
  current = seededDocuments[0],
  profile = defaultProfile
) {
  return (args: {
    documents: typeof seededDocuments;
    current: (typeof seededDocuments)[0];
    profile: typeof defaultProfile;
  }) => {
    // Only seed if localStorage is empty (avoids overwriting on reload)
    if (window.localStorage.getItem("files")) return;
    window.localStorage.setItem("files", JSON.stringify(args.documents));
    window.localStorage.setItem("currentDocument", JSON.stringify(args.current));
    window.localStorage.setItem("profileV3", JSON.stringify(args.profile));
  };
}

/* -------------------------------------------------------------------------- */
/*  Settings Tests                                                            */
/* -------------------------------------------------------------------------- */

test.describe("Settings modal", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      seedLocalStorage(),
      { documents: seededDocuments, current: seededDocuments[0], profile: defaultProfile }
    );
    await page.goto("/");
  });

  test("opens via gear icon", async ({ page }) => {
    await page.getByRole("button", { name: "Open settings" }).click();
    await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
  });

  test("toggles night mode", async ({ page }) => {
    await page.getByRole("button", { name: "Open settings" }).click();

    const nightModeSwitch = page.getByRole("switch", { name: "Night Mode" });
    await expect(nightModeSwitch).toHaveAttribute("aria-checked", "false");

    await nightModeSwitch.click();
    await expect(nightModeSwitch).toHaveAttribute("aria-checked", "true");

    await nightModeSwitch.click();
    await expect(nightModeSwitch).toHaveAttribute("aria-checked", "false");
  });

  test("changes tab size", async ({ page }) => {
    await page.getByRole("button", { name: "Open settings" }).click();

    const tabSizeSelect = page.locator("#tab-size");
    await expect(tabSizeSelect).toHaveValue("4");

    await tabSizeSelect.selectOption("2");
    await expect(tabSizeSelect).toHaveValue("2");

    await tabSizeSelect.selectOption("8");
    await expect(tabSizeSelect).toHaveValue("8");
  });

  test("changes keybinding mode", async ({ page }) => {
    await page.getByRole("button", { name: "Open settings" }).click();

    const keybindingsSelect = page.locator("#keybindings");
    await expect(keybindingsSelect).toHaveValue("default");

    await keybindingsSelect.selectOption("vim");
    await expect(keybindingsSelect).toHaveValue("vim");

    await keybindingsSelect.selectOption("emacs");
    await expect(keybindingsSelect).toHaveValue("emacs");
  });

  test("toggles auto-save", async ({ page }) => {
    await page.getByRole("button", { name: "Open settings" }).click();

    const autoSaveSwitch = page.getByRole("switch", { name: "Auto Save" });
    await expect(autoSaveSwitch).toHaveAttribute("aria-checked", "true");

    await autoSaveSwitch.click();
    await expect(autoSaveSwitch).toHaveAttribute("aria-checked", "false");
  });

  test("toggles word count display", async ({ page }) => {
    await expect(page.getByTestId("word-count")).toBeVisible();

    await page.getByRole("button", { name: "Open settings" }).click();
    const wordCountSwitch = page.getByRole("switch", { name: "Word Count" });
    await expect(wordCountSwitch).toHaveAttribute("aria-checked", "true");

    await wordCountSwitch.click();
    await expect(wordCountSwitch).toHaveAttribute("aria-checked", "false");

    await page.getByRole("button", { name: "Close settings" }).click();
    await expect(page.getByTestId("word-count")).toHaveCount(0);
  });

  test("toggles character count display", async ({ page }) => {
    await expect(page.getByTestId("character-count")).toBeVisible();

    await page.getByRole("button", { name: "Open settings" }).click();
    const charCountSwitch = page.getByRole("switch", { name: "Character Count" });
    await expect(charCountSwitch).toHaveAttribute("aria-checked", "true");

    await charCountSwitch.click();
    await expect(charCountSwitch).toHaveAttribute("aria-checked", "false");

    await page.getByRole("button", { name: "Close settings" }).click();
    await expect(page.getByTestId("character-count")).toHaveCount(0);
  });

  test("closes with X button", async ({ page }) => {
    await page.getByRole("button", { name: "Open settings" }).click();
    await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();

    await page.getByRole("button", { name: "Close settings" }).click();
    await expect(page.getByRole("dialog", { name: "Settings" })).toHaveCount(0);
  });

  test("closes with Escape key", async ({ page }) => {
    await page.getByRole("button", { name: "Open settings" }).click();
    await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Settings" })).toHaveCount(0);
  });

  test("settings persist across page reload", async ({ page }) => {
    await page.getByRole("button", { name: "Open settings" }).click();

    await page.getByRole("switch", { name: "Night Mode" }).click();
    await page.locator("#tab-size").selectOption("2");
    await page.locator("#keybindings").selectOption("vim");
    await page.getByRole("switch", { name: "Auto Save" }).click();

    // Wait for store to persist settings to localStorage
    await page.waitForFunction(() => {
      const profile = JSON.parse(localStorage.getItem("profileV3") || "{}");
      return profile.enableNightMode === true && profile.enableAutoSave === false;
    });

    await page.reload();

    await page.getByRole("button", { name: "Open settings" }).click();
    await expect(page.getByRole("switch", { name: "Night Mode" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    await expect(page.locator("#tab-size")).toHaveValue("2");
    await expect(page.locator("#keybindings")).toHaveValue("vim");
    await expect(page.getByRole("switch", { name: "Auto Save" })).toHaveAttribute(
      "aria-checked",
      "false"
    );
  });
});

/* -------------------------------------------------------------------------- */
/*  Sidebar Tests                                                             */
/* -------------------------------------------------------------------------- */

test.describe("Sidebar", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      seedLocalStorage(),
      { documents: seededDocuments, current: seededDocuments[0], profile: defaultProfile }
    );
    await page.goto("/");
  });

  test("opens on hamburger menu click", async ({ page }) => {
    const toggleButton = page.getByRole("button", { name: "Toggle sidebar" });
    await toggleButton.click();

    await expect(page.locator("aside")).toBeVisible();
    await expect(page.getByRole("button", { name: "New Document" })).toBeVisible();
  });

  test("document list shows all documents", async ({ page }) => {
    await page.getByRole("button", { name: "Toggle sidebar" }).click();

    await expect(page.getByRole("button", { name: /Alpha\.md/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Beta\.md/ })).toBeVisible();
  });

  test("creates new document from sidebar", async ({ page }) => {
    await page.getByRole("button", { name: "Toggle sidebar" }).click();

    await page.getByRole("button", { name: "New Document" }).click();

    const documentButtons = page.locator("aside ul button");
    await expect(documentButtons).toHaveCount(3);
  });

  test("selects document from list", async ({ page }) => {
    await page.getByRole("button", { name: "Toggle sidebar" }).click();

    await page.getByRole("button", { name: /Beta\.md/ }).click();

    await expect(
      page.getByRole("heading", { level: 2, name: "Beta.md" })
    ).toBeVisible();
  });

  test("deletes document from sidebar with confirmation", async ({ page }) => {
    await page.getByRole("button", { name: "Toggle sidebar" }).click();

    await expect(page.getByRole("button", { name: /Alpha\.md/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Beta\.md/ })).toBeVisible();

    await page.getByRole("button", { name: "Delete Document" }).click();

    const deleteDialog = page.getByRole("dialog", { name: "Delete Document" });
    await expect(deleteDialog).toBeVisible();
    await expect(deleteDialog).toContainText("Alpha.md");

    await page.getByRole("button", { name: "Delete", exact: true }).click();

    await expect(deleteDialog).toHaveCount(0);

    const documentButtons = page.locator("aside ul button");
    await expect(documentButtons).toHaveCount(1);
    await expect(page.getByRole("button", { name: /Beta\.md/ })).toBeVisible();
  });

  test("cancels delete confirmation", async ({ page }) => {
    await page.getByRole("button", { name: "Toggle sidebar" }).click();

    await page.getByRole("button", { name: "Delete Document" }).click();

    const deleteDialog = page.getByRole("dialog", { name: "Delete Document" });
    await expect(deleteDialog).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(deleteDialog).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Alpha\.md/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Beta\.md/ })).toBeVisible();
  });

  test("closes on menu click", async ({ page }) => {
    const toggleButton = page.getByRole("button", { name: "Toggle sidebar" });

    await toggleButton.click();
    await expect(page.locator("aside")).toBeVisible();

    await toggleButton.click();
    await expect(page.locator("aside")).toHaveCount(0);
  });

  test("Services section is collapsed by default", async ({ page }) => {
    await page.getByRole("button", { name: "Toggle sidebar" }).click();

    const servicesButton = page.getByRole("button", { name: "Services" });
    await expect(servicesButton).toBeVisible();
    await expect(servicesButton).toHaveAttribute("aria-expanded", "false");

    await expect(page.locator("#services-panel")).toHaveCount(0);
  });

  test("expanding Services section shows cloud provider buttons", async ({ page }) => {
    await page.getByRole("button", { name: "Toggle sidebar" }).click();

    await page.getByRole("button", { name: "Services" }).click();

    const servicesPanel = page.locator("#services-panel");
    await expect(servicesPanel).toBeVisible();

    await expect(servicesPanel.getByText("GitHub")).toBeVisible();
    await expect(servicesPanel.getByText("Dropbox")).toBeVisible();
    await expect(servicesPanel.getByText("Google Drive")).toBeVisible();
    await expect(servicesPanel.getByText("OneDrive")).toBeVisible();
    await expect(servicesPanel.getByText("Bitbucket")).toBeVisible();
  });
});
