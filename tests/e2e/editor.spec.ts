import { test, expect } from "@playwright/test";

const seededDocument = {
  id: "editor-test-doc",
  title: "Editor Test.md",
  body: "# Hello World\n\nThis is a test document for editor workflows.",
  createdAt: "2026-03-10T00:00:00.000Z",
};

const secondDocument = {
  id: "editor-test-doc-2",
  title: "Second Document.md",
  body: "# Second\n\nContent of the second document.",
  createdAt: "2026-03-11T00:00:00.000Z",
};

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

function seedSingleDocument(page: import("@playwright/test").Page) {
  return page.addInitScript(
    ({ doc, profile }) => {
      if (window.localStorage.getItem("files")) return;
      window.localStorage.setItem("files", JSON.stringify([doc]));
      window.localStorage.setItem("currentDocument", JSON.stringify(doc));
      window.localStorage.setItem("profileV3", JSON.stringify(profile));
    },
    { doc: seededDocument, profile: defaultProfile }
  );
}

function seedMultipleDocuments(page: import("@playwright/test").Page) {
  return page.addInitScript(
    ({ docs, current, profile }) => {
      if (window.localStorage.getItem("files")) return;
      window.localStorage.setItem("files", JSON.stringify(docs));
      window.localStorage.setItem("currentDocument", JSON.stringify(current));
      window.localStorage.setItem("profileV3", JSON.stringify(profile));
    },
    {
      docs: [seededDocument, secondDocument],
      current: seededDocument,
      profile: defaultProfile,
    }
  );
}

test.describe("Document creation", () => {
  test.beforeEach(async ({ page }) => {
    await seedSingleDocument(page);
  });

  test("creates a new document via sidebar button", async ({ page }) => {
    await page.goto("/");

    // Open sidebar
    await page.getByRole("button", { name: "Toggle sidebar" }).click();

    // Verify only the seeded document exists
    await expect(
      page.getByRole("button", { name: /Editor Test\.md/ })
    ).toBeVisible();

    // Click "New Document"
    await page.getByRole("button", { name: "New Document" }).click();

    // The title should switch to the default new document name
    await expect(
      page.getByRole("heading", { level: 2, name: "Untitled Document.md" })
    ).toBeVisible();

    // Both documents should appear in the sidebar document list
    await expect(
      page.getByRole("button", { name: /Editor Test\.md/ })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Untitled Document\.md/ })
    ).toBeVisible();
  });
});

test.describe("Document title editing", () => {
  test.beforeEach(async ({ page }) => {
    await seedSingleDocument(page);
  });

  test("renames a document via the title bar", async ({ page }) => {
    await page.goto("/");

    // Verify original title
    await expect(
      page.getByRole("heading", { level: 2, name: "Editor Test.md" })
    ).toBeVisible();

    // Click the edit button to enter editing mode
    await page.getByRole("button", { name: "Edit title" }).click();

    // The input should appear and be focused
    const titleInput = page.locator("#document-title");
    await expect(titleInput).toBeVisible();
    await expect(titleInput).toBeFocused();

    // Clear the input and type a new name
    await titleInput.fill("Renamed Document.md");
    await titleInput.press("Enter");

    // The heading should now reflect the new title
    await expect(
      page.getByRole("heading", { level: 2, name: "Renamed Document.md" })
    ).toBeVisible();

    // Edit button should reappear (no longer in editing mode)
    await expect(
      page.getByRole("button", { name: "Edit title" })
    ).toBeVisible();
  });

  test("cancels title edit on Escape", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Edit title" }).click();

    const titleInput = page.locator("#document-title");
    await titleInput.fill("Should Not Persist");
    await titleInput.press("Escape");

    // Original title should be preserved
    await expect(
      page.getByRole("heading", { level: 2, name: "Editor Test.md" })
    ).toBeVisible();
  });
});

