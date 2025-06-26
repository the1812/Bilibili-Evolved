import { defineComponentMetadata } from '@/components/define'
import { useScopedConsole } from '@/core/utils/log'

const displayName = '关注时间显示'
const console = useScopedConsole(displayName)

type FollowTimeInfo = {
  mtime: number
  label: string
}

const insertFollowTimeToCard = (mid: number, dateStr: string, label: string): void => {
  const anchor = document.querySelector<HTMLAnchorElement>(
    `.relation-card-info__uname[href*="/${mid}"]`,
  )
  const card = anchor?.closest('.relation-card-info')
  if (!card || card.querySelector('.relation-card-info__time')) {
    return
  }

  const div = document.createElement('div')
  div.className = 'relation-card-info__time'
  div.textContent = `${label}：${dateStr}`

  const sign = card.querySelector('.relation-card-info__sign')
  sign?.parentNode?.insertBefore(div, sign.nextSibling)
}

const midMap: Record<number, FollowTimeInfo> = {}

let fetchWrapped = false
let pendingUpdate = false

const updateCards = (): void => {
  if (pendingUpdate) {
    return
  }
  pendingUpdate = true
  requestAnimationFrame(() => {
    pendingUpdate = false
    const visibleMids = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.relation-card-info__uname'),
    )
      .map(el => el.href.match(/\/(\d+)/)?.[1])
      .filter(Boolean)
      .map(Number)

    for (const mid of visibleMids) {
      const data = midMap[mid]
      if (data) {
        const dateStr = new Date(data.mtime * 1000).toLocaleString()
        insertFollowTimeToCard(mid, dateStr, data.label)
      }
    }
  })
}

const entry = async (): Promise<void> => {
  try {
    const { addImportantStyle } = await import('@/core/style')
    const { default: style } = await import('./subscribe-time.scss')
    addImportantStyle(style, 'subscribe-time-style')
  } catch (e) {
    console.warn('样式加载失败:', e)
  }

  if (fetchWrapped) {
    return
  }
  fetchWrapped = true

  new MutationObserver(updateCards).observe(document.body, {
    childList: true,
    subtree: true,
  })

  const originalFetch = unsafeWindow.fetch
  unsafeWindow.fetch = new Proxy(originalFetch, {
    apply(target, thisArg, args) {
      const [input] = args
      const url = typeof input === 'string' ? input : input.url

      const isFan = url.includes('/x/relation/fans')
      const isFollowing = url.includes('/x/relation/followings')

      if (isFan || isFollowing) {
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

              for (const user of list) {
                if (typeof user.mid === 'number' && typeof user.mtime === 'number') {
                  const label = isFan ? ' Ta 关注你的时间' : '你关注 Ta 的时间'
                  midMap[user.mid] = { mtime: user.mtime, label }

                  const dateStr = new Date(user.mtime * 1000).toLocaleString()
                  insertFollowTimeToCard(user.mid, dateStr, label)
                }
              }
            })
            .catch(err => console.warn('JSON 解析失败:', err))

          return res
        })
      }

      return target.apply(thisArg, args)
    },
  })
}

export const component = defineComponentMetadata({
  name: 'subscribeTimeShow',
  displayName: '关注时间显示',
  author: {
    name: 'CNOCM',
    link: 'https://github.com/CNOCM',
  },
  tags: [componentsTags.utils],
  urlInclude: [/^https:\/\/space\.bilibili\.com\/\d+\/(relation|fans)\/(fans|follow)/],
  entry,
  description: {
    'zh-CN': '在粉丝/关注列表显示关注的具体时间',
  },
})
