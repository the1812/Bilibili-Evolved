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
待补充:
- 多文件支持
- Vue SFC 支持

### 修改现有功能
- 启动[监视模式](##构建/监视)
- 确认功能对应的代码文件, 通常根据目录结构就可以找到, 实在找不到可以在设置中可以通过检查元素查看到某项功能对应的 `data-key`, 这个 key 对应的是 `src/client/resource-manifest.js` 中的 key, 从而可以得知相应的代码文件名称 (`path` 属性)
- 修改代码, 保存后会自动编译

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
- 写好代码后可以进行[编译](##构建/监视), 调试时需要多次改动代码也可以使用监视模式
- 在 `src/utils/gui-settings/gui-settings.html` 中添加对应的设置项, 可以使用 `<checkbox>` 或 `<dropdown>` 元素, 子选项需要增加 `indent` 值, 并在 `dependencies` 中指定父级的 key.

## 构建/监视
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
- 调试过程中会产生编译后的文件(`min`文件夹里的东西和根目录的4个脚本主文件), 建议提交前放弃这些文件的更改, 只提交对源代码的修改, 防止冲突
- commit message 只需写明改动点, 中英文随意, 也不强求类似 [commit-lint](https://github.com/conventional-changelog/commitlint) 的格式

## 发起合并请求
将 preview 分支往主仓库的 preview 分支合并就行
