import { defineComponentMetadata } from '@/components/define'
import { addStyle, removeStyle } from '@/core/style'
import { playerUrls } from '@/core/utils/urls'
import style from './keep-control-wrap.scss'

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

const load = () => {
  addStyle(style, name)
}
const unload = () => {
  removeStyle(name)
}

export const component = defineComponentMetadata({
  name,
  displayName,
  author,
  tags: [componentsTags.style, componentsTags.video],
  entry: load,
  reload: load,
  unload,
  urlInclude: playerUrls,
})
