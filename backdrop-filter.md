# 背景模糊效果兼容性
`模糊视频控制栏背景`使用了背景模糊效果(`backdrop-filter: blur`), 详见[MDN文档](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter).

旧版本中`模糊设置面板`, `播放器触摸支持`也使用了此效果, 现行版本已经移除.

## Chrome / Edge (Chromium)
- 背景模糊效果需要手动在`chrome://flags/#enable-experimental-web-platform-features`中开启. (Edge要把`chrome`换成`edge`)
- 含有背景模糊效果的动画有掉帧现象.
- 在Chrome 73 ~ 74版中, 如果您的屏幕DPI缩放大于100%, 或者改动了页面缩放倍数, 则模糊效果区域会错位. 详见[Chromium Issue #942910](https://bugs.chromium.org/p/chromium/issues/detail?id=942910), 75版后改动页面缩放倍数依然会错位.

## Firefox
- 背景模糊效果无效, 详见[Bugzilla #1178765](https://bugzilla.mozilla.org/show_bug.cgi?id=1178765).

## Safari
- 尚未在Safari中测试, 根据MDN里的兼容性描述应该是支持的.
