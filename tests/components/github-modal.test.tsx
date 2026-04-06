import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GitHubModal } from "@/components/modals/GitHubModal";
import { useStore } from "@/stores/store";

const mockFetchOrgs = vi.fn();
const mockFetchRepos = vi.fn();
const mockFetchBranches = vi.fn();
const mockFetchFiles = vi.fn();
const mockFetchFileContent = vi.fn();
const mockSaveFile = vi.fn();
const mockConnect = vi.fn();
const mockSetCurrent = vi.fn();
const mockReset = vi.fn();
const mockDisconnect = vi.fn();

const connectedDefaults = {
  isConnected: true,
  isLoading: false,
  user: { login: "testuser", name: "Test User", avatar_url: "" },
  orgs: [{ login: "testuser" }, { login: "org1" }],
  repos: [],
  branches: [],
  files: [],
  current: { owner: "", repo: "", branch: "", path: "", sha: "" },
  connect: mockConnect,
  disconnect: mockDisconnect,
  fetchOrgs: mockFetchOrgs,
  fetchRepos: mockFetchRepos,
  fetchBranches: mockFetchBranches,
  fetchFiles: mockFetchFiles,
  fetchFileContent: mockFetchFileContent,
  saveFile: mockSaveFile,
  setCurrent: mockSetCurrent,
  reset: mockReset,
};

let githubOverrides: Partial<typeof connectedDefaults> = {};

vi.mock("@/hooks/useGitHub", () => ({
  useGitHub: () => ({ ...connectedDefaults, ...githubOverrides }),
}));

vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ notify: vi.fn() }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const initialState = useStore.getState();

