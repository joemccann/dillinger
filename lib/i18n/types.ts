import type { LocaleId } from "./locales";

/**
 * Flat message keys used across the Dillinger UI.
 *
 * Keys are grouped by feature area (navbar, sidebar, settings, modals,
 * editor, toasts). Add a new key to every locale dictionary when extending.
 */
export type MessageKey =
  // Navbar
  | "navbar.import"
  | "navbar.image"
  | "navbar.exportAs"
  | "navbar.toggleSidebar"
  | "navbar.importFile"
  | "navbar.insertImage"
  | "navbar.exportDocument"
  | "navbar.exportFormats"
  | "navbar.hidePreview"
  | "navbar.showPreview"
  | "navbar.enterZenMode"
  | "navbar.zenModeShortcut"
  | "navbar.openSettings"
  | "navbar.openSettings"

  // Sidebar
  | "sidebar.services"
  | "sidebar.importFrom"
  | "sidebar.saveTo"
  | "sidebar.documents"
  | "sidebar.newDocument"
  | "sidebar.saveSession"
  | "sidebar.deleteDocument"
  | "sidebar.link"
  | "sidebar.unlink"
  | "sidebar.linkLabel"
  | "sidebar.unlinkLabel"

  // Settings
  | "settings.title"
  | "settings.close"
  | "settings.autoSave"
  | "settings.wordCount"
  | "settings.characterCount"
  | "settings.nightMode"
  | "settings.scrollSync"
  | "settings.tabSize"
  | "settings.keybindings"
  | "settings.vim"
  | "settings.emacs"
  | "settings.default"
  | "settings.language"
  | "settings.english"
  | "settings.farsi"

  // Editor
  | "editor.noDocument"
  | "editor.words"
  | "editor.characters"
  | "editor.saveTitle"
  | "editor.documentTitle"
  | "editor.unsaved"
  | "editor.saved"
  | "editor.editTitle"
  | "editor.renameDocument"
  | "editor.dropFileTitle"
  | "editor.dropFileSubtitle"
  | "editor.exitZenMode"

  // Modals - generic
  | "modal.close"
  | "modal.goBack"
  | "modal.cancel"
  | "modal.save"
  | "modal.fileName"
  | "modal.commitMessage"
  | "modal.noFiles"
  | "modal.private"
  | "modal.placeholderDocument"
  | "modal.placeholderCommitMessage"
  | "modal.workspace"
  | "modal.repository"
  | "modal.branch"
  | "modal.selectWorkspace"
  | "modal.selectRepository"
  | "modal.selectBranch"

  // Modals - delete
  | "delete.title"
  | "delete.description"
  | "delete.confirm"
  | "delete.cannotDeleteLast"
  | "delete.deleteDocument"

  // Modals - cloud connect
  | "cloud.connectTitle.github"
  | "cloud.connectTitle.dropbox"
  | "cloud.connectTitle.googleDrive"
  | "cloud.connectTitle.oneDrive"
  | "cloud.connectTitle.bitbucket"
  | "cloud.connectDescription.github"
  | "cloud.connectDescription.dropbox"
  | "cloud.connectDescription.googleDrive"
  | "cloud.connectDescription.oneDrive"
  | "cloud.connectDescription.bitbucket"
  | "cloud.connectButton.github"
  | "cloud.connectButton.dropbox"
  | "cloud.connectButton.googleDrive"
  | "cloud.connectButton.oneDrive"
  | "cloud.connectButton.bitbucket"
  | "cloud.importFrom.github"
  | "cloud.importFrom.dropbox"
  | "cloud.importFrom.googleDrive"
  | "cloud.importFrom.oneDrive"
  | "cloud.importFrom.bitbucket"
  | "cloud.saveTo.github"
  | "cloud.saveTo.dropbox"
  | "cloud.saveTo.googleDrive"
  | "cloud.saveTo.oneDrive"
  | "cloud.saveTo.bitbucket"

  // Keyboard shortcuts
  | "shortcuts.title"
  | "shortcuts.editor"
  | "shortcuts.view"
  | "shortcuts.help"
  | "shortcuts.undo"
  | "shortcuts.redo"
  | "shortcuts.cutLine"
  | "shortcuts.duplicateLine"
  | "shortcuts.toggleComment"
  | "shortcuts.find"
  | "shortcuts.findReplace"
  | "shortcuts.toggleZen"
  | "shortcuts.exitZen"
  | "shortcuts.keyboardShortcuts"

  // Drop overlay

  // Import
  | "import.unsupportedType"
  | "import.convertFailed"

  // Toasts
  | "toast.documentsSaved"
  | "toast.documentDeleted"
  | "toast.imported"
  | "toast.importFailed"
  | "toast.exportPreparing"
  | "toast.exportedStyledHtml"
  | "toast.exportedFormat"
  | "toast.exportFailedConnection"
  | "toast.exportFailed"
  | "toast.disconnected"
  | "toast.disconnectFailed"
  | "toast.fetchFailed"
  | "toast.fetchingFiles"
  | "toast.fetchingFile"
  | "toast.fetchingOrganizations"
  | "toast.fetchingRepositories"
  | "toast.fetchingBranches"
  | "toast.saving"
  | "toast.saveSuccess"
  | "toast.saveFailed"
  | "toast.unknownError"
  | "toast.noFileSelected"
  | "toast.fileImported"
  | "toast.fileSaved"
  | "toast.uploaded"
  | "toast.uploadFailed"
  | "toast.failedToNavigateFolder"
  | "toast.failedToNavigateBack"
  | "toast.notifications"
  | "toast.dismissNotification"
  | "preview.emptyState"
  | "editor.emacsUnavailable"
  | "error.title"
  | "error.description"
  | "error.tryAgain"
  | "notFound.description"
  | "notFound.goHome";

/** One message bag per locale. */
export interface Messages {
  locale: LocaleId;
  dir: "ltr" | "rtl";
  /** @returns the Farsi-compatible digits when locale is fa, otherwise converts nothing. */
  formatNumber: (value: number) => string;
  [key: string]: LocaleId | "ltr" | "rtl" | ((value: number) => string) | string;
}

export type MessageDict = Record<MessageKey, string>;
