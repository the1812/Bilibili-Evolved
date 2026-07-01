# AGENTS.md

This file gives coding agents repository-specific guidance for working on Bilibili Evolved. Read `CONTRIBUTING.md` first, then use this file as the practical checklist for implementation and verification.

## Project Structure

- `src/` contains the userscript core, built-in components, shared runtime APIs, settings UI, and other code shipped with the main script.
- `registry/lib/components/` contains installable components. New components should be placed under the appropriate category directory and use `index.ts` as the webpack entry.
- `registry/lib/plugins/` contains plugins. Use a plugin when the feature only makes sense as an extension of another component.
- Third-party components that are meant to remain outside the main repository should be added through `registry/lib/docs/third-party.ts` instead of mixing external component registration with in-repo source changes.
- `dist/` and `registry/dist/` are build outputs. Do not include generated dist files in normal development changes.
- Feature documentation outputs under `doc/features/` are generated from metadata. Update them only when the task is explicitly about generated docs or release preparation.

## Development Setup

- The package manager is `pnpm`.
- Install root dependencies with `pnpm install`.
- Install registry dependencies from `registry/` when building registry features.
- Use the VS Code tasks from `.vscode/tasks.json` as the source of truth for local task commands when in doubt.

Common commands:

```sh
pnpm run type
pnpm run lint-check
pnpm run build-core
pnpm run build-features
pnpm ts-node dev-tools/dev-server/index.ts
```

The dev server serves the local userscript and registry build output for browser testing. See `CONTRIBUTING.md` for Tampermonkey setup details.

## Component And Plugin Guidelines

- Define components with `defineComponentMetadata`.
- Follow existing plugin definitions for code under `registry/lib/plugins/`.
- New components should include `author` metadata.
- Component `name` values should be specific and camelCase. Display names and option names should clearly describe the feature instead of using generic labels.
- If a component has an `index.md`, do not duplicate the same description in metadata unless the existing pattern for that component requires it.
- Use `urlInclude` and `urlExclude` for page matching instead of manually repeating page checks in `entry`.
- Keep `entry` focused on the work that must happen when the component starts.
- Do not rely on the return value of `entry` for cleanup. Put teardown logic in `unload`; use `reload` together with `unload` when a component must support disable and re-enable behavior.
- Use existing helpers such as `styledComponentEntry`, `toggleStyle`, shared core APIs, component APIs, and plugin APIs before adding new infrastructure.
- Put fixed component styles in SCSS files instead of constructing style text in business logic. Use `instantStyles`, `styledComponentEntry`, or `toggleStyle` so styles are only applied when intended.
- For options, follow existing `defineOptionsMetadata` and `options` patterns so defaults, labels, and validators stay close to metadata.
- Model exclusive choices as one option, usually with an enum or dropdown, instead of multiple mutually exclusive boolean options.
- If settings need to control CSS, prefer toggling a class on `html` or `body` and writing SCSS against that class.

## Code Style

- Follow the repository ESLint and Prettier configuration.
- Use named exports except in files covered by the existing ESLint overrides, such as Vue single-file components and build-related files.
- Keep control-flow bodies braced.
- Preserve the existing TypeScript, Vue 2, and SCSS conventions around the code being changed.
- Avoid unnecessary defensive branches, empty error handling, duplicated state, and one-off abstractions.
- Prefer existing Bilibili API wrappers, request helpers, settings helpers, observer utilities, style utilities, and UI components over reimplementing equivalent behavior.
- Prefer stable Bilibili APIs and existing wrappers over reading page-internal globals or framework internals when the data is available from an API.
- Scope DOM selectors to the nearest stable parent class or page region. Avoid broad selectors that can match unrelated Bilibili UI.
- Keep names and types aligned with behavior. If a function starts returning a broader shape, update the type and name instead of overloading a misleading contract.
- Be careful with data units and API failure states. Do not cache a failed request as if it were a successful value, and keep byte, bit, count, id, and URL semantics explicit.

## Generated Files

- Do not manually edit generated docs or dist outputs as part of ordinary feature or bug-fix work.
- If generated files must be updated, use the project’s existing build or docs generation workflow and include only the intended generated changes.
- Do not commit unrelated cache, profile, local debug, or package-manager output files.

## Validation

Choose validation based on the risk and scope of the change.

- Run `pnpm run type` for TypeScript type checking.
- Run `pnpm run lint-check` for lint validation.
- Run `pnpm run build-core` for core userscript changes.
- Run `pnpm run build-features` for registry component or plugin changes.
- For browser-facing behavior, verify the changed feature in a real browser with the local userscript installed.
- For API-shape or Bilibili-rollout-dependent changes, record what page or account state was actually self-tested.

The pull request workflow runs:

1. `pnpm run type`
2. `pnpm run lint-check`
3. `pnpm run build-core`
4. install dependencies in `registry/`
5. `pnpm run build-features`

When a change affects page behavior, also check the browser console for new runtime errors and test the relevant Bilibili page type, such as video, bangumi, live, feeds, space, settings panel, or the affected component area.

## Branches And Commits

- Use `preview-features` as the base for new features.
- Use `preview-fixes` as the base for bug fixes.
- Commit messages only need to clearly describe the change; the repository does not require a strict conventional commit format.
- Do not create release tags, push release branches, or perform release steps unless the task is explicitly about releasing.
