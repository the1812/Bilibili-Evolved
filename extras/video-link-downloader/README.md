# Bilibili Evolved 视频链接下载器
从 [Bilibili Evolved](https://github.com/the1812/Bilibili-Evolved/) 复制的视频数据下载视频, 用于解决 Chrome 无法下载超过 2GB 视频的限制, 以及 Firefox 内存占用过大导致标签页卡顿的问题.

适用于长视频(几个小时)的下载, 短视频可以直接在浏览器中完成下载.

目前仅有下载单个视频的功能, 以后可能会添加批量功能.

## 安装

环境需求: 需要已安装 [Node.js](https://nodejs.org/zh-cn/), 否则会没有 `npm` 命令.
```shell
npm install -g bilibili-evolved-video-link-downloader
```

安装完成后, 即可使用 `vld` 命令来下载视频.

## 使用

如果选择的是`复制数据`, 直接执行`vld`, 程序会自动读取剪贴板中的内容:
```shell
vld
```
如果选择的是`导出数据`, 且假定保存的文件是`xxx.json`, 则要在后面加上文件名:
```shell
vld xxx.json
```