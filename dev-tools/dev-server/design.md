# Bilibili Evolved Dev Tools

## Server

### Serve components
Serve (watch) contents:
- `./registry/dist/*` -> `localhost:2333/registry/dist/*`: Build on demand, cache 16 items by default.
- `./dist/` -> `localhost:2333/dist/*`: Build at startup.

### WebSocket
Dev server on WebSocket: `ws://localhost:2333`

Send Messages:

`start`
```json
{
  "type": "start"
}
```

`coreUpdate`
```json
{
  "type": "coreUpdate",
}
```

`itemUpdate`
```json
{
  "type": "itemUpdate",
  "path": "http://localhost:2333/registry/dist/components/style/auto-hide-sidebar.js"
}
```

`stop`
```json
{
  "type": "stop",
}
```

## Client
As component:
- name: devClient
- displayName: DevClient
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

### Debug widget
- Server connection status
- Action: Disconnect / Reconnect
- Support key bindings / LaunchBar actions
