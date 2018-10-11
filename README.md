# Bilibili-Evolved
增强哔哩哔哩Web端体验的油猴脚本.

# 安装
需要浏览器拥有[Tampermonkey](https://tampermonkey.net/)或同类插件.

[![正式版](https://img.shields.io/badge/正式版-🌸-green.svg?style=flat-square&colorB=009688)](https://github.com/the1812/Bilibili-Evolved/raw/master/bilibili-evolved.user.js)

正式发布的版本, 最稳定, 更新频率较低.

[![预览版](https://img.shields.io/badge/预览版-🍺-yellow.svg?style=flat-square&colorB=607D8B)](https://github.com/the1812/Bilibili-Evolved/raw/preview/bilibili-evolved.preview.user.js)

新增内容测试的地方, 更新频率高, 但功能不稳定.

[![离线版](https://img.shields.io/badge/离线版-👻-blue.svg?style=flat-square)](https://github.com/the1812/Bilibili-Evolved/raw/master/bilibili-evolved.offline.user.js)

内置所有依赖项, 体积较大, 可以减少GitHub服务器不稳定的影响. 由于任何依赖项更新后此脚本也需更新, 所以更新频率会高于正式版.

[![预览离线版](https://img.shields.io/badge/预览离线版-🌟-blue.svg?style=flat-square&colorB=F06292)](https://github.com/the1812/Bilibili-Evolved/raw/preview/bilibili-evolved.preview-offline.user.js)

兼备预览版和离线版的特点.

> 某些破坏性的大更新会使旧版脚本**完全**无法工作, 请及时检查更新.
# 设置
脚本启用后, 在网页左侧中央会有一个齿轮图标, 点击即可打开设置.
设置项的说明见功能概览一节.

**设置保存后, 需要刷新网页才能生效.**
![设置](images/gui-settings.png)
## 默认值
### 样式
- 主题颜色: `浅蓝色(#00A0D8)`
- 样式调整: `开启`
    - 顶栏(对横幅)不透明度: `0.382`
- 夜间模式: `关闭`
- 夜间模式计划时段: `关闭`
    - 起始时间: `18:00`
    - 结束时间: `6:00`
- 搜索栏置顶: `开启`
    - 显示顶部横幅: `开启`
### 工具
- 删除广告: `开启`
- 稍后再看重定向: `开启`
- 隐藏搜索推荐: `关闭`
- 展开动态标题: `开启`
### 视频与直播
- 自动展开弹幕列表: `开启`
- 缩放看板娘: `开启`
- 删除直播水印: `开启`
- 删除视频标题层: `关闭`
- 模糊视频控制栏背景: `关闭`
### 触摸
- 顶栏触摸优化: `关闭`
- 播放器触摸支持: `关闭`
    - 启用实验性动画效果: `关闭`
    > 因为部分浏览器对包含实验性效果的动画没有优化会很卡, 所以开放此选项.
    - 启用双击控制: `关闭`
### 其他
- 显示消息: `开启`
- 模糊设置面板背景: `关闭`
- 启用缓存: `开启`

# 功能概览
为保证最佳体验, 设备分辨率建议在1080P及以上, 并且已登录哔哩哔哩账户.
## 样式
### 主题颜色
设定顶栏(样式调整启用时)和夜间模式使用的主题色.
![粉色](images/new-navbar-stardust.png)
![紫色](images/new-navbar-purple.png)
![蓝色](images/new-navbar-lightBlue.png)
![绿色](images/new-navbar-teal.png)
![暗蓝色](images/new-navbar-blueGrey.png)
### 样式调整
**主要**会改变顶栏的样式, 并有一些其他地方的界面微调:
- 为播放器增加主题色投影
- 可控制顶栏对横幅的透明度
- 使播放器按钮垂直对齐
- 使部分搜索栏的提示文字的颜色更清晰
- 启用迷你播放器时, 防止下方内容(评论区, 相关推荐等)突然向上收拢影响阅读
- 隐藏播放页面的"返回旧版"侧栏
- 修复直播间一些文字初始状态不正确
#### 顶栏效果
![主站](images/new-navbar.png)
![播放](images/new-navbar-stardust.png)
### 夜间模式(实验性)
夜间模式更适合光线暗的环境, 并会大量应用自定义颜色.

目前仅支持部分常用页面, 其他页面会陆续添加, 不支持推广板块(会被`删除广告`功能去除的部分).
#### 启用前
![日间](images/light-style.png)
#### 启用后
![夜间](images/dark-style.png)
#### 夜间模式计划时段
设置一个使用夜间模式的时间段, 进入/离开此时间段时, 会自动开启/关闭夜间模式.
> 结束时间小于起始时间时将视为次日, 如`18:00`至`6:00`表示晚上18:00到次日6:00.
### 搜索栏置顶
在主站(非新版播放器)中, 总是把搜索框置于顶栏.
#### 启用前
![不调整](images/original-navbar.png)
#### 启用后
![调整](images/override-navbar.png)
#### 移除横幅
在搜索框位置调整启用的时候, 还可以使用此功能移除顶部横幅.
##### 启用前
![不移除](images/override-navbar.png)
##### 启用后
![移除](images/no-banner.png)

## 工具
### 删除广告
删除嵌于页面中的推广横幅.
#### 删除前
![删除前](images/remove-ads-before.png)
#### 删除后
![删除后](images/remove-ads-after.png)
### 稍后再看重定向
将稍后再看的链接重定向为普通播放网址, 以使用新版播放页面.
### 隐藏搜索推荐
将搜索框的推荐词替换为`搜索`.
### 展开动态标题
在顶栏的动态预览框中:
- 关闭时, 长名称的后半部分会用`...`代替.
![关闭时](images/full-tweets-title-off.png)
- 启用时, 不管名称多长, 总是完全展开up主和视频的标题.
![启用时](images/full-tweets-title-on.png)


## 视频与直播
### 查看封面
在视频播放页面/直播间中, `设置`→`视频与直播`下会出现查看封面按钮, 点击可以查看或保存封面.
![查看封面按钮](images/view-cover-button.png)
### 自动展开弹幕列表
新版播放页面中, 弹幕列表默认收起以显示推荐的其他视频. 启用此功能可在每次加载视频时自动展开弹幕列表.
### 缩放看板娘
根据屏幕DPI缩放看板娘的大小以提高像素的清晰度.
### 删除直播水印
删除观看直播时角落的水印.
### 删除视频标题层
删除视频里鼠标经过时出现在顶端的标题覆盖层.

标题覆盖层的位置:
![标题覆盖层](images/remove-top-mask.png)
### 模糊视频控制栏背景
此功能需要浏览器支持背景模糊效果, 详情见兼容性一节.
#### 启用前
![不模糊背景](images/blur-video-control-disabled.png)
#### 启用后
![模糊背景](images/blur-video-control.png)

## 触摸支持
### 顶栏
删除顶栏右侧的一级链接(从`大会员`到`历史`), 以方便触屏设备快速预览信息.被删除的链接可从各预览中的`查看更多`进入.
### 播放器
#### 启用触摸控制
- 左右滑动可调整进度
- 上下滑动可调整音量
- 进度调整可在左上角和右上角取消
- 在不同位置滑动, 可以使用3档不同的灵敏度.

![进度调整](images/adjust-playback.png)
![音量调整](images/adjust-volume.png)

已知问题: 滑动调整的音量不会保存, 下次打开视频将恢复原音量.

#### 启用双击控制
将操作方式更改为: 单击显示/隐藏控制栏, 双击播放/暂停.
#### 增大间距
增大控制栏的按钮间距, 使触摸操作更准确.
##### 启用前
![放大前](images/player-buttons-original.png)
##### 启用后
![放大后](images/player-buttons-large.png)
## 其他
关于脚本自身的一些设定.
### 显示消息
允许在网页左下角显示来自本脚本的消息, 如更新提醒, 错误提示等.
![消息](images/toast.png)
### 模糊设置面板背景
使设置面板的内容区半透明并模糊后方图像.
### 启用缓存
使用缓存以提高脚本的加载速度, 此选项只对非离线版有效.

# 兼容性
## ![Chrome:兼容](https://img.shields.io/badge/Chrome-兼容-brightgreen.svg?style=flat-square&colorB=009688)
- 背景模糊效果(`backdrop-filter`)需要手动在`chrome://flags/#enable-experimental-web-platform-features`中开启.
## ![Firfox:部分兼容](https://img.shields.io/badge/FireFox-部分兼容-yellow.svg?style=flat-square&colorB=1976D2)
- 滚动条样式无效.
- 背景模糊效果无效.
- 触摸调整的进度预览有弹跳现象.(来自`transition: all 0.2s;`. 短时间内总是从原数值开始变化, 而不是当前数值)
## ![Edge:部分兼容](https://img.shields.io/badge/Edge-部分兼容-yellow.svg?style=flat-square&colorB=1976D2)
- 滚动条样式无效.
- 由于Edge的CSS渲染bug(主要集中在`filter`和`color`), 部分自定义颜色错乱.
- 顶栏触摸体验不佳.
- 触摸功能需要手动在`about:flags`中开启.
## ![Safari:未知](https://img.shields.io/badge/Safari-未知-lightgrey.svg?style=flat-square&colorB=323232)
尚未在Safari中测试.
