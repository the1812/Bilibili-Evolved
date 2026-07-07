---
name: bilibili-evolved-dev-server
description: Bilibili-Evolved local dev server workflow. Use when working in the Bilibili-Evolved repository and needing to start the dev server, compile or watch one registry component/plugin, create a component/plugin scaffold through the dev server, reason about HTTP build-on-request versus WebSocket commands, or use DevClient during local feature development.
---

# Bilibili Evolved Dev Server

## Core Model

- Read `AGENTS.md` and `CONTRIBUTING.md` before making repo changes.
- Use PowerShell syntax on Windows.
- Use `pnpm`; do not use npm.
- Start the local dev server with:

```powershell
pnpm tsx dev-tools/dev-server/index.ts
```

- HTTP serves static resources only, but requesting `/registry/dist/components/<id>.js` or `/registry/dist/plugins/<id>.js` may trigger build-on-request before serving the file.
- WebSocket is the control plane for explicit commands such as build, watch, stop, create, and session query.
- `dist/`, `registry/dist/`, and generated feature docs are not normal development changes.

## Feature Commands

Use these commands when the dev server is already running:

```powershell
pnpm tsx dev-tools/dev-server/command.ts sessions
pnpm tsx dev-tools/dev-server/command.ts build component style/hide/banner
pnpm tsx dev-tools/dev-server/command.ts build plugin video/player/speed
pnpm tsx dev-tools/dev-server/command.ts watch component style/hide/banner
pnpm tsx dev-tools/dev-server/command.ts stop component style/hide/banner
```

- `build` compiles one feature once without creating a watcher.
- `watch` starts or reuses one feature watcher.
- `stop` stops one watcher.
- `sessions` prints active watched feature paths.
- Prefer these commands over full registry builds when validating one component or plugin.

## Creating Features

Create new registry component/plugin scaffolds through the dev server command:

```powershell
$authorName = gh api user --jq ".login"
$authorLink = gh api user --jq ".html_url"
pnpm tsx dev-tools/dev-server/command.ts create component style/my-feature myFeature "My Feature" $authorName $authorLink "Feature description."
pnpm tsx dev-tools/dev-server/command.ts create plugin video/player/my-plugin myPlugin "My Plugin" $authorName $authorLink "Plugin description."
```

Before creating a feature, get the current GitHub user from `gh` with `gh api user --jq ".login"` and use that as `authorName`; get the profile URL with `gh api user --jq ".html_url"` and use that as `authorLink`. If `gh` is unavailable, not authenticated, or returns a blank value, ask the user for the GitHub username/profile link before running `create`. Do not use the code agent name, local OS username, or local Git `user.name` / `user.email` for author metadata.

After creation, inspect and edit the generated `index.ts` and `index.md`. Keep component/plugin names specific and camelCase, include author metadata for contributor-created features, and keep descriptions in `index.md`.

## DevClient

- DevClient connects to `ws://localhost:<port>`.
- Starting debug from the settings panel rewrites the feature update URL to the local `/registry/dist/...` URL and relies on HTTP build-on-request.
- Stopping debug, losing the dev server, or seeing a feature session disappear should restore the original update URL.
- If debugging state looks wrong, query sessions first, then inspect DevClient `devRecords` and auto-update URLs.

## Browser Checks

- Bilibili Evolved depends on a userscript manager extension such as Tampermonkey. The built-in browser and Playwright do not provide that extension environment and are not reliable for runtime behavior checks.
- If real browser validation is useful and available, try controlling the user's Chrome browser because it can use the installed userscript manager, extension permissions, login state, and real Bilibili pages.
- Browser validation is optional for this skill. If Chrome, the userscript manager, account state, or the target page is unavailable, continue the dev server workflow and report that browser validation was not performed.

## Validation

- For TypeScript changes, run `pnpm run type`.
- For lint-sensitive changes, run `pnpm run lint-check`.
- For core userscript changes, run `pnpm run build-core`.
- For registry-wide confidence, run `pnpm run build-features`.
- For one feature, prefer `pnpm tsx dev-tools/dev-server/command.ts build <component|plugin> <id>` while the dev server is running.
