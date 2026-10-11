<template>
  <div class="fresh-home-categories">
    <div class="fresh-home-header">
      <div class="fresh-home-header-title">分区</div>
      <div class="fresh-home-header-center-area">
        <div class="fresh-home-header-tabs">
          <div ref="tabs" class="default-tabs">
            <div
              v-for="t of tabs"
              :key="t.name"
              :data-name="t.name"
              class="default-tab"
              :class="{ selected: t === selectedTab }"
              @click="selectTab(t)"
            >
              <div class="default-tab-name">
                {{ t.displayName }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="fresh-home-header-pagination">
        <VButton v-if="isReordering" icon title="完成排序" @click="toggleReorder">
          <VIcon icon="mdi-check" :size="18" />
        </VButton>
        <VButton v-else icon title="排序" @click="toggleReorder">
          <VIcon icon="mdi-swap-horizontal" :size="18" />
        </VButton>
      </div>
    </div>
    <div class="fresh-home-categories-content">
      <component :is="content" :region="selectedTab" />
    </div>
  </div>
</template>
<script lang="ts">
import { ArrayContent } from '@/core/common-types'
import { Reorder, ReorderOrientations } from '@/core/reorder'
import { ascendingSort } from '@/core/utils/sort'
import { VButton, VIcon } from '@/ui'
import { freshHomeOptions } from '../../options'
import { linkOnlyNames, supportedCategories } from './filter'
import { getContent } from './content/content'

const tabs = Object.entries(supportedCategories).map(([name, category]) => ({
  id: category.code as number,
  name,
  displayName: name,
  category,
  href: category.link,
  linkOnly: linkOnlyNames.includes(name),
}))
type TabType = ArrayContent<typeof tabs>
export default Vue.extend({
  components: {
    VButton,
    VIcon,
  },
  data() {
    const orderMap = (freshHomeOptions.categoriesOrder ?? {}) as Record<string, number>
    const orderedTabs = [...tabs].sort(ascendingSort(t => orderMap[t.name]))
    const firstSelectable = orderedTabs.find(t => !t.linkOnly) ?? orderedTabs[0]
    return {
      tabs: orderedTabs,
      isReordering: false,
      reorder: null,
      selectedTab: firstSelectable,
      content: getContent(firstSelectable.name),
    }
  },
  mounted() {
    const tabsContainer = this.$refs.tabs as HTMLElement
    const reorder = new Reorder(tabsContainer)
    reorder.orientation = ReorderOrientations.grid
    reorder.addEventListener('reorder', ({ detail: items }) => {
      const newOrder = Object.fromEntries(
        items.map(it => {
          const name = it.element.getAttribute('data-name') as string
          return [name, it.order]
        }),
      )
      console.log(items, newOrder)
      freshHomeOptions.categoriesOrder = newOrder
    })
    this.reorder = reorder
  },
  methods: {
    toggleReorder() {
      this.reorder.toggle()
      this.isReordering = this.reorder.enabled
    },
    selectTab(tab: TabType) {
      if (this.isReordering) {
        return
      }
      // 无内容流的页面入口直接打开链接
      if (tab.linkOnly || this.selectedTab === tab) {
        window.open(tab.href, '_blank')
        return
      }
      this.selectedTab = tab
      this.content = getContent(tab.name)
    },
  },
})
</script>
<style lang="scss">
@import 'common';

.fresh-home-categories {
  @include v-stretch();
  --fresh-home-categories-column-gap: 28px;
  --fresh-home-categories-header-gap: 12px;
  &-content {
    font-size: 14px;
  }
}
</style>
