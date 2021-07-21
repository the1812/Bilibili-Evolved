# 代码贡献指南

## 搭建开发环境

- 需要安装 [Node.js](https://nodejs.org/en/download/), [Visual Studio Code](https://code.visualstudio.com/) 和 [yarn](https://yarnpkg.com/getting-started/install#global-install).
- 将项目 Fork 至自己账户后, 克隆至本地

```powershell
git clone https://github.com/{{your-name}}/Bilibili-Evolved.git -b v2 --single-branch
cd Bilibili-Evolved
```
- 安装依赖

```powershell
yarn
```

### 本体
需要说明的是, 脚本本体和功能是分开的两个项目, 因此编译时也是分开的. 脚本本体的编译通常使用 `监视开发版 dev:watch` 任务, 会产生 `dist/bilibili-evolved.dev.user.js` 文件.
> 如果不使用 Visual Studio Code, 则需要根据 `.vscode/tasks.json` 中各个任务定义的命令手动在终端执行. (npm scripts 仅用于 CI)

然后配置本地调试环境:

**如果使用的是基于 Chromium 的浏览器**
1. Chrome 插件管理 `chrome://extensions/` > Tampermonkey > 详细信息
2. 打开`允许访问文件网址`
3. 新建脚本
4. 粘贴内容:
```js
// ==UserScript==
// @name         Bilibili Evolved (Local)
// @description  Bilibili Evolved (本地)
// @version      300.0
// @author       Grant Howard, Coulomb-G
// @copyright    2021, Grant Howard (https://github.com/the1812) & Coulomb-G (https://github.com/Coulomb-G)
// @license      MIT
// @match        *://*.bilibili.com/*
// @exclude      *://*.bilibili.com/*/mobile.html
// @exclude      *://*.bilibili.com/api/*
// @exclude      *://api.bilibili.com/*
// @exclude      *://api.*.bilibili.com/*
// @exclude      *://live.bilibili.com/h5/*
// @exclude      *://live.bilibili.com/*/h5/*
// @exclude      *://m.bilibili.com/*
// @exclude      *://mall.bilibili.com/*
// @exclude      *://member.bilibili.com/studio/bs-editor/*
// @exclude      *://www.bilibili.com/h5/*
// @exclude      *://www.bilibili.com/*/h5/*
// @exclude      *://message.bilibili.com/pages/nav/index_new_sync
// @exclude      *://message.bilibili.com/pages/nav/index_new_pc_sync
// @exclude      *://t.bilibili.com/h5/dynamic/specification
// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_setClipboard
// @grant        GM_info
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @connect      cdn.jsdelivr.net
// @connect      cn.bing.com
// @connect      www.bing.com
// @connect      translate.google.cn
// @connect      translate.google.com
// @connect      localhost
// @connect      *
// @require      https://cdn.jsdelivr.net/npm/lodash@4.17.15/lodash.min.js
// @require      https://cdn.jsdelivr.net/npm/jszip@3.1.5/dist/jszip.min.js
// @require      https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.min.js
// @icon         https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@preview/images/logo-small.png
// @icon64       https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@preview/images/logo.png
// ==/UserScript==
```
6. 在那些 `@require` 下面再添加一行 `@require file://{{ bilibili-evolved.dev.user.js的绝对路径 }}`
> Windows 例子: `@require file://C:/xxx/Bilibili-Evolved/bilibili-evolved.dev.user.js`

> macOS 例子: `@require file:///Users/xxx/Documents/Bilibili-Evolved/bilibili-evolved.dev.user.js`
7. 保存脚本, 监视模式下保存文件构建完成后, 刷新即可生效

> 上面那些其他的 @require 跟 `src/client/common.meta.json` 里的保持一致就行, 偶尔这些依赖项会变动导致这个本地调试脚本失效, 到时候照着改一下就行.

**如果使用 Firefox 或 Safari**
1. 运行 `启动服务器(本体) dev:serve` 任务, 假设得到的服务链接为`http://localhost:5000/`
2. 继续 Chromium 指南中的第 3~6 步, 但在第 6 步时 `@require` 的链接使用 `http://localhost:5000/bilibili-evolved.dev.user.js`.
3. 保存脚本, 监视模式下保存文件构建完成后, 在 Tampermonkey 中编辑脚本 - 外部, 删除 `localhost` 的缓存文件后生效.

### 组件
组件除了本体内置的几个(内置的按照本体的调试方法就行), 其他都是和本体分离的, 本节包括这些组件的编译和调试方法, 同样适用于插件. 组件的源代码和产物均位于 `registry` 文件夹中.

1. 运行任务 `监视组件 dev:components`, (插件运行 `监视插件 dev:plugins`), 任务会询问要编译的组件是哪个, 从列表中选择即可.
2. 然后运行 `启动服务器(组件) dev:serve components`, 就得到了组件在 `localhost` 下的链接.
3. 进入网站, 打开脚本的设置面板 - 组件管理, (确保`自动更新器`功能开启) 粘贴组件的链接并安装.
4. 监视模式下保存文件构建完成后, 在控制台中运行
```js
bilibiliEvolved.componentApis.importComponent('autoUpdate').checkUpdatesAndReload()
```
会自动更新所有 `localhost` 加载的组件并刷新页面.


## 修改
找到对应的代码文件修改, 可以搜索组件的 `name` 或 `displayName` 定位文件, 修改后运行对应的编译任务即可.

## 新增
### 本体
本体内容的新增, 可以在 `src/` 中进行, v2 中不再有 v1 的奇怪限制, 你可以直接增加文件, 在代码中使用 `import` / `export` 等.

### 组件
在 `registry/lib/components` 中是所有组件的源代码.

> 你可能还发现 `src/components` 中也有大量组件, 除了几个内置组件, 其他是在 v1.10.20 (commit `855bb6f`) 时做的迁移测试留下的, 我以后会迁移到  `registry/lib/components` 中, 所以就当没看见好了.

1. 根据类别进入对应的子文件夹, 如样式修改的功能就是 `style/`
2. 新建文件夹, 名称为组件名, 单词短横线分隔
3. 新建文件 `index.ts` 作为组件入口点
> 此名称不可更改, webpack 配置中将搜索所有 index.ts 作为组件编译入口

4. 在 `index.ts` 中导出 `component` 对象, 实现 `ComponentMetadata` 接口
```ts
import { ComponentMetadata } from '@/components/types'

export const component: ComponentMetadata = {
  // ...
}
```
> 在 `ComponentMetadata` 的源码中有各属性的说明

5. 根据组件的复杂度, 可以自行在文件夹中创建其他文件来组织代码, 下方还列出了一些可用资源可以帮助你加快开发.
6. 编译并调试组件.

### 插件
在 `registry/lib/plugins` 中是所有插件的源代码, 步骤和组件基本一致, 只有在第 4 步中, 导出的是 `plugin` 对象, 实现 `PluginMetadata` 接口.

## 可用资源
本体提供了大量 API 供组件 / 插件使用.
### 全局
全局变量, 无需 `import` 就可以直接使用. (Tampermonkey API 这里不再列出了, 可根据代码提示使用)

- `Vue`: Vue 库的主对象, 在创建 `.vue` 组件时, 其中的 `<script>` 可以直接使用 `Vue.extend()`
- `lodash`: 包含所有 Lodash 库提供的方法
- `JSZip`: 创建 `.zip` 文件的库, 一般直接用脚本的 `DownloadPackage` 就行了
- `dq` / `dqa`: `document.querySelector` 和 `document.querySelectorAll` 的简写, `dqa` 会返回真实数组
- `none`: 什么都不做的空函数
- `componentTags`: 预置的一些组件标签, 实现 `ComponentMetadata.tags` 时常用

### 本体 API
仅介绍常用 API, 其他可以翻阅源代码了解, 代码中均带有文档.

- `core/ajax`: 封装 `XMLHttpRequest` 常见操作, 以及 `bilibiliApi` 作为 b 站 API 的响应处理 (`fetch` 可以直接用)
- `core/download`: `DownloadPackage` 类封装了下载文件的逻辑, 可以添加单个或多个文件, 多个文件时自动打包为 `.zip`, 确定是单个文件时也可以直接调用静态方法 `single`
- `core/file-picker`: 打开系统的文件选择对话框
- `core/life-cycle`: 控制在网页的不同生命周期执行代码
- `core/meta`: 获取脚本的自身元数据, 如名称, 版本等/
- `core/observer`: 封装各种监视器, 包括元素增删, 进入/离开视图, 大小变化, 以及当前页面视频的更换
- `core/spin-query`: 轮询器, 等待页面上异步加载的元素, 也可以自定义查询条件
- `core/user-info`: 获取当前用户的登录信息
- `core/version`: 版本比较
- `core/watchlater`: 稍后再看列表获取, 添加/移除稍后再看等
- `core/settings`: 脚本设置 API, 可监听设置变更, 获取组件设置, 判断组件是否开启等
- `core/toast`: 通知 API, 能够在左下角显示通知
- `core/utils`: 工具集, 包含各种常量, 格式化函数, 排序工具, 标题获取, 日志等

### 组件 API
- `components/types`: 组件相关接口定义
- `components/styled-components`: 包含样式的组件 entry 简化包装函数
- `components/user-component`: 用户组件的安装/卸载 API
- <待 v1 组件迁移完成后补充>

### 插件 API
- `plugins/data`: 数据注入 API

持有数据的一方使用特定的 `key` 调用 `registerAndGetData` 注册并获取数据, 在这之前或之后所有的 `addData` 调用都能修改这些数据. 两方通过使用相同的 `key` 交换数据, 可以有效降低代码耦合.

例如, 自定义顶栏功能的顶栏元素列表就是合适的数据, 夜间模式的插件可以向其中添加一个快速切换夜间模式的开关, 而不需要修改自定义顶栏的代码.

> 有时候需要分开数据的注册和获取, 可以分别调用 `registerData` 和 `getData`

> 从设计上考虑好你的数据是否适合此 API, `addData` 做出的数据修改是单向累加式的, 不能够撤销.

- `plugins/hook`: 钩子函数 API

对于某种特定时机发生的事件, 可以调用 `getHook` 允许其他地方注入钩子提高扩展性, 其他地方可以嗲用 `addHook` 进行注入.

例如, 自动更新器在组件管理面板注入了钩子, 在新组件安装时记录安装来源, 实现自动更新. 组件管理面板没有任何更新相关代码.

- `plugins/style`: 提供简单的自定义样式增删 API (复杂样式请考虑组件或者 Stylus)

### UI
所有的 UI 组件建议使用 `'@/ui'` 导入, 大部分看名字就知道是什么, 这里只列几个特殊的.

- `ui/icon/VIcon.vue`: 图标组件, 自带 MDI 图标集, b 站图标集, 支持自定义图标注入
- `ui/_common.scss`: 一些通用的 Sass Mixin, 在代码中可以直接使用 `@import "common"` 导入
- `ui/ScrollTrigger.vue`: 进入视图时触发事件, 通常用于实现无限滚动
- `ui/VEmpty.vue`: 表示无数据, 界面可被插件更改
- `ui/VLoading.vue`: 表示数据加载中, 界面可被插件更改

## 代码风格检查
项目中含有 ESLint, 不通过 ESLint 可能无法发起 Pull Request. 配置基于 `airbnb-base`, `typescript-eslint/recommended`, `vue/recommended` 修改而来, 几个比较特殊的规则如下:

### 强制性
- 除了 Vue 单文件组件, 禁止使用 `export default`, 所有导出必须命名.
- 参数列表, 数组, 对象等的尾随逗号必须添加.
- 如非必要禁止在末尾添加分号.
- 任何控制流语句主体必须添加大括号.

### 建议性
- 一行代码最长 80 字符.
- 不需要使用 `this` 特性的函数, 均使用箭头函数.

## 提交 commit
commit message 只需写明改动点, 中英文随意, 也不强求类似 [commit-lint](https://github.com/conventional-changelog/commitlint) 的格式.

## 发起 PR (合并请求)
将你的分支往主仓库的 `preview` 分支合并就行.
> 目前 Technical Preview 阶段应该是往 `v2` 分支

## 自行保留
你可以选择不将功能代码合并到主仓库, 因此也没有 ESLint 的限制. PR 时仅添加指向你的仓库中的组件链接即可.
> 预计会有个专门的文档列出所有可安装的组件和插件, 修改这个文档即可. 不过目前的 Technical Preview 中还没有这个文档