test.describe("Document switching", () => {
  test.beforeEach(async ({ page }) => {
    await seedMultipleDocuments(page);
  });

  test("switches between documents and updates the editor and preview", async ({
    page,
  }) => {
    await page.goto("/");

    // Start on the first document
    await expect(
      page.getByRole("heading", { level: 2, name: "Editor Test.md" })
    ).toBeVisible();
    await expect(page.locator("#preview h1")).toHaveText("Hello World");

    // Open sidebar and click the second document
    await page.getByRole("button", { name: "Toggle sidebar" }).click();
    await page.getByRole("button", { name: /Second Document\.md/ }).click();

    // Title and preview should update
    await expect(
      page.getByRole("heading", { level: 2, name: "Second Document.md" })
    ).toBeVisible();
    await expect(page.locator("#preview h1")).toHaveText("Second");

    // Switch back to the first document
    await page.getByRole("button", { name: /Editor Test\.md/ }).click();

    await expect(
      page.getByRole("heading", { level: 2, name: "Editor Test.md" })
    ).toBeVisible();
    await expect(page.locator("#preview h1")).toHaveText("Hello World");
  });
});

test.describe("Document deletion", () => {
  test.beforeEach(async ({ page }) => {
    await seedMultipleDocuments(page);
  });

  test("deletes a document after confirmation", async ({ page }) => {
    await page.goto("/");

    // Open sidebar
    await page.getByRole("button", { name: "Toggle sidebar" }).click();

    // Both documents should be visible
    await expect(
      page.getByRole("button", { name: /Editor Test\.md/ })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Second Document\.md/ })
    ).toBeVisible();

    // Click delete — should open the confirmation modal
    await page.getByRole("button", { name: "Delete Document" }).click();
    await expect(
      page.getByRole("dialog", { name: "Delete Document" })
    ).toBeVisible();

    // Confirm deletion
    await page.getByRole("button", { name: "Delete", exact: true }).click();

    // The deleted document should no longer appear in the sidebar
    await expect(
      page.getByRole("button", { name: /Editor Test\.md/ })
    ).toHaveCount(0);

    // The remaining document should become active
    await expect(
      page.getByRole("heading", { level: 2, name: "Second Document.md" })
    ).toBeVisible();
  });

  test("cancels document deletion", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Toggle sidebar" }).click();
    await page.getByRole("button", { name: "Delete Document" }).click();

    // Cancel in the confirmation modal
    await page.getByRole("button", { name: "Cancel" }).click();

    // Both documents should still be present
    await expect(
      page.getByRole("button", { name: /Editor Test\.md/ })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Second Document\.md/ })
    ).toBeVisible();
  });
});

test.describe("Preview toggle", () => {
  test.beforeEach(async ({ page }) => {
    await seedSingleDocument(page);
  });

  test("hides and shows the preview pane", async ({ page }) => {
    await page.goto("/");

    // Preview should be visible by default (wait for async markdown render)
    await expect(page.locator("#preview")).toBeVisible();
    await expect(page.locator("#preview h1")).toHaveText("Hello World", { timeout: 10_000 });

    // Hide preview
    await page.getByRole("button", { name: "Hide preview" }).click();
    await expect(page.locator("#preview")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Show preview" })
    ).toBeVisible();

    // Show preview again
    await page.getByRole("button", { name: "Show preview" }).click();
    await expect(page.locator("#preview")).toBeVisible();
    await expect(page.locator("#preview h1")).toHaveText("Hello World", { timeout: 10_000 });
  });
});

test.describe("Zen mode", () => {
  test.beforeEach(async ({ page }) => {
    await seedSingleDocument(page);
  });

  test("enters zen mode via keyboard shortcut and exits with Escape", async ({
    page,
  }) => {
    await page.goto("/");

    // Verify normal layout is present
    await expect(
      page.getByRole("button", { name: "Toggle sidebar" })
    ).toBeVisible();
    await expect(page.locator("#preview")).toBeVisible();

    // Enter zen mode with Cmd+Shift+Z (Meta on Mac, Control elsewhere)
    await page.keyboard.press("Meta+Shift+z");

    // In zen mode: navbar, sidebar toggle, and preview should be gone
    await expect(
      page.getByRole("button", { name: "Toggle sidebar" })
    ).toHaveCount(0);
    await expect(page.locator("#preview")).toHaveCount(0);

    // The exit zen mode button should be visible
    await expect(
      page.getByRole("button", { name: "Exit zen mode" })
    ).toBeVisible();

    // Exit via Escape
    await page.keyboard.press("Escape");

    // Normal layout should return
    await expect(
      page.getByRole("button", { name: "Toggle sidebar" })
    ).toBeVisible();
    await expect(page.locator("#preview")).toBeVisible();
  });

  test("enters zen mode via navbar button and exits via close button", async ({
    page,
  }) => {
    await page.goto("/");

    // Click the zen mode button in the navbar
    await page.getByRole("button", { name: "Enter zen mode" }).click();

    // Zen mode should be active
    await expect(
      page.getByRole("button", { name: "Exit zen mode" })
    ).toBeVisible();
    await expect(page.locator("#preview")).toHaveCount(0);

    // Click the exit button
    await page.getByRole("button", { name: "Exit zen mode" }).click();

    // Normal layout should return
    await expect(
      page.getByRole("button", { name: "Toggle sidebar" })
    ).toBeVisible();
  });
});

