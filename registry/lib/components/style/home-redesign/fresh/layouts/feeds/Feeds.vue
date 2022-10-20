<template>
  <div class="fresh-home-feeds">
    <div class="fresh-home-header">
      <div class="fresh-home-header-title">动态</div>
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
        <a href="https://www.bilibili.com/video/online.html" target="_blank" title="在线列表">
          <VButton icon>
            <VIcon icon="mdi-account-group-outline" :size="19" />
          </VButton>
        </a>
        <VButton icon title="刷新" @click="reload">
          <VIcon icon="mdi-refresh" :size="18" />
        </VButton>
        <VButton icon title="上一页" @click="$refs.videoList.offsetPage(-1)">
          <VIcon icon="left-arrow" :size="20" />
        </VButton>
        <VButton icon title="下一页" @click="$refs.videoList.offsetPage(1)">
          <VIcon icon="right-arrow" :size="20" />
        </VButton>
        <a
          class="fresh-home-header-icon-button rotate"
          href="https://t.bilibili.com"
          target="_blank"
        >
          <VButton round>
            <VIcon icon="feeds" :size="20" />
            全部动态
          </VButton>
        </a>
      </div>
    </div>
    <div class="fresh-home-feeds-content">
      <VideoList ref="videoList" :videos="videos" :loading="loading" />
    </div>
  </div>
</template>
<script lang="ts">
import { getVideoFeeds } from '@/components/feeds/api'
import { VideoCard } from '@/components/feeds/video-card'
import { ArrayContent } from '@/core/common-types'
import { VButton, VIcon } from '@/ui'
import VideoList from '../../VideoList.vue'

type FeedsApi = () => Promise<VideoCard[]>
const tabs = [
  {
    name: 'videoFeeds',
    displayName: '视频',
    api: getVideoFeeds.bind(undefined, 'video') as FeedsApi,
    href: 'https://t.bilibili.com/?tab=8',
  },
  {
    name: 'bangumiFeeds',
    displayName: '番剧',
    api: getVideoFeeds.bind(undefined, 'bangumi') as FeedsApi,
    href: 'https://t.bilibili.com/?tab=512',
  },
]
type TabType = ArrayContent<typeof tabs>
export default Vue.extend({
  components: {
    VButton,
    VIcon,
    VideoList,
  },
  data() {
    return {
      tabs,
      selectedTab: tabs[0],
      videos: [],
      loading: true,
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
      this.videos = await this.selectedTab.api().finally(() => {
        this.loading = false
      })
    },
  },
})
</script>
<style lang="scss">
@import 'common';

.fresh-home-feeds {
  @include v-stretch();
  &-content {
    flex-grow: 1;
    display: flex;
    margin: -12px;
  }
}
</style>
