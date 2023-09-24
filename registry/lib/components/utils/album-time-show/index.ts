import { defineComponentMetadata } from '@/components/define'
import { attributesSubtree, childList } from '@/core/observer'
import { select } from '@/core/spin-query'

let albumList: Element
let oldObserver: MutationObserver
const observeAlbum = async (node: Element) => {
  // 相簿更新时会复用原有元素，必须得监听子元素属性变化
  const [observer] = attributesSubtree(node, () => {
    // 为所有相簿添加发布时间显示
    albumList.querySelectorAll('.album-card').forEach(e => {
      const pubTimeElement = e.querySelector('.album-pub-time')

      // eslint-disable-next-line no-underscore-dangle
      const time = (e as any).__vue__.item.ctime

      if (time !== undefined) {
        if (pubTimeElement !== null) {
          pubTimeElement.innerHTML = new Date(time * 1000).toLocaleString()
        } else {
          e.insertAdjacentHTML(
            'beforeend',
            `<div class="album-pub-time">${new Date(time * 1000).toLocaleString()}</div>`,
          )
        }
      }
    })
  })

  // 移除旧的MutationObserver
  oldObserver?.disconnect()
  oldObserver = observer

  const { addImportantStyle } = await import('@/core/style')
  const { default: style } = await import('./album-time.scss')
  addImportantStyle(style, 'album-pub-time-style')
}
const entry = async () => {
  const spaceContainer = await select('.s-space')
  childList(spaceContainer, async () => {
    if (!document.URL.match(/^https:\/\/space\.bilibili\.com\/\d+\/album/)) {
      return
    }

    albumList = await select('.album-list__content')
    observeAlbum(albumList)
  })
}

export const component = defineComponentMetadata({
  name: 'albumPubTimeShow',
  author: {
    name: 'Light_Quanta',
    link: 'https://github.com/LightQuanta',
  },
  displayName: '相簿发布时间显示',
  tags: [componentsTags.utils],
  urlInclude: [/^https:\/\/space\.bilibili\.com/],
  entry,
  description: {
    'zh-CN': '在相簿界面显示相簿的发布时间',
  },
})