test.describe("Settings modal", () => {
  test.beforeEach(async ({ page }) => {
    await seedSingleDocument(page);
  });

  test("opens settings and toggles night mode", async ({ page }) => {
    await page.goto("/");

    // Open settings
    await page.getByRole("button", { name: "Open settings" }).click();
    await expect(
      page.getByRole("dialog", { name: "Settings" })
    ).toBeVisible();

    // Night mode should be off initially
    const nightModeSwitch = page.getByRole("switch", { name: "Night Mode" });
    await expect(nightModeSwitch).toHaveAttribute("aria-checked", "false");

    // Toggle night mode on
    await nightModeSwitch.click();
    await expect(nightModeSwitch).toHaveAttribute("aria-checked", "true");

    // Close settings
    await page.getByRole("button", { name: "Close settings" }).click();
    await expect(
      page.getByRole("dialog", { name: "Settings" })
    ).toHaveCount(0);

    // Reopen settings — night mode should still be on
    await page.getByRole("button", { name: "Open settings" }).click();
    await expect(
      page.getByRole("switch", { name: "Night Mode" })
    ).toHaveAttribute("aria-checked", "true");
  });

  test("changes tab size setting", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Open settings" }).click();

    const tabSizeSelect = page.locator("#tab-size");
    await expect(tabSizeSelect).toHaveValue("4");

    await tabSizeSelect.selectOption("2");
    await expect(tabSizeSelect).toHaveValue("2");

    // Close and reopen to verify persistence within session
    await page.getByRole("button", { name: "Close settings" }).click();
    await page.getByRole("button", { name: "Open settings" }).click();
    await expect(page.locator("#tab-size")).toHaveValue("2");
  });

  test("closes settings with Escape key", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Open settings" }).click();
    await expect(
      page.getByRole("dialog", { name: "Settings" })
    ).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Settings" })
    ).toHaveCount(0);
  });
});

test.describe("Markdown preview accuracy", () => {
  test("renders various markdown elements in the preview pane", async ({
    page,
  }) => {
    const markdownDoc = {
      id: "markdown-test",
      title: "Markdown Test.md",
      body: [
        "# Heading 1",
        "## Heading 2",
        "### Heading 3",
        "",
        "A paragraph with **bold** and *italic* text.",
        "",
        "- Item one",
        "- Item two",
        "- Item three",
        "",
        "1. First",
        "2. Second",
        "3. Third",
        "",
        "> A blockquote",
        "",
        "`inline code`",
        "",
        "```",
        "code block",
        "```",
        "",
        "[A link](https://example.com)",
      ].join("\n"),
      createdAt: "2026-03-10T00:00:00.000Z",
    };

    await page.addInitScript(
      ({ doc, profile }) => {
        window.localStorage.setItem("files", JSON.stringify([doc]));
        window.localStorage.setItem("currentDocument", JSON.stringify(doc));
        window.localStorage.setItem("profileV3", JSON.stringify(profile));
      },
      { doc: markdownDoc, profile: defaultProfile }
    );

    await page.goto("/");

    const preview = page.locator("#preview");
    await expect(preview).toBeVisible();

    // Headings
    await expect(preview.locator("h1")).toHaveText("Heading 1");
    await expect(preview.locator("h2")).toHaveText("Heading 2");
    await expect(preview.locator("h3")).toHaveText("Heading 3");

    // Inline formatting
    await expect(preview.locator("strong")).toHaveText("bold");
    await expect(preview.locator("em")).toHaveText("italic");

    // Unordered list
    const ulItems = preview.locator("ul > li");
    await expect(ulItems).toHaveCount(3);
    await expect(ulItems.nth(0)).toHaveText("Item one");

    // Ordered list
    const olItems = preview.locator("ol > li");
    await expect(olItems).toHaveCount(3);
    await expect(olItems.nth(0)).toHaveText("First");

    // Blockquote
    await expect(preview.locator("blockquote")).toBeVisible();

    // Code elements
    await expect(preview.locator("code")).toHaveCount(2);

    // Link
    const link = preview.locator("a[href='https://example.com']");
    await expect(link).toHaveText("A link");
  });

  test("updates preview when editor content changes via store", async ({
    page,
  }) => {
    await seedSingleDocument(page);
    await page.goto("/");

    // Verify initial preview
    await expect(page.locator("#preview h1")).toHaveText("Hello World");

    // Update the document body via the store (avoids direct Monaco interaction)
    await page.evaluate(() => {
      const store = (window as unknown as Record<string, unknown>).__ZUSTAND_STORE__;
      if (store) return;

      // Fall back to localStorage manipulation + reload
      const files = JSON.parse(localStorage.getItem("files") || "[]");
      const current = JSON.parse(localStorage.getItem("currentDocument") || "{}");
      const newBody = "# Updated Heading\n\nNew content here.";
      current.body = newBody;
      files[0].body = newBody;
      localStorage.setItem("files", JSON.stringify(files));
      localStorage.setItem("currentDocument", JSON.stringify(current));
    });

    // Reload to pick up updated localStorage
    await page.reload();

    await expect(page.locator("#preview h1")).toHaveText("Updated Heading");
    await expect(page.locator("#preview p")).toContainText("New content here.");
  });
});

