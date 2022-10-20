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
          <use :href="'#header-icon-' + data.icon" :xlink:href="'#header-icon-' + data.icon" />
        </svg>
        <div class="name">{{ name }}</div>
        <span class="count">
          <template v-if="data.count !== null">{{ data.count }}</template>
        </span>
      </a>
      <div v-if="data.subCategories" class="sub-regions-popup popup">
        <a
          v-for="[regionName, url] of Object.entries(data.subCategories)"
          :key="regionName"
          class="sub-region"
          :href="url"
          target="_blank"
          >{{ regionName }}</a
        >
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { categories, Category } from '@/components/utils/categories/data'
import { popperMixin } from '../mixins'

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
    const { addCategoryIcons } = await import('@/components/utils/categories/data')
    addCategoryIcons()
    const { region_count = {} } = await bilibiliApi(
      getJson('https://api.bilibili.com/x/web-interface/online'),
      '[自定义顶栏] 分区投稿信息获取失败',
    )
    Object.values(this.categories).forEach((data: Category) => {
      if (data.code) {
        if (Array.isArray(data.code)) {
          data.count = lodash.sum(data.code.map(c => region_count[c]))
        } else {
          data.count = region_count[data.code]
        }
      }
    })
  },
  mounted() {
    // 火狐浏览器似乎无法按预期地计算 NavbarHome 外层容器的大小
    // 通过某些方法迫使其重新计算似乎就能得到正确的值。如这里的方法，以及改变视口大小等
    // 上述结论来自实验，其原理未知
    this.$el.style.maxHeight = 'inherit'
    this.$nextTick(() => {
      this.$el.style.maxHeight = ''
    })
  },
})
</script>
<style lang="scss">
@import '../nav-link';
.custom-navbar .home-popup {
  max-height: 75vh;
  display: flex;
  flex-wrap: wrap;

  // flex 布局纵向排列换行无法撑开父元素的水平长度（浏览器 bug），用此方式绕过
  // 相关链接：
  // 1. https://www.cnblogs.com/ccti7/p/14687477.html
  // 2. https://stackoverflow.com/a/41209546/13860169
  // 3. https://stackoverflow.com/a/33899301/13860169
  flex-direction: row;
  writing-mode: vertical-lr;
  & > * {
    writing-mode: horizontal-tb;
  }

  .category-item {
    border-radius: 8px;
    font-size: 12pt;
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
      padding: 8px;
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
      padding: 6px;
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
      font-size: 14px;
    }
  }
}
</style>
