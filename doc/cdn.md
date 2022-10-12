# 更换脚本 CDN

CDN 是脚本的编译时配置, 无法做进设置中于运行时切换, 如需更换, 可以参考以下步骤.

## 获取源代码

步骤同 [CONTRIBUTING.md](../CONTRIBUTING.md#搭建开发环境) 中的 `搭建开发环境` 一节.

## 修改 CDN 配置

CDN 配置位于 `webpack/cdn/`, 可在目录下新建一个文件, 导出一个 CDN 配置对象, 并在 `index.ts` 中将 `altCdn` 指向新的配置对象.

配置对象的各个字段说明如下:
```js
{
  owner: '你的 GitHub 用户名'
  host: 'CDN 的域名',
  stableClient: `正式版下载链接`,
  previewClient: `预览版下载链接`,
  // 第三方库配置, 注意版本要和 github.ts 里的一致, MDI 是 5.3.45
  library: {
    lodash: 'Lodash 下载链接',
    protobuf: 'protobuf.js 下载链接',
    jszip: 'JSZip 下载链接',
    sortable: 'Sortable 下载链接',
    mdi: 'MDI 图标库下载链接',
  },
  smallLogo: '脚本的小图标',
  logo: '脚本的大图标',
  root: (branch, ownerOverride) => 'GitHub 文件根目录',
}
```

## 编译

运行 `本体:编译生产版本` 任务 (`pnpm webpack --config ./webpack/webpack.prod.ts --progress`).

会得到:
- 正式版: `dist\bilibili-evolved.user.js`
- 预览版: `dist\bilibili-evolved.preview.user.js`

选择一个需要的版本, 将文件内容复制, 粘贴到油猴的新建脚本中, 保存即可.

## 更新

脚本的后续更新, 需要进行 `git pull` 更新代码, 然后重新执行上一节的编译操作.
