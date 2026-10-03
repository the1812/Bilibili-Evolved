import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { childListSubtree } from '@/core/observer'
import { addComponentListener, getComponentSettings } from '@/core/settings'
import { select } from '@/core/spin-query'
import { getMatchTerms, isPushed, isRelevant, SearchVideoInfo } from './match'

const name = 'searchResultFilter'
const displayName = '搜索结果过滤'

enum FilterMode {
  Pushed = '仅推送: 只检查非关键词召回的视频',
  Strict = '严格: 每个关键词都要出现',
  Loose = '宽松: 至少出现一个关键词',
}

const options = defineOptionsMetadata({
  mode: {
    displayName: '过滤模式',
    dropdownEnum: FilterMode,
    defaultValue: FilterMode.Pushed,
  },
  matchTag: {
    displayName: '同时匹配视频标签',
    defaultValue: true,
  },
})
export type SearchResultFilterOptions = OptionsOfMetadata<typeof options>

const hiddenClass = 'be-search-filter-hidden'
const showAllClass = 'be-search-filter-show-all'
const counterClass = 'be-search-filter-counter'

/** bvid -> 搜索接口返回的视频信息, 翻页后旧数据会被 store 覆盖, 所以累积缓存 */
const videoInfos = new Map<string, SearchVideoInfo>()
let showAll = false
let stopObserving: (() => void) | undefined

const getSearchState = () => {
  // 搜索页通过 Vue app 暴露 Pinia 实例, 视频数据来自其中的 searchResponse / searchTypeResponse
  for (const element of unsafeWindow.document.querySelectorAll('#app, #i_cecream')) {
    // eslint-disable-next-line no-underscore-dangle
    const state = (element as any).__vue_app__?.config?.globalProperties?.$pinia?.state?.value
    if (state?.searchResponse || state?.searchTypeResponse) {
      return state
    }
  }
  return undefined
}

/** 在 store 中找出所有视频数组 (综合页首屏 / 翻页 / 视频分类页的路径各不相同) */
const collectVideoInfos = (state: unknown) => {
  const walk = (value: unknown, depth: number) => {
    if (!value || typeof value !== 'object' || depth > 6) {
      return
    }
    if (Array.isArray(value)) {
      const [first] = value
      if (first && typeof first === 'object' && 'bvid' in first && 'hit_columns' in first) {
        value.forEach((it: SearchVideoInfo) => it.bvid && videoInfos.set(it.bvid, it))
        return
      }
      value.forEach(it => walk(it, depth + 1))
      return
    }
    Object.values(value).forEach(it => walk(it, depth + 1))
  }
  walk(state, 0)
}

const getKeyword = () => new URLSearchParams(location.search).get('keyword') ?? ''

const getCardBvid = (card: Element) =>
  card
    .querySelector('a[href*="/video/BV"]')
    ?.getAttribute('href')
    ?.match(/\/video\/(BV\w+)/)?.[1]

const updateCounter = (count: number, onToggle: () => void) => {
  let counter = document.querySelector(`.${counterClass}`) as HTMLElement | null
  if (count === 0) {
    counter?.remove()
    return
  }
  const anchor = document.querySelector('.search-page .video-list')
  if (!anchor) {
    return
  }
  if (!counter) {
    counter = document.createElement('div')
    counter.className = counterClass
    counter.addEventListener('click', () => {
      showAll = !showAll
      document.documentElement.classList.toggle(showAllClass, showAll)
      onToggle()
    })
  }
  if (counter.nextElementSibling !== anchor) {
    anchor.before(counter)
  }
  const text = `已过滤 ${count} 条无关视频 · ${showAll ? '重新隐藏' : '临时显示'}`
  if (counter.textContent !== text) {
    counter.textContent = text
  }
}

const update = () => {
  const { options: opt } = getComponentSettings<SearchResultFilterOptions>(name)
  collectVideoInfos(getSearchState())
  const cards = [...document.querySelectorAll('.search-page .video-list .bili-video-card')]
  const infos = cards
    .map(card => videoInfos.get(getCardBvid(card)))
    .filter((it): it is SearchVideoInfo => Boolean(it))
  const matchConfig = {
    requireAll: opt.mode === FilterMode.Strict,
    matchTag: opt.matchTag,
  }
  // 当前页一条都没命中的关键词无法区分相关性 (多半是分词没还原出来), 不参与过滤
  const terms = getMatchTerms(getKeyword(), infos).filter(term =>
    infos.some(info => isRelevant(info, [term], matchConfig)),
  )
  let hiddenCount = 0
  cards.forEach(card => {
    const wrapper = card.parentElement
    const info = videoInfos.get(getCardBvid(card))
    // 拿不到数据 (广告卡片 / 未知结构) 时一律保留, 宁可漏过不可误杀
    const hide =
      Boolean(info) &&
      (opt.mode !== FilterMode.Pushed || isPushed(info)) &&
      !isRelevant(info, terms, matchConfig)
    if (wrapper.classList.contains(hiddenClass) !== hide) {
      wrapper.classList.toggle(hiddenClass, hide)
    }
    if (hide) {
      hiddenCount++
    }
  })
  updateCounter(hiddenCount, update)
}

const unload = () => {
  stopObserving?.()
  stopObserving = undefined
  document.querySelectorAll(`.${hiddenClass}`).forEach(it => it.classList.remove(hiddenClass))
  document.querySelector(`.${counterClass}`)?.remove()
}

const entry = async () => {
  unload()
  // 翻页 / 切换分类时 .search-page 会被整体替换, 需要监听更外层的 .search-content
  const container = await select('.search-content')
  if (!container) {
    return
  }
  let scheduled = false
  const [observer] = childListSubtree(container, () => {
    if (scheduled) {
      return
    }
    scheduled = true
    requestAnimationFrame(() => {
      scheduled = false
      update()
    })
  })
  stopObserving = () => observer.disconnect()
  update()
}

export const component = defineComponentMetadata({
  name,
  displayName,
  author: {
    name: 'Zichao-xu',
    link: 'https://github.com/Zichao-xu',
  },
  tags: [componentsTags.utils],
  options,
  urlInclude: [/^https:\/\/search\.bilibili\.com\/(all|video)/],
  instantStyles: [
    {
      name,
      style: () => import('./search-result-filter.scss'),
    },
  ],
  entry: async () => {
    await entry()
    addComponentListener(`${name}.mode`, update)
    addComponentListener(`${name}.matchTag`, update)
  },
  reload: entry,
  unload,
})
