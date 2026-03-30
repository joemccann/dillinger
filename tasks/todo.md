# Task Plan

## Dependency Graph

- T1: Freeze the executable ship scope for the nested Next.js worktree and translate the finish report into an implementation plan. `depends_on: []`
- T2: Add automated verification infrastructure in the Next.js worktree for unit/integration coverage and browser E2E automation. `depends_on: [T1]`
- T3: Restore markdown, preview, import/export, and editor-state parity required by the frozen ship scope. `depends_on: [T2]`
- T4: Finish image handling, service/OAuth consistency, and documentation cleanup in the Next.js worktree. `depends_on: [T2, T3]`
- T5: Run the release gate in the Next.js worktree: tests, typecheck, lint, build, and browser UI/UX verification. `depends_on: [T3, T4]`

## Tasks

- [x] T1 Freeze the executable ship scope for the nested Next.js worktree and translate the finish report into an implementation plan.
- [x] T2 Add automated verification infrastructure in the Next.js worktree for unit/integration coverage and browser E2E automation.
- [x] T3 Restore markdown, preview, import/export, and editor-state parity required by the frozen ship scope.
- [x] T4 Finish image handling, service/OAuth consistency, and documentation cleanup in the Next.js worktree.
- [x] T5 Run the release gate in the Next.js worktree: tests, typecheck, lint, build, and browser UI/UX verification.

## Review

- In scope: `/Users/joemccann/dev/vercel/dillinger/.worktrees/nextjs-migration/next-app`.
- Frozen ship target for execution: bring the current Next.js app up to the behavior claimed by its own README and migration docs, with local proof via automated tests and browser E2E.
- Initial execution baseline: the nested worktree already passes `npx tsc --noEmit`, `npm run lint`, and `npm run build`, but it still has no test harness and known parity gaps in markdown rendering, import/export behavior, image handling, settings wiring, and integration consistency.
- Completed implementation: added a Vitest + Playwright verification stack, production-mode `verify` script, HTML import conversion route, local/cloud import flows that create new documents instead of overwriting the current one, image insertion UI + upload coverage, explicit plain/styled HTML export semantics, export filename normalization, and OAuth base URL normalization across service routes.
- Browser proof: Playwright now seeds the app, verifies shell controls, counts, settings, local markdown import, local HTML import conversion, image insertion, legacy-style document preservation, and plain/styled HTML download behavior against the production server.
- Final release gate result in `/Users/joemccann/dev/vercel/dillinger/.worktrees/nextjs-migration/next-app`: `npm run verify` passed, which runs `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`, and production-server `playwright test`.

## Production Handoff Report

### Dependency Graph

- T1: Audit the nested Next.js worktree changes, verification state, and deployment docs for a production handoff summary. `depends_on: []`
- T2: Identify the remaining Vercel, beta-domain, OAuth, and API rollout work needed to ship the Next.js app. `depends_on: [T1]`
- T3: Generate and open an HTML report that captures completed changes, production rollout steps, and residual risks. `depends_on: [T1, T2]`

### Tasks

- [x] T1 Audit the nested Next.js worktree changes, verification state, and deployment docs for a production handoff summary.
- [x] T2 Identify the remaining Vercel, beta-domain, OAuth, and API rollout work needed to ship the Next.js app.
- [x] T3 Generate and open an HTML report that captures completed changes, production rollout steps, and residual risks.

### Review

- Report artifact: `/Users/joemccann/dev/vercel/dillinger/.worktrees/nextjs-migration/next-app/docs/reports/2026-03-10-nextjs-production-handoff-report.html`.
- The handoff report scopes the real migration app under `/Users/joemccann/dev/vercel/dillinger/.worktrees/nextjs-migration/next-app`, not the root checkout.
- It summarizes the implemented diff, the local verification evidence, the remaining Vercel and domain setup, the required environment variables by provider, and the OAuth callback/API follow-up needed before production.
- The rollout recommendation is a stable beta branch mapped to `beta.dillinger.io`, because OAuth providers need fixed callback URLs rather than transient preview deployment URLs.
- Highest-risk hosted checks still required after deployment: PDF export on Vercel, each OAuth callback end-to-end, and any beta deployment protection that could interfere with third-party redirects back into `/api/*/callback`.

