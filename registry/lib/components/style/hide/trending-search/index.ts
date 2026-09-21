import { defineComponentMetadata } from '@/components/define'
import { mutationObserve } from '@/core/observer'
import { select } from '@/core/spin-query'

const DEFAULT_TEXT = '搜索'

// 主站搜索框为 .nav-search-input, 直播间为 .nav-search-content
const searchInputSelector = 'input.nav-search-input, input.nav-search-content'
// 搜索按钮: 主站为 .nav-search-btn, 直播间为 .search-btn
const searchButtonSelector = '.nav-search-btn, .search-btn'
// 空关键词搜索时的跳转目标, 直播间跳搜索页的直播分区
const searchHomeUrl = 'https://search.bilibili.com/all'
const liveSearchUrl = 'https://search.bilibili.com/live'

const resetInput = (input: HTMLInputElement) => {
  if (input.placeholder !== DEFAULT_TEXT) {
    input.placeholder = DEFAULT_TEXT
  }
  if (input.value === '' && input.title !== DEFAULT_TEXT) {
    input.title = DEFAULT_TEXT
  }
}

const redirectEmptySearch = (input: HTMLInputElement) => {
  const form = input.closest<HTMLFormElement>('#nav-searchform')
  if (!form) {
    return
  }
  const searchUrl = window.location.host === 'live.bilibili.com' ? liveSearchUrl : searchHomeUrl
  const redirectIfEmpty = (event: Event) => {
    if (input.value.trim() !== '') {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    window.open(searchUrl)
  }
  form.addEventListener('submit', redirectIfEmpty, true)
  form.addEventListener(
    'keydown',
    event => {
      if (event.key === 'Enter') {
        redirectIfEmpty(event)
      }
    },
    true,
  )
  form.addEventListener(
    'click',
    event => {
      if (event.target instanceof Element && event.target.closest(searchButtonSelector)) {
        redirectIfEmpty(event)
      }
    },
    true,
  )
}

export const component = defineComponentMetadata({
  name: 'hideTrendingSearch',
  displayName: '隐藏热搜',
  tags: [componentsTags.style],
  instantStyles: [
    {
      name: 'hideTrendingSearch',
      style: () => import('./hide-trending-search.scss'),
    },
  ],
  entry: async () => {
    const input = await select<HTMLInputElement>(searchInputSelector, { queryInterval: 500 })
    if (!input) {
      return
    }
    mutationObserve([input], { attributes: true, attributeFilter: ['placeholder', 'title'] }, () =>
      resetInput(input),
    )
    redirectEmptySearch(input)
  },
})
