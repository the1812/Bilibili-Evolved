import { defineComponentMetadata } from '@/components/define'
import { styledComponentEntry } from '@/components/styled-component'

interface LiveInfo {
  cover: string
  face: string
  uname: string
  title: string
  roomid: number
  pic: string
  online: number
  link: string
}
const entry = async () => {
  const { select } = await import('@/core/spin-query')
  const liveList = (await select('.live-up-list, .bili-dyn-live-users__body')) as HTMLElement
  if (liveList === null) {
    return
  }
  const pageSize = 24
  const { getPages, getJsonWithCredentials } = await import('@/core/ajax')
  const fullList: LiveInfo[] = await getPages({
    api: page =>
      getJsonWithCredentials(
        `https://api.live.bilibili.com/relation/v1/feed/feed_list?page=${page}&pagesize=${pageSize}`,
      ),
    getList: json => lodash.get(json, 'data.list', []),
    getTotal: json => lodash.get(json, 'data.results', 0),
  })
  const upNameSelector = '.up-name, .bili-dyn-live-users__item__uname'
  const liveListNames = dqa(liveList, upNameSelector)
  const presentedNames = liveListNames.map((it: HTMLElement) => it.innerText.trim())
  // const presentedNames = []
  const presented = fullList.filter(it => presentedNames.includes(it.uname))
  const extend = fullList.filter(it => !presentedNames.includes(it.uname))

  const liveDetailItem = liveList.children[0] as HTMLElement
  extend.forEach(it => {
    const existingNames = dqa(liveList, upNameSelector) as HTMLElement[]
    if (existingNames.some(n => n.innerText.trim() === it.uname)) {
      return
    }
    const cloneItem = (() => {
      const clone = liveDetailItem.cloneNode(true) as HTMLElement
      const url = `https://live.bilibili.com/${it.roomid}`
      dqa(clone, 'a[href]').forEach(a => a.setAttribute('href', url))
      if (clone.matches('.bili-dyn-live-users__item')) {
        clone.addEventListener('click', () => {
          window.open(url, '_blank')
        })
      }
      const face = dq(
        clone,
        '.live-up-img, .bili-dyn-live-users__item__face, .bili-awesome-img',
      ) as HTMLElement
      face.style.backgroundImage = `url(${it.face})`
      face.style.backgroundSize = 'cover'
      const facepic = dq(clone, '.b-img--face') as HTMLElement
      facepic.style.visibility = 'hidden'
      const title = dq(clone, '.live-name, .bili-dyn-live-users__item__title') as HTMLElement
      title.innerHTML = it.title
      title.title = it.title
      const name = dq(clone, upNameSelector) as HTMLElement
      name.innerHTML = it.uname
      name.title = it.uname
      return clone
    })()
    liveList.insertAdjacentElement('beforeend', cloneItem)
  })
  const { disableProfilePopup } = await import('@/components/feeds/disable-profile-popup')
  disableProfilePopup()
  console.log(presented, extend)
}

export const component = defineComponentMetadata({
  name: 'extendFeedsLive',
  displayName: '直播信息扩充',
  description: {
    'zh-CN': '在动态的`正在直播`中, 为每一个直播间加上标题, 并且能够显示超过10个的直播间.',
  },
  entry: styledComponentEntry(() => import('./extend-feeds-live.scss'), entry),
  tags: [componentsTags.feeds, componentsTags.live],
  urlInclude: [/^https:\/\/t\.bilibili\.com\/$/],
})
