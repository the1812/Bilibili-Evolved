import { defineComponentMetadata } from '@/components/define'
import { feedsCardsManager } from '@/components/feeds/api'

const entry = async () => {
  const { select } = await import('@/core/spin-query')
  let leftPanel: HTMLElement
  if (feedsCardsManager.managerType === 'v2') {
    const leftAside = await select('.bili-dyn-home--member aside.left')
    const section = document.createElement('section')
    section.classList.add('group-filter-section')
    leftAside.insertAdjacentElement('afterbegin', section)
    leftPanel = section
  } else {
    leftPanel = await select('.home-container .left-panel')
  }
  if (leftPanel === null) {
    return
  }
  const FilterPanel = await import('./FilterPanel.vue')
  const { mountVueComponent } = await import('@/core/utils')
  leftPanel.insertAdjacentElement('afterbegin', mountVueComponent(FilterPanel).$el)
}

export const component = defineComponentMetadata({
  name: 'feedsGroupFilter',
  entry,
  displayName: '动态分组过滤',
  author: { name: 'Rinne', link: 'https://github.com/OharaRinneY' },
  urlInclude: [
    // 仅动态首页
    /^https:\/\/t\.bilibili\.com\/$/,
  ],
  tags: [componentsTags.feeds],
})
