# Bilibili-Evolved
增强哔哩哔哩Web端体验的油猴脚本.

作为[原脚本](bilibili-touch.js)的工程化形式,工程化目前未完成,完成之前可以先使用原脚本.

# 功能概览
## 新样式
改变顶栏的样式,适用于主站和新版播放器.暂不支持直播,相簿.

设备分辨率建议在1080P及以上.
![主站](images/new-navbar.png)
![播放](images/new-navbar-stardust.png)
### 自定义颜色
![粉色](images/new-navbar-stardust.png)
![紫色](images/new-navbar-purple.png)
![蓝色](images/new-navbar-lightBlue.png)
![绿色](images/new-navbar-teal.png)
![暗蓝色](images/new-navbar-blueGrey.png)
### 夜间主题
夜间主题会大量应用自定义颜色.
#### 启用前
![日间](images/light-style.png)
#### 启用后
![夜间](images/dark-style.png)
### 搜索框位置调整
在主站(非新版播放器)中,总是把搜索框置于顶栏.
#### 启用前
![不调整](images/original-navbar.png)
#### 启用后
![调整](images/override-navbar.png)
### 移除横幅
在搜索框位置调整启用的时候,还可以使用此功能移除顶部横幅.
#### 启用前
![不移除](images/override-navbar.png)
#### 启用后
![移除](images/no-banner.png)
## 触摸支持
### 顶栏
删除顶栏右侧的一级链接(从`大会员`到`历史`),以方便触屏设备快速预览信息.被删除的链接可从各预览中的`查看更多`进入.
### 播放器
