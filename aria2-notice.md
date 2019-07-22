# 使用 aria2 下载大文件
使用 aria2 可以解决 Chrome 无法下载超过 2GB 视频的限制, 以及 Firefox 内存占用过大导致标签页卡顿或崩溃的问题. ~~(顺便还能在PanDownload里用)~~

## 前言: 链接下载器(vld)即将寿终正寝
我编写链接下载器的目的, 就是希望在我找到稳定的方案前, 能**暂时**地解决大文件的下载问题. 所以随着对 aria2 支持的完善, 链接下载器也将不再更新.

通过以下命令可以卸载链接下载器:
```powershell
npm uninstall -g bilibili-evolved-video-link-downloader
```

如果您当时只是为了安装链接下载器而安装了 Node.js, 也可以将 Node.js 卸载.

## 下载 aria2
您可以在 [aria2官网](https://aria2.github.io/) 或 [GitHub Release页面](https://github.com/aria2/aria2/releases/latest) 下载 aria2. 无需安装, 解压后即可使用.

## 使用 aria2
脚本支持两种方式将数据传送给 aria2:
### 导出 aria2
这个选项将导出一个纯文本文件, 里面记录了下载视频所需的信息, 将它传给 aria2 即可开始下载.

假设导出的文件是`export.txt`, 放在 aria2 相同的文件夹中. 可以在终端中使用以下命令开始下载: (当然终端里的工作目录也要在 aria2 的文件夹里)
```powershell
aria2c -i export.txt
```

> Windows 系统的终端可以从 **资源管理器** 里的 **文件** - **打开 Windows Powershell** 启动.

如果经常需要下载, 这些步骤还是比较繁琐的, 有一些方法可以简化这些步骤:

1. 添加 aria2 的文件夹到 PATH 环境变量中, 这样就可以在任意位置使用 `aria2c` 命令. 可以参考[Java官网对PATH的解释](https://www.java.com/zh_CN/download/help/path.xml)或者[这篇知乎专栏](https://zhuanlan.zhihu.com/p/67726501)的3.2节.
2. 使用下方的 aria2 RPC 方法.

### 导出 aria2 RPC
aria2 RPC 是 aria2 提供的一种功能, 可以让 aria2 保持运行, 源源不断地接收下载任务并自动完成下载. 初次配置会比较繁琐, 但完成后就不需要像上面那样每次都要在终端里输命令了.

配置 RPC 的过程篇幅比较长, 推荐去网上搜一下教程, 这里给出一些参考教程: (请先看一下下面的简要说明再开始跟着教程)
1. [如何配置 Aria2 来进行文件下载 - 简书](https://www.jianshu.com/p/ab2b0c8a077a)
2. [aria2配置示例 | Binuxの杂货铺](https://binux.blog/2012/12/aria2-examples/)

配置文件参考: (只包含了几个关键的设置, 教程里其他设置可以跳过)
```conf
# 文件的保存路径 (可使用绝对路径或相对路径), 默认: 当前启动位置
dir=C:/xxxx
# 单个任务最大线程数, 添加时可指定, 默认:5
split=12
# 启用 RPC, 默认:false
enable-rpc=true
# RPC 监听端口, 端口被占用时可以修改, 默认:6800
rpc-listen-port=6800
# 允许所有来源, 默认:false
rpc-allow-origin-all=true
# 允许非外部访问, 默认:false
rpc-listen-all=true
# 设置的 RPC 授权令牌, v1.18.4 新增功能, 取代 --rpc-user 和 --rpc-passwd 选项
rpc-secret=xxxxxx
```
基本上就是指定一下保存路径, 设一个密钥, 其他 RPC 设置开起来就 OK 了. RPC 密钥(rpc-secret)就是类似密码的东西, 下载请求里带上正确的密码才可以下载, 建议还是设一个比较好.

只要做到让 aria2 读取您的配置后启动即可, 有需要还可以加一个开机自启动.

在脚本中选择`导出 aria2 RPC`选项后, 会出现 RPC 配置面板, 需要填一下对应的配置:
- 主机: 如果您的 aria2 运行在远程服务器上, 需要把主机改成服务器的. 如果就是在自己电脑上开着的保持默认就好.
- 端口: 默认6800, 如果你在配置文件里改过, 那么这里也要改.
- 密钥: 如果您设置了RPC密钥, 需要在这里输入, 没设置的话留空.
- 路径: 如果需要下载到不同于默认保存路径的地方, 可以在这里设置, 注意要填完整路径(绝对路径), 相对路径的话是相对 aria2 的启动文件夹而不是配置里的默认位置.

点确定后, 脚本会记住这些配置, 然后发送下载请求给 aria2, 配置都正确无误的话, 下载就会自动开始了.

> 您可以在[aria2 WebUI](https://ziahamza.github.io/webui-aria2/)中输入您的配置, 连接后可以直观地看到下载状态等信息

## 卸载 aria2
如需卸载 aria2, 删掉它的文件夹就行了.

## 题外话
如果您知道如何将 HTTP Headers (主要是 Referer 和 User-Agent)和链接(最好还能指定文件名)同时传给 IDM(Internet Download Manager), 请在 [issue #149](https://github.com/the1812/Bilibili-Evolved/issues/149) 中留言, 谢谢~
