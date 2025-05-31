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
        const blockedType: number | null = lodash.get(
          vueData,
          'data.modules.module_dynamic.major.blocked.blocked_type',
          null,
        )
        const isBlockedByCharge = blockedType === 3
        if (!isBlockedByCharge) {
          return
        }
        card.element.classList.add('plugin-block')
      },
    })
  },
}
