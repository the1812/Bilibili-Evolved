# 从 v1 (旧版) 迁移设置

在 v2 的组件库中, 提供了 `v1 设置迁移` 的功能, 可以将 v1 中使用的功能自动安装到 v2 中来.

本文档将说明迁移的步骤, 从还没有安装 v2 的脚本开始:

## 1. 导出 v1 设置
打开脚本设置面板, 在搜索框旁边的菜单中选择导出设置, 得到文件 `settings.json`

![image](https://user-images.githubusercontent.com/26504152/127772561-96410454-45eb-4a08-9223-6a97c1850abb.png)

## 2. 安装 v2 脚本
前往 [README](../README.md#安装) 安装 v2 脚本, 并禁用 v1 脚本.

## 3. 安装 v1 设置迁移
前往 [功能列表](./features/features.md), 搜索 `v1 设置迁移`, 根据自身网络情况选择合适的安装链接并复制.

![image](https://user-images.githubusercontent.com/26504152/127772680-9e227748-6685-4bb4-9afb-4e0b1e96b282.png)

刷新之前的 b 站页面, v2 脚本应该已经生效, 设置面板依然默认在页面左侧中央.

打开设置面板, 进入左下角的 `组件`, 在 `添加组件` 那里的输入框粘贴链接, 点击添加, 安装完成后刷新页面.

![image](https://user-images.githubusercontent.com/26504152/127772811-bc1ac97f-ecaa-4823-b694-c393d688ad35.png)

## 4. 开始迁移
再次打开设置面板, 进入左下角的 `关于`, 上一步成功的话这里会多出一个 `导入 v1 设置` 的按钮.

![image](https://user-images.githubusercontent.com/26504152/127772852-4594d882-9ce7-4059-a34c-366725ce36ff.png)

点击这个按钮, 选择一开始导出的 `settings.json` 文件, 脚本将会开始下载所有在 v1 中开启的功能并安装.

等待安装完成后, 刷新页面就完成迁移了. v1 脚本可以先不卸载, 免得这设置迁移有啥 bug 把数据搞丢了就不好了(
