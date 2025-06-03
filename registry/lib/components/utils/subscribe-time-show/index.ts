import { defineComponentMetadata } from '@/components/define'
import { childList } from '@/core/observer'
import { select } from '@/core/spin-query'

let relationList: Element
let oldObserver: MutationObserver

const observeFans = async (node: Element) => {
  // 监听关注列表元素变化
  const [observer] = childList(node, () => {
    // 读取Vue属性里的关注列表
    // eslint-disable-next-line no-underscore-dangle
    const subscribeTime = (
      relationList.parentElement.parentElement.parentElement.parentElement as any
    ).__vue__.relationList.map(l => l.mtime)

    // 为所有子元素添加关注时间显示
    relationList.querySelectorAll('.list-item>.content').forEach((e, index) => {
      // 防止重复添加元素
      if (e.querySelector('.subscribe-time-fix') === null) {
        const time = subscribeTime[index]
        if (time !== undefined) {
          e.querySelector('p').insertAdjacentHTML(
            'afterend',
            `<div class="desc subscribe-time-fix">关注时间:${new Date(
              time * 1000,
            ).toLocaleString()}</div>`,
          )
        }
      }
    })
  })

  // 移除旧的MutationObserver
  oldObserver?.disconnect()
  oldObserver = observer

  const { addImportantStyle } = await import('@/core/style')
  const { default: style } = await import('./subscribe-time.scss')
  addImportantStyle(style, 'subscribe-time-style')
}
const entry = async () => {
  const spaceContainer = await select('.s-space')
  childList(spaceContainer, async () => {
    if (!document.URL.match(/^https:\/\/space\.bilibili\.com\/\d+\/fans/)) {
      return
    }
    relationList = await select('.relation-list')
    observeFans(relationList)
  })
}

export const component = defineComponentMetadata({
  name: 'subscribeTimeShow',
  author: {
    name: 'Light_Quanta',
    link: 'https://github.com/LightQuanta',
  },
  displayName: '关注时间显示',
  tags: [componentsTags.utils],
  urlInclude: [/^https:\/\/space\.bilibili\.com/],
  entry,
  description: {
    'zh-CN': '在粉丝/关注列表显示关注的具体时间',
  },
})
