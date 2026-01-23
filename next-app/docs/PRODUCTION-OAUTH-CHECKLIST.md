# Production OAuth Configuration Checklist

Before deploying the Next.js app to production, update ALL OAuth applications with production URLs.

## Production URL Format
Your production redirect URIs will be:
- Base URL: `https://your-production-domain.com` (or `https://dillinger.vercel.app`)
- Callback pattern: `https://your-production-domain.com/api/{service}/callback`

---

## Google Drive

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [ ] Select your OAuth 2.0 Client ID
- [ ] Add production Authorized redirect URI:
  ```
  https://your-production-domain.com/api/google-drive/callback
  ```
- [ ] Update Vercel environment variables:
  ```
  GOOGLE_CLIENT_ID=your_client_id
  GOOGLE_CLIENT_SECRET=your_client_secret
  NEXT_PUBLIC_APP_URL=https://your-production-domain.com
  ```

---

## OneDrive (Microsoft)

- [ ] Go to [Azure Portal](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
- [ ] Select your app registration
- [ ] Go to "Authentication" → "Add a platform" → "Web"
- [ ] Add production redirect URI:
  ```
  https://your-production-domain.com/api/onedrive/callback
  ```
- [ ] Update Vercel environment variables:
  ```
  ONEDRIVE_CLIENT_ID=your_client_id
  ONEDRIVE_CLIENT_SECRET=your_client_secret
  NEXT_PUBLIC_APP_URL=https://your-production-domain.com
  ```

---

## GitHub

- [ ] Go to [GitHub Developer Settings](https://github.com/settings/developers)
- [ ] Select your OAuth App (or create new one for production)
- [ ] Update Authorization callback URL:
  ```
  https://your-production-domain.com/api/github/callback
  ```
- [ ] Update Vercel environment variables:
  ```
  GITHUB_CLIENT_ID=your_client_id
  GITHUB_CLIENT_SECRET=your_client_secret
  NEXT_PUBLIC_APP_URL=https://your-production-domain.com
  ```

---

## Dropbox

- [ ] Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
- [ ] Select your app
- [ ] Under "OAuth 2" → "Redirect URIs", add:
  ```
  https://your-production-domain.com/api/dropbox/callback
  ```
- [ ] Update Vercel environment variables:
  ```
  DROPBOX_APP_KEY=your_app_key
  DROPBOX_APP_SECRET=your_app_secret
  NEXT_PUBLIC_APP_URL=https://your-production-domain.com
  ```

---

## Bitbucket

- [ ] Go to [Bitbucket OAuth Consumers](https://bitbucket.org/account/settings/app-passwords/)
- [ ] Select your OAuth consumer
- [ ] Update Callback URL:
  ```
  https://your-production-domain.com/api/bitbucket/callback
  ```
- [ ] Update Vercel environment variables:
  ```
  BITBUCKET_CLIENT_ID=your_client_id
  BITBUCKET_CLIENT_SECRET=your_client_secret
  NEXT_PUBLIC_APP_URL=https://your-production-domain.com
  ```

---

## Medium

- [ ] Go to [Medium Settings](https://medium.com/me/settings/security)
- [ ] Update OAuth callback URL:
  ```
  https://your-production-domain.com/api/medium/callback
  ```
- [ ] Update Vercel environment variables:
  ```
  MEDIUM_CLIENT_ID=your_client_id
  MEDIUM_CLIENT_SECRET=your_client_secret
  NEXT_PUBLIC_APP_URL=https://your-production-domain.com
  ```

---

## Vercel Environment Variables

In Vercel dashboard, set all environment variables for **Production** environment:

```bash
# Google Drive
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# OneDrive
ONEDRIVE_CLIENT_ID=
ONEDRIVE_CLIENT_SECRET=

# GitHub
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Dropbox
DROPBOX_APP_KEY=
DROPBOX_APP_SECRET=

# Bitbucket
BITBUCKET_CLIENT_ID=
BITBUCKET_CLIENT_SECRET=

# Medium
MEDIUM_CLIENT_ID=
MEDIUM_CLIENT_SECRET=

# App URL (CRITICAL - used for all OAuth redirects)
NEXT_PUBLIC_APP_URL=https://your-production-domain.com

# Node Environment
NODE_ENV=production
```

---

## Testing Checklist (After Production Deploy)

After updating all OAuth apps and deploying to production:

- [ ] Test Google Drive: Connect → List Files → Save File → Import File
- [ ] Test OneDrive: Connect → List Files → Save File → Import File
- [ ] Test GitHub: Connect → List Repos → List Files → Save File
- [ ] Test Dropbox: Connect → List Files → Save File → Import File
- [ ] Test Bitbucket: Connect → List Repos → List Files → Save File
- [ ] Test Medium: Connect → Publish Post
- [ ] Test all export formats: HTML, Markdown, PDF
- [ ] Test drag & drop file import
- [ ] Test image upload
- [ ] Test zen mode toggle
- [ ] Test scroll sync toggle
- [ ] Test night mode toggle

---

## Important Notes

1. **NEXT_PUBLIC_APP_URL is critical** - All OAuth callbacks use this to construct redirect URIs
2. **You can keep localhost URLs** in OAuth apps for local development alongside production URLs
3. **OAuth apps allow multiple redirect URIs** - add production without removing localhost
4. **Some providers require review** - If you added new scopes, some OAuth apps may need re-approval
5. **Clear cookies** - After deploying, users may need to reconnect their accounts with new tokens

---

## Quick Reference: All Callback URLs

```
https://your-production-domain.com/api/google-drive/callback
https://your-production-domain.com/api/onedrive/callback
https://your-production-domain.com/api/github/callback
https://your-production-domain.com/api/dropbox/callback
https://your-production-domain.com/api/bitbucket/callback
https://your-production-domain.com/api/medium/callback
```
