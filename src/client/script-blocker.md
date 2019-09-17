# ScriptBlocker API
脚本启动时, 会根据 `bilibiliEvolved.settings.scriptBlockPatterns` 中的信息来阻止其他脚本载入.

> 似乎在 Firefox 中不起效果

## 基本用法
```JavaScript
// 设置要阻止的脚本源, 可以为字符串或正则表达式, 构成数组存入 scriptBlockPatterns.
// 刷新页面后就会阻止相应脚本
bilibiliEvolved.settings.scriptBlockPatterns = ['log-reporter', /vendor\.[\w]+/]
```
> 检测时使用的是脚本的 URL, 即`<script>`标签的`src`或`<link>`标签的`href`, 如果脚本是内联的, URL 将为`<inline>`.

## 事件
页面加载完成后再动态注入的脚本依然会被阻挡, 这种情况还可以事先设置一个 `block` 事件监听:
```JavaScript
bilibiliEvolved.scriptBlocker.addEventListener('block', e => {
  // 获取被删掉的那个脚本 Node
  const node = e.detail
  console.log('[Event] Blocked script: ', node)
})
```