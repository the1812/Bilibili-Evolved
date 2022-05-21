本地开发工具, 提供自动更新功能和样式热重载的能力, 需要与 DevServer 配合使用. (DevServer 的使用方式见 [CONTRIBUTING.md](https://github.com/the1812/Bilibili-Evolved/blob/preview/CONTRIBUTING.md))

`自动连接` 开启时, 每次进入网页都会自动尝试连接到 DevServer, 如果关闭则需要手动操作连接.

`刷新策略` 决定了收到本体或者功能更新的消息时是否刷新:

本体:
  - **自动刷新**: 收到更新时立即刷新页面
  - 不自动刷新: 收到更新时不刷新页面

功能:
  - 总是自动刷新: 收到更新时立即刷新页面
  - **样式优先**: 功能带有 `instantStyles` 时, 热重载 `instantStyles` 中的样式, 不刷新页面
  - 逻辑优先: 在 `样式优先` 前提下, 要求功能的 `entry` 不为 `none` 时, 才触发热重载样式, 否则刷新页面
  - 不自动刷新: 收到更新时不刷新页面
