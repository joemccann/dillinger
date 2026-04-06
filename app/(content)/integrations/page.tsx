import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Integrations",
  description:
    "Connect Dillinger to GitHub, Dropbox, Google Drive, OneDrive, and Bitbucket. Import, edit, and save markdown files directly to your cloud storage.",
  alternates: { canonical: "https://dillinger.io/integrations" },
};

const INTEGRATIONS = [
  {
    name: "GitHub",
    description:
      "Import markdown files from any repository. Edit them in Dillinger with live preview, then save back to GitHub with a single click. Works with public and private repos.",
    useCases: [
      "Edit README.md files with live preview",
      "Write documentation directly in the browser",
      "Review and update wiki pages",
      "Draft release notes in markdown",
    ],
  },
  {
    name: "Dropbox",
    description:
      "Access your Dropbox markdown files from any device. Dillinger connects via OAuth, so your credentials stay secure. Edit and save without leaving the browser.",
    useCases: [
      "Edit notes and drafts stored in Dropbox",
      "Sync work documents across devices",
      "Maintain a personal knowledge base",
    ],
  },
  {
    name: "Google Drive",
    description:
      "Import and save markdown files to Google Drive. Your documents are accessible from Gmail, Google Docs, and any device signed into your Google account.",
    useCases: [
      "Store markdown alongside Google Docs",
      "Share formatted documents via Drive links",
      "Access files from any device with Google sign-in",
    ],
  },
  {
    name: "OneDrive",
    description:
      "Connect your Microsoft OneDrive account to import and save markdown files. Integrates with the Microsoft ecosystem for seamless document management.",
    useCases: [
      "Edit documents in the Microsoft ecosystem",
      "Sync with SharePoint and Teams",
      "Access files from Windows, macOS, and mobile",
    ],
  },
  {
    name: "Bitbucket",
    description:
      "Import and save files to Bitbucket repositories. Ideal for teams using Atlassian tools who want a dedicated markdown editing experience.",
    useCases: [
      "Edit repository documentation",
      "Update project README files",
      "Write Confluence-compatible markdown content",
    ],
  },
];

export default function IntegrationsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-4">Integrations</h1>
      <p className="text-text-muted text-lg mb-12 max-w-2xl">
        Dillinger connects to five major cloud platforms. Import files, edit
        with live preview, and save back — all from your browser.
      </p>

      <div className="space-y-12">
        {INTEGRATIONS.map((integration) => (
          <section
            key={integration.name}
            id={integration.name.toLowerCase().replace(/\s+/g, "-")}
            className="border-b border-border-light pb-12 last:border-0"
          >
            <h2 className="text-2xl font-bold mb-3">{integration.name}</h2>
            <p className="text-text-muted leading-relaxed mb-6">
              {integration.description}
            </p>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
                Use cases
              </h3>
              <ul className="space-y-2 text-text-muted">
                {integration.useCases.map((uc) => (
                  <li key={uc} className="flex items-start gap-2">
                    <span className="text-plum mt-1 shrink-0">-</span>
                    <span>{uc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-border-light text-center">
        <h2 className="text-2xl font-bold mb-3">
          Connect your first service
        </h2>
        <p className="text-text-muted mb-6">
          Open the editor, click the sidebar menu, and link any cloud provider
          in seconds.
        </p>
        <Link
          href="/"
          className="inline-block bg-plum text-bg-sidebar px-6 py-3 rounded font-medium hover:opacity-90 transition-opacity"
        >
          Open the Editor
        </Link>
      </div>
    </div>
  );
}
