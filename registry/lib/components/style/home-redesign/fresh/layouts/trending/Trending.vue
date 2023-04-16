<template>
  <div class="fresh-home-trending">
    <div class="fresh-home-header">
      <div class="fresh-home-header-title">
        {{ title }}
      </div>
      <div class="fresh-home-header-pagination">
        <VButton icon title="刷新" @click="reload">
          <VIcon icon="mdi-refresh" :size="18" />
        </VButton>
        <VButton icon title="上一页" @click="$refs.videoList.offsetPage(-1)">
          <VIcon icon="left-arrow" :size="20" />
        </VButton>
        <VButton icon title="下一页" @click="$refs.videoList.offsetPage(1)">
          <VIcon icon="right-arrow" :size="20" />
        </VButton>
      </div>
    </div>
    <div class="fresh-home-trending-content">
      <VideoList ref="videoList" :videos="videos" :loading="loading" />
    </div>
  </div>
</template>
<script lang="ts">
import { VButton, VIcon } from '@/ui'
import VideoList from '../../VideoList.vue'
import { freshHomeOptions } from '../../options'
import { getTrendingVideos } from '../../../trending'

export default Vue.extend({
  components: {
    VButton,
    VIcon,
    VideoList,
  },
  data() {
    return {
      videos: [],
      loading: true,
    }
  },
  computed: {
    title() {
      if (freshHomeOptions.personalized) {
        return '推荐'
      }
      return '热门'
    },
  },
  created() {
    this.reload()
  },
  methods: {
    async reload() {
      this.loading = true
      this.videos = []
      this.videos = await getTrendingVideos(freshHomeOptions.personalized).finally(() => {
        this.loading = false
      })
    },
  },
})
</script>
<style lang="scss">
@import 'common';

.fresh-home-trending {
  @include v-stretch();
  &-content {
    flex-grow: 1;
    display: flex;
    margin: -12px;
  }
}
</style>
