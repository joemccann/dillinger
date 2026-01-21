# Agent Learnings - Next.js Migration

This document captures key learnings and debugging insights from the Next.js migration project.

---

## Vercel Deployment - Subdirectory Configuration

**Problem:** Vercel was deploying the old Express.js app at the repository root instead of the Next.js app in `next-app/` subdirectory.

**Solution:**
1. Set **Root Directory** to `next-app` in Vercel Dashboard (Settings → General)
2. Create `vercel.json` inside `next-app/` directory (not repository root)
3. Minimal config works best:
   ```json
   {
     "$schema": "https://openapi.vercel.sh/vercel.json",
     "framework": "nextjs"
   }
   ```

**Key Insight:** When Root Directory is set to a subdirectory, Vercel looks for `vercel.json` INSIDE that subdirectory, not at the repository root. The framework detection works automatically once the config file is in the right place.

---

## Next.js API Routes - Static Generation Errors

**Problem:** Production build failed with errors like:
```
Dynamic server usage: Route /api/bitbucket/branches couldn't be rendered statically because it used `cookies`
```

**Root Cause:** Next.js tries to statically pre-render API routes during build by default. Routes that use `cookies()` or other dynamic server features must be explicitly marked as dynamic.

**Solution:** Add to the top of every API route file:
```typescript
export const dynamic = "force-dynamic";
```

**Files affected:** All 45 API route files in:
- `app/api/google-drive/`
- `app/api/onedrive/`
- `app/api/github/`
- `app/api/dropbox/`
- `app/api/bitbucket/`
- `app/api/medium/`
- `app/api/export/`
- `app/api/upload/`

**Implementation:** Used bash script to add export to all route files:
```bash
for file in $(find app/api -name "route.ts"); do
  echo 'export const dynamic = "force-dynamic";
' | cat - "$file" > /tmp/tempfile && mv /tmp/tempfile "$file"
done
```

---

## Google Drive OAuth Scopes

**Problem 1:** Files API returned empty array even though user had `.md` files in Drive.

**Root Cause:** Using `https://www.googleapis.com/auth/drive.file` scope only grants access to files created by the app itself.

**Solution:** Changed to `https://www.googleapis.com/auth/drive` scope in `app/api/google-drive/oauth/route.ts` to access all user files.

**Problem 2:** Status endpoint returned 401 "missing authentication credential".

**Root Cause:** Missing `openid` and `email` scopes required for `/oauth2/v2/userinfo` endpoint.

**Solution:** Updated scope to:
```typescript
scope: "openid email https://www.googleapis.com/auth/drive"
```

---

## Google Drive - Preventing Duplicate Files

**Problem:** Saving a file with the same name created duplicates instead of overwriting.

**Root Cause:** Google Drive allows duplicate filenames by default. The save route only updated files when an explicit `fileId` was provided.

**Solution:** Modified `app/api/google-drive/save/route.ts` to:
1. Check if file with same name exists in target folder
2. If exists, use that file ID to update it
3. If not, create new file

**Implementation:**
```typescript
if (!targetFileId) {
  const query = `name = '${fileName}' and '${parentId}' in parents and trashed = false`;
  const searchResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (searchResponse.ok) {
    const searchData = await searchResponse.json();
    if (searchData.files?.length > 0) {
      targetFileId = searchData.files[0].id;
    }
  }
}

// Use PATCH if targetFileId exists, POST if creating new
const method = targetFileId ? "PATCH" : "POST";
```

---

## OneDrive OAuth Fixes

**Problem 1:** OAuth callback failed with "invalid_request - redirect_uri mismatch" for consumer accounts.

**Solution:** Changed OAuth endpoint from `/common/` to `/consumers/` in `app/api/onedrive/oauth/route.ts`:
```typescript
const authUrl = `https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?${params}`;
```

**Problem 2:** Graph API returned 401 Unauthorized.

**Solution:** Added `User.Read` scope:
```typescript
scope: "User.Read Files.ReadWrite.All offline_access"
```

**Problem 3:** Files API returned "Operation not supported" when using `$filter`.

**Solution:** Removed `$filter` query parameter (not supported on personal OneDrive) and implemented server-side filtering:
```typescript
const files = data.value.filter((item) => {
  return item.folder || item.name.toLowerCase().endsWith('.md');
});
```

---

## Bitbucket OAuth Fixes

**Problem 1:** Token exchange failed with "redirect_uri does not match".