## Vercel Rollout

### Dependency Graph

- T1: Audit the Next.js worktree, existing Vercel project/domain state, and local secret sources so rollout inputs are known. `depends_on: []`
- T2: Record the deployment plan with explicit verification gates before changing Git or Vercel state. `depends_on: [T1]`
- T3: Commit and push the Next.js migration branch, then verify the remote branch contains the new commit. `depends_on: [T1, T2]`
- T4: Create or update the Vercel project so the root directory is `next-app`, then verify the linked project settings. `depends_on: [T3]`
- T5: Stand up the stable beta domain mapping and configure `NEXT_PUBLIC_APP_URL` for beta and production, then verify both in Vercel state. `depends_on: [T4]`
- T6: Add provider secrets in Vercel for the enabled services and verify they are present in the intended environments. `depends_on: [T5]`
- T7: Run deployment-facing verification and update the rollout review with the exact state achieved and any blockers. `depends_on: [T6]`

### Tasks

- [x] T1 Audit the Next.js worktree, existing Vercel project/domain state, and local secret sources so rollout inputs are known.
- [x] T2 Record the deployment plan with explicit verification gates before changing Git or Vercel state.
- [x] T3 Commit and push the Next.js migration branch, then verify the remote branch contains the new commit.
- [x] T4 Create or update the Vercel project so the root directory is `next-app`, then verify the linked project settings.
- [x] T5 Stand up the stable beta domain mapping and configure `NEXT_PUBLIC_APP_URL` for beta and production, then verify both in Vercel state.
- [x] T6 Add provider secrets in Vercel for the enabled services and verify they are present in the intended environments.
- [x] T7 Run deployment-facing verification and update the rollout review with the exact state achieved and any blockers.

### Review

- Pushed `feature/nextjs-migration` to `origin` at commit `814f2098c6db2c3d34bd4e9606784ea552725281` and verified the remote branch SHA matches.
- Updated the existing Vercel project `joe-mccanns-projects/dillinger` so it remains rooted at `next-app` but now uses the correct `Next.js` framework preset instead of stale Angular-specific settings.
- Linked `/Users/joemccann/dev/vercel/dillinger/.worktrees/nextjs-migration/next-app` to the Vercel project locally via `.vercel/project.json`.
- Added `beta.dillinger.io` to the `dillinger` project with `gitBranch=feature/nextjs-migration` and verified the project-domain record shows that branch binding.
- Set `NEXT_PUBLIC_APP_URL=https://beta.dillinger.io` for `Preview (feature/nextjs-migration)` and `NEXT_PUBLIC_APP_URL=https://dillinger.io` for `Production`, then verified both env records via `vercel env ls`.
- Loaded and applied all 12 provider variables from `.env.local` to both `Preview (feature/nextjs-migration)` and `Production`: GitHub, Dropbox, Google Drive, OneDrive, Bitbucket, and Medium client ID/secret pairs. Verified all 12 provider vars plus `NEXT_PUBLIC_APP_URL` in both targets.
- Redeployed the refreshed preview deployment and verified `beta.dillinger.io` aliases to `https://dillinger-nzbzrjava-joe-mccanns-projects.vercel.app`.
- Current blocker surfaced by verification: `curl -I https://beta.dillinger.io` returns `HTTP/2 401` from Vercel Authentication. The beta domain is live and correctly mapped, but public beta access and OAuth callback testing will remain blocked until preview deployment protection is relaxed or bypassed for this branch/domain.

## OAuth Next Steps

### Dependency Graph

