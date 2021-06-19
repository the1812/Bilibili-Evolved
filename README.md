<div align="center"><img id="Bilibili-Evolved" width="500" alt="Bilibili Evolved" src="https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@preview/images/bilibili-evolved-wide-color.svg"></div>
<br>
<div align="center">

「 强大的哔哩哔哩增强脚本 」

</div>

[📦 安装](#安装) / [Install](doc/install-tutorial.en-US.md) / [インストール](doc/install-tutorial.ja-JP.md)

[⚙ 设置](#设置)

[📚 功能](doc/features.md)

[👻 兼容性](#兼容性)

[🐛 版本历史与更新日志](https://github.com/the1812/Bilibili-Evolved/releases)

[📖 参与开发](CONTRIBUTING.md)

[❤ 捐助](doc/donate.md)

# 安装
需要浏览器拥有 [Tampermonkey](https://tampermonkey.net/) 插件.

**注意事项**
- 做好觉悟, 脚本开启后不能使用弹幕点赞和举报, 全景视频不能用鼠标拖拽视角(只能用键盘操作), 对性能也有较大影响.
- 某些破坏性的大更新会使旧版脚本**完全**无法运行, 请及时检查更新.
- 使用 aria2 RPC 时脚本管理器可能会提示"脚本试图访问跨域资源", 请选择"始终允许".

点击名称即可安装👇

| [正式版](https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@master/bilibili-evolved.user.js) | [预览版](https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@preview/bilibili-evolved.preview.user.js) | [离线版](https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@master/bilibili-evolved.offline.user.js) | [预览离线版](https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@preview/bilibili-evolved.preview-offline.user.js) |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| 正式发布的版本, 最稳定, 更新频率较低.                                                          | 新增内容测试的地方, 更新频率高, 但功能不稳定.                                                           | 内置所有依赖项, 体积较大, 更新频率高于正式版.                                                          | 兼备预览版和离线版的特点.                                                                                           |


## 备用安装源
如果默认的安装链接无法使用, 可以尝试以下的备用安装源.

|          | 更新延迟 | 下载速度 | 正式版                                                                                       | 预览版                                                                                                | 离线版                                                                                               | 预览离线版                                                                                                    |
| -------- | -------- | -------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| jsDelivr | 24h      | 快             | [安装](https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@master/bilibili-evolved.user.js) | [安装](https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@preview/bilibili-evolved.preview.user.js) | [安装](https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@master/bilibili-evolved.offline.user.js) | [安装](https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@preview/bilibili-evolved.preview-offline.user.js) |
| GitHub   | <1h      | 需要梯子       | [安装](https://github.com/the1812/Bilibili-Evolved/raw/master/bilibili-evolved.user.js)      | [安装](https://github.com/the1812/Bilibili-Evolved/raw/preview/bilibili-evolved.preview.user.js)      | [安装](https://github.com/the1812/Bilibili-Evolved/raw/master/bilibili-evolved.offline.user.js)      | [安装](https://github.com/the1812/Bilibili-Evolved/raw/preview/bilibili-evolved.preview-offline.user.js)      |

### 关于换源
上面的更换安装源能够以不同的来源安装脚本**本体**, 但脚本还有个热更新机制, 会自动下载脚本**功能**的更新. 如果你想完全更换为 GitHub 源 (例如希望尽快得到刚发布的更新), 除了从上面的 GitHub 安装源安装脚本以外, 安装完还需要在脚本的设置里将 `其他 - 更新源` 从默认的 `jsDelivr` 更换为 `GitHub`.

## 推荐配置
- 操作系统: 64-bit Windows 10 / macOS 10.15+
- 分辨率: 2K+ / 192ppi
- 浏览器: Chrome 80+ / Firefox 65+ / Edge 80+ / Safari 14+
- 处理器: Intel Core i7 / AMD Ryzen 5
- 内存: 8GB
- 脚本管理器: Tampermonkey 4.11 / Violentmonkey 2.12
- 显卡: GeForce GTX 660 / Radeon HD 7870
- 网络: 10MB/s

# 设置
脚本启用后, 在网页左侧中央会有一个齿轮图标, 点击即可打开设置. 默认只启用了一部分功能, 您可以根据需要自由调整设置.

可以在[功能列表](doc/features.md)页中查看每项功能的详细说明, 在网页中通过鼠标停留在某一项也可以查看简要说明.

大部分功能可通过设置面板开启, 有一些功能会以`附加功能`的形式生效, 或者是可以在`附加功能`做进一步设置. `附加功能`可从网页左侧中央的功能按钮进入.

**绝大部分设置保存后, 需要刷新网页才能生效. 仅有一些样式设置可以立即生效.**

<img alt="设置" height="500" src="https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@preview/images/compressed/gui-settings.jpg">


# 兼容性

## 脚本管理器

### [Tampermonkey](https://tampermonkey.net/) / [Violentmonkey](https://violentmonkey.github.io/)
完全兼容, 但在较旧的浏览器中 Violentmonkey 可能无法运行此脚本.

### [Greasemonkey](https://www.greasespot.net/)
不兼容.

### [AdGuard](https://adguard.com/zh_cn/adguard-windows/overview.html)
~~不兼容~~
部分兼容, 加载模式仅可为`延迟(自动)`且无法更改. 经测试, Adguard 在最新7.5.3版本中已支持复杂数据储存.

## 浏览器

支持**最新版** Chrome, Edge (Chromium 内核), Firefox, Safari, 不保证脚本能在["套壳类浏览器"](https://www.jianshu.com/p/67d790a8f221)或者较长时间没更新的浏览器中完美运行.

UWP 版 Edge 已经不再支持了(就是 Windows 10 自带的那个), 请使用以上列出的浏览器, 或换用 [Chromium 内核的 Edge](https://www.microsoft.com/en-us/edge).
> Windows 10 20H2 更新中好像完全替换掉了 UWP 版 Edge (R.I.P.) 自带浏览器变成了 Chromium 内核 Edge.

# 开发者
见 https://github.com/the1812/Bilibili-Evolved/graphs/contributors (之前用的 Contributors Badge 挂了)

## 文案翻译贡献者
- [PleiadeSubaru](https://github.com/Etherrrr)
- [Lets-Halloween](https://github.com/Lets-Halloween)
- Joshuaふみひる

## 参与项目
欢迎参考[代码贡献指南](CONTRIBUTING.md)来为项目添砖加瓦~ (小心编译器的神秘 bug / 小心被祖传代码闪瞎)

# 第三方开源组件
👍感谢这些组件帮助我们极大地提升了开发效率.

- [Vue.js](https://cn.vuejs.org/index.html)
- [Vuex](https://vuex.vuejs.org/zh/)
- [JSZip](https://stuk.github.io/jszip/)
- [Slip.js](https://github.com/kornelski/slip)
- [Lodash](https://lodash.com/)
- [jQuery](http://jquery.com/)
- [MDI](https://materialdesignicons.com)

# 已知问题
- 和`解除B站区域限制`一同使用时, 两个脚本功能互相没有任何问题, 但有的人会遇到没弹幕的状况. 单独使用各脚本时正常, 目前未找到原因.
- 4K视频只能导出下载, 不能直接下载.
- 可能无法很好地适应窄屏幕, 请尽量以1400px以上的宽度使用此脚本.
- ASS弹幕下载不能包含高级弹幕, 字幕弹幕等.

# 相关推荐
这些脚本/插件同样能够改善您在B站的体验, 相同的功能将不会整合到 Bilibili Evolved, 但会尽可能地适配

## bilibili网页端添加APP首页推荐
作者: [indefined](https://github.com/indefined)
- [GitHub](https://github.com/indefined/UserScripts/tree/master/bilibiliHome)
- [GreasyFork](https://greasyfork.org/zh-CN/scripts/368446-bilibili%E7%BD%91%E9%A1%B5%E7%AB%AF%E6%B7%BB%E5%8A%A0app%E9%A6%96%E9%A1%B5%E6%8E%A8%E8%8D%90)

## pakku.js 哔哩哔哩弹幕过滤器
作者: [xmcp](https://github.com/xmcp)
- [主页](https://s.xmcp.ml/pakkujs/)
- [GitHub](https://github.com/xmcp/pakku.js)

## BLTH - Bilibili Live Tasks Helper
作者: [andywang425](https://github.com/andywang425)
- [GitHub](https://github.com/andywang425/BLTH)
- [GreasyFork](https://greasyfork.org/zh-CN/scripts/406048-b%E7%AB%99%E7%9B%B4%E6%92%AD%E9%97%B4%E6%8C%82%E6%9C%BA%E5%8A%A9%E6%89%8B)

----

**喜欢的话就点个⭐Star吧(°∀°)ﾉ**

**或者也可以考虑[捐助](doc/donate.md)支持一下哦(｀・ω・´)**

支付宝

<img alt="支付宝" src="https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@preview/images/compressed/alipay.jpg" height="200">

微信

<img alt="微信" src="https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@preview/images/compressed/wechat.jpg" height="200">

----

# 我写的其他一些玩意

## [Touhou Tagger](https://github.com/the1812/Touhou-Tagger)
☯ 从 [THBWiki](https://thwiki.cc/) 自动填写东方Project同人音乐CD曲目信息

## [Malware Patch](https://github.com/the1812/Malware-Patch)
阻止中国流氓软件的管理员授权

## [dizzylab auto theme](https://github.com/the1812/dizzylab-auto-theme)
[dizzylab](https://www.dizzylab.net/) 自适应 Stylus 主题, 跟随系统亮/暗设定

## [Steam CSS](https://github.com/the1812/SteamCSS)
为 [Steam](https://store.steampowered.com/) 的库和内置浏览器插入一段自定义的 CSS, 用于更换字体等

## [Popcap Patches](https://github.com/the1812/Popcap-Patches)
Popcap游戏3D加速补丁制作器, 可修复宝石迷阵, 祖玛等游戏

----
