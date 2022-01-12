<template>
  <div
    class="fresh-home-categories-default"
  >
    <div class="fresh-home-categories-default-video-column">
      <div class="fresh-home-categories-default-video-column-item">
        <SubHeader>
          有新动态
        </SubHeader>
        <VideoSlides :api="activeVideosApi" />
      </div>
      <div class="fresh-home-categories-default-video-column-item">
        <SubHeader>
          最新发布
        </SubHeader>
        <VideoSlides :api="newVideosApi" />
      </div>
    </div>
    <div class="fresh-home-categories-default-rank-list">
      <a href="" target="_blank">
        <SubHeader>
          排行榜
        </SubHeader>
      </a>
      <RankList :api="rankingsApi" />
    </div>
  </div>
</template>
<script lang="ts">
import RankList from './RankList.vue'
import VideoSlides from './VideoSlides.vue'
import SubHeader from '../../../SubHeader.vue'

export default Vue.extend({
  components: {
    RankList,
    VideoSlides,
    SubHeader,
  },
  props: {
    regionCode: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      activeVideosApi: `https://api.bilibili.com/x/web-interface/dynamic/region?ps=10&rid=${this.regionCode}`,
      newVideosApi: `https://api.bilibili.com/x/web-interface/newlist?ps=10&rid=${this.regionCode}`,
      rankingsApi: `https://api.bilibili.com/x/web-interface/ranking/region?rid=${this.regionCode}&day=3&original=0`,
    }
  },
})
</script>
<style lang="scss">
@import "common";

.fresh-home-categories-default {
  @include h-stretch(28px);

  &-video-column {
    @include v-stretch(16px);
    flex: 1;
    &-item {
      @include v-stretch(12px);
    }
  }
  &-rank-list {
    @include v-stretch(12px);
  }
}
</style>
