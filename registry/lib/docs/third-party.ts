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
]
export const thirdPartyPlugins: DocSourceItem[] = [
  {
    type: 'plugin',
    name: 'live.invisibleView',
    displayName: '直播隐身观看',
    fullRelativePath: '../../registry/dist/plugins/live/bili-live-invisible.js',
    fullAbsolutePath: 'registry/dist/plugins/live/bili-live-invisible.js',
    description: '屏蔽 B 站直播间的统计上报请求 (data.bilivideo / live-trace / rumt 等 10 条实测规则, 遥测 26/26 全拦). 依据贡献范围约定, 身份字段改写的完整版以独立脚本形式发布在作者自己的仓库, 未包含在本插件中.',
    owner: 'xly2333',
  },
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