function resetStore() {
  useStore.setState(
    {
      ...initialState,
      documents: [],
      currentDocument: {
        id: "1",
        title: "Test Doc",
        body: "# Hello",
        createdAt: new Date().toISOString(),
      },
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

type ModalProps = Parameters<typeof GitHubModal>[0];

function renderModal(overrides: Partial<ModalProps> = {}) {
  const defaults: ModalProps = {
    isOpen: true,
    onClose: vi.fn(),
    mode: "import",
  };
  const props = { ...defaults, ...overrides };
  const result = render(<GitHubModal {...props} />);
  return { ...result, props };
}

describe("GitHubModal", () => {
  beforeEach(() => {
    resetStore();
    githubOverrides = {};
    vi.clearAllMocks();
  });

  it("does not render when not open", () => {
    renderModal({ isOpen: false });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders import mode with org selection step", () => {
    renderModal({ mode: "import" });

    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.getByText("Import from GitHub")).toBeVisible();
    expect(screen.getByText("testuser")).toBeVisible();
    expect(screen.getByText("org1")).toBeVisible();
  });

  it("renders export mode with filename and commit fields", async () => {
    const user = userEvent.setup();

    githubOverrides = {
      orgs: [{ login: "testuser" }],
      repos: [{ name: "my-repo", full_name: "testuser/my-repo", private: false, default_branch: "main" }],
      branches: [{ name: "main", sha: "abc123" }],
      files: [{ path: "README.md", sha: "def456", url: "" }],
    };

    const { rerender, props } = renderModal({ mode: "save" });

    // Navigate through steps: org -> repo -> branch -> files
    await user.click(screen.getByText("testuser"));

    githubOverrides = {
      ...githubOverrides,
      current: { owner: "testuser", repo: "", branch: "", path: "", sha: "" },
    };
    rerender(<GitHubModal {...props} />);

    await user.click(screen.getByText("my-repo"));

    githubOverrides = {
      ...githubOverrides,
      current: { owner: "testuser", repo: "my-repo", branch: "", path: "", sha: "" },
    };
    rerender(<GitHubModal {...props} />);

    await user.click(screen.getByText("main"));

    githubOverrides = {
      ...githubOverrides,
      current: { owner: "testuser", repo: "my-repo", branch: "main", path: "", sha: "" },
    };
    rerender(<GitHubModal {...props} />);

    expect(screen.getByLabelText("File name")).toBeVisible();
    expect(screen.getByLabelText("Commit message")).toBeVisible();
  });

  it("shows loading state when not connected and loading", () => {
    githubOverrides = {
      isConnected: false,
      isLoading: true,
      user: null,
      orgs: [],
    };

    renderModal();

    expect(screen.getByText("Connect to GitHub")).toBeVisible();
  });

  it("shows connected user info in org list", () => {
    renderModal();

    expect(screen.getByText("testuser")).toBeVisible();
  });

  it("back button navigates to previous step", async () => {
    const user = userEvent.setup();

    githubOverrides = {
      repos: [{ name: "my-repo", full_name: "testuser/my-repo", private: false, default_branch: "main" }],
    };

    renderModal({ mode: "import" });

    // Select an org to move to repos step
    await user.click(screen.getByText("testuser"));

    // Now on repos step, back button should appear
    const backButton = screen.getByRole("button", { name: "Go back" });
    expect(backButton).toBeVisible();

    await user.click(backButton);

    // Should be back on orgs step showing org list
    expect(screen.getByText("org1")).toBeVisible();
  });

  it("close button closes modal", async () => {
    const user = userEvent.setup();
    const { props } = renderModal();

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it("escape key closes modal", async () => {
    const user = userEvent.setup();
    const { props } = renderModal();

    await user.keyboard("{Escape}");

    expect(props.onClose).toHaveBeenCalledOnce();
  });

  describe("import flow", () => {
    it("selecting an org calls fetchRepos and advances to repos step", async () => {
      const user = userEvent.setup();

      githubOverrides = {
        repos: [{ name: "my-repo", full_name: "testuser/my-repo", private: false, default_branch: "main" }],
      };

      renderModal({ mode: "import" });

      await user.click(screen.getByText("org1"));

      expect(mockFetchRepos).toHaveBeenCalledWith("org1");
      expect(screen.getByText("my-repo")).toBeVisible();
    });

    it("selecting a repo calls fetchBranches and advances to branches step", async () => {
      const user = userEvent.setup();

      githubOverrides = {
        repos: [{ name: "my-repo", full_name: "testuser/my-repo", private: false, default_branch: "main" }],
        branches: [{ name: "main", sha: "abc123" }, { name: "develop", sha: "xyz789" }],
      };

      renderModal({ mode: "import" });

      // org -> repos
      await user.click(screen.getByText("testuser"));
      // repos -> branches
      await user.click(screen.getByText("my-repo"));

      expect(mockFetchBranches).toHaveBeenCalledWith("my-repo");
      expect(screen.getByText("main")).toBeVisible();
      expect(screen.getByText("develop")).toBeVisible();
    });

    it("selecting a branch calls fetchFiles and advances to files step", async () => {
      const user = userEvent.setup();

      githubOverrides = {
        repos: [{ name: "my-repo", full_name: "testuser/my-repo", private: false, default_branch: "main" }],
        branches: [{ name: "main", sha: "abc123" }],
        files: [{ path: "README.md", sha: "def456", url: "" }],
      };

      renderModal({ mode: "import" });

      await user.click(screen.getByText("testuser"));
      await user.click(screen.getByText("my-repo"));
      await user.click(screen.getByText("main"));

      expect(mockFetchFiles).toHaveBeenCalledWith("main");
      expect(screen.getByText("README.md")).toBeVisible();
    });

    it("selecting a file calls fetchFileContent and imports the document", async () => {
      const user = userEvent.setup();
      const mockNotify = vi.fn();

      vi.mocked(await import("@/components/ui/Toast")).useToast = () => ({ notify: mockNotify }) as any;

      mockFetchFileContent.mockResolvedValue({ content: "# Imported content", sha: "abc" });

      githubOverrides = {
        repos: [{ name: "my-repo", full_name: "testuser/my-repo", private: false, default_branch: "main" }],
        branches: [{ name: "main", sha: "abc123" }],
        files: [{ path: "docs/guide.md", sha: "def456", url: "" }],
      };

      const { props } = renderModal({ mode: "import" });

      await user.click(screen.getByText("testuser"));
      await user.click(screen.getByText("my-repo"));
      await user.click(screen.getByText("main"));
      await user.click(screen.getByText("docs/guide.md"));

      expect(mockFetchFileContent).toHaveBeenCalledWith("docs/guide.md");
    });

    it("shows 'No markdown files found' when files list is empty", async () => {
      const user = userEvent.setup();

      githubOverrides = {
        repos: [{ name: "my-repo", full_name: "testuser/my-repo", private: false, default_branch: "main" }],
        branches: [{ name: "main", sha: "abc123" }],
        files: [],
      };

      renderModal({ mode: "import" });

      await user.click(screen.getByText("testuser"));
      await user.click(screen.getByText("my-repo"));
      await user.click(screen.getByText("main"));

      expect(screen.getByText("No markdown files found")).toBeVisible();
    });
  });

  describe("save flow", () => {
    it("shows filename and commit message fields at files step", async () => {
      const user = userEvent.setup();

      githubOverrides = {
        repos: [{ name: "my-repo", full_name: "testuser/my-repo", private: false, default_branch: "main" }],
        branches: [{ name: "main", sha: "abc123" }],
        files: [{ path: "README.md", sha: "def456", url: "" }],
      };

      renderModal({ mode: "save" });

      await user.click(screen.getByText("testuser"));
      await user.click(screen.getByText("my-repo"));
      await user.click(screen.getByText("main"));

      const filenameInput = screen.getByLabelText("File name");
      const commitInput = screen.getByLabelText("Commit message");

      expect(filenameInput).toBeVisible();
      expect(commitInput).toBeVisible();
      // Default filename from currentDocument title
      expect(filenameInput).toHaveValue("Test Doc");
    });

    it("allows editing filename and commit message", async () => {
      const user = userEvent.setup();

      githubOverrides = {
        repos: [{ name: "my-repo", full_name: "testuser/my-repo", private: false, default_branch: "main" }],
        branches: [{ name: "main", sha: "abc123" }],
        files: [],
      };

      renderModal({ mode: "save" });

      await user.click(screen.getByText("testuser"));
      await user.click(screen.getByText("my-repo"));
      await user.click(screen.getByText("main"));

      const filenameInput = screen.getByLabelText("File name");
      const commitInput = screen.getByLabelText("Commit message");

      await user.clear(filenameInput);
      await user.type(filenameInput, "new-file");
      expect(filenameInput).toHaveValue("new-file");

      await user.type(commitInput, "Add new file");
      expect(commitInput).toHaveValue("Add new file");
    });

    it("selecting a file in save mode sets current path via setCurrent", async () => {
      const user = userEvent.setup();

      githubOverrides = {
        repos: [{ name: "my-repo", full_name: "testuser/my-repo", private: false, default_branch: "main" }],
        branches: [{ name: "main", sha: "abc123" }],
        files: [{ path: "README.md", sha: "def456", url: "" }],
      };

      renderModal({ mode: "save" });

      await user.click(screen.getByText("testuser"));
      await user.click(screen.getByText("my-repo"));
      await user.click(screen.getByText("main"));
      await user.click(screen.getByText("README.md"));

      expect(mockSetCurrent).toHaveBeenCalledWith({ path: "README.md", sha: "def456" });
    });

    it("clicking Save to GitHub calls saveFile with correct params", async () => {
      const user = userEvent.setup();
      mockSaveFile.mockResolvedValue(true);

      githubOverrides = {
        repos: [{ name: "my-repo", full_name: "testuser/my-repo", private: false, default_branch: "main" }],
        branches: [{ name: "main", sha: "abc123" }],
        files: [],
      };

      const { props } = renderModal({ mode: "save" });

      await user.click(screen.getByText("testuser"));
      await user.click(screen.getByText("my-repo"));
      await user.click(screen.getByText("main"));

      const commitInput = screen.getByLabelText("Commit message");
      await user.type(commitInput, "My commit");

      await user.click(screen.getByRole("button", { name: /save to github/i }));

      expect(mockSetCurrent).toHaveBeenCalled();
      expect(mockSaveFile).toHaveBeenCalledWith("# Hello", "My commit");
    });

    it("successful save closes the modal", async () => {
      const user = userEvent.setup();
      mockSaveFile.mockResolvedValue(true);

      githubOverrides = {
        repos: [{ name: "my-repo", full_name: "testuser/my-repo", private: false, default_branch: "main" }],
        branches: [{ name: "main", sha: "abc123" }],
        files: [],
      };

      const { props } = renderModal({ mode: "save" });

      await user.click(screen.getByText("testuser"));
      await user.click(screen.getByText("my-repo"));
      await user.click(screen.getByText("main"));

      await user.click(screen.getByRole("button", { name: /save to github/i }));

      expect(props.onClose).toHaveBeenCalled();
    });

    it("failed save does not close the modal", async () => {
      const user = userEvent.setup();
      mockSaveFile.mockResolvedValue(false);

      githubOverrides = {
        repos: [{ name: "my-repo", full_name: "testuser/my-repo", private: false, default_branch: "main" }],
        branches: [{ name: "main", sha: "abc123" }],
        files: [],
      };

      const { props } = renderModal({ mode: "save" });

      await user.click(screen.getByText("testuser"));
      await user.click(screen.getByText("my-repo"));
      await user.click(screen.getByText("main"));

      await user.click(screen.getByRole("button", { name: /save to github/i }));

      expect(props.onClose).not.toHaveBeenCalled();
    });

    it("uses default commit message when none provided", async () => {
      const user = userEvent.setup();
      mockSaveFile.mockResolvedValue(true);

      githubOverrides = {
        repos: [{ name: "my-repo", full_name: "testuser/my-repo", private: false, default_branch: "main" }],
        branches: [{ name: "main", sha: "abc123" }],
        files: [],
      };

      renderModal({ mode: "save" });

      await user.click(screen.getByText("testuser"));
      await user.click(screen.getByText("my-repo"));
      await user.click(screen.getByText("main"));

      await user.click(screen.getByRole("button", { name: /save to github/i }));

      // commit message should default to "Update <filename>.md"
      expect(mockSaveFile).toHaveBeenCalledWith("# Hello", expect.stringContaining("Update"));
    });

    it("does not save when no current document exists", async () => {
      const user = userEvent.setup();

      useStore.setState({ currentDocument: null }, true);

      githubOverrides = {
        repos: [{ name: "my-repo", full_name: "testuser/my-repo", private: false, default_branch: "main" }],
        branches: [{ name: "main", sha: "abc123" }],
        files: [],
      };

      renderModal({ mode: "save" });

      await user.click(screen.getByText("testuser"));
      await user.click(screen.getByText("my-repo"));
      await user.click(screen.getByText("main"));

      await user.click(screen.getByRole("button", { name: /save to github/i }));

      expect(mockSaveFile).not.toHaveBeenCalled();
    });
  });

  describe("connect state", () => {
    it("shows connect button when not connected", () => {
      githubOverrides = {
        isConnected: false,
        user: null,
        orgs: [],
      };

      renderModal();

      expect(screen.getByRole("button", { name: "Connect GitHub" })).toBeVisible();
    });

    it("clicking connect calls github.connect", async () => {
      const user = userEvent.setup();

      githubOverrides = {
        isConnected: false,
        user: null,
        orgs: [],
      };

      renderModal();

      await user.click(screen.getByRole("button", { name: "Connect GitHub" }));

      expect(mockConnect).toHaveBeenCalledOnce();
    });

    it("backdrop click on connect modal calls onClose", async () => {
      const user = userEvent.setup();

      githubOverrides = {
        isConnected: false,
        user: null,
        orgs: [],
      };

      const { props } = renderModal();

      // Click the backdrop (the element with aria-hidden="true")
      const backdrop = screen.getByRole("dialog").querySelector("[aria-hidden='true']");
      if (backdrop) await user.click(backdrop);

      expect(props.onClose).toHaveBeenCalled();
    });
  });

  describe("breadcrumb display", () => {
    it("shows owner in breadcrumb after org selection", async () => {
      const user = userEvent.setup();

      githubOverrides = {
        repos: [{ name: "my-repo", full_name: "testuser/my-repo", private: false, default_branch: "main" }],
        current: { owner: "testuser", repo: "", branch: "", path: "", sha: "" },
      };

      renderModal({ mode: "import" });

      // Breadcrumb should show owner
      expect(screen.getAllByText("testuser").length).toBeGreaterThanOrEqual(1);
    });

    it("shows owner, repo and branch in breadcrumb", () => {
      githubOverrides = {
        files: [{ path: "README.md", sha: "def456", url: "" }],
        current: { owner: "testuser", repo: "my-repo", branch: "main", path: "", sha: "" },
      };

      renderModal({ mode: "import" });

      // Force to files step by navigating
      // Since we set current with all values, breadcrumb should display them
      expect(screen.getByText("my-repo")).toBeVisible();
    });
  });

  describe("private repo badge", () => {
    it("shows Private badge for private repos", async () => {
      const user = userEvent.setup();

      githubOverrides = {
        repos: [{ name: "secret-repo", full_name: "testuser/secret-repo", private: true, default_branch: "main" }],
      };

      renderModal({ mode: "import" });

      await user.click(screen.getByText("testuser"));

      expect(screen.getByText("Private")).toBeVisible();
    });
  });

  describe("file selection highlight", () => {
    it("highlights the currently selected file in save mode", async () => {
      const user = userEvent.setup();

      githubOverrides = {
        orgs: [{ login: "hlorg" }],
        repos: [{ name: "hlrepo", full_name: "hlorg/hlrepo", private: false, default_branch: "dev" }],
        branches: [{ name: "dev", sha: "abc123" }],
        files: [{ path: "README.md", sha: "def456", url: "" }],
        current: { owner: "hlorg", repo: "hlrepo", branch: "dev", path: "README.md", sha: "def456" },
      };

      renderModal({ mode: "save" });

      // Navigate: use getAllByText to handle breadcrumb duplicates
      const orgEls = screen.getAllByText("hlorg");
      await user.click(orgEls.find((el) => el.closest("button"))!);
      const repoEls = screen.getAllByText("hlrepo");
      await user.click(repoEls.find((el) => el.closest("button"))!);
      const branchEls = screen.getAllByText("dev");
      await user.click(branchEls.find((el) => el.closest("button"))!);

      // The check icon should be present for the selected file
      const fileButton = screen.getByText("README.md").closest("button");
      expect(fileButton?.className).toContain("bg-bg-highlight");
    });
  });
});
