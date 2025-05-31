import type { PluginMetadata } from '@/plugins/plugin'

export const plugin: PluginMetadata = {
  name: 'feedsFilter.pluginBlocks.goods',
  displayName: '动态过滤器 - 移除商品带货动态',
  async setup() {
    const { forEachFeedsCard, getVueData } = await import('@/components/feeds/api')
    forEachFeedsCard({
      added: card => {
        const vueData = getVueData(card.element)
        const additionalType: string | null = lodash.get(
          vueData,
          'data.modules.module_dynamic.additional.type',
          null,
        )
        const isGoods = additionalType === 'ADDITIONAL_TYPE_GOODS'
        if (!isGoods) {
          return
        }
        card.element.classList.add('plugin-block')
      },
    })
  },
}
