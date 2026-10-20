<!-- spell-checker: disable -->

<div align="center"><img id="Bilibili-Evolved" width="500" alt="Bilibili Evolved" src="./images/bilibili-evolved-wide-color.svg"></div>
<br>
<div align="center">

「 强大的哔哩哔哩增强脚本 」

</div>

# Bilibili Evolved · AdGuard 兼容性改进分支

本仓库基于 Bilibili Evolved 上游项目进行修改, 重点改进 AdGuard for Windows 和 AdGuard for Mac 下的脚本兼容性. 这是由社区维护的非官方分支, 不代表上游作者发布或背书.

- 原作者: [Grant Howard / the1812](https://github.com/the1812)、[Coulomb-G](https://github.com/Coulomb-G), 以及所有[上游贡献者](https://github.com/the1812/Bilibili-Evolved/graphs/contributors).
- 上游仓库: [the1812/Bilibili-Evolved](https://github.com/the1812/Bilibili-Evolved).
- 本分支维护者: [baiyoung](https://github.com/baiyoung).
- 本分支仓库: [baiyoung/Bilibili-Evolved](https://github.com/baiyoung/Bilibili-Evolved).
- 许可: 保留上游版权与许可声明, 详见 [开源许可](#开源许可) 和 [LICENCE.md](./LICENCE.md).

本分支的主要改动涉及 AdGuard 设置存储、组件沙箱中的浏览器 API 调用和运行时依赖加载. 兼容性仍在验证中, 不保证所有组件均能正常运行; Windows 尚未完成实机验证. 上游功能文档可供参考, 但不代表本分支的验证结果.

## 导航

[📦 安装](#安装)

[⚙ 设置](#设置)

[📚 功能](doc/features/features.md)

[👻 兼容性](#兼容性)

[🐛 版本历史与更新日志](CHANGELOG.md)

[📌 上游更新计划](https://github.com/users/the1812/projects/1/views/3)

[📕 文档站点](https://bilibili-evolved-doc.vercel.app/)
> 文档站点由 [Waua](https://github.com/FoundTheWOUT) 开发, [点此进入 GitHub 仓库](https://github.com/FoundTheWOUT/bilibili-evolved-doc).

[📖 参与开发](CONTRIBUTING.md)

[🐛 本分支问题反馈](https://github.com/baiyoung/Bilibili-Evolved/issues)

[❤ 支持上游作者](doc/donate.md)

# 安装

可以使用 [Tampermonkey](https://tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/), 也可以在 AdGuard for Windows / Mac 的「扩展」中导入下方脚本链接测试. 此处的 AdGuard 指桌面应用, 不包括 AdGuard 浏览器扩展.

下方链接均指向本分支仓库, 正式版使用 `master`, 预览版使用 `preview`. 源码版本号变更不等于已发布, 实际版本以目标文件中的 `@version` 为准; 未发布到对应分支的修复不会通过这些链接安装.

**注意事项**

- 需要网络能够访问 GitHub Raw 及脚本依赖的资源.
- 安装或更新前, 请在「关于」面板导出设置备份. 同一页面只启用一份 Bilibili Evolved, 避免多个管理器或多个版本同时注入.
- 本分支问题请提交到 [本仓库 Issues](https://github.com/baiyoung/Bilibili-Evolved/issues), 不要将本分支特有问题直接交给上游维护者处理.
- 默认不预装任何组件, 需要在按[设置](#设置)中的说明添加感兴趣的功能.
- 这个是一个综合性的脚本, 如果只是想下载视频建议去 [GreasyFork](https://greasyfork.org/zh-CN/scripts/by-site/bilibili.com) 找个更专业的.
- 对性能有较大影响, 详见[配置要求](#配置).
- 默认不对未登录的状态做适配.
- 新版本一旦正式发布, 就不再对旧版本做任何技术支持.
- 使用外部网站的链接时 (如将下载任务发送到自己的服务器 / 使用链接安装组件等) 可能会提示"脚本试图访问跨域资源", 请选择"始终允许" 避免下次还提示.

| 本分支正式版 (GitHub Raw) | 本分支预览版 (GitHub Raw) |
| --- | --- |
| [安装](https://raw.githubusercontent.com/baiyoung/Bilibili-Evolved/master/dist/bilibili-evolved.user.js) | [安装](https://raw.githubusercontent.com/baiyoung/Bilibili-Evolved/preview/dist/bilibili-evolved.preview.user.js) |

如需使用原作者维护的版本, 请前往[上游 README 的安装章节](https://github.com/the1812/Bilibili-Evolved#安装), 不要混淆两套更新源.

> 如果处于某种原因只能停在旧版, 可以参考[旧版本回退指南](./doc/rollback.md).

# 设置

脚本启用后, 在网页左侧中央会有功能面板和设置面板的入口. 功能面板中包含适用于当前页面的一些功能入口, 设置面板中可以管理组件的开启/关闭, 修改组件选项, 以及安装/卸载组件和插件等.

![sidebar](images/v2/side-panel.jpg)


<img alt="settings-panel" src="images/v2/settings-panel.jpg" width="600">

全新安装的脚本实际上没有任何功能, 你可以通过多种方式添加功能:

打开设置面板, 进入左下的组件/插件/样式管理, 会有批量, 浏览, 和在线三个按钮, 以及下面还有个输入框可以用链接添加.

- `批量`: 可以粘贴多个功能的在线链接并一次性安装.
- `浏览`: 载入本地的功能文件.
- `在线`: 打开在线仓库窗口.

<img alt="manage-panel" src="images/v2/manage-panel.jpg" width="400">

> 用链接安装需要对应文件的直链, 批量安装时逐行粘贴链接即可.

如果你曾经使用过 v1 版, 可以利用 `v1 设置迁移` 组件将旧设置导入到 v2 中, 该工具将自动把里面开启的设置对应的组件下载并安装, 使用方法可以参考[这个文档](./doc/v1-migrate.md).

最后, 在关于面板中, 可以查看脚本的详细版本号, 以及进行设置导入 / 导出等快捷操作.

<img alt="about-panel" src="images/v2/about-panel.jpg" width="450">

# 配置

以下配置说明沿用上游文档, 并非本分支对所有环境的测试承诺.

## 最低配置

- 操作系统: Windows 8.1 / macOS Big Sur
- 分辨率: 1920x1080, 缩放 125%
- 浏览器: Chrome 110+ / Firefox 140+ / Safari 18.4+ (仅理论上能运行, 没测试过)
- 处理器: Intel Core i5-10500 / AMD Ryzen 5 3600
- 内存: 8GB
- 脚本管理器: Tampermonkey 5.0 / Violentmonkey 2.18
- 显卡: GeForce GTX 1050 / Radeon HD 7870
- 网络: 10MB/s

## 推荐配置

- 操作系统: Windows 10 / macOS Sonoma
- 分辨率: 3840x2160, 缩放 200%
- 浏览器: Chrome 140+ / Firefox 140+
- 处理器: Intel Core i7-11700 / AMD Ryzen 7 5800
- 内存: 32GB
- 脚本管理器: Tampermonkey 5.0 / Violentmonkey 2.18
- 显卡: GeForce RTX 3060 / Radeon RX 6600XT
- 网络: 20MB/s

# 兼容性

## 脚本管理器

### [Tampermonkey](https://tampermonkey.net/) / [Violentmonkey](https://violentmonkey.github.io/)

兼容, 但在较旧的浏览器中 Violentmonkey 可能无法运行此脚本.

### [Greasemonkey](https://www.greasespot.net/)

不兼容.

### AdGuard for Windows / AdGuard for Mac

本分支正在改进这两个桌面应用的兼容性, 不沿用上游「不兼容」的笼统结论, 也不承诺完美兼容. 已在 macOS 环境进行部分调试; Windows 和各组件的完整回归仍待完成.

反馈问题时请附上系统、浏览器、AdGuard 和脚本版本, 组件名称、复现步骤及完整错误堆栈. 导出的配置可能包含个人设置或自定义服务地址, 公开上传前请检查并删除敏感内容.

## 浏览器

支持**最新版** Chrome, Firefox, 不保证脚本能在 Safari 和 ["套壳类浏览器"](https://www.jianshu.com/p/67d790a8f221) 中完美运行.

# 开发者

感谢原作者 Grant Howard (the1812)、Coulomb-G 及以下上游贡献者. 本分支的兼容性改动不改变原项目的作者归属.

<a href="https://github.com/the1812/Bilibili-Evolved/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=the1812/Bilibili-Evolved" />
</a>

## 文案翻译贡献者

- [PleiadeSubaru](https://github.com/Etherrrr)
- [Lets-Halloween](https://github.com/Lets-Halloween)
- Joshuaふみひる

## 参与项目

欢迎参考[代码贡献指南](CONTRIBUTING.md)来为项目添砖加瓦~

## 更换 CDN

如果希望更换脚本的基础 CDN (GitHub Raw), 可以参考[更换脚本 CDN](./doc/cdn.md)中的说明.

# 隐私声明

本脚本以及本仓库中提供的组件/插件, 是完全匿名的. 用户数据的使用均在本地完成, 不会存储到任何服务器, 也不会有所谓的"用户体验改善计划"来收集统计数据.

但是, 任何组件/插件都对用户数据有着完全的访问能力, 对于其他来源(非本仓库提供)的组件/插件, 请自行甄别其安全性.

# 开源许可

本项目保留上游的 MIT 许可声明、作者署名和版权信息. 使用、修改或再分发软件时, 应随软件副本或实质性部分保留版权声明及许可声明, 包括免责声明; 仅标注原仓库地址不能代替这些声明.

[LICENCE.md](./LICENCE.md) 保留了上游关于再分发入口和技术支持的附加说明, 并附有 MIT 许可正文. 这些附加说明不是标准 MIT 文本的一部分, 此处未删除或改写它们. 再分发时请一并阅读和保留相关文件, 不要将本分支描述为上游官方版本.

第三方依赖仍遵循各自的许可证, 本项目的许可声明不替代其许可要求.

# 第三方开源组件

👍感谢这些组件帮助我们极大地提升了开发效率.

- [Vue.js](https://cn.vuejs.org/index.html)
- [JSZip](https://stuk.github.io/jszip/)
- [StreamSaver.js](https://github.com/jimmywarting/StreamSaver.js)
- [bilibili API collect](https://github.com/SocialSisterYi/bilibili-API-collect)
- [popper-core](https://github.com/popperjs/popper-core)
- [Tippy.js](https://github.com/atomiks/tippyjs)
- [Sortable](https://github.com/SortableJS/Sortable)
- [color](https://github.com/Qix-/color)
- [Lodash](https://lodash.com/)
- [marked](https://github.com/markedjs/marked)
- [MDI](https://materialdesignicons.com)

# 相关推荐

这些脚本/插件同样能够改善您在B站的体验, 相同的功能将不会整合到 Bilibili Evolved, 但会尽可能地适配

## BewlyBewly

作者: [Hakadao](https://github.com/hakadao)

- [GitHub](https://github.com/BewlyBewly/BewlyBewly)

## pakku：哔哩哔哩弹幕过滤器

作者: [xmcp](https://github.com/xmcp)

- [主页](https://s.xmcp.ltd/pakkujs/)
- [GitHub](https://github.com/xmcp/pakku.js)

## BLTH - Bilibili Live Tasks Helper

作者: [andywang425](https://github.com/andywang425)

- [GitHub](https://github.com/andywang425/BLTH)
- [GreasyFork](https://greasyfork.org/zh-CN/scripts/406048-b%E7%AB%99%E7%9B%B4%E6%92%AD%E9%97%B4%E6%8C%82%E6%9C%BA%E5%8A%A9%E6%89%8B)

----

**喜欢的话就点个⭐Star 吧(°∀°)ﾉ**

**也可以通过[上游捐助说明](https://github.com/the1812/Bilibili-Evolved/blob/preview/doc/donate.md)支持原作者. 以下渠道和二维码均来自上游, 并非本分支维护者的收款渠道.**

爱发电

> 之前的支付宝付款码有点问题, 现已弃用 (不必担心, 转账均已收到), 在爱发电中仍然可以选择支付宝作为付款方式.

<a href="https://afdian.com/a/the1812" target="_blank">
  <img alt="爱发电" src="./images/compressed/afdian.jpg" width="400">
</a>

微信

<img alt="微信" src="./images/compressed/wechat.jpg" width="400">

----

# 上游作者的其他项目

## [Touhou Tagger](https://github.com/the1812/Touhou-Tagger)

☯ 从 [THBWiki](https://thwiki.cc/) 自动填写东方 Project 同人音乐 CD 曲目信息

## [Malware Patch](https://github.com/the1812/Malware-Patch)

阻止中国流氓软件的管理员授权

## [dizzylab auto theme](https://github.com/the1812/dizzylab-auto-theme)

[dizzylab](https://www.dizzylab.net/) 自适应 Stylus 主题, 跟随系统亮/暗设定

## [Steam CSS](https://github.com/the1812/SteamCSS)

为 [Steam](https://store.steampowered.com/) 的库和内置浏览器插入一段自定义的 CSS, 用于更换字体等

----
