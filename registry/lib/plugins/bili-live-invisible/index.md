屏蔽 B 站直播间的统计 / 埋点 / 追踪上报请求（规则基于 367 条真实抓包逐条实测：遥测 26/26、误伤 0），并按 [BiliLiveInvisible](https://github.com/lzghzr/bilibili-live-invisible)（Xposed 模块）的语义改写 `access_key` / `room_id` / `uid` 三个身份字段。覆盖 `fetch` / `XHR` / `sendBeacon` / `WebSocket`（含弹幕协议二进制帧）四个通道，每个通道均有兜底安全网。

⚠️ 注意事项：

- 插件在 BE 核心初始化完成后才安装拦截，**BE 启动前的首屏请求无法覆盖**（独立 userscript 版无此限制，见[仓库](https://github.com/xly2333/bili-live-invisible)）。
- 签名参数（`w_rid` / `wts` / `csrf`）不重算，改写后的请求可能被服务端签名校验拒绝。
- 同一公开直播流不登录（无痕窗口）本就可看；本脚本只是把「游客化」自动化了。仅供学习研究。
