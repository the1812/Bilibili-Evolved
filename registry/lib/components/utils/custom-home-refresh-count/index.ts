import { defineComponentMetadata } from '@/components/define'
import { select } from '@/core/spin-query'

interface RecommendParams {
  fresh_type?: number
  fetch_row?: number
  ps?: number
}
interface FeedStore {
  homeVersion: string
  getRecommend: (...args: unknown[]) => unknown
  $onAction: (
    listener: (action: { name: string; args: RecommendParams[] }) => void,
    detached: boolean,
  ) => () => void
}

const className = 'be-custom-home-refresh-count'
let generation = 0
let unsubscribe: (() => void) | undefined
let getCount = () => 15

const findStore = (): FeedStore | undefined => {
  if (!document.querySelector('.recommended-container_floor-aside > .container')) {
    return undefined
  }
  // The production homepage exposes its Pinia instance through the Vue app.
  // eslint-disable-next-line no-underscore-dangle
  const provides = (unsafeWindow.document.querySelector('#app') as any)?.__vue_app__?._context
    ?.provides
  if (!provides) {
    return undefined
  }
  for (const key of Reflect.ownKeys(provides)) {
    // eslint-disable-next-line no-underscore-dangle
    const store = provides[key]?._s?.get?.('feed') as FeedStore | undefined
    if (
      store?.homeVersion === 'V8' &&
      typeof store.$onAction === 'function' &&
      typeof store.getRecommend === 'function'
    ) {
      return store
    }
  }
  return undefined
}

const unload = () => {
  generation++
  unsubscribe?.()
  unsubscribe = undefined
  document.documentElement.classList.remove(className)
}

const reload = async () => {
  unload()
  const currentGeneration = generation
  const store = await select(findStore)
  if (!store || currentGeneration !== generation) {
    return
  }
  unsubscribe = store.$onAction(({ name, args }) => {
    const params = args[0]
    // Only the native top refresh action: leave initial and infinite feeds alone.
    if (name !== 'getRecommend' || params?.fresh_type !== 3 || params.fetch_row !== 1) {
      return
    }
    const count = Number(getCount())
    if (!Number.isSafeInteger(count) || count < 1) {
      return
    }
    // Pinia dispatches this callback before the action and its WBI middleware.
    args[0] = { ...params, ps: count }
    document.documentElement.classList.add(className)
  }, true)
}

export const component = defineComponentMetadata({
  name: 'customHomeRefreshCount',
  displayName: '自定义首页换一换数量',
  entry: async ({ settings }) => {
    getCount = () => settings.options.count
    await reload()
  },
  reload,
  unload,
  urlInclude: [/^https:\/\/www\.bilibili\.com\/(?:index\.html)?(?:[?#].*)?$/],
  instantStyles: [
    {
      name: 'customHomeRefreshCount',
      style: () => import('./refresh-count.scss'),
    },
  ],
  options: {
    count: {
      displayName: '每批推荐条目数量',
      defaultValue: 15,
      validator: (value: number, oldValue: number) => {
        const count = Number(value)
        return Number.isSafeInteger(count) && count >= 1 ? count : oldValue
      },
    },
  },
  tags: [componentsTags.utils],
  author: {
    name: 'ChiyukiKazama',
    link: 'https://github.com/ChiyukiKazama',
  },
})
