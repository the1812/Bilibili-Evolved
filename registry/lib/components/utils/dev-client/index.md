本地开发工具, 提供自动更新功能和样式热重载的能力, 需要与 DevServer 配合使用. (DevServer 的使用方式见 [CONTRIBUTING.md](https://github.com/the1812/Bilibili-Evolved/blob/preview/CONTRIBUTING.md))

`自动连接` 开启时, 每次进入网页都会自动尝试连接到 DevServer, 如果关闭则需要手动操作连接.

`刷新策略` 决定了收到本体或者功能更新的消息时是否刷新:
  - **总是刷新**: 收到更新时立即刷新页面
  - 不刷新: 收到更新时不刷新页面

`热重载策略` 决定了是否开启热重载功能, 只要成功触发热重载, 就不刷新页面:
  - **开启热重载**: 功能带有 `instantStyles` 时, 热重载 `instantStyles` 中的样式
  - 关闭热重载: 收到更新时按 `刷新策略` 执行

> 目前就这两个选项, 将来可能会支持对 `entry` 的热重载
