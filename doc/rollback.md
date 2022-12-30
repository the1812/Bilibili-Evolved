# 旧版本回退指南

> ⚠警告: 使用旧版本产生的不兼容 / 功能失效等问题需要自行承担, 本仓库只受理最新版脚本的反馈.

在 [Release](https://github.com/the1812/Bilibili-Evolved/releases) 中找到要回退的版本, 并记住发布的时间.

前往 https://github.com/the1812/Bilibili-Evolved/commits/master/dist/bilibili-evolved.user.js, 找到相同日期中的第一个 `CI Build`, 并点击查看详情.

![image](https://user-images.githubusercontent.com/26504152/206855808-27c0d501-0c98-4f9c-be30-53ad0db715ab.png)

在详情页中右键 `Raw`, 选择 `Save link as...` (链接另存为), 会下载脚本的内容.

![image](https://user-images.githubusercontent.com/26504152/206855884-4a704c4c-4020-47fc-aa04-0f855d73b19b.png)

将脚本内容粘贴覆盖到油猴中, 并删掉这两行检查更新用的配置.

![image](https://user-images.githubusercontent.com/26504152/206856196-fbde3ef9-eddf-4b3f-a12f-12547f2f0494.png)

保存后, 进入 b 站, 从脚本设置中关闭 `自动更新器`.

![image](https://user-images.githubusercontent.com/26504152/206856445-ce5ebeb1-7d58-4602-8c3b-c506efdd5f32.png)
