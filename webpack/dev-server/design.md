# Bilibili Evolved Dev Tools

## Server

### Serve components
Serve (watch) contents:
- `./registry/dist/*` -> `localhost:2333/registry/*`: Build on demand, cache 16 items by default.
- `./dist/` -> `localhost:2333/core/*`: Build at startup.

### WebSocket
Dev server on WebSocket: `ws://localhost:2333`

Send Messages:

`start`
```json
{}
```

`coreUpdate`
```json
{
  "type": "core",
  "path": "core/bilibili-evolved.dev.user.js"
}
```

`itemUpdate`
```json
{
  "name": "name",
  "displayName": "Display Name",
  "type": "component",
  "path": "registry/components/feeds/copy-link.js"
}
```

`stop`
```json
{}
```

## Client
As component:
- name: devClient
- displayName: Dev Client
- entry:
  - Try connect `ws://localhost:2333`
  - Debug toolbar (as widget)
- options:
  - port: `2333`
  - updateMode: `reload` | `noReload` | `style`

### WebSocket
Receive Messages:

- `start`
- `coreUpdate`
- `itemUpdate`
- `stop`

### Debug toolbar
- Updated ${num} features
- Server connection status
- Action: Disconnect / Reconnect
- Support key bindings / LaunchBar actions
