import { defineComponentMetadata } from '@/components/define'
import { useScopedConsole } from '@/core/utils/log'
import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'

const displayName = '关注时间显示'
const console = useScopedConsole(displayName)

const SELECTORS = {
  profileFollowContainer: '.space-head-follow.b-follow',
  profileTextClass: 'subscribe-time-text',
  relationCardAnchor: '.relation-card-info__uname',
  relationCardContainer: '.relation-card-info',
  relationCardTimeClass: 'relation-card-info__time',
  relationCardSign: '.relation-card-info__sign',
}

type FollowTimeInfo = {
  mtime: number
  label: string
}

const midMap: Record<number, FollowTimeInfo> = {}

const insertFollowTimeToCard = (mid: number, dateStr: string, label: string) => {
  const anchor = document.querySelector<HTMLAnchorElement>(
    `${SELECTORS.relationCardAnchor}[href*="/${mid}"]`,
  )
  const card = anchor?.closest(SELECTORS.relationCardContainer)
  if (!card) {
    return
  }
  if (card.querySelector(`.${SELECTORS.relationCardTimeClass}`)) {
    return
  }

  const div = document.createElement('div')
  div.className = SELECTORS.relationCardTimeClass
  div.textContent = `${label}：${dateStr}`

  const sign = card.querySelector(SELECTORS.relationCardSign)
  if (sign?.parentNode) {
    sign.parentNode.insertBefore(div, sign.nextSibling)
  }
}

let fetchWrapped = false
let pendingUpdate = false

const updateCards = () => {
  if (pendingUpdate) {
    return
  }
  pendingUpdate = true
  requestAnimationFrame(() => {
    pendingUpdate = false
    const mids = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(SELECTORS.relationCardAnchor),
    )
      .map(el => el.href.match(/\/(\d+)/)?.[1])
      .filter(Boolean)
      .map(Number)

    mids.forEach(mid => {
      const data = midMap[mid]
      if (data) {
        const dateStr = new Date(data.mtime * 1000).toLocaleString()
        insertFollowTimeToCard(mid, dateStr, data.label)
      }
    })
  })
}

const waitForProfileContainer = () =>
  new Promise<Element>(resolve => {
    const check = () => document.querySelector(SELECTORS.profileFollowContainer)
    let container = check()
    if (container) {
      resolve(container)
    } else {
      const observer = new MutationObserver(() => {
        container = check()
        if (container) {
          observer.disconnect()
          resolve(container)
        }
      })
      observer.observe(document.body, { childList: true, subtree: true })
    }
  })

const insertSubscribeTime = (followTimeStr: string) => {
  const container = document.querySelector(SELECTORS.profileFollowContainer)
  if (!container) {
    return
  }
  if (container.querySelector(`.${SELECTORS.profileTextClass}`)) {
    return
  }

  if (getComputedStyle(container).position === 'static') {
    ;(container as HTMLElement).style.position = 'relative'
  }

  const infoEl = document.createElement('div')
  infoEl.className = SELECTORS.profileTextClass
  infoEl.textContent = `关注于 ${followTimeStr}`
  container.appendChild(infoEl)
}

const entry = async () => {
  try {
    const { addImportantStyle } = await import('@/core/style')
    const { default: style } = await import('./subscribe-time.scss')
    addImportantStyle(style, 'subscribe-time-style')
  } catch (e) {
    console.error('样式加载失败:', e)
  }

  new MutationObserver(updateCards).observe(document.body, { childList: true, subtree: true })

  if (!fetchWrapped) {
    fetchWrapped = true
    const originalFetch = unsafeWindow.fetch
    unsafeWindow.fetch = new Proxy(originalFetch, {
      apply(target, thisArg, args) {
        const url = typeof args[0] === 'string' ? args[0] : args[0].url
        if (url.includes('/x/relation/fans') || url.includes('/x/relation/followings')) {
          return target.apply(thisArg, args).then(res => {
            res
              .clone()
              .json()
              .then(json => {
                const list = json?.data?.list
                if (!Array.isArray(list)) {
                  console.warn('接口数据结构异常:', json)
                  return
                }
                list.forEach(user => {
                  if (typeof user.mid === 'number' && typeof user.mtime === 'number') {
                    const label = url.includes('/x/relation/fans')
                      ? 'Ta 关注你的时间'
                      : '你关注 Ta 的时间'
                    midMap[user.mid] = { mtime: user.mtime, label }
                    insertFollowTimeToCard(
                      user.mid,
                      new Date(user.mtime * 1000).toLocaleString(),
                      label,
                    )
                  }
                })
              })
              .catch(err => console.warn('JSON 解析失败:', err))
            return res
          })
        }
        return target.apply(thisArg, args)
      },
    })
  }

  const match = location.href.match(/space\.bilibili\.com\/(\d+)/)
  if (!match) {
    console.warn('无法提取 mid')
    return
  }
  const mid = Number(match[1])

  const info = await bilibiliApi(
    getJsonWithCredentials(`https://api.bilibili.com/x/web-interface/relation?mid=${mid}`),
  )
  if (!info?.relation) {
    console.warn('未获取到 relation 信息')
    return
  }
  if (!info.relation.mtime) {
    console.log('当前未关注或关注时间无效')
    return
  }

  try {
    await waitForProfileContainer()
  } catch (e) {
    console.warn('等待关注容器超时，跳过插入关注时间')
    return
  }

  insertSubscribeTime(new Date(info.relation.mtime * 1000).toLocaleString())
}

export const component = defineComponentMetadata({
  name: 'subscribeTimeShow',
  displayName: '关注时间显示',
  author: {
    name: 'CNOCM',
    link: 'https://github.com/CNOCM',
  },
  tags: [componentsTags.utils],
  urlInclude: [
    /^https:\/\/space\.bilibili\.com\/\d+\/(relation|fans)\/(fans|follow)/,
    /https:\/\/space\.bilibili\.com\/\d+/,
  ],
  entry,
  description: { 'zh-CN': '在粉丝/关注列表及用户主页显示关注的具体时间。' },
})
