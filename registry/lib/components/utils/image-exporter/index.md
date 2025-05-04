可以批量导出某个地方的图片, 目前支持动态和专栏.

动态文件名变量:
- `n`: 第 n 张图
- `id`: 动态 ID
- `user`: 用户名
- `userID`: 用户 ID
- 动态发布时间:
  - `publishYear`
  - `publishMonth`
  - `publishDay`
  - `publishHour`
  - `publishMinute`
  - `publishSecond`
  - `publishMillisecond`
- 被转发的数据 (如果不是转发类型的动态, 则和上面的对应变量相同):
  - `originalID`: 被转发的动态 ID
  - `originalUser`: 被转发的用户名
  - `originalUserID`: 被转发用户 ID
  - 被转发的动态发布时间:
    - `originalPublishYear`
    - `originalPublishMonth`
    - `originalPublishDay`
    - `originalPublishHour`
    - `originalPublishMinute`
    - `originalPublishSecond`
    - `originalPublishMillisecond`

专栏文件名变量:
- `n`: 第 n 张图
- `title`: 专栏标题
- `cv`: 专栏 cv 号
- 专栏发布时间:
  - `publishYear`
  - `publishMonth`
  - `publishDay`
  - `publishHour`
  - `publishMinute`
  - `publishSecond`
  - `publishMillisecond`
