<template>
  <div ref="container" class="be-infinite-scroll">
    <div v-for="item of items" :key="keyMapper(item)" class="infinite-scroll-item">
      <slot :item="item">
        {{ item }}
      </slot>
    </div>
    <div ref="scrollTrigger" class="scroll-trigger" :class="{ end }">
      <slot v-if="!end" name="loading"> 加载中... </slot>
      <slot v-else name="end"> 已经到底啦~ </slot>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

/**
 * @deprecated use ScrollTrigger.vue instead.
 */
export default defineComponent({
  name: 'InfiniteScroll',
  props: {
    initialItems: {
      type: Array as PropType<unknown[]>,
      default: () => [],
    },
    fetchData: {
      type: Function as PropType<(page: number) => Promise<any[] | false>>,
      required: true,
    },
    keyMapper: {
      type: Function as PropType<(item: unknown) => string | number>,
      default: () => (item: any) => item,
    },
  },
  emits: ['next-page', 'prev-page'],
  data() {
    return {
      items: [...this.initialItems],
      loadingPromise: null,
      page: 1,
      observer: null,
      end: false,
    }
  },
  mounted() {
    const scrollTrigger = this.$refs.scrollTrigger as HTMLElement
    // const container = this.$refs.container as HTMLElement
    const observer = new IntersectionObserver(
      lodash.debounce(records => {
        if (records.some(r => r.intersectionRatio > 0)) {
          // console.log('observer')
          this.loadNextPage()
        }
      }, 100),
    )
    observer.observe(scrollTrigger)
    this.observer = observer
  },
  methods: {
    async loadNextPage(page: number = this.page) {
      try {
        const func = this.fetchData
        const promise = func(page)
        this.page++
        this.$emit('next-page')
        this.loadingPromise = promise
        const items = await promise
        this.loadingPromise = null
        if (items === false) {
          this.observer && this.observer.disconnect()
          this.end = true
          return
        }
        this.items.push(...items)
        await this.$nextTick()
        const scrollTrigger = this.$refs.scrollTrigger as HTMLElement
        const container = this.$refs.container as HTMLElement
        // console.log(
        //   page,
        //   scrollTrigger.offsetTop,
        //   container.clientHeight + container.offsetTop
        // )
        if (scrollTrigger.offsetTop < container.clientHeight + container.offsetTop) {
          this.loadNextPage()
        }
      } catch (error) {
        console.error(error)
        this.page--
        this.$emit('prev-page')
        this.loadNextPage(page)
      }
    },
  },
})
</script>
<style lang="scss" scoped>
@import './common';
.be-infinite-scroll {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  @include no-scrollbar();
  .infinite-scroll-item {
    @include text-color();
  }
  .scroll-trigger {
    padding: 4px 6px;
    align-self: center;
    color: #888;
  }
}
</style>