- T1: Extract the exact OAuth callback endpoints and env usage from the Next.js app. `depends_on: []`
- T2: Verify current provider-side setup requirements from official docs for GitHub, Dropbox, Google Drive, OneDrive, Bitbucket, and Medium. `depends_on: [T1]`
- T3: Summarize the exact next actions required in provider consoles and Vercel/beta access for each OAuth provider. `depends_on: [T1, T2]`

### Tasks

- [x] T1 Extract the exact OAuth callback endpoints and env usage from the Next.js app.
- [x] T2 Verify current provider-side setup requirements from official docs for GitHub, Dropbox, Google Drive, OneDrive, Bitbucket, and Medium.
- [x] T3 Summarize the exact next actions required in provider consoles and Vercel/beta access for each OAuth provider.

### Review

- The app builds every OAuth redirect URI from `NEXT_PUBLIC_APP_URL`, falling back to `NEXT_PUBLIC_BASE_URL`, in [env.ts](/Users/joemccann/dev/vercel/dillinger/.worktrees/nextjs-migration/next-app/lib/env.ts#L1).
- Current callback paths and requested scopes are implemented in:
  [google-drive/oauth/route.ts](/Users/joemccann/dev/vercel/dillinger/.worktrees/nextjs-migration/next-app/app/api/google-drive/oauth/route.ts#L16),
  [onedrive/oauth/route.ts](/Users/joemccann/dev/vercel/dillinger/.worktrees/nextjs-migration/next-app/app/api/onedrive/oauth/route.ts#L16),
  [github/oauth/route.ts](/Users/joemccann/dev/vercel/dillinger/.worktrees/nextjs-migration/next-app/app/api/github/oauth/route.ts#L17),
  [dropbox/oauth/route.ts](/Users/joemccann/dev/vercel/dillinger/.worktrees/nextjs-migration/next-app/app/api/dropbox/oauth/route.ts#L18),
  [bitbucket/oauth/route.ts](/Users/joemccann/dev/vercel/dillinger/.worktrees/nextjs-migration/next-app/app/api/bitbucket/oauth/route.ts#L16),
  [medium/oauth/route.ts](/Users/joemccann/dev/vercel/dillinger/.worktrees/nextjs-migration/next-app/app/api/medium/oauth/route.ts#L16).
- The highest-priority non-provider blocker is still Vercel Authentication on `beta.dillinger.io`; third-party callbacks will not complete while beta returns `401`.
- Provider-specific next steps differ materially:
  Google and Microsoft support multiple registered redirect URIs, GitHub OAuth Apps do not, Bitbucket OAuth consumers use a single callback base, Dropbox expects exact registered redirect URIs, and Medium no longer allows new integrations.

## OAuth Report Export And PDF Investigation

### Dependency Graph

- T1: Extract the OAuth handoff content and generate an HTML report file with a markdown-version code block at the bottom. `depends_on: []`
- T2: Reproduce the beta PDF export failure in the currently open Chrome instance and confirm the user-facing error. `depends_on: []`
- T3: Inspect the beta deployment runtime and local PDF export implementation to determine the server-side failure cause. `depends_on: [T2]`
- T4: Summarize findings, update task tracking, and point to the generated HTML artifact. `depends_on: [T1, T3]`

### Tasks

- [x] T1 Extract the OAuth handoff content and generate an HTML report file with a markdown-version code block at the bottom.
- [x] T2 Reproduce the beta PDF export failure in the currently open Chrome instance and confirm the user-facing error.
- [x] T3 Inspect the beta deployment runtime and local PDF export implementation to determine the server-side failure cause.
- [x] T4 Summarize findings, update task tracking, and point to the generated HTML artifact.

### Review

- Generated report artifact: `/Users/joemccann/dev/vercel/dillinger/.worktrees/nextjs-migration/next-app/docs/reports/2026-03-10-oauth-next-steps-and-pdf-investigation.html`.
- The report includes the OAuth provider next steps plus a literal markdown code block of the report content at the bottom, as requested.
- Reproduced the browser-side beta investigation by switching the active tab in the currently open Google Chrome instance to `https://beta.dillinger.io/api/export/pdf` and verifying the active tab URL/title.
- Browser DOM introspection through AppleScript was blocked because Chrome's `Allow JavaScript from Apple Events` setting is disabled on this machine. That prevented reading the page body directly from the Chrome process, but did not block URL/title verification.
- Verified a real beta application failure through Vercel logs: `POST /api/export/pdf` on `feature/nextjs-migration` returns `500`.
- Confirmed the likely root cause locally by invoking `mdToPdf()` directly in the Next.js worktree; it fails with `Could not find Chrome (ver. 143.0.7499.192)`.
- The implementation in `/Users/joemccann/dev/vercel/dillinger/.worktrees/nextjs-migration/next-app/app/api/export/pdf/route.ts` uses `md-to-pdf`, which launches Puppeteer without a Vercel-compatible Chromium strategy and swallows the underlying exception in a bare `catch`.

## PDF Export Fix

### Dependency Graph

- T1: Audit the current PDF export route, its dependencies, and any existing test coverage to define the minimal Vercel-compatible fix. `depends_on: []`
- T2: Implement a serverless-compatible PDF export path and add regression tests for the route behavior. `depends_on: [T1]`
- T3: Run local verification for lint/typecheck/tests/build on the updated PDF export path. `depends_on: [T2]`
- T4: Commit the fix, push the branch, redeploy beta, and verify the hosted PDF export endpoint. `depends_on: [T3]`
- T5: Update task tracking with the exact outcome, including any residual runtime constraints. `depends_on: [T4]`

### Tasks

- [x] T1 Audit the current PDF export route, its dependencies, and any existing test coverage to define the minimal Vercel-compatible fix.
- [x] T2 Implement a serverless-compatible PDF export path and add regression tests for the route behavior.
- [x] T3 Run local verification for lint/typecheck/tests/build on the updated PDF export path.
- [x] T4 Commit the fix, push the branch, redeploy beta, and verify the hosted PDF export endpoint.
- [x] T5 Update task tracking with the exact outcome, including any residual runtime constraints.

### Review

- Replaced the old `md-to-pdf` route implementation with a dedicated PDF helper that renders existing Dillinger markdown HTML and launches Chromium through `puppeteer-core` plus `@sparticuz/chromium`.
- Added route-level regression coverage in `/Users/joemccann/dev/vercel/dillinger/.worktrees/nextjs-migration/next-app/tests/routes/export-pdf.route.test.ts` for validation, success headers, and error handling.
- Added `experimental.serverComponentsExternalPackages` for `@sparticuz/chromium` and `puppeteer-core` in `/Users/joemccann/dev/vercel/dillinger/.worktrees/nextjs-migration/next-app/next.config.mjs`.
- Added a Vercel function include rule in `/Users/joemccann/dev/vercel/dillinger/.worktrees/nextjs-migration/next-app/vercel.json` so the Chromium `bin` brotli assets are bundled for `app/api/export/pdf/route.ts`.
- Local verification passed in `/Users/joemccann/dev/vercel/dillinger/.worktrees/nextjs-migration/next-app`: `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`, `npm run verify`, and a live local `POST http://127.0.0.1:3015/api/export/pdf` smoke that returned a valid one-page PDF.
- Final deployed fix sequence on `origin/feature/nextjs-migration`: `b47a3ad90dc989f9ba180075f5e34b0ae480c7f3`, `60fdcd5535e12625fffdba92bec807ea21b6b4ea`, and `c2dea1386ea7b299ab7a3f5f51ec8f2d6ea07f8c`.
- First hosted attempt failed with a new logged runtime error: missing `@sparticuz/chromium/bin` in the deployment bundle. That was resolved by the `vercel.json` include rule.
- Final hosted verification passed on `beta.dillinger.io`: protected `POST /api/export/pdf` returned `HTTP/2 200`, `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="beta-smoke.pdf"`, and a valid PDF body.
