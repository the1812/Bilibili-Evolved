# 代码贡献指南 Pull Request Guide

## 环境需求
- [.NET Core 3.1+](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/en/download/)
  - [全局安装 yarn](https://yarnpkg.com/getting-started/install#global-install)

## 下载项目代码
将项目 Fork 至自己账户

然后克隆至本地
```powershell
git clone --single-branch -b preview https://github.com/{{your-name}}/Bilibili-Evolved.git
cd Bilibili-Evolved
```

## 安装依赖
```powershell
yarn
```

## 修改代码

### 修改现有功能
- 启动[监视模式](##构建/监视)
- 确认功能对应的代码文件, 通常根据目录结构就可以找到, 实在找不到可以在设置中可以通过检查元素查看到某项功能对应的 `data-key`, 这个 key 对应的是 `src/client/resource-manifest.js` 中的 key, 从而可以得知相应的代码文件名称 (`path` 属性)
- 修改代码, 保存后会自动编译

#### 夜间模式修改
如果要改的是夜间模式, 改原有样式就原地改, 添加样式就进入数字最大的那个 `dark-slice-xxx.scss` 文件修改即可

> 你可能会发现, 旧的 slice 风格以多个不同地方的选择器 + 尽量少的样式声明组成; 新的 slice 里是按照修改的地方分开存放, 因为有 Sass 的 Mixin, 所以可以放心地随时添加样式声明, Mixin 列表见 `src/style/dark/_dark-definitions.scss`

附一些要点:
- 尽可能遵照 b 站白天原有的元素风格, 除非原版实在太丑
- 颜色相关的 Mixin 参数含义:
  - 0个字符 `transparent`
  - 1个字符 `e` -> `#eee`
  - 2个字符 `e8` -> `#e8e8e8`
  - 3/6个字符 `eee` -> `#eee`
- theme-color 相关的 Mixin 可以对各种属性应用主题色
- foreground-color 相关的 Mixin 仅用于主题色做背景时的前景色 (对应设置中的 `文本颜色`)
- 避免写入名字过于宽泛的选择器, 比如 `.card`, 夜间模式作用于所有页面, 要尽可能避免选择器误伤. 遇到这种情况可以向上寻找元素的父级 class, 组成一个 `.xxx .card` 就比较好
- 遇到纯色图片可以用 `@to-theme('pink')` / `@to-theme('blue')` 转换为主题色 (参数是原来的颜色, 目前就这两种, 放在 filter 上)
- 旧的 slice 基本都不符合这些要点, 不过我们也懒得改了(

### 添加新功能
- 在 `src/client/settings.js` 中的 `settings` 对象上添加新的 key, 作为新功能的默认值
- 在 `@types/global/index.d.ts` 添加对应的类型声明
- 在 `src` 下对应的文件夹分类中创建代码文件, 如果只有一个 `.js` / `.ts` 文件, 可以不建子文件夹, 带有样式等建议放在同名的子文件夹
> ⚠️ 由于历史原因, 即便是分在不同的文件夹, 这些功能组件的文件名也不能重名

- 在 `src/client/resource-manifest.js` 中添加声明, 类型大致如下:
```ts
// 大部分可以参考文件里上方类似的写法
// 早期组件可能还会有一些这里没列出来的已弃用属性, 不建议使用
interface ResourceDefinition {
  [key: string]: {
    /** 代码文件的 js 文件名, 中间要插入一个 `.min.` 例如 abc.ts -> abc.min.js */
    path: string
    /** 在设置面板中的展示名称, 包括子选项 */
    displayNames: {
      [key: string]: string
    },
    /** 样式定义
     * true 会自动取同目录下同名的 `.css` / `.scss` 生成资源定义, 代码中可以用 `${key}Style` 作为样式的 key 导入
     * important 会自动注入到 body 末尾, 不需要再在代码里导入
     * instant 会优先于代码运行前注入到 head 里, 不需要再在代码里导入
    */
    style?: boolean | 'important' | 'instant'
    /** HTML 定义, 为 true 时类似 style, 可以在代码中作为字符串导入, 生成的 key 为 `${key}Html` */
    html? boolean
    /** 为 true 时表示可实时重载, 无需刷新生效, 会调用相应的 unload / reload 方法, 下述 */
    reloadable?: boolean
    /** 定义下拉框数据 */
    dropdown?: {
      /** 需要下拉框的选项 key */
      key: string
      /** 下拉框数据列表 */
      items: string[]
    }
  }
}
```
- 写好代码后可以进行[编译](##编译), 调试时需要多次改动代码也可以使用监视模式
- 在 `src/utils/gui-settings/gui-settings.html` 中添加对应的设置项, 可以使用 `<checkbox>` 或 `<dropdown>` 元素, 子选项需要增加 `indent` 值, 并在 `dependencies` 中指定父级的 key.

### 多文件
将重复逻辑提出一个单独文件是很好的做法, 但可惜本项目对多文件的支持十分有限.

例子: 假设 `a.ts` `b.ts` 都想使用 `lib.ts` 中的函数 `foo`, 那么 `lib.ts` 需要写成这样:
```ts
// lib.ts
// 导出函数本身, 这样 VSCode 才能提供代码补全, 且通过 TypeScript 编译
export const foo = () => console.log('foo')

// 导出一个默认对象, 对象上声明一个固定的 export 属性, 值为一个对象, 包含当前文件所有要导出的内容
// 这个是运行时实际获取导出内容的地方, 所以 export 这个名字不能更换
export default {
  export: { foo }
}
```
> `export `(后面带一个空格) 会被编译器识别为导出, 并在最后生成的代码中删除, 因此你不能在其他任何地方使用 `export `, 包括字符串里也不行. 例如 `const html = '<a class="export link">link</a>'` 会变成 `const html = '<a class="link">link</a>'`, 需要改成 `const html = '<a class="link export">link</a>'` 才行.

然后使用的时候, **必须**通过动态导入方式导入 `lib.ts` 中的功能 (`interface` 之类的运行时不存在的东西没有这个限制)
```ts
// a.ts / b.ts
(async () => {
  const { foo } = await import('./lib')
  foo()
})()
```
`a.ts` 如果作为一项功能, 需要在 `src/client/resource-manifest.js` 中声明, `lib.ts` 只导出一些可重用的功能, 不需要声明.
如果 `lib.ts` 即是一项功能, 又导出函数给其他功能使用, 那么仍然需要声明.

### Vue SFC 支持 (Vue 单文件组件)
Vue 的支持仅限内置的几种标签: `<template>`, `<script>`, `<style>`. 语言可选用 `ts`, `js`, `css`, `scss`, `html`.
在脚本中也**必须**使用动态导入:
```ts
// xxx.ts
(async () => {
  const ComponentA = await import('./a.vue')
  new Vue({
    el: '.container',
    components: { ComponentA },
    // ...
  })

  const ComponentB = await import('./b.vue')
  const vm = new (Vue.extend(ComponentB))().$mount()
  document.body.appendChild(vm.$el)
  vm.xxx = xxx
  // ...
})()
```

### 创建附加功能
可以在功能组件中声明附加功能, 添加按钮到脚本的`附加功能`面板:
```ts
export default {
  widget: {
    // ...
  }
}
```
`widget` 是一个对象, 类型如下:
```ts
interface Widget {
  /** 插入到附加功能面板的 HTML, 一般可以带上 class="gui-settings-flat-button" 获得与其他附加功能按钮一致的外观 */
  content: string
  /** 附加功能面板打开时, 会调用这个判断当前页面是否适用此附加功能
   * 得到 false 的话不会插入 content, 也不会执行 success
   */
  condition: () => boolean | Promise<boolean>
  /** content 插入后运行的函数 */
  success: () => void | Promise<void>
}
```
关于例子可以查看 `src/live/download-live-records.ts`

### 可重载功能
如果你设计的功能不需要刷新页面也能切换开启/关闭状态, 可以将其写为可重载功能:
```ts
// 初次运行功能时, 直接执行文件内容, setup 将会调用
const setup = () => {
  // ...
}
setup()

// 上面那些内容只会运行一次
export default {
  // 重新开启功能时, reload 会调用, setup 不调用
  reload: () => {
    // ...
  },
  // 关闭功能时, unload 会调用
  unload: () => {
    // ...
  },
}
```
然后在 `src/client/resource-manifest.js` 中添加 `reloadable: true`, 例如:
```ts
disableFeedsDetails: {
  path: 'disable-feeds-details.min.js',
  reloadable: true,
  displayNames: {
    disableFeedsDetails: '禁止跳转动态详情',
  },
},
```
关于例子可查看 `src/activity/disable-feeds-details.ts`

更进一步, 如果你的功能只是简单切换一下样式, 还可以这么写:
```ts
// 样式内容, 样式 id, (可选)
export default resources.toggleStyle('a { color: red }', 'my-style', {

})
```
关于例子可查看 `src/style/player-on-top.js`


## 编译
编译代码 (有时候要跑两次才能真正编译完成, 玄学bug)

(VSCode 对应任务: `重新编译 rebuild`)
```powershell
dotnet builder/dotnet/publish/build.dll
```

监视代码改动 (Vue构建偶尔会出bug假死, 关掉重启下就行)

(VSCode 对应任务: `监视 watch`)
```powershell
dotnet builder/dotnet/publish/build.dll watch
```

## 提交 commit
- 调试过程中会产生编译后的文件 (`min` 文件夹里的东西和根目录的4个脚本主文件), 建议提交前放弃这些文件的更改, 只提交对源代码的修改, 以免 PR 的时候冲突
- commit message 只需写明改动点, 中英文随意, 也不强求类似 [commit-lint](https://github.com/conventional-changelog/commitlint) 的格式

## 发起 PR (合并请求)
将 preview 分支往主仓库的 preview 分支合并就行
