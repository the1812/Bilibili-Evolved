import { defineComponentMetadata } from '@/components/define'
import { feedsCardsManager } from '@/components/feeds/api'
import { feedsFilterPlugin } from './plugin'
import { type FeedsFilterOptions, options } from './options'
import { ComponentEntry } from '@/components/types'
import { addComponentListener } from '@/core/settings'

const entry: ComponentEntry<FeedsFilterOptions> = async ({ metadata }) => {
  const { select } = await import('@/core/spin-query')
  let leftPanel: HTMLElement
  if (feedsCardsManager.managerType === 'v2') {
    const leftAside = await select('.bili-dyn-home--member aside.left')
    const section = document.createElement('section')
    section.classList.add('feeds-filter-section')
    leftAside.insertAdjacentElement('afterbegin', section)
    leftPanel = section
  } else {
    leftPanel = await select('.home-container .left-panel')
  }
  if (leftPanel === null) {
    return
  }
  const FeedsFilterCard = await import('./FeedsFilterCard.vue')
  const { mountVueComponent } = await import('@/core/utils')
  leftPanel.insertAdjacentElement('afterbegin', mountVueComponent(FeedsFilterCard).$el)
  addComponentListener(
    `${metadata.name}.showInFeedsHome`,
    async (value: boolean) => {
      document.body.classList.toggle('disable-feeds-filter-card', !value)
    },
    true,
  )
}

export const component = defineComponentMetadata({
  name: 'feedsFilter',
  displayName: '动态过滤器',
  entry,
  tags: [componentsTags.feeds],
  options,
  reload: () => document.body.classList.remove('disable-feeds-filter'),
  unload: () => document.body.classList.add('disable-feeds-filter'),
  extraOptions: async () => {
    const FeedsFilterCard = await import('./FeedsFilterCard.vue')
    return Vue.extend({
      render(h) {
        return h(FeedsFilterCard.default, {
          props: {
            contentsOnly: true,
          },
        })
      },
    })
  },
  urlInclude: [
    // 仅动态首页
    /^https:\/\/t\.bilibili\.com\/$/,
  ],
  plugin: feedsFilterPlugin,
})
