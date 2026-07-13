<template>
  <HomeRedesignBase>
    <div class="search-home" :style="pageStyle">
      <div class="search-home-bar">
        <LaunchBar />
      </div>
    </div>
  </HomeRedesignBase>
</template>
<script lang="ts">
import { addComponentListener, removeComponentListener } from '@/core/settings'
import LaunchBar from '@/components/launch-bar/LaunchBar.vue'
import HomeRedesignBase from '../HomeRedesignBase.vue'
import { getSearchHomeOptions } from './options'

export default Vue.extend({
  components: {
    HomeRedesignBase,
    LaunchBar,
  },
  data() {
    return {
      backgroundColor: '#ffffff',
      backgroundImageUrl: '',
    }
  },
  computed: {
    pageStyle(): Record<string, string> {
      const style: Record<string, string> = {
        backgroundColor: this.backgroundColor || '#ffffff',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
      }
      if (this.backgroundImageUrl) {
        style.backgroundImage = `url(${JSON.stringify(this.backgroundImageUrl)})`
      } else {
        style.backgroundImage = 'none'
      }
      return style
    },
  },
  created() {
    this.syncBackground()
    addComponentListener('searchHome.backgroundColor', this.syncBackground)
    addComponentListener('searchHome.backgroundImage', this.syncBackground)
  },
  beforeDestroy() {
    removeComponentListener('searchHome.backgroundColor', this.syncBackground)
    removeComponentListener('searchHome.backgroundImage', this.syncBackground)
  },
  methods: {
    syncBackground() {
      const options = getSearchHomeOptions()
      this.backgroundColor = options.backgroundColor || '#ffffff'
      this.backgroundImageUrl = options.backgroundImage?.url?.trim() || ''
    },
  },
})
</script>
<style lang="scss">
@import 'common';

// 让首页改造容器铺满视口并使用子元素背景
.home-redesign-base:has(.search-home) {
  background-color: transparent !important;
  align-self: stretch;
  width: 100%;
  min-height: 100vh;
}

.search-home {
  flex-grow: 1;
  width: 100%;
  min-height: 100vh;
  padding: 24px 16px 48px;
  box-sizing: border-box;
  @include v-center();
  justify-content: center;

  &-bar {
    width: min(640px, 92vw);

    .launch-bar {
      font-size: 16px;
      padding: 10px 16px;
      border-radius: 24px;
      border: 1px solid #8884;
      background-color: rgba(255, 255, 255, 0.92);
      box-shadow: var(--home-card-shadow, 0 4px 12px 0 rgba(0, 0, 0, 0.05));
      transition: border-color 0.2s ease-out, box-shadow 0.2s ease-out;

      body.dark & {
        background-color: rgba(40, 40, 40, 0.92);
        color: #eee;
      }

      &:hover,
      &:focus-within {
        border-color: var(--theme-color, #00a1d6);
        box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08);
      }

      .input-area .launch-bar-form .input {
        width: 100%;
        padding: 10px 8px;
        font-size: 16px;
      }

      .launch-bar-suggest-list {
        margin-top: 8px;
        border-radius: 12px;
      }
    }
  }
}
</style>
