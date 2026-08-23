import { defineComponentMetadata } from '@/components/define'
import { playerUrls } from '@/core/utils/urls'

const name = 'keepControlWrap'
const displayName = '强制保留播放器控制栏'
const author = [
  {
    name: 'Andy_Allan',
    link: 'https://github.com/andya1lan',
  },
  {
    name: 'WhiteTeal55',
    link: 'https://github.com/WhiteTeal55',
  },
]

export const component = defineComponentMetadata({
  name,
  displayName,
  author,
  entry: none,
  instantStyles: [{ name, style: () => import('./keep-control-wrap.scss') }],
  tags: [componentsTags.style, componentsTags.video],
  urlInclude: playerUrls,
})
