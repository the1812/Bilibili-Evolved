import { DocSourceItem } from '.'

export const thirdPartyComponents: DocSourceItem[] = [
  {
    type: 'component',
    name: 'liveDanmakuSendStatus',
    displayName: '直播弹幕发送检测',
    fullRelativePath: '../../registry/dist/components/live/danmaku-send-status.js',
    fullAbsolutePath: 'registry/dist/components/live/danmaku-send-status.js',
    description:
      '检测系统过滤和直播间屏蔽，仅在发送失败时提示原因和弹幕内容，并将屏蔽响应改写为发送失败。',
    owner: 'mengguojia',
  },
  {
    type: 'component',
    name: 'videoCurTime',
    displayName: '视频内显示时间',
    fullRelativePath: '../../registry/dist/components/video/player/localtime.js',
    fullAbsolutePath: 'registry/dist/components/video/player/localtime.js',
    description: '在视频播放器右上角显示系统时间.',
    owner: 'FoundTheWOUT',
  },
  {
    type: 'component',
    name: 'levelBlocker',
    displayName: '等级屏蔽器',
    fullRelativePath: '../../registry/dist/components/utils/level-blocker.js',
    fullAbsolutePath: 'registry/dist/components/utils/level-blocker.js',
    description:
      '按 B 站账号等级自动屏蔽低等级 UP 主发布的视频与评论区评论/回复，支持首页、分区、搜索、播放页推荐、动态、空间及新版 Shadow DOM 评论区。',
    owner: 'lyfiiu',
  },
]
export const thirdPartyPlugins: DocSourceItem[] = [
  {
    type: 'plugin',
    name: 'customNavbar.items.localHistory',
    displayName: '自定义顶栏 - 本地历史搜索',
    fullRelativePath: '../../registry/dist/plugins/style/custom-navbar-local-history.js',
    fullAbsolutePath: 'registry/dist/plugins/style/custom-navbar-local-history.js',
    description:
      '把自定义顶栏"历史"弹窗的搜索替换为本地历史库检索: 全量抓取观看历史保存到 IndexedDB, 在本地全量数据上按标题/UP 主搜索(支持拼音全拼与首字母), 能搜到早期观看的视频.',
    owner: 'xinyulan810',
  },
]
