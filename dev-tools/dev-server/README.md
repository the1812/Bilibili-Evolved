# Bilibili Evolved Dev Server

## HTTP

The HTTP server serves static files from the repository root.

- `dist/*` -> core userscript outputs
- `registry/dist/components/*` -> component outputs
- `registry/dist/plugins/*` -> plugin outputs

Requests to `registry/dist/components/<id>.js` and `registry/dist/plugins/<id>.js` are still static resource requests, but they may trigger build-on-request before the file is served. HTTP does not expose control APIs.

## WebSocket

Dev server WebSocket: `ws://localhost:23333` by default.

WebSocket is the command and event control plane.

Client commands:

```json
{ "type": "queryFeatureSessions" }
```

```json
{ "type": "buildFeature", "kind": "component", "id": "style/hide/banner", "requestId": "..." }
```

```json
{ "type": "startFeatureSession", "kind": "plugin", "id": "video/player/speed", "requestId": "..." }
```

```json
{ "type": "stopFeatureSession", "kind": "component", "id": "style/hide/banner", "requestId": "..." }
```

```json
{
  "type": "startDebugFeature",
  "kind": "component",
  "id": "style/hide/banner",
  "targetClientId": "dev-client-1",
  "requestId": "..."
}
```

```json
{
  "type": "createFeature",
  "kind": "component",
  "id": "style/my-feature",
  "name": "myFeature",
  "displayName": "My Feature",
  "authorName": "Author Name",
  "authorLink": "https://example.com",
  "description": "Feature description.",
  "requestId": "..."
}
```

Server events:

- `serverReady`: initial connection event with `clientId` and active `featureSessions`.
- `featureSessionsChanged`: active watched feature paths changed.
- `itemUpdate`: watched feature compiled and DevClient should update.
- `featureBuilt`: explicit feature build or watched build completed.
- `featureBuildFailed`: explicit feature build failed.
- `serverStop`: server is shutting down; DevClient should restore dev URLs and close the socket.
- `commandResult`: response for commands with `requestId`.

## CLI

Use the command client while the dev server is running:

```powershell
pnpm tsx dev-tools/dev-server/command.ts sessions
pnpm tsx dev-tools/dev-server/command.ts build component style/hide/banner
pnpm tsx dev-tools/dev-server/command.ts watch plugin video/player/speed
pnpm tsx dev-tools/dev-server/command.ts stop component style/hide/banner
pnpm tsx dev-tools/dev-server/command.ts start-debug component style/hide/banner dev-client-1
pnpm tsx dev-tools/dev-server/command.ts stop-debug component style/hide/banner
```
