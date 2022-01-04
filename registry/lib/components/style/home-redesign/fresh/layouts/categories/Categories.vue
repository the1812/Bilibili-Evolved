<template>
  <div class="fresh-home-categories">
    <div class="fresh-home-header">
      <div class="fresh-home-header-title">
        分区
      </div>
      <div class="fresh-home-header-center-area">
        <div class="fresh-home-header-tabs">
          <div class="default-tabs">
            <div
              v-for="t of tabs"
              :key="t.name"
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
        <VButton icon title="排序">
          <VIcon icon="mdi-swap-horizontal" :size="18" />
        </VButton>
      </div>
    </div>
    <div class="fresh-home-categories-content">
      content
    </div>
  </div>
</template>
<script lang="ts">
import { categories } from '@/components/utils/categories/data'
import { ArrayContent } from '@/core/common-types'
import { VButton, VIcon } from '@/ui'

const tabs = Object.entries(categories).map(([name, category]) => ({
  id: category.code as number,
  name,
  displayName: name,
  category,
  href: category.link,
}))
type TabType = ArrayContent<typeof tabs>
export default Vue.extend({
  components: {
    VButton,
    VIcon,
  },
  data() {
    return {
      tabs,
      selectedTab: tabs[0],
      loading: true,
      videos: [],
      rankVideos: [],
    }
  },
  created() {
    this.reload()
  },
  methods: {
    selectTab(tab: TabType) {
      if (this.selectedTab === tab) {
        window.open(tab.href, '_blank')
        return
      }
      this.selectedTab = tab
      this.reload()
    },
    async reload() {
      this.loading = true
      this.videos = []
      this.videos = await this.selectedTab.api().finally(() => { this.loading = false })
    },
  },
})
</script>
<style lang="scss">
@import "common";

.fresh-home-categories {
  @include v-stretch();
  &-content {

  }
}
</style>
