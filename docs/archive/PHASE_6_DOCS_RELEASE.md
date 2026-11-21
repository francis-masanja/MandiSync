# Phase 6 – Documentation & Release

## Objectives
- Publish all documentation to GitHub Pages.
- Add contribution guidelines.
- Record a demo video of the UI.
- Automate the release pipeline (tag → Vercel deploy).

## Tasks

| # | Task | Details | Effort |
|---|------|---------|--------|
| 6.1 | **GitHub Pages for docs/** | `npm i -D gh-pages`, add `predeploy`/`deploy` scripts, update `package.json`. | 0.5 day |
| 6.2 | **CONTRIBUTING.md** | Architecture overview, linking to `docs/architecture.md`, coding standards, test requirements. | 0.5 day |
| 6.3 | **Playwright demo video** | Record a 3‑minute walkthrough of all 5 tabs + demo modal using Playwright video recording, upload to YouTube/GitHub. | 0.5 day |
| 6.4 | **Release workflow** | `.github/workflows/release.yml`: on tag push → run lint/type‑check/tests → build → Vercel production deploy. | 0.5 day |
| 6.5 | **CHANGELOG.md** | Keep a Changelog format, auto‑generate entries from PR titles using `github-release-notes`. | 0.5 day |

## GitHub Pages Setup
1. Add scripts to `package.json`:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d out"
}
```
2. Ensure `next.config.ts` has `output: "export"` for static export.
3. Run `npm run deploy` after a successful CI build.

## CONTRIBUTING.md (outline)
```markdown
# Contributing to MandiSync

## Getting Started
1. Fork the repo and clone your fork.
2. `npm ci` to install dependencies.
3. Run `npm run dev` to start the dev server.

## Architecture
- See [/docs/architecture.md] for a high‑level overview.
- API contracts are defined in [/docs/api.md].

## Coding Standards
- Typescript strict mode (`tsconfig.json`).
- ESLint + Prettier (run `npm run lint` before committing).
- All new features must have **unit tests** (Vitest) and **e2e tests** (Playwright).

## Branch & PR Policy
- Use `feature/<short‑description>` branches.
- Open a PR and tag `@reviewer` for code review.
- PR must pass the CI pipeline (lint, type‑check, tests, coverage).

## Release Process
- Merge to `main` triggers a preview deployment.
- Tag a release (`vX.Y.Z`) to trigger a production deploy (see release workflow).
```

## Demo Video (Playwright)
```bash
# Record a video (Chromium) of the full UI flow
npx playwright test --project=chromium --trace=on --output=videos/demo.mp4
```
- Upload `videos/demo.mp4` to YouTube (unlisted) and embed the link in the `README.md`.

## Release Workflow (`.github/workflows/release.yml`)
```yaml
name: Release
on:
  push:
    tags: ["v*.*.*"]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run lint && npm run type-check && npm run test && npm run build
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true
      - name: Deploy to Vercel (production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
```

## CHANGELOG.md (template)
```markdown
# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]
- Pending changes.

## [v1.0.0] - 2026-09-18
- Initial public release.
- Implemented core UI, API, in‑memory DB.
- Added demo modal with full farmer flow.
```

---

## Decision Log
- **Docs publishing**: GitHub Pages via static export (simpler than Vercel Docs). 
- **Video**: Playwright built‑in video recorder (no extra tooling). 
- **Release**: Tag‑based Vercel production deploy ensures immutable builds.
