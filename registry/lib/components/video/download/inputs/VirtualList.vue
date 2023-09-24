<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

type PropsType = {
  items: any[]
  itemHeight: number
  stageItemCount?: number // 容器容纳的列表项数量
  bufferItemCount?: number // 边缘预留缓冲的列表项数量
  updateRequiredItemCount?: number // 缓冲列表项低于此数时触发更新
  focuseItemIndex?: number // 初始聚焦的列表项
}

const props = withDefaults(defineProps<PropsType>(), {
  stageItemCount: 50,
  bufferItemCount: 5,
  updateRequiredItemCount: 5,
  focuseItemIndex: 0
})

const container = ref<HTMLDivElement>()
const stageHeight = computed(() => props.stageItemCount * props.itemHeight)
const clientHeight = computed(() => container.value?.clientHeight ?? 0)
const scrollHeight = computed(() => container.value?.scrollHeight ?? 0)

const ptr = ref(0)
const appendPaddingTop = computed(() => ptr.value * props.itemHeight)
const appendPaddingBottom = computed(() => (props.items.length - ptr.value - props.stageItemCount) * props.itemHeight)
const activatedItems = computed(() => props.items.slice(ptr.value, ptr.value + props.stageItemCount))

const forceScrolling = ref(false)
const lastScrollTop = ref(0)

onMounted(() => {
  setTimeout(() => focus(props.focuseItemIndex))
})

watch(
  () => props.focuseItemIndex,
  (newv, oldv) => {
    focus(newv)
  }
)

/**
 * 将 viewport 对齐到指定元素
 * @param index 
 * @param alignment 决定用顶部还是底部对齐
 */
const focus = (index: number, alignment: 'top' | 'bottom' = 'top') => {
  if (alignment === 'top') {
    const offset = index - moveStage(index - props.bufferItemCount)
    moveViewport(offset * props.itemHeight)
  } else if (alignment === 'bottom') {
    const offset = index - moveStage(index + props.bufferItemCount - props.stageItemCount)
    moveViewport(offset * props.itemHeight)
  }
}

/**
 * 在 stage 之内移动 viewport，不引起数据变化
 * @param top float
 */
const moveViewport = (top: number) => {
  if (top < 0) {
    top = 0
  } else if (top > (stageHeight.value - clientHeight.value)) {
    top = stageHeight.value - clientHeight.value
  }
  // 滚动列表
  forceScrolling.value = true
  container.value?.scrollTo({
    top: appendPaddingTop.value + top,
    behavior: 'instant'
  })

  return top
}

/**
 * 在虚拟列表之内移动 stage，引起数据变化
 * @param index int
 */
const moveStage = (index: number) => {
  if (index < 0) {
    index = 0
  } else if (index > props.items.length - props.stageItemCount) {
    index = props.items.length - props.stageItemCount
  }
  // 触发内容变化并推动列表
  return ptr.value = index
}

const onScroll = lodash.throttle((event: Event) => {
  if (forceScrolling.value) {
    // 手动触发滚动时不做处理
    forceScrolling.value = false
    return
  }

  const tar = event.currentTarget as HTMLDivElement
  const step = tar.scrollTop - lastScrollTop.value
  // console.log(tar.scrollHeight, tar.scrollTop, step)
  lastScrollTop.value = tar.scrollTop
  if (step > 0) {
    // 向下滚动
    const actualBottomHeight = tar.scrollTop + tar.clientHeight,
      contentBottomHeight = appendPaddingTop.value + stageHeight.value
    const buffer = contentBottomHeight - actualBottomHeight,
      min = props.itemHeight * props.updateRequiredItemCount
    if (buffer < min) {
      const offset = props.bufferItemCount - Math.round(buffer / props.itemHeight)
      moveStage(ptr.value + offset)
    }
  } else if (step < 0) {
    // 向上滚动
    const actualTopHeight = tar.scrollHeight - tar.scrollTop,
      contentTopHeight = tar.scrollHeight - appendPaddingTop.value
    const buffer = contentTopHeight - actualTopHeight,
      min = props.itemHeight * props.updateRequiredItemCount
    if (buffer < min) {
      const offset = props.bufferItemCount - Math.round(buffer / props.itemHeight)
      moveStage(ptr.value - offset)
    }
  }
}, 33)

</script>

<template>
  <div class="virtual-list" ref="container" @scroll.self="onScroll">
    <ul class="scroll-box">
      <li class="list-item" v-for="(item, index) in activatedItems" :key="index">
        <slot name="item" :item="item" :index="index"></slot>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.virtual-list {
  overflow-x: hidden;
  overflow-y: auto;

  >.scroll-box {
    list-style: none;
    padding-top: v-bind('`${appendPaddingTop}px`');
    padding-bottom: v-bind('`${appendPaddingBottom}px`');

    >.list-item {}
  }
}
</style>
