<p align="center">
  <img src="https://github.com/user-attachments/assets/885053fb-b002-4168-98f5-56e583829983" alt="Dillinger Banner" width="100%" />
</p>

<h1 align="center">Dillinger</h1>

<p align="center">
  <strong>The last Markdown editor you'll ever need.</strong>
</p>

<p align="center">
  A modern, cloud-native Markdown editor built on Next.js — designed for speed, focus, and seamless sync.
</p>

<p align="center">
  <a href="#quick-start"><strong>Get Started</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#cloud-integrations"><strong>Integrations</strong></a> ·
  <a href="#deployment"><strong>Deploy</strong></a>
</p>

---

## ✨ Why Dillinger

Most markdown editors are either:
- bloated  
- offline-only  
- or lack serious developer ergonomics  

**Dillinger fixes that.**

It combines:
- ⚡ VS Code-grade editing  
- ☁️ Native cloud storage  
- 🧘 Distraction-free UX  
- 🔄 Real-time rendering  

---

## ⚡ Quick Start

```bash
npm install
npm run dev
````

Open → [http://localhost:3000](http://localhost:3000)

---

## 🧱 Requirements

* Node.js 18+
* npm / yarn / pnpm / bun

---

## 🚀 Features

### Editor Experience

* Monaco Editor (VS Code core)
* Syntax highlighting for Markdown
* Image paste support

### Live Workflow

* Real-time preview
* Scroll sync
* Instant feedback loop

### Focus Mode

* Zen Mode (`Cmd/Ctrl + Shift + Z`)
* Fullscreen, distraction-free writing

### File Handling

* Drag & drop `.md`, `.txt`, `.markdown`
* Auto-save (local persistence)

### Export

* Markdown
* HTML
* PDF

### Cloud Integrations

* GitHub
* Google Drive
* Dropbox
* OneDrive
* Bitbucket

---

## 🔐 Environment Setup

Create:

```bash
.env.local
```

### Template

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

# GitHub
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=http://localhost:3000/api/github/callback

# Dropbox
DROPBOX_CLIENT_ID=
DROPBOX_CLIENT_SECRET=
DROPBOX_REDIRECT_URI=http://localhost:3000/api/dropbox/callback
```

---

## ☁️ Cloud Integrations

Each provider requires OAuth configuration.

### Google Drive

* Enable Drive API
* Create OAuth credentials
* Redirect:

```
/api/google-drive/callback
```

### OneDrive

* Azure App Registration
* Permissions:

  * Files.ReadWrite
  * User.Read

### Bitbucket

* OAuth consumer
* Repo read/write access

### GitHub

* OAuth App
* Callback:

```
/api/github/callback
```

### Dropbox

* Scoped app
* Enable:

  * files.metadata.read
  * files.content.write

---

## 🚢 Deployment

Update all OAuth callbacks:

```bash
https://yourdomain.com/api/{provider}/callback
```

Then:

```bash
npm run build
npm start
```

---

## 🏗 Tech Stack

| Layer     | Technology   |
| --------- | ------------ |
| Framework | Next.js 14   |
| Editor    | Monaco       |
| Styling   | Tailwind CSS |
| State     | Zustand      |
| Icons     | Lucide       |

---

## 📦 Scripts

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm start                # Start production server
npm run lint             # ESLint
npm run test             # Unit + E2E tests
npm run test:unit        # Vitest unit/integration tests
npm run test:watch       # Vitest watch mode
npm run test:e2e         # Playwright E2E tests
npm run test:e2e:headed  # E2E in visible browser
npm run verify           # Lint + typecheck + all tests
```

---

## 🧪 Testing

294 unit/integration tests (Vitest) + 39 E2E tests (Playwright) with 98% code coverage.

```bash
npm run test:unit                # Run all unit tests
npx vitest run --coverage        # With coverage report
npm run test:e2e:headed          # E2E in visible browser
```

Tests live in `tests/` organized by type: `lib/`, `store/`, `hooks/`, `components/`, `routes/`, and `e2e/`.

---

## 🧭 Philosophy

Dillinger is built around a simple idea:

> Writing tools should disappear.

No friction.
No clutter.
Just flow.

---

## 🤝 Contributing

PRs welcome. Open an issue first for major changes.

---

## 📄 License

MIT
