<!-- spell-checker: disable -->
# 更新日志

## v2.9.6-preview
`2024-12-28`

包含 [v2.9.6](https://github.com/the1812/Bilibili-Evolved/releases/tag/v2.9.6) 的所有更新内容.

- 新增插件 `自定义顶栏 - 版权内容`. (#5045)
> 为自定义顶栏扩充版权内容相关的快速入口, 包括国创 / 电影 / 电视剧 /综艺 / 纪录片

- 视频截图在还有截图未处理 (保存 / 丢弃) 时, 离开页面增加二次确认. (#5066)

## v2.9.6
`2024-12-28`

✨新增
- `自定义顶栏` 更新:
  - (来自 v2.9.5-preview) 历史支持手动刷新. (#4948)
  - 全局固定适配话题页. (#5039)
  - 新歌热榜 URL 更新. (#5056)
  - `订阅` 重命名为 `番剧`, 功能不变. (#4777)
  - 增加 VLOG, 搞笑, 综艺, 单机游戏入口. (#1511)
- `传统连播模式` 支持番剧页面. (#5067)
- `下载视频` 增加选项 `DASH 回退编码`, 默认回退到 AVC, 可以避免 HEVC 回退到 AV1 的情况. (#5080)
- 新增功能 `隐藏首页轮播图`. (从上一版本废弃的 `简化首页` 中提取) (#5038)
- `夜间模式` 优化对动态和新版首页的适配. (#5075)

🐛修复
- 修复 `隐藏头像框` 对部分角标删除不完全. (#5040)
- 修复 `自定义顶栏` 删除搜索历史时失焦. (#4732)
- 修复 `自定义顶栏` 未登录时仍能通过功能面板进行排序. (#5051)
- 修复 `自定义顶栏` 收藏夹的音频链接错误. (#5069)
- 修复在搜索页的样式冲突. (#5073)
- 修复 `直播首页静音` 在关闭时仍会导致首页静音. (#5045)
- 修复 `禁止滚轮调音量` 在 Firefox 中不生效. (#5047)
- 回退 `直播信息扩充` 的 API 变更. (#4964)

## v2.9.5-preview
`2024-11-12`

包含 [v2.9.5](https://github.com/the1812/Bilibili-Evolved/releases/tag/v2.9.5) 的所有更新内容.

- `自定义顶栏` 的历史支持手动刷新. (#4948)

## v2.9.5
`2024-11-12`

<details>
<summary>正式版用户将获得 v2.9.4-preview 的所有改动, 点击展开查看</summary>

✨新增
- 新增组件 `隐藏头像框`.
> 隐藏页面中用户的头像框 (包括角标), 目前支持动态和视频页面.

- 新增组件 `隐藏直播马赛克`. (#4634)
> 移除直播画面中的马赛克区域.

- 优化了搜索框的搜索建议精准度. (#4833)
- 新增组件 `删除动态`. (PR #4915 by [gouzil](https://github.com/gouzil))
> 删除动态, 可选转发抽奖, 和全部删除.

- `保存视频元数据` 增加 FFMETADATA 字段选项. (PR #4943 by [WakelessSloth56](https://github.com/WakelessSloth56))
- 新增组件 `评论内容替换`. (#4072)
> 替换评论中的内容.
> 可以添加多个替换配置, 每项配置可将一个关键词替换为其他文本. 若替换的目标是一个链接, 则视作替换为表情.
>

- `直播信息扩充` 更换新的 API 接口. (PR #4964 by [Oxygenくん](https://github.com/oxygenkun))

</details>

✨新增
- 新版视频推荐适配组件:
  - `显示视频投稿时间` (#4934, PR #4960 by [呼乎户](https://github.com/wisokey))
  - `隐藏视频推荐`
  - `选集区域优化`, 其中 `展开选集标题` 选项还可恢复分 P 数的展示
  - `传统连播模式`
  - `展开弹幕列表` - `有选集时不自动展开`
- 优化在线仓库中的搜索逻辑和搜索为空的提示. (#4975, #4973)
- `自定义顶栏` 的历史支持显示分 P 数信息. (#1866)
- `删除广告` 更新对首页浮窗广告的屏蔽. (#5001)

🐛修复
- 修复 `简化直播间` 付费礼物屏蔽失效. (#4968)
- 修复动态菜单中的扩展菜单项失效. (#4976)
- `夜间模式` 排除工房页面, 避免文字难以阅读. (#4981)
- `自定义顶栏` 移除已下线的 `短剧榜` 入口. (#4987)
- 修复 `删除广告` 导致直播间和个人空间里的动态显示不出来. (#5003)
- 修复 `网址参数清理` 对需转义的字符处理不正确. (#5009)
- 修复组件描述在部分页面的标题颜色不正确. (#4995)
- 修复 `禁止跳转动态详情` 在带图转发动态二次转发后, 查看图片按钮失效. (PR #4980 by [sunfkny](https://github.com/sunfkny))
- 插件 `下载视频 - WASM 混流输出` 修复写入元数据选项, 新增混流进度, 优化多集下载. (#4840, PR #4984 by [WakelessSloth56](https://github.com/WakelessSloth56))

☕开发者相关
- `自定义顶栏` 未登录时的阿卡林头像转为内置. (感觉说不定 b 站哪天就把这图删了)

🗑️废弃
- 废弃 `简化首页` 功能, 请使用 [BewlyBewly](https://github.com/BewlyBewly/BewlyBewly) 替代.

## v2.9.4-preview
`2024-10-22`

包含 [v2.9.4](https://github.com/the1812/Bilibili-Evolved/releases/tag/v2.9.4) 的所有更新内容.

✨新增
- 新增组件 `隐藏头像框`.
> 隐藏页面中用户的头像框 (包括角标), 目前支持动态和视频页面.

- 新增组件 `隐藏直播马赛克`. (#4634)
> 移除直播画面中的马赛克区域.

- 优化了搜索框的搜索建议精准度. (#4833)
- 新增组件 `删除动态`. (PR #4915 by [gouzil](https://github.com/gouzil))
> 删除动态, 可选转发抽奖, 和全部删除.

- `保存视频元数据` 增加 FFMETADATA 字段选项. (PR #4943 by [WakelessSloth56](https://github.com/WakelessSloth56))
- 新增组件 `评论内容替换`. (#4072)
> 替换评论中的内容.
> 可以添加多个替换配置, 每项配置可将一个关键词替换为其他文本. 若替换的目标是一个链接, 则视作替换为表情.
>

- `直播信息扩充` 更换新的 API 接口. (PR #4964 by [Oxygenくん](https://github.com/oxygenkun))

## v2.9.4
`2024-10-22`

✨新增
- `屏蔽黑名单up主` 去除了登录校验. (#4917, PR #4926 by [snowraincloud](https://github.com/snowraincloud))
- `图片批量导出` 适配新型的图片动态. (#4830)
- 更新评论区的 `夜间模式`. (#4931)

🐛修复
- 修复 StreamSaver 和 ffmpeg WASM 的 SRI 校验问题. (#4913, #4864)
- 修复下载合集时 BV 号命名重复. (#4818)
- 修复 `删除广告` 去除首页广告时没有遵循 `占位文本` 选项. (#4836)
- 修复 `自定义顶栏` 历史面板中的多余 title 提示. (#4962)
- 修复下载弹幕时播放器设置没有正确读取. (#4824)

🗑️废弃
- `自定义顶栏` 删除 `相簿` 入口.

☕开发者相关
- 修复 DevClient 无法重载 Shadow DOM 样式.

## v2.9.3-preview
`2024-09-15`

主要是各种修复, 见 [v2.9.3](https://github.com/the1812/Bilibili-Evolved/releases/tag/v2.9.3).

## v2.9.3
`2024-09-15`

<details>
<summary>正式版用户将获得 v2.9.1-preview ~ v2.9.2-preview 的所有改动, 点击展开查看</summary>

✨新增
- `查看封面` 可以为 aria2 输出提供直接的封面下载. (PR #4798 by [Oxygenくん](https://github.com/oxygenkun))
- 新增组件 `保存视频元数据`. (PR #4840 by [WakelessSloth56](https://github.com/WakelessSloth56))
> - 保存视频元数据为 [FFMETADATA](https://ffmpeg.org/ffmpeg-formats.html#Metadata-2) 格式
>   - 使用组件 `下载视频` 时指定 `WASM` 输出方式（插件 `下载视频 - WASM 混流输出`）可选择是否直接混流入输出文件。
> - 保存视频章节为 OGM 格式 (https://github.com/the1812/Bilibili-Evolved/discussions/2069#discussioncomment-10110916)

- `简化首页` 支持隐藏轮播图. (PR #4852 by [Lime](https://github.com/Liumingxun))
- 新增组件 `添加直播间用户超链接`. (PR #4856 by [Light_Quanta](https://github.com/LightQuanta))
> 网页版直播间右上角的房间观众和大航海界面的用户列表只可查看用户名，不可进行点击。该组件为用户头像和用户名称处添加点击效果，允许通过点击直接查看用户空间。

- 插件 `下载视频 - WASM 混流输出` 支持并行下载库和音视频流. (PR #4864 by [WakelessSloth56](https://github.com/WakelessSloth56))
- `弹幕转义` 支持对正斜杠的换行 (`/n`) 进行转义. (#4865)
- `自定义顶栏` 支持直接在功能中打开布局设置. (#2666)
- `高分辨率图片` 支持处理没有指定高度的图片, 支持在专栏页面中请求原图. (#2868)
- `直播间网页全屏自适应` 样式适配较低的宽度值. (#4895)

☕开发者相关
- 外部资源接入 Subresource Integrity. (#4896)

</details>

🐛修复
- 修复 `快速收起评论` 对旧版评论区的兼容性. (#4905)
- 修复 `快捷键扩展` 的发送评论在新版评论区失效. (#4843)
- 修复 `禁用评论区搜索词` 偶现样式失效. (#4843)

☕开发者相关
- `ShadowDomObserver` 在使用前无需再调用 `observe()`.
- 增加工具方法 `getActiveElement` 检测当前页面的聚焦元素.

## v2.9.2-preview
`2024-09-08`

包含 [v2.9.2](https://github.com/the1812/Bilibili-Evolved/releases/tag/v2.9.2) 的所有更新内容.

✨新增
- `弹幕转义` 支持对正斜杠的换行 (`/n`) 进行转义. (#4865)
- `自定义顶栏` 支持直接在功能中打开布局设置. (#2666)
- `高分辨率图片` 支持处理没有指定高度的图片, 支持在专栏页面中请求原图. (#2868)
- `直播间网页全屏自适应` 样式适配较低的宽度值. (#4895)

☕开发者相关
- 外部资源接入 Subresource Integrity. (#4896)

## v2.9.2
`2024-09-08`

✨新增
- `网址参数清理` 支持清理 `is_room_feed`. (PR #4886 by [dreammu](https://github.com/dreammu))

🐛修复
- 新版评论区相关功能修复: (#4843)
  - 修复 `快速收起评论` 按钮错位. (#4890)
  - 恢复功能: `禁用评论区搜索词`, `评论区IP属地显示`, `复制动态链接`.
  - `简化评论区` 支持 Firefox.
  - 样式实现使用 [Container style queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_size_and_style_queries#container_style_queries_2) 替代 [:host-context](https://developer.mozilla.org/en-US/docs/Web/CSS/:host-context), 虽然 Firefox 还是不支持, 但是能稍微标准化一点.
  - 夜间模式适配

☕开发者相关
- Shadow DOM API (`./src/core/shadow-dom`) 更名为 Shadow Root API (`./src/core/shadow-root`), 模块内的功能导出单例:
  - `shadowDomObserver`: 持续观测页面上的所有 Shadow DOM.
  - `shadowRootStyles`: 支持将样式注入到 Shadow DOM 内部.
- Comments API 增加 `CommentAreaV3` 实现, 支持基于 Shadow DOM 的新版评论区. (#4843)
- 增加 `isContainerStyleQuerySupported` 来检测当前浏览器对 [Container style queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_size_and_style_queries#container_style_queries_2) 的支持.
- 组件样式支持在 `ComponentMetadata.instantStyles` 中声明 `shadowDom: true` 来插入到 Shadow DOM 中.


## v2.9.1-preview
`2024-08-15`

包含 [v2.9.1](https://github.com/the1812/Bilibili-Evolved/releases/tag/v2.9.1) 的所有更新内容.

✨新增
- `查看封面` 可以为 aria2 输出提供直接的封面下载. (PR #4798 by [Oxygenくん](https://github.com/oxygenkun))
- 新增组件 `保存视频元数据`. (PR #4840 by [WakelessSloth56](https://github.com/WakelessSloth56))
> - 保存视频元数据为 [FFMETADATA](https://ffmpeg.org/ffmpeg-formats.html#Metadata-2) 格式
>   - 使用组件 `下载视频` 时指定 `WASM` 输出方式（插件 `下载视频 - WASM 混流输出`）可选择是否直接混流入输出文件。
> - 保存视频章节为 OGM 格式 (https://github.com/the1812/Bilibili-Evolved/discussions/2069#discussioncomment-10110916)

- `简化首页` 支持隐藏轮播图. (PR #4852 by [Lime](https://github.com/Liumingxun))
- 新增组件 `添加直播间用户超链接`. (PR #4856 by [Light_Quanta](https://github.com/LightQuanta))
> 网页版直播间右上角的房间观众和大航海界面的用户列表只可查看用户名，不可进行点击。该组件为用户头像和用户名称处添加点击效果，允许通过点击直接查看用户空间。

- 插件 `下载视频 - WASM 混流输出` 支持并行下载库和音视频流. (PR #4864 by [WakelessSloth56](https://github.com/WakelessSloth56))

## v2.9.1
`2024-08-15`

<details>
<summary>正式版用户将获得 v2.9.0-preview 的所有改动 (新功能以及一项废弃), 点击展开查看</summary>

✨新增
- `简化直播间` 支持屏蔽推荐直播间. (#4787)
- 新增功能 `删除直播马赛克遮罩` (#4634, PR #4814)
> 删除观看直播时某些分区的马赛克遮罩.

- `启用视频截图` 截出来的图支持直接复制. (此功能需要 Firefox 127 版本以上) (#4806)
- `图片批量导出`, `下载视频` 支持更多变量, 详情可在更新组件后查看设置中的说明: (#3852)
  - 动态 ID, 用户 ID, 动态发布时间, 被转发动态相关数据
  - 专栏 cv 号, 专栏发布时间
  - (仅对批量视频下载 (分P / 合集) 有效) up 主名称, up 主 ID, 视频发布时间
- `自定义顶栏` 的稍后再看和历史面板现在始终显示 "已观看" 状态. (#4346)
- `自定义顶栏` 的稍后再看, 收藏和历史面板优化了分 P 数和观看进度的展示, 详见[此处](https://github.com/the1812/Bilibili-Evolved/discussions/1866#discussioncomment-10075203). (#1866)

🗑️废弃
- 删除 `下载视频` 的 Toast 输出方式.

</details>

🐛修复
- 部分修复 `简化评论区` 在新版评论区下失效. (#4843)
  - 头像框目前还没找到比较好的方式隐藏, 暂不支持.
  - 时间由于 Shadow DOM 限制, 无法再挪到右上角了, `装扮 & 时间` 只对装扮有效.
  - 样式实现依赖 [:host-context](https://developer.mozilla.org/en-US/docs/Web/CSS/:host-context), 因此目前还不支持 Firefox.
- 修复 `删除视频弹窗` 和 `禁用特殊弹幕样式` 在新版播放器下失效. (#4843, #4823, PR #4839 by [festoney8](https://github.com/festoney8))
- 修复 `快捷键扩展` 的部分操作和 `启用弹幕空降` 在新版播放器下失效.

☕开发者相关
- 新增 Shadow DOM 系列 API (`src/core/shadow-dom.ts`), 用于处理 Shadow DOM 相关的逻辑.
  - `ShadowDomObserver`: 持续观测页面上的所有 Shadow DOM.
  - `ShadowDomStyles`: 支持将样式注入页面, 包含所有 Shadow DOM 内部.
- `MutationObserver` 相关的 API 支持使用 `Node` 类型作为目标.

## v2.9.0-preview
`2024-07-19`

✨新增
- `简化直播间` 支持屏蔽推荐直播间. (#4787)
- 新增功能 `删除直播马赛克遮罩` (#4634, PR #4814)
> 删除观看直播时某些分区的马赛克遮罩.

- `启用视频截图` 截出来的图支持直接复制. (此功能需要 Firefox 127 版本以上) (#4806)
- `图片批量导出`, `下载视频` 支持更多变量, 详情可在更新组件后查看设置中的说明: (#3852)
  - 动态 ID, 用户 ID, 动态发布时间, 被转发动态相关数据
  - 专栏 cv 号, 专栏发布时间
  - (仅对批量视频下载 (分P / 合集) 有效) up 主名称, up 主 ID, 视频发布时间
- `自定义顶栏` 的稍后再看和历史面板现在始终显示 "已观看" 状态. (#4346)
- `自定义顶栏` 的稍后再看, 收藏和历史面板优化了分 P 数和观看进度的展示, 详见[此处](https://github.com/the1812/Bilibili-Evolved/discussions/1866#discussioncomment-10075203). (#1866)

🗑️废弃
- 删除 `下载视频` 的 Toast 输出方式.

## v2.8.13
`2024-07-19`

<details>
<summary>获得 v2.8.12-preview 的所有新功能, 点击展开查看</summary>

✨新增
- `下载视频 - WASM 混流输出` 支持批量下载. (PR #4726 by [WakelessSloth56](https://github.com/WakelessSloth56))
- `夜间模式` 增加 `color-scheme` meta 信息, 适配 Chrome 的 [Fluent overlay scrollbars](chrome://flags/#fluent-overlay-scrollbars). (#4717)

</details>

✨新增
- `删除广告` 支持屏蔽首页的 "广告已被屏蔽" 占位卡片.
- `自定义顶栏` 增加公益、公开课、社区中心入口. (#1511)

🐛修复
- 修复 `显示视频投稿时间` 时间显示错误及不显示时间的问题. (#4755, PR #4756 by [呼乎户](https://github.com/wisokey))
- 修复夜间模式的一些适配问题. (#4376, #4768, #4785, #4802, PR #4763, #4810 by [Pencil](https://github.com/pencilqaq))
- 修复 `屏蔽黑名单up主` 弹窗高度溢出. (PR #4784 by [snowraincloud](https://github.com/snowraincloud))
- 修复 `自定义顶栏` 搜索框在 b 站搜索页打字时自动弹出. (#4808)

☕开发者相关
- 修复 GitHub Workflow 中 pnpm 安装失败.

## v2.8.11-preview / v2.8.12-preview
`2024-05-14`

包含 [v2.8.11](https://github.com/the1812/Bilibili-Evolved/releases/tag/v2.8.11) 的所有更新内容.

✨新增
- `下载视频 - WASM 混流输出` 支持批量下载. (PR #4726 by [WakelessSloth56](https://github.com/WakelessSloth56))
- `夜间模式` 增加 `color-scheme` meta 信息, 适配 Chrome 的 [Fluent overlay scrollbars](chrome://flags/#fluent-overlay-scrollbars). (#4717)

## v2.8.11 / v2.8.12
`2024-05-14`

🐛修复
- 修复了搜索框中的 XSS 注入问题.
- 修复了搜索框在搜索页面不能同步关键词. (#4721)
- 修复 `评论区IP属地显示` 失效. (#4690)
- 在搜索框中删除搜索历史时将不再收起下拉菜单. (#4732)
- 修复功能反复开关时, 功能面板中的按钮重复出现. (#4731)
- 修复功能面板空间不足时出现折行. (#4730)
- 修复 `启用视频截图` 在番剧区失效. (#4719)

☕开发者相关
- Comment API 调整:
  - 增加对 `CommentArea` 销毁的监测.
  - `forEachCommentItem` / `forEechCommentArea` 参数统一支持 `added` 和 `removed` 回调.
  - `CommentReplyItem` / `CommentItem` 增加属性 `vueProps`.


## v2.8.10-preview
`2024-04-23`

包含 [v2.8.10](https://github.com/the1812/Bilibili-Evolved/releases/tag/v2.8.10) 的所有更新内容.

- 更新了 `动态过滤器` 的描述, 当开启 `直播信息扩充` 时不可配置 `正在直播` 的显隐. (#4705)

## v2.8.10
`2024-04-23`

<details>
<summary>获得 v2.8.9-preview 的所有新功能, 点击展开查看</summary>

- `下载视频 - WASM 混流输出` 支持更持久的缓存方式. (PR #4667 by [WakelessSloth56](https://github.com/WakelessSloth56))
- `外置稍后再看` 和 `启用快速收藏` 增加了 `显示方式` 选项, 出现无法自动适配的排版问题时可以尝试手动调整此设置. (#4532)
- 新增插件 `动态过滤器 - 移除商品带货动态`. (#4425)
> 移除动态里的商品带货动态 (UP主的推荐 · 来自 XX), 装有 `动态过滤器` 时生效.

- 新增组件 `动态图片平铺展示`. (#4645)
> 将动态中左右切换式的图片改回传统的平铺展示. (在动态详情中可能稍有延迟)

- 更换了 `自定义顶栏` 的动态提醒数字来源. (#4427)

</details>

✨新增
- 夜间模式更新对视频和直播页面的样式. (#4701, PR #4675 by [WangYK](https://github.com/AnotiaWang))
- 增强 `下载视频 - WASM 混流输出` 对错误输入流的检测, 支持 FLAC 音频流 (产生 `.mkv` 文件). (PR #4686 by [DBeidachazi](https://github.com/DBeidachazi))
- `复制动态链接` 改用 `opus` 格式的链接, 并支持新版话题页面. (PR #4695, PR #4696 by [星海](https://github.com/lovelyCARDINAL))
- 同时安装了 pakku 时, 支持下载处理后的弹幕. (PR #4712 by [xmcp](https://github.com/xmcp))
- `传统连播模式` 支持识别和处理视频列表. (#4699, PR #4713 by [Wuch](https://github.com/IEXPECTATION))
- `删除视频弹窗` 支持屏蔽收起后的弹窗. (#4703)

🐛修复
- 再次修复 `快速收起评论` 遮挡评论的表情等弹窗.
- 修复评论区相关功能失效. (#4690)
- 修复 `自定义顶栏` 导致稍后再看页面布局错位. (#4668)

☕开发者相关
- Comment API 现已重构并支持 Vue 3 版本的评论区. (#4690)

## v2.8.9-preview
`2024-03-09`

包含 [v2.8.9](https://github.com/the1812/Bilibili-Evolved/releases/tag/v2.8.9) 的所有更新内容.

✨新增
- `下载视频 - WASM 混流输出` 支持更持久的缓存方式. (PR #4667 by [WakelessSloth56](https://github.com/WakelessSloth56))
- `外置稍后再看` 和 `启用快速收藏` 增加了 `显示方式` 选项, 出现无法自动适配的排版问题时可以尝试手动调整此设置. (#4532)
- 新增插件 `动态过滤器 - 移除商品带货动态`. (#4425)
> 移除动态里的商品带货动态 (UP主的推荐 · 来自 XX), 装有 `动态过滤器` 时生效.

- 新增组件 `动态图片平铺展示`. (#4645)
> 将动态中左右切换式的图片改回传统的平铺展示. (在动态详情中可能稍有延迟)

- 更换了 `自定义顶栏` 的动态提醒数字来源. (#4427)


## v2.8.9
`2024-03-09`

✨新增
- `下载视频 - IDM 输出支持` 补充了保留文件名相关内容的描述. (PR #4664 by [LY](https://github.com/Young-Lord))
- 夜间模式更新对以下区域的支持:
  - 新版评论区输入框 (#4605)
  - 动态详情页
  - 搜索页面 (#4354)
- `删除广告` 现在可以在新版首页中将删除后的空位移除. (#4610)
- `删除视频弹窗` 支持屏蔽 "请评价视频播放效果" 等小弹窗, 归属于投票类. (#4610)

🐛修复
- 修复 XML 弹幕下载遇到空弹幕时报错. (#4629)
- 修复播放前显示封面在中途暂停仍会出现. (#4491)
- 修复 `自定义顶栏` 的搜索结果描述溢出. (#4464)
- 修复自动关灯无效. (PR #4659 by [Waua](https://github.com/FoundTheWOUT), #4631)
- 修复 `网址参数清理` 导致搜索页出现 `https://search.bilibili.com/undefined`. (PR #4663 by [sunfkny](https://github.com/sunfkny), #4656)
- 修复 `禁止跳转动态详情` 导致动态中的查看图片按钮失效. (PR #4662 by [sunfkny](https://github.com/sunfkny))
- 修复 `展开动态内容` 对部分用户失效. (#4633)
- 修复 `高分辨率图片` 导致旧版首页 logo 比例出错. (#4480)
- 修复个人空间中搜索过动态后再返回导致常规动态里的相关功能失效. (#4458)
- 修复番剧区的 `扩展倍速` 失效. (#4571)
- 修复 `快速收起评论` 遮挡评论的表情等弹窗.
- 修复 `自定义顶栏` 导致网课分区内容错位. (#4610)
- 修复 `隐藏顶部横幅` 导致部分分区页面内容错位. (#4610)

☕开发者相关
- PlayerAgent 支持监听 `pause` 事件.
- `forEachFeedsCard` 现在不会在非动态页面执行.

## v2.8.8 / v2.8.8-preview
`2024-01-18`

<details>
<summary>正式版用户将获得 v2.8.6-preview ~ v2.8.7-preview 的所有新功能, 点击展开查看</summary>

✨新增
- 新增插件 `下载视频 - MPV 输出支持加强版`. (PR #4448 by [weapon!](https://github.com/Asukaaaaaa))
> 同时支持单文件和多文件, 不需要额外下载程序处理 mpv 协议, 配置方式请参考 [README](https://github.com/Asukaaaaaa/tricks/blob/main/Bilibili-Evolved%20mpv-ex%20%E6%8F%92%E4%BB%B6.md)

- `查看封面` 组件安装后可为 `下载视频` 提供下载封面支持. (#889, PR #4473 by [Oxygenくん](https://github.com/oxygenkun))
- 新增插件 `下载视频 - WASM 混流输出`. (PR #4521 by [WakelessSloth56](https://github.com/WakelessSloth56))
> 使用 WASM 在浏览器中下载并合并音视频，运行过程中请勿关闭页面，初次使用或清除缓存后需要加载约 30 MB 的 WASM 文件

- 使用流量计费网络时, 不再触发本体和功能的更新检查. (仅 Chrome) (#4477)
- `快捷键扩展` 的音量调整支持自定义幅度. (#2594)
- `自定义字体` 改善了组件代码和功能. (PR #4485 by [Tinhone](https://github.com/Tinhone))

☕开发者相关
- PlayerAgent API 重构为调用 `window.player` 和 `window.nano` API, 可以解决 #2544 的问题, 感谢 [timongh](https://github.com/timongh) 和 [WakelessSloth56](https://github.com/WakelessSloth56) 的发现. (#4330, #4341)

</details>

⚠ 注意
- Firefox 的最低版本要求提升至 121, 顺便更新了下配置要求, 分为了最低配置和推荐配置, CPU 统一为桌面级型号.
- 移除对旧版视频播放器的支持, 仅支持新版视频播放器 (BPX 播放器)

✨新增
- 新增插件 `动态过滤器 - 移除充电专属动态`. (#4033)
> 移除动态里的充电专属动态, 装有 `动态过滤器` 时生效.

- `删除视频弹窗` 支持屏蔽 "心动" 弹窗, `禁用特殊弹幕样式` 支持屏蔽相应的带货弹幕. (#4565)
- `删除广告` 支持屏蔽首页的桌面端弹窗广告. (#4590)
- 新增插件 `下载视频 - 空输出`. (#4581)
> 提供一个 "空" 的输出选项, 只想获取下载视频的附带产物 (弹幕, 字幕等) 时可以使用此插件.

- `下载视频` 支持下载合集. (#3240)
- 视频相关功能和快捷键扩展支持新版番剧播放器. (#4571)

🐛修复
- 修复 `评论区IP属地显示` 在小黑屋中失效的问题. (#4572, PR #4573 by [Light_Quanta](https://github.com/LightQuanta))
- `自定义字体` 改进: (PR #4585 by [Tinhone](https://github.com/Tinhone))
  - 修复 `自定义字体` 导致快速收藏图标消失. (#4566)
  - 将 `覆盖选项` 迁移到了更多选项中.
  - 因为文泉驿微米黑（WenQuanYi Micro Hei）字体的部分版本存在朝鲜语（韩语）显示不正确的问题，所以从默认设置中删除，使用 Malgun Gothic 字体替换.
- 夜间模式适配播放页的充电卡片. (#4599, PR #4600 by [Pencil](https://github.com/pencilqaq))
- `直播信息扩充` 使用新的 API, 能够显示悄悄关注的主播. (PR #4587 by [Oxygenくん](https://github.com/oxygenkun))
- 修复自定义顶栏在搜索页面的表现: 关键词同步 & 禁用全局固定. (#1431)
- `删除广告` 使用 CSS `:has` 功能实现了移除广告的空白占位区域. (#3997)
- 修复新版的动态多图界面中 `图片批量导出` 检测不到图片. (#4586)
- 修复使用 `pluginApis.installStyle` 安装带有特殊字符的名称的样式后, 无法删除的问题. (#4557)
- 修复快速收起评论遮挡了评论的操作菜单. (#4595)
- 更新了 `稍后再看重定向` 的说明文字, 明确了功能作用范围. (#4555)
> 将稍后再看的链接重定向为普通播放网址.
> - `重定向页面`: 对稍后再看列表页面里的链接重定向.
> - `重定向顶栏`: 对 `自定义顶栏` 里的稍后再看链接重定向.

- 修复文件命名格式中 `[title]`, `[ep]`, `[lid]` 变量的值获取不正确. (#4575)

☕开发者相关
- pnpm 更新至 8.12.1.
- README 调整了一些中英文字符之间的空格. (PR #4602 by [Shen-Linwood](https://github.com/Shen-Linwood))
- PlayerAgent.getPlayerConfig 支持 BPX 播放器, 且默认认为当前 Agent 为 BPX 类型.
- 修复 DownloadPackage 中同名文件会互相覆盖. (#4576)
- 动态过滤器中使用 CSS `.plugin-block` 可以隐藏某个动态卡片, 插件结合 `forEachFeedsCard` 等 API 可以实现自定义的过滤逻辑. (#4033)
- retrieveImageUrl 支持传入 picture 元素本身.
- 内置 UA 更新至 Firefox 123.
- 增加了 simulateClick API, 可以模拟一次点击. (依次触发 `pointerdown`, `mousedown`, `pointerup`, `mouseup`, `click` 事件)

## v2.8.7 / v2.8.7-preview
`2023-11-23`

- 修复正式版中清爽首页无法加载的问题. (#4538)

其他更新内容请看 [v2.8.6](https://github.com/the1812/Bilibili-Evolved/releases/tag/v2.8.6) / [v2.8.6-preview](https://github.com/the1812/Bilibili-Evolved/releases/tag/v2.8.6-preview).

## v2.8.6-preview
`2023-11-22`

包含 [v2.8.6](https://github.com/the1812/Bilibili-Evolved/releases/tag/v2.8.6) 的所有更新内容.

✨新增
- 新增插件 `下载视频 - MPV 输出支持加强版`. (PR #4448 by [weapon!](https://github.com/Asukaaaaaa))
> 同时支持单文件和多文件, 不需要额外下载程序处理 mpv 协议, 配置方式请参考 [README](https://github.com/Asukaaaaaa/tricks/blob/main/Bilibili-Evolved%20mpv-ex%20%E6%8F%92%E4%BB%B6.md)

- `查看封面` 组件安装后可为 `下载视频` 提供下载封面支持. (#889, PR #4473 by [Oxygenくん](https://github.com/oxygenkun))
- 新增插件 `下载视频 - WASM 混流输出`. (PR #4521 by [WakelessSloth56](https://github.com/WakelessSloth56))
> 使用 WASM 在浏览器中下载并合并音视频，运行过程中请勿关闭页面，初次使用或清除缓存后需要加载约 30 MB 的 WASM 文件

- 使用流量计费网络时, 不再触发本体和功能的更新检查. (仅 Chrome) (#4477)
- `快捷键扩展` 的音量调整支持自定义幅度. (#2594)
- `自定义字体` 改善了组件代码和功能. (PR #4485 by [Tinhone](https://github.com/Tinhone))

☕开发者相关
- PlayerAgent API 重构为调用 `window.player` 和 `window.nano` API, 可以解决 #2544 的问题, 感谢 [timongh](https://github.com/timongh) 和 [WakelessSloth56](https://github.com/WakelessSloth56) 的发现. (#4330, #4341)

## v2.8.6
`2023-11-22`
✨新增
- `清爽首页` / `极简首页` 现在可以正确重定向 "悬浮视频". (#4404)
- `网址参数清理` 增加 `spmid` 参数. (#4512)
- `快捷键扩展` 默认不再启用前进/后退的快捷键 (默认使用 b 站的前进/后退). (#4501)
- `展开动态内容` 现在不会展开专栏类型的动态, 并保留原来的 "全文" 按钮. (#4475)

🐛修复
- 修复了首页的正式版安装链接 CDN 不正确. (#4460)
- 修复 `极简首页` 在特定情况下无法触发加载的问题. (#4302, PR #4430 by [Tinhone](https://github.com/Tinhone))
- 调整了 `简化评论区` 和 `删除广告` 对评论区附近的活动横幅和小喇叭横幅的说明, 关于这两种元素的具体区别以及分配至的组件, 可以参考 #4444 中的讨论.
- 修复 `直播信息扩充` 中的标题未处理转义的 HTML 特殊字符.
- 修复 `BV 号转换` 复制的链接即使没有参数也会带上末尾的 `?`. (#4515)
- 修复番剧片单页面出现报错. (#1999)
- 修复 `自定义顶栏` 历史面板无法正确跳转课程. (#4484)
- 修复 `自定义顶栏` 在历史记录页面产生的布局错位. (#4459)
- 修复 `网址参数清理` 处理相对路径 URL 时产生了错误的结果. (#4471)
- 修复 `自定义顶栏` 在专栏页面挡住了作者信息顶栏. (#4540)

☕开发者相关
- 锁定了 PR Check 中的 pnpm 版本, 避免 pnpm 更新后出现不兼容 lockfile 导致 PR Check 失败.
- `夜间模式` 增加了一篇详细的[开发文档](./registry/lib/components/style/dark-mode/README.md).
- Microsoft Edge 不再作为首要兼容的浏览器. (和 Chrome 相同内核, 理论上兼容性不会有太大差别)

## v2.8.5 / v2.8.5-preview
`2023-09-24`

✨新增
- 新增组件 `自定义字体`. (PR #4406 by [Tinhone](https://github.com/Tinhone))
> 使用组件提供的字体设置覆盖原版的主站字体，并使主站字体可被自定义。字体设置写法请参考 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/font-family) 、默认设置与设置说明

- `简化直播间` 适配了新版 PK 条. (PR #4439 by [Pencil](https://github.com/pencilqaq))

- `下载视频` 支持配置 DASH 格式下的文件扩展名. (PR #4449 by [小傅Fox](https://github.com/xfoxfu))


<details>
<summary>正式版用户将获得 v2.8.0-preview ~ v2.8.4-preview 的所有新功能, 点击展开查看</summary>

- `清爽首页` 改进:
  - 支持自定义板块的布局和可见性. (操作方式和自定义顶栏那个差不多)
  - 番剧时间表优化样式, 增加翻页按钮.

<div>
  <img height="400" src="https://user-images.githubusercontent.com/26504152/242905984-895cb72c-b344-40c3-91a0-2a6b20d5f783.png">
  <img height="400" src="https://user-images.githubusercontent.com/26504152/242905640-cbc948f1-734e-46f2-96a7-d57787b7cf47.png">
</div>

- 新增功能 `首页净化`. (PR #4153 by [RieN](https://github.com/rien7))
> 删除首页特定类型的卡片.

- `自定义顶栏` 增加 `创作中心` 入口, `排行` 新增 `全站音乐榜` 和 `短剧榜` 的入口. (#4101, PR #4154 by [星海](https://github.com/lovelyCARDINAL), PR #4155 by [星海](https://github.com/lovelyCARDINAL))
- `播放器置顶（新）` 增加选项 `顶部留白`. (#4152, PR #4165 by [Ziu](https://github.com/ZiuChen))
- `播放器置顶（新）` 的标题改为放置到播放器和点赞中间. (PR #4208 by [LockRim](https://github.com/LockRim))
- `显示视频投稿时间` 支持转义字符. (#4160, PR #4167 by [呼乎户](https://github.com/wisokey))
- `隐藏视频推荐` 支持稍后再看和收藏夹播放页, 并适配 bpx 播放器. (#4174)
- 新增功能 `隐藏记笔记` 和 `隐藏稿件投诉`. (#4124)
- 优化了 `自定义顶栏` 中订阅在筛选时的 API 调用. (#4120)
- 优化粗体的显示: 优先调用 Semibold 字重, 若字体不支持则使用 Bold 字重.
- `自定义顶栏` 增加选项:
  - 支持自定义消息提醒样式, 可设置为 `数字`, `点状` 或 `隐藏`. (#4125)
  - 支持自定义搜索栏宽度. (#4112)
- 搜索在纯数字输入时, 增加对 UID 和直播间的搜索. (#677)
- `网址参数清理` 更新对直播间的支持. (#1459)
- `自动点赞` 转为由 [CrazyboyQCD](https://github.com/CrazyboyQCD) 维护, 支持手动控制点赞和黑名单功能. (PR #4343, PR #4358 by [CrazyboyQCD](https://github.com/CrazyboyQCD))

- `简化直播间` 支持隐藏荣耀等级勋章. (PR #4348 by [CrunchyShark](https://github.com/CrunchyShark944))
- 在设置面板中的组件管理等面板中, 搜索框移动至已安装列表的上方, 更符合直觉. (#3806)
- 支持从 Tampermonkey 的菜单中唤起功能和设置面板. (#4170)
- 搜索栏中添加了导入 / 导出设置的操作. (#4170)
- `自定义顶栏` 新增选项 `链接对齐样式`, 可以自定义纯链接弹窗内链接文字的对齐样式. (PR #4365 by [Tinhone](https://github.com/Tinhone))
- `简化评论区` 支持独立控制简化选项, 并支持隐藏粉丝勋章和活动横幅. (仅支持新版评论区) (#2381)
- `清爽首页` 设置为隐藏的版块现在将彻底销毁, 减少资源占用.
- `禁用特殊弹幕样式` 支持禁用大会员弹幕. (#4227)
- `下载视频` 在批量下载番剧时, 支持下载多个不同板块的选集. (#2834)
- 新增功能 `全屏直播礼物简化`. (PR #4306 by [TimmyOVO](https://github.com/TimmyOVO))

> 移除全屏观看直播时的底部礼物栏

- 新增功能 `评论区 IP 属地显示`. (PR #4331, PR #4334 by [Light_Quanta](https://github.com/LightQuanta))

> 在评论区显示评论的IP属地信息

- 新增功能 `直播间网页全屏自适应`. (#4216)

> 在直播网页全屏时, 自动调整侧边栏的宽度, 使得视频区域的比例和视频源相匹配, 达到无黑边的效果. 如果在侧边栏的边缘拖动, 可以自定义侧边栏的固定宽度, 双击边缘可以还原到自动宽度.
>
> - `侧边栏最大宽度 (px)`: 限制侧边栏可被拉伸到的最大宽度. (最小宽度固定为 190px, 再小的话布局就要出问题了)
>
> > 注意, 由于有最大宽度和最小宽度的限制, 部分窗口尺寸下仍然无法做到无黑边.

- 新增功能 `关注时间显示`. (PR #4352 by [Light_Quanta](https://github.com/LightQuanta))

> 在个人空间的粉丝/关注列表显示关注的具体时间

- 新增功能 `自动移出稍后再看`.

> 在稍后再看页面播放结束时, 自动将当前视频移出稍后再看.
> 注意:
> - 一定要播放结束, 快结束时手动切走不算
> - b 站的稍后再看列表不会实时刷新

- 新增功能 `相簿发布时间显示`. (PR #4362 by [Light_Quanta](https://github.com/LightQuanta))

> 在个人空间的相簿界面显示相簿的发布时间

</details>

🐛修复
- 修复 `禁止滚轮调音量` 在网页全屏下失效. (#4381).
- 修复 Feeds API 无法解析新版图文动态的文字内容. (主要是动态过滤器会受影响) (#4409)
- 修复 `选集区域优化` 在部分视频合集页面上无法使用 <kbd>Alt</kbd> 来切换折叠. (#4429)
- 修复被转发图文动态的 `详情 >` 功能失效. (PR #4452 by [sunfkny](https://github.com/sunfkny))


## v2.8.4-preview
`2023-09-07`

包含 [v2.7.6](https://github.com/the1812/Bilibili-Evolved/releases/tag/v2.7.6) 的所有更新内容.

- `直播间网页全屏自适应` 支持自定义侧边栏宽度. (#4216)
- 修复 `直播勋章快速更换` 获取头衔列表时报错. (#4403)

## v2.7.6
`2023-09-07`

更新了动态相关的 API 地址, 修复番剧无法加载的问题. (#4305)


## v2.8.3-preview
`2023-08-26`

包含 v2.7.5 的所有更新内容.

✨新增
- `网址参数清理` 更新对直播间的支持. (#1459)
- `自动点赞` 转为由 [CrazyboyQCD](https://github.com/CrazyboyQCD) 维护, 支持手动控制点赞和黑名单功能. (PR #4343, PR #4358 by [CrazyboyQCD](https://github.com/CrazyboyQCD))

- `简化直播间` 支持隐藏荣耀等级勋章. (PR #4348 by [CrunchyShark](https://github.com/CrunchyShark944))
- 在设置面板中的组件管理等面板中, 搜索框移动至已安装列表的上方, 更符合直觉. (#3806)
- 支持从 Tampermonkey 的菜单中唤起功能和设置面板. (#4170)
- 搜索栏中添加了导入 / 导出设置的操作. (#4170)
- `自定义顶栏` 新增选项 `链接对齐样式`, 可以自定义纯链接弹窗内链接文字的对齐样式. (PR #4365 by [Tinhone](https://github.com/Tinhone))
- `简化评论区` 支持独立控制简化选项, 并支持隐藏粉丝勋章和活动横幅. (仅支持新版评论区) (#2381)
- `清爽首页` 设置为隐藏的版块现在将彻底销毁, 减少资源占用.
- `禁用特殊弹幕样式` 支持禁用大会员弹幕. (#4227)
- `下载视频` 在批量下载番剧时, 支持下载多个不同板块的选集. (#2834)
- 新增功能 `全屏直播礼物简化`. (PR #4306 by [TimmyOVO](https://github.com/TimmyOVO))

> 移除全屏观看直播时的底部礼物栏

- 新增功能 `评论区 IP 属地显示`. (PR #4331, PR #4334 by [Light_Quanta](https://github.com/LightQuanta))

> 在评论区显示评论的IP属地信息

- 新增功能 `直播间网页全屏自适应`. (#4216)

> 在直播网页全屏时, 自动调整侧边栏的宽度, 使得视频区域的比例和视频源相匹配, 达到无黑边的效果.
>
> - `侧边栏最大宽度 (px)`: 限制侧边栏可被拉伸到的最大宽度. (最小宽度固定为 190px, 再小的话布局就要出问题了)
>
> > 注意, 由于有最大宽度和最小宽度的限制, 部分窗口尺寸下仍然无法做到无黑边.

- 新增功能 `关注时间显示`. (PR #4352 by [Light_Quanta](https://github.com/LightQuanta))

> 在个人空间的粉丝/关注列表显示关注的具体时间

- 新增功能 `自动移出稍后再看`.

> 在稍后再看页面播放结束时, 自动将当前视频移出稍后再看.
> 注意:
> - 一定要播放结束, 快结束时手动切走不算
> - b 站的稍后再看列表不会实时刷新

- 新增功能 `相簿发布时间显示`. (PR #4362 by [Light_Quanta](https://github.com/LightQuanta))

> 在个人空间的相簿界面显示相簿的发布时间

🐛修复
- 修复 `清爽首页` 番剧区图标不显示. (#4262)
- 修复 `清爽首页` 番剧区时间线的遮罩颜色在夜间模式下不正确.
- 修复 `隐藏记笔记` 功能打开后, 评论区的笔记弹窗无法显示. (#4285)

☕开发者相关
- SwitchOptions API 更新:
  - 老的 `createSwitchOptions` 标记为已弃用.
  - 新的 `newSwitchComponentWrapper` 更名为 `wrapSwitchOptions`.
  - `checkedIcon` 拥有默认值: `mdi-eye-off-outline`.
  - `notCheckedIcon` 拥有默认值: `mdi-eye-outline`.
  - `dimAt` 选项功能更改为如下所示, 更符合直觉:
```ts
/**
 * 控制开关变暗的时机
 *
 * `false`: 始终不变暗
 * `'checked'`: 当开关开启时变暗
 * `'notChecked'`: 当开关关闭时变暗
 *
 * @default 'checked'
 */
dimAt?: false | 'checked' | 'notChecked'
```
- Vue 升级到 2.7, 支持组合式 API 以及使用 Volar 提供代码提示. (PR #4337 by [timongh](https://github.com/timongh))
- 修复组件加载失败时没有输出任何报错.

## v2.7.5
`2023-08-26`

✨新增
- 夜间模式适配新版番剧播放页面. (PR #4366 by [QwExZy@0xx1](https://github.com/qwaszx-WXY))

🐛修复
- 修复下载弹幕的数量比实际要少. (#4287)
- jsDelivr 源域名由 `fastly.jsdelivr.net` 更换为 `cdn.jsdelivr.net`. (#4198)
- 修复 `快速收起评论区` 在新版动态下宽度不正确. (#4282)
- 修复删除搜索历史时选项不会立即消失. (#4268)
- 修复 `直播全屏包裹` 的颜色问题. (#4166, PR #4323 by [CrazyboyQCD](https://github.com/CrazyboyQCD))
- 修复 `下载字幕` 失效, 注意由于 b 站接口变更, AI 字幕可能无法下载. (#4319)
- 修复 `隐藏视频推荐` 未能隐藏番剧页面的相关推荐. (#4247)
- 修复 `自定义顶栏` 中封面图片在个人空间的样式异常. (#4312, PR #4338 by [timongh](https://github.com/timongh))
- 修复 `简化直播间` 屏蔽标题栏活动后, 粉丝团打榜弹窗位置异常. (#4215)
- 修复 `传统连播模式` 在点击右侧推荐视频时会延后一次. (#4256)

☕开发者相关
- 修复 VPopup 组件中 openHandler 的 this 绑定丢失. (#4264)
- 重构了 Comments API. (#4334)
  - `CommentReplyItem` 实现了 `EventTarget`, 评论更新事件 (`repliesUpdate`) 均通过 `EventTarget` 的事件订阅实现.
  - 修复新版评论区下评论更新事件没触发.
- 重构了 `playerModePolyfill` 的实现, 解决 empty class token 在页面上反复报错的问题.

## v2.7.4 / v2.8.2-preview
`2023-07-16`

- 修复 v4.2 播放器下视频相关功能失效. (#4303)

注: 下载字幕还是会失败, 属于另一个问题 (#4319), 需要另外再修复.


## v2.7.3 / v2.8.1-preview
`2023-07-13`

- 修复 VideoInfo 报错 `Cannot read properties of null (reading 'list')`. (影响 `下载字幕`, `查看封面` 等功能) (#4291)

## v2.8.0-preview
`2023-06-03`

包含 v2.7.2 的所有更新内容.

✨新增

- `清爽首页` 改进:
  - 支持自定义板块的布局和可见性. (操作方式和自定义顶栏那个差不多)
  - 番剧时间表优化样式, 增加翻页按钮.

<div>
  <img height="400" src="https://user-images.githubusercontent.com/26504152/242905984-895cb72c-b344-40c3-91a0-2a6b20d5f783.png">
  <img height="400" src="https://user-images.githubusercontent.com/26504152/242905640-cbc948f1-734e-46f2-96a7-d57787b7cf47.png">
</div>

- 新增功能 `首页净化`. (PR #4153 by [RieN](https://github.com/rien7))
> 删除首页特定类型的卡片.

- `自定义顶栏` 增加 `创作中心` 入口, `排行` 新增 `全站音乐榜` 和 `短剧榜` 的入口. (#4101, PR #4154 by [星海](https://github.com/lovelyCARDINAL), PR #4155 by [星海](https://github.com/lovelyCARDINAL))
- `播放器置顶（新）` 增加选项 `顶部留白`. (#4152, PR #4165 by [Ziu](https://github.com/ZiuChen))
- `播放器置顶（新）` 的标题改为放置到播放器和点赞中间. (PR #4208 by [LockRim](https://github.com/LockRim))
- `显示视频投稿时间` 支持转义字符. (#4160, PR #4167 by [呼乎户](https://github.com/wisokey))
- `隐藏视频推荐` 支持稍后再看和收藏夹播放页, 并适配 bpx 播放器. (#4174)
- 新增功能 `隐藏记笔记` 和 `隐藏稿件投诉`. (#4124)
- 优化了 `自定义顶栏` 中订阅在筛选时的 API 调用. (#4120)
- 优化粗体的显示: 优先调用 Semibold 字重, 若字体不支持则使用 Bold 字重.
- `自定义顶栏` 增加选项:
  - 支持自定义消息提醒样式, 可设置为 `数字`, `点状` 或 `隐藏`. (#4125)
  - 支持自定义搜索栏宽度. (#4112)
- 搜索在纯数字输入时, 增加对 UID 和直播间的搜索. (#677)

☕开发者相关
- 播放器模式转换出的 bpx class 更换为更统一的名称, 并增加事件派发. (PR #4191 by [Ziu](https://github.com/ZiuChen))
- 需要选择组件 / 插件的构建任务中, 优化了选项的长度. (PR #4192 by [Ziu](https://github.com/ZiuChen))
- 弃用 utils 中的 `formData`. (名称具有歧义, 应使用 `URLSearchParams` 来代替)
- `addComponentListener` / `removeComponentListener` 支持传入多层的组件 options 路径.
- 移除依赖 `vue-fragment`. (使用 `display: contents` 代替)

## v2.7.2
`2023-06-03`

> ⚠ 对浏览器的要求中, Safari 提升至 15.4

✨新增

<details>
<summary>获得 v2.6.1-preview ~ v2.7.1-preview 的所有新功能, 点击展开查看</summary>

- `自定义顶栏` 搜索优化:
  - 提高了搜索 av 号 / BV 号结果的优先级, 输入编号后直接回车就可以前往视频.
  - 支持搜索多种 ID, 可以通过安装对应的插件来使用: (#677)
    - 搜索 av / BV 号时, 支持显示视频标题
    - 支持搜索专栏 cv 号 / 文集 rl 号
    - 支持搜索音频 au 号 / 播放列表 am 号
    - 支持搜索番剧 ss / ep 号, 或番剧详情 md 号
    - 支持搜索用户 uid 号
    - 纯数字输入时, 支持同时搜索视频和专栏
- `自定义顶栏` 的收藏和稍后再看支持显示数量. (#4069)
- `自定义顶栏` 的订阅支持过滤 在看 / 看过 / 想看. (#3217)
- 添加跨域存储功能 (`crossOriginLocalStorage`), 支持搜索历史跨域同步. (#3893)
- 新增功能 `弹幕转义`. (#3470)
> 将弹幕中的 `\n` 替换为真实的换行, 注意这可能导致原先不重叠的弹幕发生重叠.
- 新增功能 `组件二等分`, 在出现问题时可帮助定位是哪个组件导致的问题. (#3829, PR #3965 by [JLoeve](https://github.com/LonelySteve))
- 优化了 `网址参数清理` 的逻辑, 通过 Hook History API 来减少出现重复的历史记录. (#4039)
- 新增功能 `隐藏热搜`. (#3744)
> 隐藏搜索栏和搜索页面中的 `bilibili 热搜`.
- 新增功能 `隐藏视频分享`. (#3663)
> 隐藏视频和番剧播放器下方的分享按钮.
- 新增插件 `快捷键扩展 - 开关灯`. (#3587)
> 在快捷键的动作列表里添加一个 "开关灯".
- `显示视频投稿时间` 允许自定义替换文本格式. (PR #4136 by [呼乎户](https://github.com/wisokey))
- `清爽首页` 排行榜支持切换为列表模式, 能够查看 10 项左右的排行. (#3611, #3175)
- 新增功能 `动态看图自动回顶`. (#4029)
> 在动态里查看图片详情时 (非全屏), 切换图片自动回到图片顶部; 退出查看图片模式时, 自动将动态移入视图内.
- 重构了 `直播信息扩充` 面板, 改为完全自主实现, 支持显示超过 10 条的直播间, 并可以进行搜索和刷新操作. (#3774, #4035, #4034)

<img src="https://user-images.githubusercontent.com/26504152/234049176-7ae3e3cf-6956-4efe-aec1-66218d940c93.png" width="300">

- 新增功能 `反转滚轮调音量`. (#4053)
> 反转在网页全屏 / 全屏模式下使用滚轮调节音量的方向, 使其更符合使用触控板时的操作方向. 请注意不能和 `禁止滚轮调音量` 一同使用.
> - 手指向上推时, 增加音量
> - 手指向下推时, 减少音量
> - 可以自定义 `灵敏度`, 同样的滚动幅度下, 灵敏度越高变化的音量越多

- 新增功能 `自动点赞`. (#2354)
> 进入视频 / 查看动态时, 自动点赞.

- 新增功能 `隐藏用户信息卡片`. (PR #4093 by [WakelessSloth56](https://github.com/WakelessSloth56))
> 隐藏鼠标指向用户名或用户头像时弹出的浮动用户信息卡片.

- 新增功能 `播放器置顶（新）`. (#3030, #PR #4152 by [RieN 7z](https://github.com/rien7))
> 原来的播放器置顶组件，现在已经不可用了，这是一个新的版本，可以在视频页面中将播放器放在页面最上方.

- 启用新的代码加载方式. (PR #3938 by [timongh](https://github.com/timongh))
- Comments API 支持读取评论图片. (PR #4130 by [manip_ego](https://github.com/manipEgo))
```diff
export interface CommentItem extends CommentReplyItem {
+  /** 评论图片 */
+  pictures?: string[]
  /** 回复 */
  replies: CommentReplyItem[]
  // ...
}
```

</details>

- `网址参数清理` 增加清理会员购和直播间的一些参数. (PR #4189, PR #4214 by [星海](https://github.com/lovelyCARDINAL))
- `删除广告` 增加选项 `保留小喇叭通知`. (PR #4199 by [imshixin](https://github.com/imshixin))
> 指评论区上方的小喇叭通知, 待 `简化评论区` 完成功能拆分后会移动到那边去.

- `与 "解除 B 站区域限制" 互斥` 现在不再在番剧详情页面生效. (#4157)

🐛修复
- 修复播放器模式切换时 `body` 类名响应问题. (PR #4188 by [Ziu](https://github.com/ZiuChen))
- 修复 `播放器控制栏背景色` 位置不正确. (#3713)
- 修复勋章过多时, `直播勋章快速更换` 的弹窗溢出视图. (#4181)
- 修复 `清爽首页` 在非内测首页上无法隐藏原版首页. (#3981)
- 修复 `自定义顶栏` 导致分区页面内容错位. (#4183)
- 修复 `删除广告` 未能删除活动横幅. (#4177)
- 修复 `外置稍后再看` 没有隐藏菜单中的相同选项. (#4175)
- 修复 `直播全屏包裹` 的一部分样式问题. (#4166, #4210)
- 修复检查更新的查看详情弹窗内容溢出. (#4164)
- 修复 `播放前显示封面` 在预览关联视频时封面消失. (#4197)
- 修复 `禁止跳转动态详情` 对新版专栏卡片无效.
- 修复 `动态过滤器` 在切换了 UP 主过滤后失效. (#4149)
- 修复 `简化直播间` 的 `标题栏活动` 内容出现溢出. (#4215)
- 新版动态页面适配:
  - `快速收起评论区`
  - `addMenuItem` API (涉及 `图片批量导出` 和 `复制动态链接`)
  - `强制固定动态侧栏`: 由于 class 名称和旧版一样, 目前只能先把宽度也锁死在旧版的宽度.
  - `夜间模式`
  - `feedsCardsManager` API

☕开发者相关
- GitHub 相关配置更换为 JSON 格式, 并由脚本自动生成 YAML.
- 增加了讨论区 `功能建议` 的模板.

## v2.7.1-preview
`2023-04-25`

包含 [v2.7.1](https://github.com/the1812/Bilibili-Evolved/releases/tag/v2.7.1) 的所有更新内容.

- Comments API 支持读取评论图片. (PR #4130 by [manip_ego](https://github.com/manipEgo))
```diff
export interface CommentItem extends CommentReplyItem {
+  /** 评论图片 */
+  pictures?: string[]
  /** 回复 */
  replies: CommentReplyItem[]
  // ...
}
```
- `显示视频投稿时间` 允许自定义替换文本格式. (PR #4136 by [呼乎户](https://github.com/wisokey))
- `清爽首页` 排行榜支持切换为列表模式, 能够查看 10 项左右的排行. (#3611, #3175)
- 新增功能 `动态看图自动回顶`. (#4029)
> 在动态里查看图片详情时 (非全屏), 切换图片自动回到图片顶部; 退出查看图片模式时, 自动将动态移入视图内.

- 重构了 `直播信息扩充` 面板, 改为完全自主实现, 支持显示超过 10 条的直播间, 并可以进行搜索和刷新操作. (#3774, #4035, #4034)

<img src="https://user-images.githubusercontent.com/26504152/234049176-7ae3e3cf-6956-4efe-aec1-66218d940c93.png" width="300">

- 新增功能 `反转滚轮调音量`. (#4053)
> 反转在网页全屏 / 全屏模式下使用滚轮调节音量的方向, 使其更符合使用触控板时的操作方向. 请注意不能和 `禁止滚轮调音量` 一同使用.
> - 手指向上推时, 增加音量
> - 手指向下推时, 减少音量
> - 可以自定义 `灵敏度`, 同样的滚动幅度下, 灵敏度越高变化的音量越多

- 新增功能 `自动点赞`. (#2354)
> 进入视频 / 查看动态时, 自动点赞.

- 新增功能 `隐藏用户信息卡片`. (PR #4093 by [WakelessSloth56](https://github.com/WakelessSloth56))
> 隐藏鼠标指向用户名或用户头像时弹出的浮动用户信息卡片.

- 新增功能 `播放器置顶（新）`. (#3030, #PR #4152 by [RieN 7z](https://github.com/rien7))
> 原来的播放器置顶组件，现在已经不可用了，这是一个新的版本，可以在视频页面中将播放器放在页面最上方.

- 新增插件 `搜索栏 - UID 跳转`, `搜索栏 - 数字联想`. (#677)
> 在输入 UID (用户 ID) 时, 提供对应的跳转选项. / 在输入纯数字时, 提供以下选项:
> - 跳转至相应的视频 (视为 av 号)
> - 跳转至相应的专栏 (视为 cv 号)


## v2.7.1
`2023-04-25`

✨新增
- `与 "解除 B 站区域限制" 互斥` 现在只在番剧页面生效.
- 更新 `夜间模式` 对新版直播间, 番剧, 稍后再看等页面的适配. (#3963, #4007, #4128, PR #4137 by [Pencil](https://github.com/pencilqaq))
- 新版番剧页面功能适配: `下载视频` (#4044), `自定义顶栏` (#4007)
- 新版稍后再看页面功能适配: `外置稍后再看`, `启用快速收藏`, `播放器控制栏背景`, `展开视频简介`. (#3916)
- `简化直播间 - 付费礼物` 现在对底栏只留一个包裹按钮, 因为其他元素也都算付费礼物了.

🐛修复
- 修复 `自定义顶栏` 动态的详情链接. (PR #4119 by [星海](https://github.com/lovelyCARDINAL))
- 修复在部分分辨率下 `外置稍后再看` 和 `启用快速收藏` 的响应式宽度. (#4083)
- 修复 `直播全屏包裹` 和 `简化直播间 - 付费礼物` 在新版直播间下的适配问题. (#4105, #4108, PR #4122 by [Pencil](https://github.com/pencilqaq), PR #4123 by [Pencil](https://github.com/pencilqaq))
- 修复 `自定义顶栏` 未完全隐藏个人空间原版顶栏. (#4079)
- 修复 `直播信息扩充` 在新版动态无法打开 “正在直播” 十个以后的链接. (#4034, #3917, PR #4145 by [hhp1614](https://github.com/hhp1614))

☕开发者相关
- pnpm 升级至 8.1.0, 之前本地装过依赖的开发者需要重新 `pnpm install` 一下.
- 废弃 Ajax Hook API. (#4117)
- 新增 API `addVideoActionButton`, 可向视频操作按钮区的 "收藏" 右侧添加元素.

## v2.7.0-preview
`2023-03-26`

包含 v2.7.0 的所有更新内容.

- 新增功能 `组件二等分`, 在出现问题时可帮助定位是哪个组件导致的问题. (#3829, PR #3965 by [JLoeve](https://github.com/LonelySteve))
- 优化了 `loadFeatureCode` 的代码. (PR #4013 by [timongh](https://github.com/timongh))
- 搜索栏在搜索 ID 时的优化, 新增功能可以通过安装对应的插件来使用: (#677)
  - 搜索 av / BV 号时, 支持显示视频标题
  - 支持搜索专栏 cv 号 / 文集 rl 号
  - 支持搜索音频 au 号 / 播放列表 am 号
  - 支持搜索番剧 ss / ep 号, 或番剧详情 md 号
- `自定义顶栏` 的收藏和稍后再看支持显示数量. (#4069)
- 优化了 `网址参数清理` 的逻辑, 通过 Hook History API 来减少出现重复的历史记录. (#4039)
- 新增功能 `隐藏热搜`. (#3744)
> 隐藏搜索栏和搜索页面中的 `bilibili 热搜`.
- 新增功能 `隐藏视频分享`. (#3663)
> 隐藏视频和番剧播放器下方的分享按钮.
- `自定义顶栏` 的订阅支持过滤 在看 / 看过 / 想看. (#3217)
- 新增插件 `快捷键扩展 - 开关灯`. (#3587)
> 在快捷键的动作列表里添加一个 "开关灯".

## v2.7.0
`2023-03-26`

增加了 GitHub Projects 看板: https://github.com/users/the1812/projects/1/views/3, 上面会列出当前和未来计划的功能, 可供参考.

✨新增
- 快捷键扩展的几个插件自带了 YouTube / PotPlayer 等预设的默认按键. (#3971)
- `简化直播间` 在开启隐藏付费礼物时, 将直接隐藏左下角的打榜入口 (以前是领银瓜子所以没算进付费礼物). (#4067)
- `专栏文字选择` 更名为 `专栏复制优化`, 现在专栏的文字默认就可以直接选择, 本功能可以用于去除复制后带上的多余文本. (#4065)
- 删除功能 `直播录像下载`, 现在已经没有直播录像的页面了. (#4061)
- 在检测到[解除番剧区域限制](https://greasyfork.org/zh-CN/scripts/25718-%E8%A7%A3%E9%99%A4b%E7%AB%99%E5%8C%BA%E5%9F%9F%E9%99%90%E5%88%B6)的脚本在运行时, 本脚本将停止运行以避免兼容性问题. (#2704)
- `选集区域优化` 在多个分组时支持仅展开当前分组. (#3899)
- `播放时自动关灯` 支持星光动画. (PR #4077 by [z503722728](https://github.com/z503722728))

🐛修复
- 修复 `直播信息扩充` 失效的问题. (#4034, PR #4043 by [deepdarkssj](https://github.com/deepdarkssj))
- 修复 `简化直播间` 在开启隐藏付费礼物时, 右下布局错乱. (PR #4089 by [Pencil](https://github.com/pencilqaq))
- 修复动态相关功能对新版专栏卡片不生效. (#3994)
- 修复搜索界面的广告链接仍然可点击. (#3969)
- 修复 `图片批量导出` 在动态失效了. (#4038)
- 修复 `选集区域优化` 仅开启 `展开选集标题` 时视频标题无法显示完全. (#3909)
- 修复 `查看封面` 在复制链接后没有显示成功图标. (#4002)
- 修复番剧页面的部分夜间模式. (PR #4077 by [z503722728](https://github.com/z503722728))

☕开发者相关
- 修复 `IframePopup.vue` 的类型定义. (PR #4014 by [timongh](https://github.com/timongh))
- 修复 `UserItem.vue` 初始化 Toast 的逻辑问题. (PR #4056 by [timongh](https://github.com/timongh))
- 优化了 `switch-options.ts` 的注释. (PR #4021 by [timongh](https://github.com/timongh))
- 清理了项目中 Vue 文件里对未定义字段的引用. (#3992)
- 导出了 Dialog API (`@/core/dialog`), 允许其他组件使用.
- 调整了 CONTRIBUTING 中的本地开发流程描述. (PR #4077 by [z503722728](https://github.com/z503722728))

## v2.6.3-preview
`2023-02-20`

包含 v2.6.3 的所有更新内容.

- 启用新的代码加载方式. (PR #3938 by [timongh](https://github.com/timongh))

## v2.6.3
`2023-02-20`

- 修复 `隐藏推荐直播` 失效. (#3993)
- 修复 `夜间模式` 下鼠标移至特定页排行榜时的显示问题. (#1052, PR #4001 by [Tinhone](https://github.com/Tinhone))

## v2.6.2-preview
`2023-02-09`

包含 v2.6.2 的所有更新内容.

- 修复搜索历史无法删除. (#3893)

## v2.6.2
`2023-02-09`

- 修复 `播放前显示封面` 未正确清除封面. (#3974, PR #3976 by [imshixin](https://github.com/imshixin))
- 删除 NavbarWatchlater.vue 中的未定义属性. (#3949)

## v2.6.1-preview
`2023-02-07`

包含 v2.6.1 的所有更新内容.

- 提高了 `自定义顶栏` 搜索栏中搜索 av 号 / BV 号结果的优先级, 输入编号后直接回车就可以前往视频.
- 添加跨域存储功能 (`crossOriginLocalStorage`), 支持搜索历史跨域同步. (#3893)
- 新增功能 `弹幕转义`. (#3470)
> 将弹幕中的 `\n` 替换为真实的换行, 注意这可能导致原先不重叠的弹幕发生重叠.

## v2.6.1
`2023-02-07`

✨新增
- 优化 `简化评论区` 的时间样式. (#3541, PR #3791 by [Tinhone](https://github.com/Tinhone))
- `下载视频`:
  - 支持选择备用下载地址. (PR #3798 by [Seaward233](https://github.com/Seaward233))
  - 新增 `StreamSaver` 输出方式.
  - 新增 `Motrix` 输出方式. (PR #3908 by [FoundTheWOUT](https://github.com/FoundTheWOUT))
- `删除广告` 支持屏蔽动态的商品推荐. (#3778)
- 优化 `自定义顶栏` 的弹窗逻辑, *有任意元素聚焦时* -> *仅在输入框聚焦时*显示弹窗. (#3756)
- `展开弹幕列表` 新增 `有选集时不自动展开` 选项. (#1734)
- 新增功能 `禁止滚轮调音量`. (#3489)
> 在网页全屏 / 全屏模式下, 禁止鼠标滚轮控制播放器的音量.

- 新增功能 `批量导入合集`. (PR #3884 by [swhoro](https://github.com/swhoro))
> 在合集页面制作一个批量导入按钮，可以新增所有合集内视频至同名收藏夹

- `扩展倍速` 添加 `隐藏移除图标` 和 `隐藏新增图标` 选项. (PR #3864 by [Tinhone](https://github.com/Tinhone))
- 新增插件 `快捷键扩展 - 开关 CC 字幕`, 默认为 <kbd>Shift</kbd> + <kbd>C</kbd>. (#3407)
- 新增插件 `快捷键扩展 - 开关弹幕列表`, 默认为 <kbd>Shift</kbd> + <kbd>D</kbd>. (#3613)
- `新版本提示` 支持在安装前查看更新说明.
- 功能面板为空时增加引导提示. (#3932, PR #3936 by [Ethkuil](https://github.com/Ethkuil))
- `下载字幕` 支持在番剧页面使用.
- 新增功能 `禁用评论区搜索词`. (#3648)
> 禁用评论区的搜索词链接.

🐛修复
- `下载视频` 的 `flv` 格式恢复 1080P 支持. (一共就 360P / 1080P, 其他清晰度还是没有, 需要的话请使用 dash 格式)
- 修复评论区功能在新版播放页上的支持, 包括 `复制评论链接` / `简化评论区` 等. (#3807)
- 修复 `清爽首页` 的排行榜第三项数据不正确. (#3911, PR #3912 by [Colerar](https://github.com/Colerar))
- 修复 `简化直播间` 对左下角红包的简化样式. (#3243)
- MDI 图标库内联至本体中, 避免阻塞页面加载. (#3964, #3888)
- 修复 `侧栏垂直偏移` 在部分直播间失效的问题. (#3934)
- 修复 `自定义顶栏` 的收藏夹在加载完毕后仍显示加载中. (#3940)
- 修复 `展开弹幕列表` 检测到的弹幕量不正确. (获取页面的已装载弹幕量太坑了, 改为调 API 获取总弹幕量来判断了) (#3958)
- 修复 `启用弹幕空降` 失效. (#3187)
- 修复 `高分辨率图片` 在个人空间投稿页失效. (#3894)
- 修复 `复制评论链接` 在个人空间复制出的链接不正确. (#3821)
- 修复 ASS 弹幕中的颜色标记不正确. (#3960)

☕开发者相关
- 完成 define API + SwitchOptions API 的改造 (受影响组件为 `简化首页` 和 `简化直播间`), 感谢 [timongh](https://github.com/timongh) 的长期贡献.
- 重新拆分了一下 PlayerAgent 的文件.
- 修复 CI 构建脚本未提交新增文件. (#3903)
- 新增 Dialog API, 可用简单封装以弹窗形式展示的内容.
- 开源许可有所变更, 对再分发有一些限制, 详见 [LICENSE](./LICENCE.md).
- 删除了 `<template>` 元素多余的 class. (#3951)
- 修复 VSCode Task 中的 ESLint 命令和 package.json 中不一致. (#3950)
- TypeScript 升级至 4.9 版本.


## v2.6.0-preview
`2023-01-01`

包含 v2.6.0 的所有更新内容.

✨新增
- 新增功能 `批量导入合集`. (PR #3884 by [swhoro](https://github.com/swhoro))
> 在合集页面制作一个批量导入按钮，可以新增所有合集内视频至同名收藏夹

- `扩展倍速` 添加 `隐藏移除图标` 和 `隐藏新增图标` 选项. (PR #3864 by [Tinhone](https://github.com/Tinhone))
- 新增插件 `快捷键扩展 - 开关 CC 字幕`, 默认为 <kbd>Shift</kbd> + <kbd>C</kbd>. (#3407)

🐛修复
- 修复新版播放页下 `简化评论区` 的样式. (#3872)
- `StreamSaver` 下载补充三方 cookie 说明. (#3824)

☕开发者相关
- 完成 define API + SwitchOptions API 的改造 (受影响组件为 `简化首页` 和 `简化直播间`), 感谢 [timongh](https://github.com/timongh) 的长期贡献.
- 重新拆分了一下 PlayerAgent 的文件.

## v2.6.0
`2023-01-01`

✨新增
- `快速收起评论区` 添加了平滑滚动效果. (PR #3857 by [Mike Lei](https://github.com/mikelei8291))
- `删除广告` 新增对搜索页广告的的屏蔽. (#3863)
- `显示视频投稿时间` 适配新版播放页. (#3860, PR #3880 by [wisokey](https://github.com/wisokey))
- `网址参数清理` 新增 `buvid`, `mid`, `up_id` 的清理. (#3896)
- `选集区域优化` 支持折叠合集下的分组. (#3764)

🐛修复
- 重新调整了 `自定义顶栏` 的历史弹窗过滤器, 改为只能选择 `全部` 或者单一类型 (#2729), 解决专栏加载不出来的问题 (#3676).
- 修复 `下载字幕` 在 3.x 播放器检测不到语言选项的问题. (#3873)
- 修复旧版播放页中高能进度条未跟随主题颜色. (#3830)
- 修复 `选集区域优化` 临时收起时, 多行标题出现布局问题. (#3841)
- 修复 `禁用特殊弹幕样式` 失效. (#3886)
- 修复 `删除视频弹窗` 失效. (#3853)
- 修复 `自定义顶栏` 开启后原版顶栏高度异常. (#3833) (应该还需要再优化下, 现在还会有点小空隙, 不过没之前那么离谱了)
- `隐藏视频标题层` 补充 `视频` 标签. (#3839)

## v2.5.2-preview
`2022-11-19`

包含 v2.5.2 的所有更新内容.

- 优化 `简化评论区` 的时间样式. (#3541, PR #3791 by [Tinhone](https://github.com/Tinhone))
- `下载视频` 支持选择备用下载地址. (PR #3798 by [Seaward233](https://github.com/Seaward233))
- 优化 `自定义顶栏` 的弹窗逻辑, *有任意元素聚焦时* -> *仅在输入框聚焦时*显示弹窗. (#3756)
- `删除广告` 支持屏蔽动态的商品推荐. (#3778)
- 新增插件 `快捷键扩展 - 开关弹幕列表`, 默认为 <kbd>Shift</kbd> + <kbd>D</kbd>. (#3613)
- `展开弹幕列表` 新增 `有选集时不自动展开` 选项. (#1734)
- 新增功能 `禁止滚轮调音量`. (#3489)
> 在网页全屏 / 全屏模式下, 禁止鼠标滚轮控制播放器的音量.

- `下载视频` 新增 `StreamSaver` 输出方式.
- `下载视频` 的 `flv` 格式恢复 1080P 支持. (一共就 360P / 1080P, 其他清晰度还是没有, 需要的话请使用 dash 格式)
- Comment API 支持新版播放页的评论区, `复制评论链接` / `简化评论区` 等相关功能应该可以使用了. (#3807)

## v2.5.2
`2022-11-19`

**⚠警告: 运行脚本的浏览器版本要求提高至:**
- Chrome / Edge: > 100
- FireFox: > 103
- Safari: > 15

✨新增
- 优化 `控制栏触摸优化` 在多 P 视频下的样式.
- 优化夜间模式在新版播放页 / 搜索页 / 直播间下的样式.
- 在线仓库支持筛选 `全部` / `已安装` / `未安装`.

🐛修复
- 修复 `自定义顶栏 - 频道` 失效的问题. (#3752)
- 修复 `扩展倍速` 的选项在 3.x 播放器中无法点击的问题. (#3539, PR #3805 by [JLoeve](https://github.com/LonelySteve))
- 修复 `BV 号转换` 的复制 av 号功能失效. (#3794, PR #3797 by [Hobart Zhi-xin Lin](https://github.com/Ethkuil))
- 修复 `自定义顶栏` 的搜索项布局错乱, 以及对原版顶栏隐藏不完全.
- 修复功能文档中的链接错误.
- 修复 `外置稍后再看` 和 `启用快速收藏` 的图标在宽屏下尺寸不对.
- 修复在线仓库中的描述提示层级问题. (#3759)
- 修复 `极简首页` 的默认标签页设置不生效. (#3817)


## v2.5.1
`2022-10-22`
- 修复 `展开选集列表` 和 `展开选集标题` 冲突的问题, 这两个组件将合并在一起, 并提供单独的选项控制列表和标题. (#3752, #692)
> 如果在 v2.5.0 中尝试安装过 `展开选集列表`, 记得先卸载掉.

- 修复 jsDelivr 源中 MDI 图标库加载失败. (#3752, #3761)
- 修复 `简化首页` 在带 query 参数的首页不显示分区选项. (#3730)

## v2.5.0
`2022-10-20`

✨新增
- 新增功能 `隐藏动态评论预览`. (#3322)
> 隐藏动态评论按钮上方的精选评论预览.

- 新增功能 `显示视频投稿时间`. (PR #3727 by [wisokey](https://github.com/wisokey))
> 为视频播放页面的推荐列表中的视频添加显示视频投稿时间.

- 新增功能 `展开选集列表`. (#3380)
> 总是完全展开视频选集列表, 注意对番剧无效.

🐛修复
- 由于 Chrome / Firefox / Safari 均已支持自适应滚动条, `夜间模式` 不再覆盖默认滚动条样式, 设置的组件详情不再隐藏滚动条. (#3370)
- 修复 `下载字幕` 得到的 ASS 文件格式不正确. (#3688)
- 修复 `播放前显示封面` 在视频暂停时仍然显示封面. (#3698)
- `自定义顶栏` 的弹窗改为有焦点时不自动收起, 以防止在其中打字时意外收起. (#3703)
- 修复 `动态过滤器` 的关键词过滤在首页和顶栏中有时无法生效的问题, 以及对转发动态无效的问题.
- 修复 b 站消息会被 `自定义顶栏` 遮挡的问题. (#3702)
- 修复 `动态反折叠` 有时失效的问题.
- 修复 `极简首页` 中合作投稿样式的问题.
- 尝试修复 `document.body is null` 报错导致脚本无法加载的问题. (#3728)
- 修复 `下载弹幕` 无法读取 3.x 播放器的弹幕设置, 以及文件中的弹幕乱序的问题. (#3739)
- 修复 `自定义顶栏` 在搜索页没有正确隐藏原版顶栏. (#3731)

☕开发者相关
- 包管理器更换为 pnpm, **请删除 node_modules 并重新安装依赖 (`pnpm install`)**.
- ESLint 加入了 Prettier 规则. (#3729)
- 更多的组件更换为 define API 声明. (PR #3682, PR #3697 by [timongh](https://github.com/timongh))
- 改善了动态的 `addMenuItem` API 稳定性.
- 添加了 `createPostHook` API, 可以让原函数先执行再让钩子函数执行.

## v2.4.1-preview
`2022-09-18`

包含 v2.4.1 的所有更新内容.

- 更多的组件更换为 define API 声明. (PR #3682 by [timongh](https://github.com/timongh))
- 新增功能 `隐藏动态评论预览`. (#3322)
- 由于 Chrome / Firefox / Safari 均已支持自适应滚动条, `夜间模式` 不再覆盖默认滚动条样式, 设置的组件详情不再隐藏滚动条. (#3370)

## v2.4.1
`2022-09-18`

✨新增
- `删除视频弹窗` 支持删除预约弹窗. (#3670)
- 默认 CDN 切换至 AltCdn (指代非 GitHub 的 CDN, 目前指向 fastly.jsdelivr.net) (#3657)

> 如果目前使用的是 GitHub 源的脚本, 且希望更换至 AltCdn, 需要重新选择 AltCdn 源的脚本进行安装.

🐛修复
- 修复 `自定义顶栏` 头像加载不出来. (#3679)
- `夜间模式` 修复对新版视频页和首页的适配. (#3671, #3661)
- `删除广告` 适配新版首页. (#3585)

## v2.4.0
`2022-09-03`

✨新增
<details>
<summary>正式版获得 v2.3.1 ~ v2.3.3 预览版的功能</summary>

- `清爽首页` 的热门视频支持显示弹幕数量.
- `极简首页` 初版已完成.
- 脚本的更新源配置默认值更换为 `GitHub`, 并添加了 `AltCdn`, 表示开发者自定义的其他 CDN 源. `jsDelivr` 将会删除.
- 在 `GitHub` 更新源下, MDI 图标库更换使用 GitHub Pages.
- 新增组件 `UP 主黑名单` by [snowraincloud](https://github.com/snowraincloud). (PR #3537)
- 在无限滚动的场景下, 点击那个 `加载中` 的标识 (ScrollTrigger) 可以手动触发加载下一页. 在遇到没有自动加载下一页的情况时会比较有用.
- `下载视频` 支持 `flac` 音源. (#3497)
- `自定义顶栏` 支持设置顶栏的高度, 设置为 64px 即为原版顶栏的高度. (#3136)

</details>

- `删除视频弹窗` 支持 3.x 播放器的 `关联视频` 和 `评分` 弹窗. (#3545)
- `展开弹幕列表` 支持设置 `最大弹幕数量`, 超过此数量不进行展开, 避免展开时卡死页面. (#2972)
- `图片批量导出` 在导出动态的图片时, 可以指定 `originalUser` 作为被转发用户名. (#1208)
- 新增插件 `自定义顶栏 - 频道`, 为自定义顶栏添加一个频道入口. (#3258)
- `自定义顶栏` 的历史弹窗中支持暂停/继续记录历史. (#3303)

🐛修复
- 修复 `默认播放器模式` 和 `播放器位置动作` 导致 `夜间模式跟随系统` 未生效. (#3157, PR #3636 by [ChsBuffer](https://github.com/chsbuffer))
- 修复个人空间中的动态无法使用动态相关功能. (#3191)
- 新版播放页 & 3.x 播放器适配: (#3187, #2615)
  - 夜间模式 (#3647)
  - 播放器投影
  - 启用双击控制
  - 控制栏触摸优化
  - 三连触摸支持
  - 隐藏视频标题层
  - 展开视频简介
  - 启用弹幕空降
  - 播放器控制栏背景色
  - 强制保留弹幕栏
  - 快捷键扩展
  - 外置稍后再看
  - 启用快速收藏
  - 传统连播模式

☕开发者相关 (来自预览版 v2.3.1)
- 重新整理了所有 CDN 调用, 并支持自定义 CDN 配置, 文档见 [doc/cdn.md](https://github.com/the1812/Bilibili-Evolved/blob/preview-features/doc/cdn.md).
- 拆分并整理了 `/src/core/settings` 的代码结构.
- 所有 webpack 配置更换为 TypeScript, 并启用 ESLint 检查.
- 重构了元数据注入功能, 新增了 i18n 和 description 注入, 详细用法可见 `webpack/inject-metadata/i18n.ts` 和 `webpack/inject-metadata/description.ts` 中的注释说明.
- 删除了用不到的包 `html-webpack-plugin`.
- 适配了 VSCode File Nesting 功能.

## v2.3.3-preview
`2022-08-25`

包含 v2.2.4 的所有更新内容.

- `自定义顶栏` 支持设置顶栏的高度, 设置为 64px 即为原版顶栏的高度. (#3136)
- 修复 `UP 主黑名单` 无法添加 UP 主. (#3597, PR #3598 by [snowraincloud](https://github.com/snowraincloud))

## v2.2.4
`2022-08-25`

✨新增
- `自定义顶栏` 适配新版首页的分区栏. (#3585)
- `网址参数清理` 支持清理 `share_from`, `is_story_h5` 参数. (#3553, PR #3607 by [EzraRT](https://github.com/EzraRT))
- `删除视频弹窗` 支持 3.x 播放器的 `投票` 和 `三连` 弹窗屏蔽, 如果有看到出现 `关联视频` 和 `评分` 弹窗的视频, 请到 #3545 反馈.

🐛修复
- 修复 `隐藏顶部横幅` 开启时, `清爽首页` 错位. (#3565)
- 修复 `隐藏顶部横幅` 在热门排行榜页面中未能隐藏. (#3618)
- 修复 `清爽首页` 的番剧中混入国创内容. (#3552)
- `侧栏垂直偏移` 的下限从 `-40%` 改为 `-35%`, 避免被顶栏遮挡. (#3532)
- 修复 `直播勋章快速更换` 无法显示勋章. (#3592, #3515)
- 尝试换一种方法兼容 Safari 下的 `requestIdleCallback`. (~~但愿有用吧~~) (#3362)
- 修复 `清爽首页` 的热门视频获取失败. (#3625)
- 修复设置中组件空菜单的显示异常. (#3610)

## v2.3.2-preview
`2022-08-14`

包含 v2.2.3 的所有更新内容.

✨新增
- 新增组件 `UP 主黑名单` by [snowraincloud](https://github.com/snowraincloud). (PR #3537)
- 在无限滚动的场景下, 点击那个 `加载中` 的标识 (ScrollTrigger) 可以手动触发加载下一页. 在遇到没有自动加载下一页的情况时会比较有用.
- `下载视频` 支持 `flac` 音源. (#3497)

## v2.2.3
`2022-08-13`

✨新增
- `BiliPlus 跳转支持` 更换了新的图标.
- `简化评论区` 支持屏蔽热评图标.

🐛修复
- 调整 `自定义顶栏` 对 `bilibili 夏` logo 的尺寸.
- 修复 ScopedConsole API 缺少浏览器的额外 API (报错为 `console.table is not a function`). (#3462)
- `夜间模式` 部分适配更新后的直播间, 修复一些动态页的问题. (#2615, #3459, #3191)
- 修复启用 `禁止跳转动态详情` 后, 动态中的展开按钮无法展开动态. (#3465)
- 新版播放器界面适配:
  - 部分 `夜间模式` 支持. (#2615)
  - `删除广告` 支持删除广告及推广视频.
  - `外置稍后再看` 和 `启用快速收藏` 支持.
- 修复 `自定义顶栏` 遮挡动态页查看大图的界面. (#3467)
- 修复视频卡片在 Safari 中的动画异常. (PR #3533 by [夜白](https://github.com/Agoines))
- 修复 3.x 播放器中开启 HEVC 后查询不到 bwp-video. (PR #3560 by [imshixin](https://github.com/imshixin))

## v2.3.1-preview
`2022-06-28`

包含 v2.2.2 的所有更新内容.

✨新增
- `清爽首页` 的热门视频支持显示弹幕数量.
- `极简首页` 初版已完成.
- 脚本的更新源配置默认值更换为 `GitHub`, 并添加了 `AltCdn`, 表示开发者自定义的其他 CDN 源. `jsDelivr` 之后将会删除.
- 在 `GitHub` 更新源下, MDI 图标库更换使用 GitHub Pages.

☕开发者相关
- 重新整理了所有 CDN 调用, 并支持自定义 CDN 配置, 文档见 [doc/cdn.md](https://github.com/the1812/Bilibili-Evolved/blob/preview-features/doc/cdn.md).
- 拆分并整理了 `/src/core/settings` 的代码结构.
- 所有 webpack 配置更换为 TypeScript, 并启用 ESLint 检查.
- 重构了元数据注入功能, 新增了 i18n 和 description 注入, 详细用法可见 `webpack/inject-metadata/i18n.ts` 和 `webpack/inject-metadata/description.ts` 中的注释说明.
- 删除了用不到的包 `html-webpack-plugin`.
- 适配了 VSCode File Nesting 功能.

## v2.2.2
`2022-06-28`

⚠ 此版本起, 对 Chromium 内核浏览器的版本要求提升至 88

✨新增
- `网址参数清理` 支持清理 `vd_source`, 之前装了临时插件的用户可以在更新后卸载相应的插件. (#3424)

🐛修复
- 修复 `bwp-video` (HEVC 编码) 下 PlayerAgent 的异常行为:
  - 修复倍速扩展的问题. (#3398, PR #3400 by [JLoeve](https://github.com/LonelySteve), PR #3401 by [imshixin](https://github.com/imshixin))
  - 修复开关灯的问题. (#3403, PR #3413 by [FoundTheWOUT](https://github.com/FoundTheWOUT))
- 修复 `简化评论区` 的样式失效, 以及评论区的操作菜单失效. (#3425, #3453)
- 修复动态详情页的动态相关功能失效.
- 修复 `videoChange` 部分情况下无法触发.
- 修复 `简化直播间` 的直播间皮肤部分情况下无法屏蔽.
- 修复搜索栏的建议在话题页面布局错乱. (#3383)
- 修复 `图片批量导出` 中的命名格式未能正确赋值. (#3326)
- 修复 `快速收起评论` 收起后再打开评论区失效的问题.

☕开发者相关
- 修复 Pull Request 中 ESLint 未报告部分代码问题.
- `loadFeatureCode` 支持从代码的返回值中得到结果.
- 删除 jsDelivr 相关的 GitHub Action.

## v2.2.1
`2022-06-03`
- 修复部分浏览器 / 脚本管理器中脚本无法运行. (对应报错 `Error: Couldn't find a style target`)
- 移除代码中的零宽空格. (#3391)

## v2.2.0
`2022-06-02`

正好借本次更新列一下最近常见的几个问题:

1. jsDelivr 被墙的问题
  - 现象: 在线仓库加载失败, 各种图标加载不出来, 新安装的脚本完全不运行等.
  - 总讨论见 #3331, 解决办法是给 `cdn.jsdelivr.net` 挂上梯子, 没梯子的可以用 #3356 的临时解决方案.
  - 我计划将所有涉及 `cdn.jsdelivr.net` 的代码都提取出来, 放在统一的一个配置里, 但是本仓库将会更换为 `raw.githubusercontent.com`, 不再内置其他任何 GitHub 反代服务. 如需使用其他 CDN, 请 Fork 仓库后自行打包.
  - 这个估计没那么快换完, 因为无论是 `cdn.jsdelivr.net` 还是 `raw.githubusercontent.com` 都有墙, 直连反正都连不上的.

2. 新版视频页最近似乎扩大灰度了, 请注意这和新版播放器 (3.x) 是两回事, 看三连那栏就可以迅速判断自己所处的视频页版本. 近期脚本功能不会支持新版视频页, 请点击右下角的返回旧版.

3. 新版播放器 (3.x) 我仍然收不到灰度, PR #3320 中提供了 `window.aid` 等变量的获取方式, 我对其做了一些整理, 但无法自行测试是否可行, 但愿能恢复一些功能吧.

4. `极简首页` 啥时候搞? 本来这次应该能写出来的, 但是中途遭遇了动态页改版和 jsDelivr 被墙, 真是片刻不得安宁, 只能再等等了.

✨新增
<details>
<summary>正式版获得 v2.1.9 ~ v2.1.10 预览版的功能</summary>

- 设置面板移动了搜索框的位置, 添加了检查更新和卸载组件的快捷按钮. (PR #3279 by [FoundTheWOUT](https://github.com/FoundTheWOUT))
- `自定义顶栏` 支持硬核 LV6 会员的图标显示. (#3203)
- `动态过滤器` 支持屏蔽发送动态的面板. (#2447)
- 新增插件 `下载视频 - 手动输入`, 可以手动输入 av / BV 号来进行下载. (#3227)
- Toast 消息能够显示关闭时间的倒计时进度, 且鼠标进入时停止倒计时. (#3204)

</details>

🐛修复
- 修复一些 3.x 播放器的适配问题. (#3187, PR #3320 by [imshixin](https://github.com/imshixin))
- 修复 `强制固定动态侧栏` 在有滚动条的时候侧栏定位出现偏移.
- 修复倍速播放快捷键单独使用时不生效. (#3350, PR #3367 by [JLoeve](https://github.com/LonelySteve))
- `视频倍速 - 快捷键支持` 更名为 `快捷键扩展 - 视频倍速`. (PR #3367 by [JLoeve](https://github.com/LonelySteve))
- 修复 `.icon` 在个人空间被覆盖背景图. (#3371)
- 修复 `自定义顶栏` 边缘间距为 `0%` 时, 预览边缘间距时出现溢出. (PR #3372 by [timongh](https://github.com/timongh))
- 新版动态页面适配: (#3191)
  - 支持 `夜间模式`.
  - 修复 `禁止跳转动态详情` 导致链接点不了.
  - 动态详情页和个人空间适配.

☕开发者相关
- 新增 DevTools 来改善开发体验, 使用方式详见 [CONTRIBUTING.md](CONTRIBUTING.md).
  - 本地可启动 DevServer, 接管本体和所有组件的编译
  - 脚本可安装 DevClient, 与 DevServer 通信并自动更新本体或组件
- GitHub Action 提交的 commit 更换为 `github-actions[bot]`. (PR #3319 by [FoundTheWOUT](https://github.com/FoundTheWOUT))
- 新增 UI 组件 `AsyncButton`: `click` 事件为异步函数时, 执行期间自动使 `Button` 禁用, 其他和 `Button` 相同.
- 禁用 Tampermonkey `GM_xmlhttpRequest` 的缓存.

## v2.1.10-preview
`2022-05-09`

✨**预览版** `v2.1.10-preview`

- 修复设置面板中按住 Ctrl 多选时报错.
- 升级一些依赖包.

## v2.1.9
`2022-05-07`

✨**正式版** `v2.1.9`
- `删除广告` 支持屏蔽视频页的创作推广和动态首页的新广告. (#3282, #3269)
- `动态反折叠` 和 `动态过滤器` 的开播记录类型支持新版动态首页. (#3191)
- 排除在直播开放平台的运行 (open-live.bilibili.com). (#3259)
- 检测到由 GreasyFork 安装时禁用反馈入口. (#3277)
- `网址参数清理` 不再在 iframe 中运行. (#2953)
- 修复标题格式化的两个问题. (#3251, #3309, PR 3310 by [cicur](https://github.com/cicur))

----

✨**预览版** `v2.1.9-preview`

- 设置面板移动了搜索框的位置, 添加了检查更新和卸载组件的快捷按钮. (PR #3279 by [FoundTheWOUT](https://github.com/FoundTheWOUT))
- `自定义顶栏` 支持硬核 LV6 会员的图标显示. (#3203)
- `动态过滤器` 支持屏蔽发送动态的面板. (#2447)
- 新增插件 `下载视频 - 手动输入`, 可以手动输入 av / BV 号来进行下载. (#3227)
- Toast 消息能够显示关闭时间的倒计时进度, 且鼠标进入时停止倒计时. (#3204)

☕开发者相关
- 所有 `substr` 调用替换为 `substring`.
- 在 ScopedConsole 的名称间添加了空格, 以改善复制为文本后的可读性.


## v2.1.8
`2022-04-16`

✨**正式版** `v2.1.8`

<details>
<summary>获得 v2.1.7 预览版的功能</summary>

- `倍速增强` 正式完成分离, 变更为 `记忆倍速`, `扩展倍速` 和独立的插件 `视频倍速 - 快捷键支持`, 详见 [PR 说明](https://github.com/the1812/Bilibili-Evolved/pull/2746). (PR #2746 by [JLoeve](https://github.com/LonelySteve))
- 为通用设置增加了一些选项描述. (#3140)

</details>

🐛修复
- 修复在线仓库把 Toast 消息挡住了. (#2613)
- 修复 `清爽首页` 中番剧时间表不能点击的问题. (#3166)
- 新版动态相关修复: (#3191)
  - 恢复支持的功能: 快速收起评论区, 复制动态链接, 导出动态图片, 展开动态内容, 禁止跳转动态详情, 动态过滤器, 直播信息扩充.
  - `自定义顶栏` 的位置已适配.
  - 还未恢复的有: 夜间模式, 动态反折叠.
> 虽然这次新版动态导致挂了很多功能, 不过技术实现上比旧版好了不少, 官方总算是有点进步了

- 修复 `控制栏触摸优化` 和 `启用双击控制` 在视频页的样式适配.
> 我实在不能理解, 为啥视频页控制栏改得这么宽, 番剧区又很窄...

----

✨**预览版** `v2.1.8-preview`

- 新增功能 `返回原版直播间`. (#2133)
- `外置稍后再看` 和 `启用快速收藏` 支持在稍后再看/收藏夹播放页面显示的选项. (#3138)
- `夜间模式` 开启时能够将 Safari 主题颜色也改成黑色了. (#2384)
- `BV 号转换` 支持复制时带上标题. (#2557)
- Esc 键可以退出 `查看封面` 的图片查看器了. (#2574)
- 操作 `在线仓库` 时, 设置面板将保持打开. (#2630)
- 操作 `自定义顶栏` 的设置时, 设置面板将自动关闭, 避免和 `v1 风格设置面板` 一起使用时顶栏被挡住. (#2642)

🐛修复
- 修复更新组件失败时的报错信息不准确.
- 删除了没有用的功能: 直播画中画, 直播间自动抽奖.

☕开发者相关
- 修复 `addData` 在数据未加载过时就执行 `provider`, 改善文档. (PR #3160 by [timongh](https://github.com/timongh))
- 添加了 `pascalCase` 工具函数.
- 接入 define API (兼容模式, 未知类型默认 any), 新功能都将遵循这套 API 来编写. (PR #3181, #3041 by [timongh](https://github.com/timongh))
- 整理了一下 ESLint 配置, task 不再输出到 HTML 文件, 并移除 `settings.json` 中冗余的配置. (#3202)
- 改进了功能代码加载的稳定性. (PR #3195 by [timongh](https://github.com/timongh))

## v2.1.7
`2022-03-22`

✨**正式版** `v2.1.7`
- 修复 `简化直播间` 里带头像框的头像大小还是不对. (#3119)
- 修复 `清爽首页` 无法设置最大宽度. (#3120)
- 检查更新时的 `安装` 链接现在将遵循更新源设置. (#3122)
- 修复 `BV 号转换` 在番剧区产生的链接错误. (#3123)
- 修复 `查看封面` 在番剧区显示错误. (#1992)
- 修复 `自定义顶栏` 的透明模式在 b 站春季主题下失效. (#3126)
- 修复更改了主题色后文字颜色没有更新.
- 修复 `下载视频` 中的下拉菜单被遮挡. (#3129, #3133)
- 更新合集的一些夜间模式样式. (#3027)
- `传统连播模式` 支持在合集的最后一集停止连播. (#2940)
- 修复番剧区在文件命名时取得的 `title` 变量错误. (#3140)
- 修复通过 `快捷键扩展` 进行的静音操作提示总是显示 `已静音`. (#2830)
- 修复 `自定义顶栏` 的历史弹窗不支持触摸模式. (#3142)
- `下载视频` 的编码格式限制恢复之前的逻辑, 仍然是优先匹配, 没有相应编码的视频源时自动回退到其他编码. (#3118)
- 完善 `mountVueComponent` 的类型. (PR #3151 by [timongh](https://github.com/timongh))
- 修复 Wasm 播放器部分情况下识别错误. (#3131)

----

✨**预览版** `v2.1.7-preview`
- `倍速增强` 正式完成分离, 变更为 `记忆倍速`, `扩展倍速` 和独立的插件 `视频倍速 - 快捷键支持`, 详见 [PR 说明](https://github.com/the1812/Bilibili-Evolved/pull/2746). (PR #2746 by [JLoeve](https://github.com/LonelySteve))
- 为通用设置增加了一些选项描述. (#3140)
- 新增 ScopedConsole API, 可以创建带有固定前缀的 `console` 对象. 同时脚本作用域中的 `window.console` 将自带 `Bilibili Evolved` 前缀. (#3105)
```ts
import { useScopedConsole, randomScopedConsole } from '@/core/utils/log'

console.log(123)
// [Bilibili Evolved] 123
{
  const console2 = useScopedConsole('scope')
  console2.log(123)
  // [Bilibili Evolved] [scope] 123

  const console3 = randomScopedConsole({ console: console2 })
  console3.log(123)
  // [Bilibili Evolved] [scope] [977a7962] 123
}
```

## v2.1.6
`2022-03-13`

以下功能已不再维护 (不再修复 bug 和添加新功能), 但是你仍然可以为其提供 Pull Request.
- 直播间自动抽奖
- 默认播放器模式
- 播放器置顶
- 播放器定位

✨新增
- `清爽首页` 已追上 v1 的功能, 现正式开放使用:
  - 所有基础板块都已完成
  - 支持启用横向滚动
  - 支持设置最大宽度来改善 21:9 屏幕的体验
  - 热门与动态均支持在 `动态过滤器` 中设置的屏蔽关键词
  - 剩余未完成: 自定义板块布局, 极简首页
- 自定义顶栏:
  - 修改了搜索栏的样式, 和脚本整体设计风格更匹配.
  - 更新了创作中心相关的链接.
- `网址参数清理` 添加了 `-Arouter` 参数, 支持通过插件 (`urlParamsClean.tailingSlash`) 清理指定网址末尾的 `/`. (#2993, #3053)
- `下载视频` 面板支持滚动, 开始按钮固定在底部. (#2990)
- 排除了两个无用的 iframe:
  - *://message.bilibili.com/pages/nav/header_sync
  - *://s1.hdslb.com/bfs/seed/jinkela/short/cols/iframe.html

<details>
<summary>正式版将获得此前预览版中的新功能, 点击展开</summary>

- 支持 AV1 编码下载. (#2941)
- `自动更新器` 的选项中, 可以手动触发更新检查.
- 新增组件 `视频页默认定位` by [timongh](https://github.com/timongh). (PR #2960)
- `倍速记忆` 更名为 `倍速增强`, 功能分裂为 `启用倍速记忆` 和 `扩展倍速菜单`, 支持单独开启. (PR #2746)
> 这个只是过渡版本, PR #2746 还没完成, 不过应该快了吧(

- 对类似拜年祭的页面开启视频类功能支持. (#2999)
- 修复 `展开动态标题` 导致 `清爽首页` 中的视频卡片标题溢出. (#2944)
- 改进了 `动态反折叠` 的描述. (#2743)

</details>

🐛修复
- 修复了稍后再看中视频截图等扩展按钮出现两次.
- 修复 `启用视频截图` 在 WASM 播放器中静默失败, 现在将弹出提示. (PR #3047 by [ProjectXero](https://github.com/XeroAlpha))
- 修复 `隐藏首页横幅` 启用后页面高度不正确.
- 修复 `简化首页` 启用时对性能的意外损耗.
- 修复 `控制栏触摸优化` 失效.
- 修复 `简化直播间` 的头像大小调整失效. (#3084)
- 改进了动态首页中直播栏的高度计算. (#2211)
- 修复 `下载视频` 中更换输入源后清晰度列表没有更新. (#3069)
- 修复 `网址参数清理` 在 festival 类页面中复制出错误的链接. (#3060)
- 修复 `下载弹幕` 得到的 XML 弹幕没有转义. (#3055)
- 修复 `下载字幕` 失效. (#3073)
- 修复 `下载视频` 在合集类页面中失效. (#3045)
- 修复启用 `自定义顶栏` 后分区页面的横幅消失. (#3042)
- 修复收藏了纪录片后 `自定义顶栏` 的收藏弹窗异常. (#2973)
- `简洁至上` 合集包移除 `自动隐藏侧栏`, 因为实在太多人不看说明就装了.

☕开发者相关
- 修复 babel-loader 缓存导致组件的 commitHash 没更新.
- `ComponentOption.validator` 添加了第二个参数表示旧值, 并添加了 `getNumberValidator` API 方便快速生成一个校验数字的 `validator`.
- `DpiImage` 的 `size` 支持直接传入数字.
- 添加了两个 Sass Mixin: `absolute-h-center` `absolute-v-center`.
- 添加了 `enableHorizontalScroll` API.
- 添加了 `UpInfo` 组件, 可以用来展示 up 主信息.
- `isBwpVideo` 修改为异步函数, `BwpPlayerAgent` 合并至 `VideoPlayerAgent`, 由于检测 `bwp-video` 需要异步, 请避免在刚进入页面时调用 `playerAgent`. (#3046)

## v2.1.5
`2022-02-20`

✨**正式版** `v2.1.5`

- 修复选项出现 null 导致脚本无法运行. (#2928)

----

✨**预览版** `v2.1.5-preview`

- 修复搜索框中的 `检查更新` 和设置中的 `立即检查所有更新` 在未超过更新间隔期时没有运行.


## v2.1.4-preview
`[预览] v2.1.4` `2022-02-18`
除了 `v2.1.4` 的内容以外, 本预览版中还包括:
- `清爽首页` 增加了视频分区板块.
- 新增组件 `视频页默认定位` by [timongh](https://github.com/timongh). (PR #2960)
- `倍速记忆` 更名为 `倍速增强`, 功能分裂为 `启用倍速记忆` 和 `扩展倍速菜单`, 支持单独开启. (PR #2746)
- 对类似拜年祭的页面开启视频类功能支持. (#2999)
- 修复 `展开动态标题` 导致 `清爽首页` 中的视频卡片标题溢出. (#2944)
- 改进了 `动态反折叠` 的描述. (#2743)

## v2.1.4
`v2.1.4` `2022-02-18`
- 修复对 UP 主视频合集页的支持. (#2986, PR #2995 by [timongh](https://github.com/timongh))
- 修复使用 `播放全部` 进入稍后再看时功能不生效. (#2339, #2986, PR #2995 by [timongh](https://github.com/timongh))
- 修复 `图片批量导出` 没过滤掉表情图片. (#2943)
- 更换了 cid Hook 的方式, 能够更好地兼容 Bilibili-Old 等脚本. (#3005)
- 修复 XML 弹幕导出的内容没转义. (#3003)
- `稍后再看重定向` 在生成链接时, 自动省略 `p=1` 的参数. (#2989)
- 修复部分番剧下载时命名错误. (#2988)
- 修复 `网址参数清理` 导致直播间热门榜出现问题. (#2953)
- `传统连播模式` 支持判断合集. (#2940)
- 修复 `简化直播间` 的房间皮肤屏蔽功能失效. (#2726)
- 修复 `自定义顶栏` 中的直播间标题过长时布局错乱. (#2886)
- `夜间模式` 支持视频页中的合集选择区. (#2136)

## v2.1.3-preview
`[预览] v2.1.3` `2022-02-05`
除了 `v2.1.3` 的内容以外, 本预览版中还包括:
- 支持 AV1 编码下载. (#2941)
- `自动更新器` 的选项中, 可以手动触发更新检查.

## v2.1.3
`v2.1.3` `2022-02-05`
- 下载视频:
  - 修复部分番剧无法下载. (#2942)
  - 修复切换视频后信息未更新. (#2805)
  - 支持 2022 拜年祭. (#2965)
- 修复 `关于` 中的主页链接错误.
- 自定义顶栏:
  - 修复专栏中的顶栏没有自动隐藏.
  - 修复在历史记录页面中的样式. (#2961, #2962)
  - 修复选项出现 null 导致脚本无法运行. (#2928)

## v2.1.2
`v2.1.2` `2022-01-25`
如果你是从 v1 过来的, 记得看下 [v2 的发布公告](https://github.com/the1812/Bilibili-Evolved/releases/tag/v2.0.7).
从此版本起, 除[最后一个 v1 离线版](https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@v2.0.8/bilibili-evolved.offline.user.js)以外, 删除了所有 v1 相关文件.

这个月基本没什么时间写, 跨年忙得很; 不过更新内容意外地很多, 也是多亏了常来 PR 的几位大神们了.

在功能的更新方面, 为了将来能够更新完本体后立即进行一次功能更新, 我也开始做了一些准备 (不过还没弄完), 目前可以在顶栏里搜索 `check updates`, 选择 `检查所有更新` 来更新已安装的功能.
由于在线仓库的分支 bug, 正式版用户的功能可能还是检查不到更新, 此时可以安装 `更新链接替换` 组件, 然后在功能面板中选择 `替换更新链接`, 输入 `master` 点击确定即可. 之后 `检查所有更新` 应该可以正常使用, `更新链接替换` 组件用完后也可以卸载.

预览版用户可以不看下面这个更新日志, 因为就是 v2.0.9 ~ v2.1.1 的合并.

✨新增
- 清爽首页完成 70% 左右, 支持活动, 热门, 动态, 栏目, 暂不支持分区和排行榜, 板块排序也还没做图形界面. 如果你只是需要上面那四个板块, 那么现在就可以试用起来了, 链接是[这个](https://raw.githubusercontent.com/the1812/Bilibili-Evolved/preview/registry/dist/components/style/home-redesign/fresh.js). (在线仓库里不开放, 因为还是半成品)
- 尝试支持禁用 b 站切换播放器模式时的定位效果, 不过离谱的是这东西上了之后又有人不想要这个定位效果, 后续应该还会做个选项. (#483)
- 防御 spm_id 对下载功能的干扰. (#2247)
- 本体功能新增 `新版本提示`, 和 v1 类似, 检测脚本本体的更新并弹出 Toast 提示.
- 自动更新组件时, 会检查组件对应的本体版本, 如果当前脚本本体过旧, 则拒绝安装. (#2891)
- 迁移 v1 隐藏功能: 网址AV号转换. (#2631)
- 视频卡片的链接带上 `/video` 避免二次跳转. (#2779)
- `自动隐藏侧栏` 支持用户自定义触发宽度, 顺便一提非自动隐藏状态下的触发宽度是 42px. (#2836)
- 下载视频:
  - 新增 MPV 列表播放支持. (PR #2806 by [wullic](https://github.com/wullic))
  - IDM 导出现在支持文件命名了. (#2871)
- 捐助方式更改:
  - 支付宝更换为爱发电, 爱发电支持支付宝和微信, 以及周期性捐助 (#2543)
  - 微信支付改用赞赏码

🐛修复
- 自定义顶栏:
  - 修复搜索框在 macOS 下输入法回车会直接触发搜索. (#2738)
  - 修复搜索词没有转义导致的问题. (#2872)
  - 修复 `动态弹窗` - `所有动态` 没有在新标签页打开.
  - 修复主站中的链接错误. (#2774, #2532)
  - 修复主页弹窗在低分辨率下内容溢出. (#2610, #2773, PR #2757 by [timongh](https://github.com/timongh), PR #2801 by [timongh](https://github.com/timongh))
  - 修复个人信息弹窗样式. (PR #2776 by [FoundTheWOUT](https://github.com/FoundTheWOUT))
- 修复专栏里的视频卡片样式问题. (#2709)
- 修复番剧区首次打开下载视频时按钮无法点击. (#2725)
- 修复 `复制评论链接` 没清理 URL hash 参数. (#2641)
- 修复 `夜间模式` 下评论的输入框高度无限增长. (#2633, PR #2764 by [timongh](https://github.com/timongh))
- 重新实现了 `直播全屏包裹`, 修复某些时候弹窗位置不正确. (~~虽然我没遇到过~~) (PR #2758 by [timongh](https://github.com/timongh))
- 修复复制评论链接后菜单不消失. (#1196, PR #2807 by [timongh](https://github.com/timongh))
- 修复默认播放器模式不生效的问题. (#2815, PR #2818 by [FoundTheWOUT](https://github.com/FoundTheWOUT))
- 修复评论区的样式问题. (#2837)
- 修复在线仓库安装时分支选择无效. (PR #2874 by [timongh](https://github.com/timongh))
- 修复 XML 弹幕下载得到的文件内容不规范. (#2875)

☕开发者相关
- 调整了 webpack 打包配置 (使用 webpack 5 asset modules, 移除 `raw-loader`), 之前 (指 v2.0.8 前) 有 clone 的开发者们记得重新 yarn 更新一下包.
- 稍后再看的错误处理统一移动到 core 中 (`src/components/video/watchlater.ts`)
- `isComponentEnabled` 能够对不存在的组件返回 `false` 了.
- 关闭 preview 分支的 CI 触发, 方便多个 PR 的合并.
- 对组件 / 插件的 watch task 默认启用 webpack 的 `mode=development` 以提供 source map.
- 修复 tasks.json 的拼写错误 (#2838)
- VSlider 修复 bug, 支持更多功能. (PR #2877 by [timongh](https://github.com/timongh))
- 更新了 @typescript/eslint, 消除 ESLint 的 TS 版本警告. (#2885)
- ComponentOption 中, `displayName` 改为可选. (#2809)
- plugin 中也支持 `author` 字段了.

## v2.1.1-preview
`[预览] v2.1.1` `2022-01-18`
- 修复 v2.1.0 在 Firefox + Violentmonkey 中无法运行.

## v2.1.0-preview
`[预览] v2.1.0` `2022-01-17`
- 修复 Firefox 中顶栏分区弹窗大小异常. (#2773, PR #2801 by [timongh](https://github.com/timongh))
- 修复复制评论链接后菜单不消失. (#1196, PR #2807 by [timongh](https://github.com/timongh))
- 修复默认播放器模式不生效的问题. (#2815, PR #2818 by [FoundTheWOUT](https://github.com/FoundTheWOUT))
- 修复评论区的样式问题. (#2837)
- 防御 spm_id 对下载功能的干扰. (#2247)
- 修复顶栏子分区的链接错误. (#2532)
- 新增 MPV 列表播放支持. (PR #2806 by [wullic](https://github.com/wullic))
- IDM 导出现在支持文件命名了. (#2871)
- 修复在线仓库安装时分支选择无效. (PR #2874 by [timongh](https://github.com/timongh))
- 修复 XML 弹幕下载得到的文件内容不规范. (#2875)
- 修复搜索词没有转义导致的问题. (#2872)
- `自动隐藏侧栏` 支持用户自定义触发宽度, 顺便一提非自动隐藏状态下的触发宽度是 42px. (#2836)
- 迁移 v1 隐藏功能: 网址AV号转换. (#2631)
- 自动更新组件时, 会检查组件对应的本体版本, 如果当前脚本本体过旧, 则拒绝安装. (#2891)
- 本体功能新增 `新版本提示`, 和 v1 类似, 检测脚本本体的更新并弹出 Toast 提示.
- 清爽首页已完成 70%.
- 捐助方式更改:
  - 支付宝更换为爱发电, 爱发电支持支付宝和微信, 以及周期性捐助 (#2543)
  - 微信支付改用赞赏码

开发者相关:
- 对功能进行 watch 时, 默认采用 development 模式以获得 source map 支持
- 修复 tasks.json 的拼写错误 (#2838)
- VSlider 修复 bug, 支持更多功能. (PR #2877 by [timongh](https://github.com/timongh))
- 更新了 @typescript/eslint, 消除 ESLint 的 TS 版本警告. (#2885)
- ComponentOption 中, displayName 改为可选. (#2809)
- plugin 中也支持 author 字段了.

## v2.0.10-preview
`[预览] v2.0.10` `2022-01-04`
- 修复专栏中视频卡片布局错位. (PR #2776 by [FoundTheWOUT](https://github.com/FoundTheWOUT))
- 尝试支持禁用 b 站切换播放器模式时的定位效果. (#483)
- 自定义顶栏:
  - 修复主站中的链接错误. (#2774)
  - 视频卡片的链接带上 `/video` 避免二次跳转. (#2779)

开发者相关:
- 稍后再看的错误处理统一移动到 core 中 (src/components/video/watchlater.ts)
- `isComponentEnabled` 能够对不存在的组件返回 `false` 了.
- 关闭 preview 分支的 CI 触发, 方便多个 PR 的合并.
- 对组件 / 插件的 watch task 默认启用 webpack 的 mode=development 以提供 source map.

## v2.0.9-preview
`[预览] v2.0.9` `2021-12-24`
- 清爽首页还是上周图里的进度, 支持活动, 热门, 动态, 栏目, 暂不支持分区和排行榜, 板块排序也还没做图形界面. 如果你只是需要上面那四个板块, 那么现在就可以试用起来了, 链接是[这个](https://raw.githubusercontent.com/the1812/Bilibili-Evolved/preview/registry/dist/components/style/home-redesign/fresh.js). (在线仓库里不开放, 因为还是半成品)
- 修复顶栏在 macOS 下输入法回车会直接触发搜索. (#2738)
- 修复专栏里的视频卡片样式问题. (#2709)
- 修复番剧区首次打开下载视频时按钮无法点击. (#2725)
- 修复顶栏的 `动态弹窗` - `所有动态` 没有在新标签页打开.
- 修复 `复制评论链接` 没清理 URL hash 参数. (#2641)
- 修复 `夜间模式` 下评论的输入框高度无限增长. (#2633, PR #2764 by [timongh](https://github.com/timongh))
- 重新实现了 `直播全屏包裹`, 修复某些时候弹窗位置不正确. (~~虽然我没遇到过~~) (PR #2758 by [timongh](https://github.com/timongh))
- 修复顶栏的主页弹窗在低分辨率下内容溢出. (#2610, PR #2757 by [timongh](https://github.com/timongh))
- 调整了 webpack 打包配置 (使用 webpack 5 asset modules, 移除 raw-loader), 之前有 clone 的开发者们记得重新 yarn 更新一下包.
- 尝试把 CI 构建调整为 Release 时构建, 而不是每次 push 时构建.

## v2.0.8
`v2.0.8` `2021-12-14`
- 修复 v1 中选择不再提示后变成弹另一种提示. (#2693)
- 修复 `自动隐藏侧栏` 在右侧的触发区域. (虽然还是不建议设置在右侧的时候用这个功能) (#2647)
- 合集包安装完后会刷新其他组件的安装状态了.
- 自定义顶栏:
  - 限制了 `动态` 等弹窗的高度, 以免无法触发下一页的加载. (#2472)
  - 修复 `历史` 面板看了没有封面的直播间后报错. (#2550)
  - `消息` 和 `稍后再看` 支持实时刷新. (#2689)
- 新增插件 `快捷键扩展 - 夜间模式`, 可以为夜间模式配置快捷键了. (#2556)

## v2.0.7
`v2.0.7` `2021-12-11`
- 新增 `下载视频 - MPV 输出支持` 插件. (PR #2605 by [diannaojiang](https://github.com/diannaojiang))
- 修复 `v1 风格设置面板` 中功能面板弹窗的方向错误. (#2604)

## v2.0.6-preview
`[预览] v2.0.6` `2021-12-08`
- 修复 `隐藏首页横幅` 在 "在线列表" 页面不生效. (#2602)
- 修复 `控制栏触摸优化` 在番剧区失效.
- 更新 `夜间模式`. (#2597)
- `下载视频` 支持杜比视界清晰度. (#2596)

## v2.0.5-preview
`[预览] v2.0.5` `2021-12-07`
- 修复 `播放时自动关灯` 对自动播放模式的检测. (PR #2581 by [FoundTheWOUT](https://github.com/FoundTheWOUT))
- 组件注入 commit hash 信息.
- 修复 `简化评论区` 粉丝牌是舰长时没删干净. (#2329)
- 更新了各种功能的描述.
- 修复 `控制栏触摸优化` 在番剧区失效.
- 修复 `直播勋章快速更换` 弹窗溢出, 支持设定最大加载数量. (#2585)
- `下载视频` 支持 8K 清晰度. (#2589)

## v2.0.4-preview
`[预览] v2.0.4` `2021-12-03`
- 修复在线仓库无法加载的问题. (#2560)
> 由于 Tampermonkey beta 版本 (红猴) 大于等于 4.14.6147 时有 bug, 还是会报错, 请先换回非 beta 版 (黑猴). Violentmonkey 用户不受影响.

版本号更新策略调整: 虽然 v2 的版本号有 commit hash, 但不改前面的数字号确实不算真正意义上的更新 (油猴检查更新检查不到), 所以 v2 之后可能会有更高的发版频率 (相对的, 每次更新的内容量会减少).

## v2.0.3-preview
`[预览] v2.0.3` `2021-12-01`
- `自定义顶栏`:
  - 重新开放 `使用季节 Logo` 选项, 并且这回真的是季节 Logo 了, 不再受活动影响. (#2420)
  - 修复弹窗里一些懒加载图片的尺寸导致界面抖动.
  - 更新了分区结构和链接. (#2532)
  - 再次尝试修复更新后设置丢失的问题. (#2501)
  - 修复 `每周必看` 链接错误. (#2510)
- 修复一部分 `播放器触摸手势` 的问题. (#2469)
- 改善一些组件在 4K 屏下的布局样式.
- 去除夜间模式给原版顶栏弹窗增加的不必要的投影. (#2493)
- 增加了 `自动隐藏侧栏` 开启时的边缘触发区域宽度, 避免 FireFox 中有时无法触发. (#2539)
- 在线仓库可以独立选择数据来源的分支了, 这对于在本地不同分支开发时可以避免 404. (PR #2559 by [FoundTheWOUT](https://github.com/FoundTheWOUT))
- 支持在 Safari 下运行. (PR #2559 by [FoundTheWOUT](https://github.com/FoundTheWOUT))
- 修复 `倍速记忆` 的一些 bug. (#2561, PR #2567 by [JLoeve](https://github.com/LonelySteve))
- `utils.playerReady` 排除嵌入式播放器. (#2540)
- 修复动态头像无法加载. (#2530)
- 修复 `简化评论区` 导致视频 tag 弹窗被遮挡. (#2499)

## v2.0.2-preview
`[预览] v2.0.2` `2021-11-16`
- 完善一些组件的描述. (PR #2506, PR #2507 by [shenzhiming88](https://github.com/shenzhiming88))
- 修复直播网页全屏时侧栏没隐藏. (#2484)
- 修复新版首页隐藏首页横幅后布局错位.
- 改善 `v1 风格设置面板` 的样式, 适配上一版的组件详情, 并处理一些弹窗溢出的问题.
- 尝试修复 `自定义顶栏` 更新后设置丢失的问题. (#2501)
- 修复关灯模式下倍速调整的提示被遮挡. (#2466)
- 使用原生剪贴板 API, 删除 `GM_setClipboard`. (#2462)
- 因 API 失效, `自定义顶栏` 取消 `使用季节 Logo` 选项. (#2420)
- 修复 `BiliPlus 跳转` 在稍后再看页面链接错误. (#2322)
- 在原版顶栏的消息 iframe 中也执行脚本来支持夜间模式. 使用 `自定义顶栏` 的用户可以把这个 iframe 屏蔽掉, 链接我写在 `自定义顶栏` 的描述里了. (#2494)
- 修复 `强制固定动态侧栏` 没固定原版顶栏的弹窗. (#2493)
- 修复互动视频里 `启用视频截图` 等按钮反复出现 / `播放前查看封面` 暂停时出现. (#2463, #2453)

## v2.0.1-preview
`[预览] v2.0.1` `2021-11-07`
- `动态过滤器` 支持屏蔽新版的话题. (#2479)
- 修复一些图标在新版动态首页尺寸错误.
- 新增插件 `快捷键扩展 - 无动作`, 将按键绑定到这个动作上可以阻止原有的事件处理. (#2474)
- 夜间模式更新. (PR #2491 by [JLoeve](https://github.com/LonelySteve))
- 支持自动破坏 `spm_id`. (#2477)
- 修复 `自动更新器` 下载失败时弹出选择文件窗口. (#2450)
- 修复侧栏在特殊直播间被壁纸遮挡. (#2484)
- GitHub CDN 更换 Raw 直链, 减少跳转. (#2409)
- 修复 `在线仓库` 在某些分辨率下文字模糊. (#2475)
- 设置面板里的组件详情改为固定位置, 这样可以支持滚动和更好的动画效果, 防止长内容超出页面.
- 因 API 失效, `查看封面` 组件不再支持在直播间中使用.
- `直播勋章快速更换` 弹窗支持滚动, 可以显示更多数量的勋章, 并按等级降序排列. (#2448)
- 修复 `直播勋章快速更换` 中的勋章大于 20 级后样式错误. (#2448)

## v2.0.0-preview
`[预览] v2.0.0` `2021-10-31`
🎃欢迎来到 Bilibili Evolved v2.0.0 (预览版), 为了更长远的发展, 我完全重写了整个项目:
- 引入现代化前端工具 (webpack, Babel, PostCSS 等)
- 源代码 TypeScript 全覆盖 (webpack 等配置文件除外)
- 自带 UI 组件库 (基于 Vue)
- 移除对 jQuery 和 Vuex 的依赖
- 全新的架构设计, 脚本体积大幅缩小: 2.79MB 👉 759KB
- 不再有离线版, 你可以自行控制功能的更新

需要注意的是:
- 脚本不会由脚本管理器自动更新到 v2, 更新提示里也不会直接让你安装更新. 因为 v2 的安装和使用方式和 v1 有很大区别, 即便你是 v1 的老用户, 也强烈建议你重新阅读 [README](https://github.com/the1812/Bilibili-Evolved/blob/preview/README.md).
- 安装前建议先备份 v1 设置, 然后卸载或者清空 v1 的数据存储, 避免遗留数据继承至 v2 造成性能影响.

功能差异:
- 虽然 README 有写, 但还是要再强调下, 全新安装的 v2 不包含任何实质性的功能, 它本身更接近于一个功能管理器, 你可以装个 `v1 设置迁移` 导入 v1 的设置 (顺便还能熟悉下怎么装功能), v1 开着的功能会在 v2 中自动安装, 详情见[此文档](https://github.com/the1812/Bilibili-Evolved/blob/preview/doc/v1-migrate.md).
- 暂不支持 v1 的 `简化首页` 功能, 在 v2 中 `简化首页` 等于 v1 的 `首页过滤` 功能. v1 的 `简化首页` 由于代码设计过于糟糕, 很难再进一步扩充功能, 我计划在 v2 发布后重写这个功能, 届时会比 v1 更加美观和强大. 如果你非常需要这个功能, 请暂时不要升级到 v2.
- 暂不支持 Safari, 但也有计划去支持了. (#2349)
- 暂不支持 v1 的 `界面翻译` 功能, 以后可能会做英语支持.
- 下载视频暂不支持 ffmpeg 命令生成 和 课程下载.

安装及使用方法见 [README](https://github.com/the1812/Bilibili-Evolved/blob/preview/README.md#安装). 如希望参与开发, 请参考[代码贡献指南](https://github.com/the1812/Bilibili-Evolved/blob/preview/CONTRIBUTING.md).

如有其他疑问, 请在这个 Release 对应的讨论区里回复.

## v2.0.0-tp9
`v2.0.0 Technical Preview ⑨` `2021-10-17`
**功能:**

- 组件与 `v1.12.20` 同步更新.
- 自定义顶栏:
  - 新增`新标签页打开`选项
  - 改善了拖动排列顶栏元素顺序时的性能.
  - `收藏`弹窗中修复了一些搜索相关的 bug.
  - 暂时禁止了`动态`上定时刷新的数字提醒, 因为弹窗里还没做完实时刷新. (#2303)
- 番剧区:
  - 修复宽屏模式 + mini 播放器出现的布局错乱. (PR #2371 by [FoundTheWOUT](https://github.com/FoundTheWOUT))
  - 恢复`默认播放器模式`, `启用双击控制`和`控制栏触摸优化`的支持.
- 夜间模式更新. (PR #2296 by [FoundTheWOUT](https://github.com/FoundTheWOUT))
- 修复 Firefox 下无法加载. (#2308)
- 下载视频中支持仅下载音频. (#2325)
- 更新了直播间勋章的 API.
- 修复夜间模式下部分 iframe 弹窗背景没有变透明.
- 修复组件没超过更新间隔期时, 选项里点检查更新不执行.

**开发:**

- 修复 `VSlider` 上使用方向键没有阻止默认行为.
- 修复 `MiniToast` 加载过早时获取不到 `body`.
- `addControlBarButton` 支持番剧区.

## v2.0.0-tp8
`v2.0.0 Technical Preview 8` `2021-09-15`

**功能:**

- 组件与 `v1.12.18` 同步更新.
- 使用在线仓库时, 连接到 `github.com` 时无需再设置跨域.
- 修复搜索栏建议的文本过长时溢出.
- 快捷键设置也能从搜索栏中唤起了.
- 修复播放器控制栏的扩展按钮(截图, 逐帧调整等)颜色不对.
- 在组件详情的菜单中, 鼠标停留在 `检查更新` 上时可以显示安装的来源 URL, 如果是来自 `localhost`, 还会显示特定的图标作为区分. (#2278)
- 快捷键支持 <kbd>Ctrl</kbd>+<kbd>Enter</kbd> 发送评论. (#1015)

**开发:**

- 新增 `RuntimeLibrary API` (`src/core/runtime-library.ts`), 可以在运行时动态载入第三方库, 可以避免在每次载入页面时都加载了不常用的库. 以下原先内置于脚本的库现已转换为运行时库:
  - protobufjs
  - JSZip
  - Sortable
- 重新整理了 `task.json` 中任务的命名.
- 功能也和本体一样能参与 CI 构建流程了.
- 支持记录第三方功能并在在线仓库中显示.
- 在 `CONTRIBUTING.md` 中补充了一些 API 说明.
- 主题颜色除了 10 级不同透明度 `var(--theme-color-XX)`, 也支持了 10 级不同明亮度 `var(--theme-color-lightness-XX)`.
- `Toast` 的 `duration` 即使在 Toast 已发出后也能响应更改了.
- 同 v1 一样, 按住 <kbd>Shift</kbd> 点击侧栏的功能将会执行 `debugger` 语句, 在开发者工具打开时能够立即停止页面运行.
- 清理了一些无用文件, `widgets` 文件夹中的代码移动到 `ui` 和 `components` 中对应的文件夹.
- `observer` 新增 `urlChange`, 可以检测 URL 变动.


## v2.0.0-tp7
`v2.0.0 Technical Preview 7` `2021-08-23`

**功能:**

- 组件与 `v1.12.16` 同步更新.
- 新增组件 `v1 风格设置面板`.
- 在功能的管理面板中, 支持在线安装新功能.
- 搜索栏支持提供自定义选项, 目前实现的有:
  - 切换在线仓库
  - 自定义顶栏设置
- 修复 `observer.allMutations` 只处理第一个调用者.
- 修复高能进度条未固定时的样式.
- 尝试为 `bwp-video` 适配 `播放前显示封面`.
- `播放器控制栏背景色` 的不透明度选项使用 `0% ~ 100%` 做范围, 之前保存的值默认是 `0.64`, 如果你之前使用过, 更新后记得去改成 `64`.

**开发:**

- `Toast` API 支持 `Toast.mini` 并提供对应组件 `MiniToast` (基于 [tippy.js](https://atomiks.github.io/tippyjs/)), 用于在特定元素旁边弹出小提示.
- 插件允许提供描述 `PluginMetadata.description`
- 组件允许提供多语言配置和作者 `ComponentMetadata.i18n` / `ComponentMetadata.author`
- 删除所有的非必要 `eslint-disable`
- 统一内置组件的 UI 导入方式.
- Vue 内置于脚本, 不再由 `// @require` 提供.
- 组件选项支持使用滑动条提供带范围的数字选择 `ComponentOption.slider`, 例子可以参考 `registry/lib/components/video/player/control-background/index.ts`.
- 组件详情中支持扩展动作, 并内置了 `卸载` 动作.

## v2.0.0-tp6
`v2.0.0 Technical Preview 6` `2021-08-01`

- 搜索栏可以使用 <kbd>/</kbd> 全局唤起了. (安装了`快捷键扩展`时)
- 自定义顶栏功能同步至 `v1.12.13`.
- 新增组件 `v1 设置迁移`, 可以导入 v1 设置了, README 中有使用说明.
- 支持[合集包](https://github.com/the1812/Bilibili-Evolved/blob/v2/doc/features/pack/pack.md)安装, 设置面板中的批量安装可以接受任意类型的功能.
- `关于`面板中有了更多的链接, 并显示更详细的版本信息.

## v2.0.0-tp5
`v2.0.0 Technical Preview 5` `2021-07-24`

- 元数据中添加了 `@connect localhost`, 解决 Tampermonkey BETA 中不能从本地安装组件的问题.
- 修复 `LifeCycleEventTypes.ComponentsLoaded` 在组件运行完成前就触发的问题.
- 动态 API 支持自定义内容过滤器. (`动态过滤器`基于此 API 实现了对顶栏动态的过滤)
- 搜索栏的历史同步 b 站的搜索历史 (同 v1), 之前产生的历史数据可以通过运行以下代码来删除.
```js
delete bilibiliEvolved.settingsApis.getComponentSettings('launchBar').options.searchHistory
```
- 支持设置 `文件下载模式`.

**插件新增:**

- 下载视频 - IDM导出
- 搜索栏 - 搜索推荐

**组件迁移:**

所有常用组件已迁移完成, 剩余未迁移的还有:
- 工作量过大 (Coming S∞n)
  - 清爽首页
  - 极简首页
- 隐藏功能 (有一定缺陷所以未公开)
  - 网址AV号转换
  - 评论楼层显示
- 废弃功能 (被 b 站官方实现)
  - 默认视频画质
  - 解除音量上限

另外一部分组件功能还未更新到 v1.12.12 的进度:
- 下载视频
  - 不支持 ffmpeg 相关导出
  - 不支持课程 / 番剧 / 电影
- 自定义顶栏
  - 分区未更新
  - 搜索栏在搜索页没有同步搜索词
  - 历史面板中的直播没有状态显示
  - 收藏面板还不能记住上次选择的收藏夹
  - 收藏面板还不能显示已失效视频
  - 视频动态还不能显示发布时间
  - `排行`还没有子菜单
  - UI 样式未统一



## v2.0.0-tp4
`v2.0.0 Technical Preview 4` `2021-07-18`

**组件迁移:**
- 自动展开弹幕列表
- BiliPlus跳转支持
- 强制保留弹幕栏
- 隐藏推荐直播/视频推荐
- 直播间自动抽奖
- 直播首页静音/隐藏推荐直播
- 直播全屏弹幕栏/包裹
- 复制动态/评论链接
- 动态/评论翻译
> 移除了 Bing 翻译 (接口挂了), 翻译后可以实时更换翻译器 (#993)
- 动态/专栏图片导出
> 支持分别自定义命名格式, 不过具体说明还没写 (#1208)
- 启用细滚动条
- 高分辨率图片
- 简化首页
> 注意这个是 v1 中的 `首页过滤`, 更换为这个名字是为了和其他几个 `简化xxx` 功能保持一致. (都是移除某个页面中不需要的元素) 原 v1 中的 `简化首页` 会更换为 `清爽首页` 之类的名字.

**插件新增:**
- 设置面板 - '最近使用'类别
> 记录点开组件详情的时间, 让最近点开过的组件排序在上面

**其他:**
- `关于`页面中将显示本体的 commit hash
- `自动更新器`将自动跳过无在线链接(通过本地浏览安装)的功能.

**API 变更:**
  - 组件不再必需填写 `enabledByDefault`, 默认就为 `true`.
  - 组件的 `instantStyles` 会在开启/关闭时自动添加/移除了.
  - 设置面板的标签分类使用自定义过滤函数. (上面那个'最近使用'类别的插件就是基于此)

## v2.0.0-tp3
`v2.0.0 Technical Preview 3` `2021-07-09`

- 设置面板更新:
  - 修复高度过小时侧栏图标溢出面板
  - 支持批量安装功能
  - 支持设置导入/导出 (在关于面板中, 与 v1 不同的是导入后会自动刷新页面)
- 组件迁移:
  - 展开动态内容
  - 简化直播间
  - 直播勋章快速更换
  - 直播看板娘高DPI适配
  - 自动收起直播侧栏
  - 倍速记忆
  - 删除视频弹窗
  - 展开视频简介
  - 外置稍后再看
  - 启用快速收藏
  - 快捷键扩展
- 插件新增:
  - 下载视频 - aria2 输出支持
- 修复无法更新现有样式.
- 引入了 CSS `gap` 属性, 浏览器版本要求提高至 Chrome 84 / Firefox 80 / Safari 14.1
- 主脚本名称变动 (`Bilibili Evolved II`变为`Bilibili Evolved (v2)`), 更新时请多加注意.
- 生成了[功能列表文档](https://github.com/the1812/Bilibili-Evolved/blob/v2/doc/features/features.md).
> 好像只能装 GitHub 源的, jsDelivr 不知道为啥 Failed to fetch 了. 另外目前只能用 Stable 的版本, Preview 分支上还没有 v2 的文件.

## v2.0.0-tp2
`v2.0.0 Technical Preview 2` `2021-06-28`

- 设置面板更新:
  - 支持右侧停靠
  - 修复组件列表溢出面板
  - 动画效果调整
- 更新了动态 API (`src/components/feeds/api`)
- 组件迁移:
  - 禁止跳转动态详情
  - 直播信息扩充
  - 快速收起评论区
  - 展开动态标题
  - 动态反折叠
  - 删除直播水印
  - 专栏文字选择
  - 网址参数清理
  - 稍后再看重定向
  - 启用弹幕空降
  - 跳过充电鸣谢
- 自定义顶栏中的搜索改为默认不显示推荐词
- 样式输入格式改为与组件和插件一致 (使用 `.js` 文件), 修复样式无法卸载

## v2.0.0-tp1
`v2.0.0 Technical Preview 1` `2021-06-11`

此次 Release 为 v2.0.0 Technical Preview 1 (技术预览版), 请注意:
- 技术预览版仅供开发者或对此项目非常熟悉的用户体验, 如果你只对日常使用感兴趣, 请继续等待 v1 的后续更新.
- 主要是本体方面的换新, 功能模块尚未迁移完成, 因此还不能替代 v1 作为日常使用.
- 不保证稳定性, 可能有大量神秘 bug 潜伏.

欢迎来到 Bilibili Evolved v2 的第一个版本, 为了更长远的发展, 我完全重写了整个项目:
- 引入现代化前端工具 (webpack, Babel, PostCSS 等)
- 源代码 TypeScript 全覆盖 (webpack 等配置文件除外)
- 自带 UI 组件库 (基于 Vue)
- 移除对 jQuery 和 Vuex 的依赖
- 全新的架构设计, 本体大小可减小至 300+KB
- 不再有离线版, 你可以自行控制组件的更新

安装文件位于 [./dist/bilibili-evolved.user.js](./dist/bilibili-evolved.user.js) 或 [./dist/bilibili-evolved.preview.user.js](./dist/bilibili-evolved.user.js) , 虽然分了个预览版但目前还没有区别(

使用方法见 [README.md](./README.md#设置).

关于技术上的更详细的信息, 请参见[代码贡献指南](./CONTRIBUTING.md).

### 已完成功能
- 下载弹幕
- 夜间模式
  - 跟随系统 / 计划时段
- 删除广告
- 查看封面
- 简化评论区

### 待完成功能 (近期)
- 下载视频, 已支持普通视频源 + flv / dash 格式 + 显示链接 / aria2 输出, 待实现番剧 / 课程 / 手动输入源, 纯音频格式 + IDM 输出.
- 自定义顶栏, 目前仅实现至 v1.10.20 (commit 855bb6f)
- 视频卡片联合投稿显示支持
- 简化直播间
- 设置面板
  - 组件/插件/样式管理 - 文本 / 批量输入支持
  - "关于"页面
  - 停靠位置

### 你可能想问的其他问题

**v1 还会更新吗?**

在 v2 正式版发布前会保持更新, 只是频率可能慢些.

**v2 正式版何时发布?**

在功能迁移完成后, 会发布 v2 的预览版, 测试没有问题后就会发布正式版.

**是否会涵盖 v1 的所有功能?**

尽量会, 有些特别复杂的功能可能会在正式版发布之后再完成开发, 目前确定的有`简化首页`.

**本体体积缩小后, 还会在 GreasyFork 上发布吗?**

我拒绝.

**可以为 v2 开发组件了吗?**

可以弄些简单的玩玩, 复杂的组件建议等预览版发布后(接口基本稳定)再开发.
