# Dillinger - Next.js

A modern markdown editor built with Next.js 14, featuring cloud storage integrations, real-time preview, and a distraction-free writing experience.

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build

```bash
npm run build
npm start
```

## Features

- **Monaco Editor** - VS Code's editor with markdown syntax highlighting
- **Live Preview** - Real-time markdown rendering with scroll sync
- **Zen Mode** - Distraction-free fullscreen editing (Cmd/Ctrl+Shift+Z)
- **Cloud Integrations** - GitHub, Dropbox, Google Drive, OneDrive, Bitbucket
- **Export Options** - Markdown, HTML, PDF
- **Publish to Medium** - Direct publishing from the editor
- **Drag & Drop Import** - Drop .md, .txt, or .markdown files
- **Image Paste** - Paste images directly into the editor
- **Local Storage** - Documents persist automatically

## Cloud Service Setup

To enable cloud integrations, create a `.env.local` file in this directory with your OAuth credentials.

### Google Drive

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth client ID**
5. Configure the OAuth consent screen if prompted:
   - User Type: External
   - Add your email as a test user
6. Application type: **Web application**
7. Add Authorized redirect URI: `http://localhost:3000/api/google-drive/callback`
8. Copy the **Client ID** and **Client Secret**
9. Go to **APIs & Services → Library** and enable the **Google Drive API**

```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-drive/callback
```

### OneDrive (Microsoft)

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory → App registrations**
3. Click **New registration**
4. Name: "Dillinger"
5. Supported account types: **Personal Microsoft accounts only** (or multi-tenant)
6. Redirect URI: **Web** → `http://localhost:3000/api/onedrive/callback`
7. Click **Register**
8. Go to **API permissions → Add a permission**
9. Select **Microsoft Graph → Delegated permissions**
10. Add: `Files.ReadWrite`, `User.Read`
11. Go to **Certificates & secrets → New client secret**
12. Copy the secret **Value** immediately (shown only once)

```bash
ONEDRIVE_CLIENT_ID=your_application_client_id
ONEDRIVE_CLIENT_SECRET=your_client_secret_value
ONEDRIVE_REDIRECT_URI=http://localhost:3000/api/onedrive/callback
```

### Bitbucket

1. Go to [Bitbucket Settings](https://bitbucket.org/account/settings/)
2. Navigate to **OAuth consumers** (under Access Management)
3. Click **Add consumer**
4. Name: "Dillinger"
5. Callback URL: `http://localhost:3000/api/bitbucket/callback`
6. Permissions: Check **Repositories: Read/Write**
7. Click **Save**
8. Copy the **Key** (client ID) and **Secret**

```bash
BITBUCKET_CLIENT_ID=your_consumer_key
BITBUCKET_CLIENT_SECRET=your_consumer_secret
BITBUCKET_REDIRECT_URI=http://localhost:3000/api/bitbucket/callback
```

### Medium

1. Go to [Medium Settings](https://medium.com/me/settings)
2. Scroll to **Integration tokens** section
3. For full OAuth support, email Medium at yourfriends@medium.com to request API access
4. Once approved, you'll receive client credentials

```bash
MEDIUM_CLIENT_ID=your_client_id
MEDIUM_CLIENT_SECRET=your_client_secret
MEDIUM_REDIRECT_URI=http://localhost:3000/api/medium/callback
```

### GitHub (Pre-configured)

GitHub integration uses existing credentials from the legacy app. If needed:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Application name: "Dillinger"
4. Homepage URL: `http://localhost:3000`
5. Authorization callback URL: `http://localhost:3000/api/github/callback`

```bash
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/api/github/callback
```

### Dropbox (Pre-configured)

Dropbox integration uses existing credentials. If needed:

1. Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Click **Create app**
3. Choose **Scoped access** and **Full Dropbox**
4. Name your app
5. Add redirect URI: `http://localhost:3000/api/dropbox/callback`
6. Under Permissions, enable `files.metadata.read` and `files.content.write`

```bash
DROPBOX_CLIENT_ID=your_app_key
DROPBOX_CLIENT_SECRET=your_app_secret
DROPBOX_REDIRECT_URI=http://localhost:3000/api/dropbox/callback
```

### Complete `.env.local` Template

```bash
# Google Drive
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-drive/callback

# OneDrive
ONEDRIVE_CLIENT_ID=
ONEDRIVE_CLIENT_SECRET=
ONEDRIVE_REDIRECT_URI=http://localhost:3000/api/onedrive/callback

# Bitbucket
BITBUCKET_CLIENT_ID=
BITBUCKET_CLIENT_SECRET=
BITBUCKET_REDIRECT_URI=http://localhost:3000/api/bitbucket/callback

# Medium
MEDIUM_CLIENT_ID=
MEDIUM_CLIENT_SECRET=
MEDIUM_REDIRECT_URI=http://localhost:3000/api/medium/callback

# GitHub (if not using legacy credentials)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=http://localhost:3000/api/github/callback

# Dropbox (if not using legacy credentials)
DROPBOX_CLIENT_ID=
DROPBOX_CLIENT_SECRET=
DROPBOX_REDIRECT_URI=http://localhost:3000/api/dropbox/callback
```

## Production Deployment

For production, update all redirect URIs to your production domain (e.g., `https://yourdomain.com/api/google-drive/callback`).

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Editor**: Monaco Editor
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Icons**: Lucide React

## License

MIT
