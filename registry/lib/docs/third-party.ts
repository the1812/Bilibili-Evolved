import { getDescriptionMarkdown } from '@/components/description'
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
export const thirdPartyPlugins: DocSourceItem[] = []

// FIXME: 在线拉取 metadata 用 getDescriptionMarkdown 生成才能有最完整的信息, 现在这实现只能拿到主 owner, 链接也不能确定
export const getThirdPartyDescription = async (item: DocSourceItem) => {
  const ownerText = item.owner ? `by ${item.owner}\n\n` : ''
  return {
    ...item,
    description: ownerText + (await getDescriptionMarkdown(item)),
  }
}
