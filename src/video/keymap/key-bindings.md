## 修改脚本`快捷键扩展`功能自带的快捷键

打开浏览器控制台 (`Ctrl+Shift+I`, 切到里面的 Console / 控制台 标签), 修改并运行以下代码:
```js
bilibiliEvolved.settings.customKeyBindings = {
  // 每一行写下要修改的功能, 后面是希望的按键
  // 比如下面这行是将静音的快捷键修改为 Shift + M
  mute: 'shift m',
}
```

- 所有可以修改快捷键的功能, 可以看[这个文件](./keymap.ts)里从 `const defaultBindings` 开始的一大段代码, 那里顺便也记录了对应的默认快捷键
- 按键的定义规则为:
  - 留空表示永远不会触发
  - 直接写下按键的名称 (对应 [KeyboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Properties) 的 `code` 或 `key` 属性)
  - 多个按键用空格隔开, 如果按键本身就是空格, 可以用 `space` 来表示
  - 可以有一些组合键: `shift` / `ctrl` / `alt` / `meta`, `meta` 在 Windows 上是 Win 键, 在 macOS 上是 Command 键
  - 如果希望映射到多种按键, 可以继续用空格隔开, 但注意组合键是固定的, 例如: 配置 `a b` 表示 `A` 或 `B` 键, 而配置 `shift a b` 就表示 `Shift + A` / `Shift + B`
  - 组合键是精确匹配的, 按下 `Ctrl + Shift + A` 不能触发配置为 `shift a` 的快捷键
  - 如果希望组合键可按可不按, 可以给它套上一个 `[]`, 例如 `[ctrl] shift a` 表示 `Ctrl + Shift +A` / `Shift + A`

注意以上的写法是覆盖之前配置的自定义快捷键, 如果希望在之前的基础上添加, 可以写成这样:
```js
bilibiliEvolved.settings.customKeyBindings = {
  ...bilibiliEvolved.customKeyBindings,
  // 每一行写下要修改的功能, 后面是希望的按键
  // 比如下面这行是将静音的快捷键修改为 Shift + M
  mute: 'shift m',
}
```
如果要删除一个自定义的快捷键配置:
```js
// 删除静音的自定义快捷键, 删除后将恢复到默认的 M 键
delete bilibiliEvolved.settings.customKeyBindings.mute
// 保存一下
bilibiliEvolved.settings.customKeyBindings = bilibiliEvolved.settings.customKeyBindings
```
