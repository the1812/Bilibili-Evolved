import { defineComponentMetadata } from '@/components/define'
import { childList } from '@/core/observer'

let relationList: Element
const processed = new WeakSet<Element>()

const observeFans = (node: Element) => {
  // 监听关注列表元素变化
  childList(node, () => {
    // 读取Vue属性里的关注列表
    // eslint-disable-next-line no-underscore-dangle
    const subscribeTime = (
      relationList.parentElement.parentElement.parentElement.parentElement as any
    ).__vue__.relationList.map(l => l.mtime)

    // 为所有子元素添加关注时间显示
    let i = 0
    relationList.querySelectorAll('.list-item>.content').forEach(e => {
      // 防止重复添加元素
      if (!processed.has(e)) {
        e.innerHTML += `<div style="color: #6d757a;position: absolute;margin-top: 5px;font-size: 8px;">关注时间：${new Date(
          subscribeTime[i] * 1000,
        ).toLocaleString()}</div>`
        processed.add(e)
      }
      i++
    })
  })
}
const entry = async () => {
  // 非粉丝/关注页面则不启动
  if (!document.URL.match(/\/\/space\.bilibili\.com\/(\d+)\/fans/)) {
    return
  }
  relationList = dq('.relation-list')
  observeFans(relationList)
}

export const component = defineComponentMetadata({
  name: 'subscribeTimeShow',
  author: {
    name: 'Light_Quanta',
    link: 'https://github.com/LightQuanta',
  },
  displayName: '关注时间显示',
  tags: [componentsTags.utils],
  entry,
  description: {
    'zh-CN': '在粉丝/关注列表显示关注的具体时间',
  },
})