**Solution:** Added `redirect_uri` parameter to token exchange POST body in `app/api/bitbucket/callback/route.ts`.

**Problem 2:** API returned 403 "credentials lack required privilege scopes".

**Solution:** Added account and repository scopes:
```typescript
scope: "account repository"
```

**Note:** User must also enable these permissions in Bitbucket OAuth app settings.

**Problem 3:** Files API returned "Resource not found" when listing directory contents.

**Solution:** Added trailing slash to directory paths:
```typescript
const apiPath = path ? `/${path}/` : "/";
const url = `https://api.bitbucket.org/2.0/repositories/${workspace}/${repo}/src/${branch}${apiPath}`;
```

---

## React SSR/Hydration Issues

**Problem:** `Cannot read properties of null (reading 'useContext')` error during build.

**Root Cause:** StoreProvider was calling `useStore()` hook during render, creating closure issues between server and client.

**Solution:** Changed to use `useStore.getState()` in `useEffect` instead:
```typescript
const hasHydrated = useRef(false);

useEffect(() => {
  if (!hasHydrated.current) {
    useStore.getState().hydrate();
    hasHydrated.current = true;
  }
}, []);
```

---

## Scroll Sync Feature

**Problem:** Scroll sync toggle didn't work - enabling it didn't sync scrolling.

**Root Cause:** Scroll listener was set up in `handleMount` callback, which captured stale `settings` value in closure.

**Solution:** Moved listener setup to `useEffect` with `settings.enableScrollSync` dependency in `components/editor/MonacoEditor.tsx`:
```typescript
useEffect(() => {
  const editor = editorRef.current;
  if (!editor) return;

  const disposable = editor.onDidScrollChange(() => {
    if (settings.enableScrollSync) {
      const scrollTop = editor.getScrollTop();
      const scrollHeight = editor.getScrollHeight() - editor.getLayoutInfo().height;
      const percent = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      setEditorScrollPercent(percent);
    }
  });

  return () => disposable.dispose();
}, [settings.enableScrollSync, setEditorScrollPercent]);
```

---

## Dark Mode Preview

**Problem:** Night mode only affected Monaco editor, not the markdown preview panel.

**Solution:** Added conditional dark class to preview in `components/preview/MarkdownPreview.tsx`:
```typescript
className={`preview-html h-full overflow-auto p-6 ${
  settings.enableNightMode ? 'dark bg-[#1e1e1e]' : 'bg-bg-primary'
}`}
```

And added comprehensive dark mode CSS to `app/globals.css`:
```css
.dark.preview-html {
  color: #d4d4d4;
}

.dark.preview-html code {
  background: #2d2d2d;
  color: #d4d4d4;
}

.dark.preview-html pre {
  background: #2d2d2d;
}
/* ... more dark mode styles */
```

---

## Production Deployment Checklist

Created comprehensive checklist at `docs/PRODUCTION-OAUTH-CHECKLIST.md` covering:
- All 6 OAuth service configurations
- Redirect URI updates for production domain
- Environment variable setup in Vercel
- Testing checklist after deployment

**Key Reminder:** Most OAuth apps allow multiple redirect URIs, so you can add production URLs without removing localhost for local development.

---

## Common Patterns

### OAuth Scope Issues
- Always check provider documentation for required scopes
- `drive.file` vs `drive` - understand access levels
- Some APIs require `openid` and `email` for userinfo endpoints
- Personal vs organizational accounts may have different requirements

### API Route Best Practices
- Mark all routes using `cookies()` as `force-dynamic`
- Use server-side filtering when provider API doesn't support it
- Always include `redirect_uri` in OAuth token exchange
- Handle trailing slashes carefully in REST APIs

### Vercel Subdirectory Deployment
1. Set Root Directory in dashboard
2. Put `vercel.json` in that subdirectory
3. Let framework auto-detection work
4. Avoid custom build commands unless necessary

---

## References

- [Next.js Dynamic Server Usage](https://nextjs.org/docs/messages/dynamic-server-error)
- [Vercel Root Directory Configuration](https://vercel.com/docs/projects/project-configuration#root-directory)
- [Google Drive API Scopes](https://developers.google.com/drive/api/guides/api-specific-auth)
- [Microsoft Graph API Permissions](https://learn.microsoft.com/en-us/graph/permissions-reference)
- [Bitbucket OAuth](https://developer.atlassian.com/cloud/bitbucket/oauth-2/)
