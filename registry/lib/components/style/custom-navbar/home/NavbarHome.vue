<template>
  <div class="home-popup" role="list">
    <div
      v-for="[name, data] of Object.entries(categories)"
      :key="name"
      role="listitem"
      class="category-item"
      :class="{ main: data.code !== null }"
    >
      <a :href="data.link" target="_blank">
        <svg aria-hidden="true">
          <use
            :href="'#header-icon-' + data.icon"
            :xlink:href="'#header-icon-' + data.icon"
          />
        </svg>
        <div class="name">{{ name }}</div>
        <span class="count">
          <template v-if="data.count !== null">{{ data.count }}</template>
        </span>
      </a>
      <div v-if="data.subRegions" class="sub-regions-popup popup">
        <a
          v-for="[regionName, url] of Object.entries(data.subRegions)"
          :key="regionName"
          class="sub-region"
          :href="url"
          target="_blank"
        >{{ regionName }}</a>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { popperMixin } from '../mixins'
import { categories } from './categories'

const clone = lodash.cloneDeep(categories)
Object.values(clone).forEach((data: any) => {
  data.count = null
})
let regionCountFetched = false
export default Vue.extend({
  mixins: [popperMixin],
  data() {
    return {
      categories: clone,
    }
  },
  async created() {
    if (regionCountFetched) {
      return
    }
    regionCountFetched = true
    const { bilibiliApi, getJson } = await import('@/core/ajax')
    const { addCategoryIcons } = await import('./category-icons')
    addCategoryIcons()
    const { region_count = {} } = await bilibiliApi(
      getJson('https://api.bilibili.com/x/web-interface/online'),
      '[自定义顶栏] 分区投稿信息获取失败',
    )
    Object.values(this.categories).forEach((data: any) => {
      if (data.code) {
        if (Array.isArray(data.code)) {
          data.count = lodash.sum(data.code.map(c => region_count[c]))
        } else {
          data.count = region_count[data.code]
        }
      }
    })
  },
})
</script>
<style lang="scss">
@import '../nav-link';
.custom-navbar .home-popup {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  width: 350px;

  .category-item {
    border-radius: 8px;
    font-size: 12pt;
    padding: 8px 16px;
    cursor: pointer;
    position: relative;
    box-sizing: border-box;
    &.loading {
      font-size: 10pt;
      cursor: initial;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    &:not(.loading):hover {
      background-color: #8882;
    }
    a {
      display: flex;
      justify-content: space-between;
      align-items: center;
      &.sub-region {
        @include nav-link();
      }
    }
    svg {
      width: 25px;
      height: 25px;
      fill: currentColor;
      margin-right: 10px;
    }
    .name {
      flex: 1 0 auto;
    }
    &.main {
      min-width: 150px;
    }
    .sub-regions-popup {
      z-index: 10002;
      width: max-content;
      transform: scaleX(0);
      transform-origin: left;
      padding: 8px;
      left: 100%;
      top: 0;
      transition-delay: 0.3s;
      pointer-events: initial;
    }
    &:hover .sub-regions-popup {
      transform: scaleX(1);
      opacity: 1;
    }
    .count {
      opacity: 0.5;
    }
  }
  @media screen and (min-height: 1000px) {
    & {
      flex-wrap: nowrap;
      width: 250px;
    }
  }
}
</style>