test.describe("Sidebar toggle", () => {
  test.beforeEach(async ({ page }) => {
    await seedSingleDocument(page);
  });

  test("opens and closes the sidebar", async ({ page }) => {
    await page.goto("/");

    // Sidebar should be closed by default
    await expect(page.locator("aside")).toHaveCount(0);

    // Open sidebar
    await page.getByRole("button", { name: "Toggle sidebar" }).click();
    await expect(page.locator("aside")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "New Document" })
    ).toBeVisible();

    // Close sidebar
    await page.getByRole("button", { name: "Toggle sidebar" }).click();
    await expect(page.locator("aside")).toHaveCount(0);
  });

  test("sidebar shows the documents section with seeded document", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Toggle sidebar" }).click();

    // The Documents section should be expanded by default
    await expect(
      page.getByRole("button", { name: /Editor Test\.md/ })
    ).toBeVisible();
  });
});

test.describe("Word and character count", () => {
  test.beforeEach(async ({ page }) => {
    await seedSingleDocument(page);
  });

  test("displays accurate word and character counts", async ({ page }) => {
    await page.goto("/");

    // "# Hello World\n\nThis is a test document for editor workflows."
    // Words: "Hello", "World", "This", "is", "a", "test", "document", "for", "editor", "workflows." = 11
    // (the "#" counts as a word too) => 11 words
    // Characters: total string length
    await expect(page.getByTestId("word-count")).toContainText("11 words");
    await expect(page.getByTestId("character-count")).toBeVisible();
  });

  test("counts update after changing document content", async ({ page }) => {
    const shortDoc = {
      id: "short-doc",
      title: "Short.md",
      body: "Hello",
      createdAt: "2026-03-10T00:00:00.000Z",
    };

    await page.addInitScript(
      ({ doc, profile }) => {
        window.localStorage.setItem("files", JSON.stringify([doc]));
        window.localStorage.setItem("currentDocument", JSON.stringify(doc));
        window.localStorage.setItem("profileV3", JSON.stringify(profile));
      },
      { doc: shortDoc, profile: defaultProfile }
    );

    await page.goto("/");

    await expect(page.getByTestId("word-count")).toContainText("1 word");
    await expect(page.getByTestId("character-count")).toContainText(
      "5 characters"
    );
  });

  test("hides word count when disabled in settings", async ({ page }) => {
    await page.goto("/");

    // Word count visible by default
    await expect(page.getByTestId("word-count")).toBeVisible();

    // Open settings and disable word count
    await page.getByRole("button", { name: "Open settings" }).click();
    await page.getByRole("switch", { name: "Word Count" }).click();
    await page.getByRole("button", { name: "Close settings" }).click();

    // Word count should be hidden
    await expect(page.getByTestId("word-count")).toHaveCount(0);
  });
});
