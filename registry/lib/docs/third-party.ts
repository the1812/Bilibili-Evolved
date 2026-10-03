import { DocSourceItem } from '.'

export const thirdPartyComponents: DocSourceItem[] = [
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
    name: 'customNavbar.items.localHistory',
    displayName: '自定义顶栏 - 本地历史搜索',
    fullRelativePath: '../../registry/dist/plugins/style/custom-navbar-local-history.js',
    fullAbsolutePath: 'registry/dist/plugins/style/custom-navbar-local-history.js',
    description:
      '把自定义顶栏"历史"弹窗的搜索替换为本地历史库检索: 全量抓取观看历史保存到 IndexedDB, 在本地全量数据上按标题/UP 主搜索(支持拼音全拼与首字母), 能搜到早期观看的视频.',
    owner: 'xinyulan810',
  },
]
