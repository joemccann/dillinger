"use client";

import { useState, useEffect } from "react";
import { useGitHub } from "@/hooks/useGitHub";
import { useStore } from "@/stores/store";
import { useToast } from "@/components/ui/Toast";
import {
  X,
  Github,
  ChevronRight,
  ArrowLeft,
  Folder,
  FileText,
  Check,
  Save,
} from "lucide-react";

type Step = "orgs" | "repos" | "branches" | "files";
type Mode = "import" | "save";

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: Mode;
}

export function GitHubModal({ isOpen, onClose, mode }: GitHubModalProps) {
  const github = useGitHub();
  const { notify } = useToast();
  const currentDocument = useStore((state) => state.currentDocument);
  const updateDocumentBody = useStore((state) => state.updateDocumentBody);
  const updateDocumentTitle = useStore((state) => state.updateDocumentTitle);

  const [step, setStep] = useState<Step>("orgs");
  const [commitMessage, setCommitMessage] = useState("");
  const [newFileName, setNewFileName] = useState("");

  useEffect(() => {
    if (isOpen && github.isConnected) {
      github.fetchOrgs();
      setStep("orgs");
      setCommitMessage("");
      setNewFileName(currentDocument?.title || "document");
    }
  }, [isOpen, github.isConnected]);

  if (!isOpen) return null;

  const handleOrgSelect = (org: string) => {
    github.fetchRepos(org);
    setStep("repos");
  };

  const handleRepoSelect = (repo: string) => {
    github.fetchBranches(repo);
    setStep("branches");
  };

  const handleBranchSelect = (branch: string) => {
    github.fetchFiles(branch);
    setStep("files");
  };

  const handleFileSelect = async (path: string) => {
    if (mode === "import") {
      const file = await github.fetchFileContent(path);
      if (file) {
        updateDocumentBody(file.content);
        updateDocumentTitle(path.split("/").pop()?.replace(/\.md$/, "") || "Untitled");
        notify("File imported from GitHub");
        onClose();
      }
    } else {
      // For save mode, select the file to overwrite
      github.setCurrent({ path, sha: github.files.find((f) => f.path === path)?.sha });
    }
  };

  const handleSave = async () => {
    if (!currentDocument) return;

    const path = github.current.path || `${newFileName}.md`;
    github.setCurrent({ path });

    const success = await github.saveFile(
      currentDocument.body,
      commitMessage || `Update ${path}`
    );

    if (success) {
      onClose();
    }
  };

  const goBack = () => {
    if (step === "repos") setStep("orgs");
    else if (step === "branches") setStep("repos");
    else if (step === "files") setStep("branches");
  };

  // Not connected state
  if (!github.isConnected) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-bg-navbar rounded-lg shadow-xl w-full max-w-md p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-invert hover:text-plum"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <Github size={48} className="mx-auto text-text-invert mb-4" />
            <h2 className="text-xl font-semibold text-text-invert mb-2">
              Connect to GitHub
            </h2>
            <p className="text-text-muted mb-6">
              Connect your GitHub account to import and save markdown files.
            </p>
            <button
              onClick={github.connect}
              className="bg-plum text-bg-sidebar px-6 py-2 rounded font-medium
                         hover:opacity-90 transition-opacity"
            >
              Connect GitHub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-bg-navbar rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-settings">
          <div className="flex items-center gap-2">
            {step !== "orgs" && (
              <button
                onClick={goBack}
                className="text-text-invert hover:text-plum"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <Github size={24} className="text-text-invert" />
            <h2 className="text-lg font-semibold text-text-invert">
              {mode === "import" ? "Import from GitHub" : "Save to GitHub"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-invert hover:text-plum"
          >
            <X size={20} />
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="px-4 py-2 text-sm text-text-muted flex items-center gap-1 border-b border-border-settings">
          {github.current.owner && (
            <>
              <span>{github.current.owner}</span>
              {github.current.repo && (
                <>
                  <ChevronRight size={14} />
                  <span>{github.current.repo}</span>
                </>
              )}
              {github.current.branch && (
                <>
                  <ChevronRight size={14} />
                  <span>{github.current.branch}</span>
                </>
              )}
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {step === "orgs" && (
            <div className="space-y-1">
              {github.orgs.map((org) => (
                <button
                  key={org.login}
                  onClick={() => handleOrgSelect(org.login)}
                  className="w-full text-left px-3 py-2 rounded text-text-invert
                             hover:bg-bg-highlight flex items-center justify-between"
                >
                  <span>{org.login}</span>
                  <ChevronRight size={16} className="text-text-muted" />
                </button>
              ))}
            </div>
          )}

          {step === "repos" && (
            <div className="space-y-1">
              {github.repos.map((repo) => (
                <button
                  key={repo.name}
                  onClick={() => handleRepoSelect(repo.name)}
                  className="w-full text-left px-3 py-2 rounded text-text-invert
                             hover:bg-bg-highlight flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Folder size={16} className="text-text-muted" />
                    <span>{repo.name}</span>
                    {repo.private && (
                      <span className="text-xs bg-bg-highlight px-1.5 py-0.5 rounded">
                        Private
                      </span>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-text-muted" />
                </button>
              ))}
            </div>
          )}

          {step === "branches" && (
            <div className="space-y-1">
              {github.branches.map((branch) => (
                <button
                  key={branch.name}
                  onClick={() => handleBranchSelect(branch.name)}
                  className="w-full text-left px-3 py-2 rounded text-text-invert
                             hover:bg-bg-highlight flex items-center justify-between"
                >
                  <span>{branch.name}</span>
                  <ChevronRight size={16} className="text-text-muted" />
                </button>
              ))}
            </div>
          )}

          {step === "files" && (
            <div className="space-y-1">
              {mode === "save" && (
                <div className="mb-4 p-3 bg-bg-highlight rounded">
                  <label className="block text-sm text-text-muted mb-1">
                    File name
                  </label>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="document.md"
                    className="w-full bg-bg-navbar text-text-invert px-3 py-2 rounded
                               border border-border-settings focus:border-plum outline-none"
                  />
                  <label className="block text-sm text-text-muted mb-1 mt-3">
                    Commit message
                  </label>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Update document"
                    className="w-full bg-bg-navbar text-text-invert px-3 py-2 rounded
                               border border-border-settings focus:border-plum outline-none"
                  />
                </div>
              )}

              {github.files.length === 0 ? (
                <p className="text-text-muted text-center py-4">
                  No markdown files found
                </p>
              ) : (
                github.files.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => handleFileSelect(file.path)}
                    className={`w-full text-left px-3 py-2 rounded text-text-invert
                               hover:bg-bg-highlight flex items-center justify-between
                               ${github.current.path === file.path ? "bg-bg-highlight" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-text-muted" />
                      <span>{file.path}</span>
                    </div>
                    {github.current.path === file.path && (
                      <Check size={16} className="text-plum" />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {mode === "save" && step === "files" && (
          <div className="p-4 border-t border-border-settings">
            <button
              onClick={handleSave}
              className="w-full bg-plum text-bg-sidebar py-2 px-4 rounded font-medium
                         hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Save to GitHub
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
