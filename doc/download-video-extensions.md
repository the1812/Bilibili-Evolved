# 下载视频按钮扩展
你可以编写自己的脚本来处理 Bilibili Evolved 产生的视频链接, 提供一个或多个额外的按钮到下载视频面板的`导出`一栏中.

一个基本的模板如下:
```js
// ==UserScript==
// @name          示例
// @version       1.0.0
// @author        Grant Howard
// @match         https://www.bilibili.com/video/*
// @match         https://www.bilibili.com/bangumi/*
// @match         https://www.bilibili.com/medialist/*
// @grant         unsafeWindow
// ==/UserScript==

;(async () => {
  // 固定模板: 因为不敢保证各个脚本的加载顺序如何, 所以操作前如果对象不存在就创建一下.
  if (!unsafeWindow.bilibiliEvolved) {
    unsafeWindow.bilibiliEvolved = {}
  }
  if (!unsafeWindow.bilibiliEvolved.downloadVideoExtensionButtons) {
    unsafeWindow.bilibiliEvolved.downloadVideoExtensionButtons = []
  }
  // 这里添加你的按钮
  unsafeWindow.bilibiliEvolved.downloadVideoExtensionButtons.push({
    // 按钮唯一名称 (key)
    name: 'consoleLog',
    // 按钮显示的名称
    displayName: '示例',
    // [暂未实现, 先都写 false 就行] 是否能处理批量的链接
    batch: false,
    // 点击按钮执行此函数
    action: video => {
      // 参数 video 的类型是 download-video.ts 中的 VideoDownloader 类的实例.
      // 此示例中简单地把链接打印到 console 中, fragments 是视频的分段, 老的 flv 视频或者 dash 格式都会产生分段
      const urls = video.fragments.map(it => it.url).join('\n')
      console.log(urls)
    }
  })
})()
```
效果如图所示:

![image](https://user-images.githubusercontent.com/26504152/116360436-7fbf3280-a832-11eb-8ae8-11c7cebaceee.png)
