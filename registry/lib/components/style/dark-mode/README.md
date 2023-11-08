<!-- spell-checker: disable -->
# 关于夜间模式

## 历史
夜间模式是 Bilibili-Evolved 最早出现的功能之一 (2018 年), 早期的技术水平很差, 留下了很多难以治理的代码. (位于 `./old/dark-slice-*.css`)
主要问题有:
- 配色没有做成 CSS Variables, 后续无法再更换主题.
- 纯 CSS 编写, 嵌套样式产生了大量冗余代码.
- 选择器条件太宽泛, 经常造成预期外的样式影响.
- 同一模块的代码分散在不同地方, 难以二次修改.

因此夜间模式为了缓解这些问题做过不少调整, 现在的组成如下:

## 文件组成

### `dark-mode.scss`
主入口样式, 只 `@import` 其他样式.

### `_dark-definition.scss`
提供辅助编写夜间模式样式的 Sass Mixin 和 Function, 主要功能如下:

#### 修改颜色

- `@include color($level)`: 设置 `color`.
> 参数例如 `@include color('e')` 会展开为 `color: #eee !important`. 类似的简写还有 `'ef'` -> `#efefef`, `'123'` -> `#123`, `123456` -> `#123456`, 如果参数留空则为透明: `@include color()` -> `color: transparent !important`, 此规则适用于所有修改颜色的 Mixin.
- `@include background-color($level)`: 设置 `background-color`.
- `@include background($level)`: 设置 `background`, 和上一条不同的是, 这条会同时去除 `background-image`.
- `@include border-color($level)`: 设置 `border-color`.
- `@include fill($level)`: 设置 `fill`. (用于 SVG)
- `@include stroke($level)`: 设置 `stroke`. (用于 SVG)

#### 特殊颜色

- 上述的[修改颜色](#修改颜色)中的 6 条 Mixin 都可以加上 `theme-` 前缀直接使用主题色作为参数, 例如 `@include theme-color()` -> `color: var(--theme-color) !important`.
- 加上 `foreground-` 前缀可以使用文本颜色 (通用设置里那个), 例如 `@include foreground-color()` -> `color: var(--foreground-color) !important`.
- `color` 和 `background-color` 可以加上 `vip-` 前缀使用大会员的粉色, 例如 `@include vip-color()` -> `color: $vip-color !important`.

#### 滤镜

通常用于处理无法直接设置颜色的图片, 会影响全部子元素.

- `@include to-white()`: 将内容转为白色.
- `@include to-gray($invert)`: 将内容转为灰色 (单色), 参数 0~1 可控制灰度值.
- `@include grayscale($value)`: 将内容黑白化, 同 CSS grayscale.
- `@include brightness($value)`: 修改亮度, 同 CSS brightness.
- `@include to-theme($from)`: 将单一颜色的图片转换为主题颜色 (近似值), 参数是原图片的颜色, 可选 `'pink'` 或 `'blue'`.

#### 其他

- `@include no-image()`: 删除元素的 `background-image`.
- `@include no-shadow()`: 删除元素的 `box-shadow`.
- `@include theme-shadow()`: 将元素的 `box-shadow` 设为主题色. (现不再推荐使用这个, 而是设置正常的黑色投影即可)
- `@include hide($hideLayout)`: 隐藏元素, 正常来说也很少用到, 实在是在夜间模式下多余且无法修改其样式的元素才考虑隐藏.
- `#{contains($selector)}`: 生成一个只要 class 包含 `$selector` 就能命中的选择器, 通常用于番剧区带有 hash 的不稳定 class 名. 例如:
```scss
#{contains('mediainfo_media_toolbar')} {
  @include color('a');
}
```
将生成
```css
[class*='mediainfo_media_toolbar'] {
  color: #aaa !important;
}
```

### `dark-navbar.scss`
处理部分顶栏样式的旧代码, 不应再新增代码.

### `dark-variables.scss`
b 站官方提供的暗色配色, 能够为较新的 b 站组件开启夜间模式配色, 并且将主题色更换为了脚本中设置的主题色.

### `dark-urls.ts`
排除的 URL 列表, 这些页面通常更新非常频繁, 难以及时适配; 或者使用频率很低不做适配.

## 开发调试指南

参考 [CONTRIBUTING.md](../../../../../CONTRIBUTING.md) 启动开发环境, 正常启动 `夜间模式` 的调试即可, 所有对 Sass / CSS 的修改都支持热重载, 如果改动 TS 代码则需要手动刷新页面.

### 规范

代码编写的规范基本对应[历史](#历史)一节中提到的问题:
- 优先使用 [_dark-definition.scss](#_dark-definitionscss) 提供的封装来修改样式.
- 新增代码应该在最新的 `dark-slice-*.scss` 文件中增加, 不应修改 `./old/dark-slice-*.css`.
- 每个 `dark-slice-*.scss` 文件存放约 1000 行左右代码, 超过应新建一个文件.
- 对同一模块的样式修改, 应使用嵌套语法写在一处.
- 修改样式时, 选择器至少要有两个有区分度的层级, 避免样式意外影响其他地方.

例如以下代码, 修改的元素是 `.container`, 这个 class 在各种地方都可能出现, 所以需要向上找到能表示当前模块的一个 class `.van-popper-login` 缩小范围.
```scss
.van-popper-login .container {
  @include border-color("4");
}
```

### 配色

转换为夜间模式后, 配色的对比度应尽可能对应原版, 推荐的配色方案参考:

| 分类                           | 原颜色      | 夜间模式颜色                                                        |
| ------------------------------ | ----------- | ------------------------------------------------------------------- |
| 一级文字颜色                   | 黑色        | `@include color('e')`                                               |
| 二级文字颜色                   | 灰色        | `@include color('a')`                                               |
| 页面背景                       | 白色        | `@include background-color('2')`                                    |
| 页面一级内容区域 / 卡片 / 弹窗 | 灰色        | `@include background-color('3')`                                    |
| 页面二级内容区域 / 卡片 / 弹窗 | 深灰色      | `@include background-color('4')`                                    |
| 链接                           | 蓝色        | `@include theme-color()`                                            |
| 主要按钮背景色                 | 蓝色        | `@include theme-background-color()`                                 |
| 主要按钮文字颜色               | 白色        | `@include foreground-color()`                                       |
| 次要按钮背景色                 | 灰色        | `@include background-color('3')`                                    |
| 次要按钮文字颜色               | 黑色 / 灰色 | `@include color('e')` / `@include color('a')`                       |
| 占位区域 (placeholder)         | 灰色        | `@include background-color('3')`                                    |
| 分割线                         | 灰色        | `@include background-color('4')` / `@include background-color('5')` |
