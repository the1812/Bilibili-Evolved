用支持自定义标签页和卡片布局的仪表盘替换 B 站首页。

## 使用限制

与「极简首页」「清爽首页」「仅搜索首页」互斥，不可同时启用。

## 选项

- 在首页的「[设置](https://www.bilibili.com/?dashboardTab=settings)」标签页中，可调整标签页顺序，并设置各页支持的显示、布局、行列数和日期分组。
- **显示「稍后再看」**同时控制标签页和视频封面上的「稍后再看」按钮。
- 「卡片布局」控制横向、紧凑或纵向的卡片布局。
- 「卡片行列数」控制横向和紧凑布局中的列数，纵向布局中的行数。`0` 为自动，上限为 `8`。
- 支持日期分组的标签页可以单独开启或关闭分组。
- 开启「在网址中记住当前标签页」后，刷新页面时会恢复网址中记录的标签页。
- 可为不同种类的链接分别开启首页内预览。

## 插件扩展

插件可以在 `setup` 中向 `dashboardHome.tabs` 注入标签页。新增标签页默认按注册顺序追加，可在「设置」中显示、隐藏或排序。

```ts
addData('dashboardHome.tabs', tabs => {
  tabs.push({
    id: 'my-plugin-tab',
    name: '我的插件',
    component: () => import('./PluginTab.vue').then(module => module.default),
  })
})
```

`id` 用于识别标签页和恢复网址中的选中状态，请使用不含空白、稳定且唯一的 ID。标签页还可提供 `propsData`、`activeLink`（再次点击当前标签页时打开的链接）和 `fixedLayout`（`horizontal`、`compact` 或 `vertical`）。

## 致谢

本组件基于 `极简首页` 开发。

- [the1812](https://github.com/the1812) 创建并维护了极简首页。
- [Tinhone](https://github.com/Tinhone) 修复了极简首页在高分屏和低缩放比例下无法触底加载的问题。
