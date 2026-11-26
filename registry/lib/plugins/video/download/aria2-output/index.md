为下载视频增加 aria2 文件导出和 RPC 输出支持.

### RPC 预设路径说明

自定义 RPC 预设的路径, 使用 aria2 RPC 功能下载文件时, 会根据这个路径来保存. 留空时使用 aria2 默认下载目录, 相对路径则会拼接到默认目录.

可以使用的变量有:

- `title`: 视频标题
- `ep`: 选集标题
- `user`: 视频 UP 主的用户名
- `userID`: 视频 UP 主的 UID
- `aid`: AV 号
- `bvid`: BV 号
- `cid`: CID (每个视频的唯一编号, AV 号对应的视频可能有多集)
- `y`/`M`/`d`: 当前年/月/日
- `n`: 批量视频的序号
- `publishYear`/`publishMonth`/`publishDay`: 视频发布的年/月/日 (部分批量视频提供)

例如, 想要按 UP 主名和标题组织路径, 可以设定为 `[user]/[title][ - ep]`, 能够得到类似 `/UP主名/xxxx - P1` 的路径; 当没有选集标题时则只有 `/UP主名/xxxx`.
