import type { PluginMetadata } from '@/plugins/plugin'

export const plugin: PluginMetadata = {
  name: 'feedsFilter.pluginBlocks.chargeFeeds',
  displayName: '动态过滤器 - 移除充电专属动态',
  async setup() {
    const { getVue2Data } = await import('@/core/utils')
    const { forEachFeedsCard } = await import('@/components/feeds/api')
    forEachFeedsCard({
      added: card => {
        const vueData = getVue2Data(card.element)

        const isBlockedByCharge =
          lodash.get(vueData, 'data.modules.module_dynamic.major.blocked.blocked_type', null) === 3
        const isChargedVideo =
          lodash.get(vueData, 'data.modules.module_dynamic.major.archive.badge.text', null) ===
          '充电专属'
        const isChargedCommonCard =
          lodash.get(vueData, 'data.modules.module_dynamic.major.type', null) ===
          'MAJOR_TYPE_UPOWER_COMMON'

        if (isBlockedByCharge || isChargedVideo || isChargedCommonCard) {
          return
        }

        card.element.classList.add('plugin-block')
      },
    })
  },
}
