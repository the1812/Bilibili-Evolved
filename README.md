# Bilibili Evolved

「 强大的哔哩哔哩增强脚本 」

[📦 安装](#安装)

[⚙ 设置](#设置)

[📚 功能](doc/features/features.md)

[👻 兼容性](#兼容性)

[🐛 版本历史与更新日志](CHANGELOG.md)

[📖 参与开发](CONTRIBUTING.md)

[❤ 捐助](doc/donate.md)

# 安装
需要浏览器拥有 [Tampermonkey](https://tampermonkey.net/) 插件, 点击下方表格中的链接安装.

**注意事项**
- 做好觉悟, 脚本开启后不能使用弹幕点赞和举报, 全景视频不能用鼠标拖拽视角(只能用键盘操作), 对性能也有较大影响.
- 新版本一旦正式发布, 就不再对旧版本做任何技术支持.
- 使用外部网站的链接时(如将下载任务发送到自己的服务器 / 使用链接安装组件等)可能会提示"脚本试图访问跨域资源", 请选择"始终允许".


|          | 更新延迟 | 正式版 | 预览版                                                                                                   |
| -------- | -------- | ------ | -------------------------------------------------------------------------------------------------------- |
| jsDelivr | 24h      | 未发布 | [安装](https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@preview/dist/bilibili-evolved.preview.user.js)       |
| GitHub   | <1h      | 未发布 | [安装](https://raw.githubusercontent.com/the1812/Bilibili-Evolved/preview/dist/bilibili-evolved.preview.user.js) |

# 设置
脚本启用后, 在网页左侧中央会有功能面板和设置面板的入口. 功能面板中包含适用于当前页面的一些功能入口, 设置面板中可以管理组件的开启/关闭, 修改组件选项, 以及安装/卸载组件和插件等.

全新安装的脚本实际上没有任何功能, 你需要去[功能列表](doc/features/features.md)中挑选你感兴趣的功能并安装, 在设置面板的左下角可以打开组件/插件/样式管理, 界面基本差不多, 在里面粘贴要安装的链接点添加就可以了, 这个脚本能发挥出怎样的作用完全取决于你的选择.

> 安装需要对应文件的直链, GitHub Raw 或 jsDelivr 都可以. 批量安装时逐行粘贴链接即可.

如果你曾经使用过 v1 版, 可以利用 `v1 设置迁移` 组件将旧设置导入到 v2 中, 该工具将自动把里面开启的设置对应的组件下载并安装, 使用方法可以参考[这个文档](./doc/v1-migrate.md).

## 推荐配置
- 操作系统: 64-bit Windows 10+ / macOS 10.15+
- 分辨率: 2K+ / 192ppi
- 浏览器: Chrome 84+ / Firefox 80+ / Edge 84+ / Safari 14.1+
- 处理器: Intel Core i7 / AMD Ryzen 5
- 内存: 8GB
- 脚本管理器: Tampermonkey 4.11 / Violentmonkey 2.12
- 显卡: GeForce GTX 660 / Radeon HD 7870
- 网络: 10MB/s

# 兼容性

## 脚本管理器

### [Tampermonkey](https://tampermonkey.net/) / [Violentmonkey](https://violentmonkey.github.io/)
兼容, 但在较旧的浏览器中 Violentmonkey 可能无法运行此脚本.

### [Greasemonkey](https://www.greasespot.net/)
不兼容.

### [AdGuard](https://adguard.com/zh_cn/adguard-windows/overview.html)
部分兼容, 加载模式仅可为`延迟(自动)`且无法更改. 经测试, AdGuard 在最新7.5.3版本中已支持复杂数据储存.

## 浏览器

支持**最新版** Chrome, Edge (Chromium 内核), Firefox, 不保证脚本能在["套壳类浏览器"](https://www.jianshu.com/p/67d790a8f221)或者较长时间没更新的浏览器中完美运行.

# 开发者
TODO (之前那个 contributors badge 抽风了)

## 文案翻译贡献者
- [PleiadeSubaru](https://github.com/Etherrrr)
- [Lets-Halloween](https://github.com/Lets-Halloween)
- Joshuaふみひる

## 参与项目
欢迎参考[代码贡献指南](CONTRIBUTING.md)来为项目添砖加瓦~

# 隐私声明
本脚本以及本仓库中提供的组件/插件, 是完全匿名的. 用户数据的使用均在本地完成, 不会存储到任何服务器, 也不会有所谓的"用户体验改善计划"来收集统计数据.

但是, 任何组件/插件都对用户数据有着完全的访问能力, 对于其他来源(非本仓库提供)的组件/插件, 请自行甄别其安全性.

# 第三方开源组件
👍感谢这些组件帮助我们极大地提升了开发效率.

- [Vue.js](https://cn.vuejs.org/index.html)
- [JSZip](https://stuk.github.io/jszip/)
- [bilibili API collect](https://github.com/SocialSisterYi/bilibili-API-collect)
- [popper-core](https://github.com/popperjs/popper-core)
- [Tippy.js](https://github.com/atomiks/tippyjs)
- [Sortable](https://github.com/SortableJS/Sortable)
- [color](https://github.com/Qix-/color)
- [Lodash](https://lodash.com/)
- [marked](https://github.com/markedjs/marked)
- [MDI](https://materialdesignicons.com)

# 已知问题
- 可能无法很好地适应窄屏幕, 请尽量以 1400px 以上的视图宽度使用此脚本.
- ASS 弹幕下载不能包含高级弹幕, 字幕弹幕等.

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
