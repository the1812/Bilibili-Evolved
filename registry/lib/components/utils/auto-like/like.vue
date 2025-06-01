<template>
  <VButton round class="manual-like" @click="like">
    <div id="text" :class="{ like: isLike }">正在点赞: {{ curLikeCnt }} / {{ totalLikeCnt }}</div>
    <VIcon v-show="!isLike" colored icon="like" :size="20" />
  </VButton>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { VButton, VIcon } from '@/ui'
import { getData } from '@/plugins/data'
import { BlackListDataKey } from './vm'

const isClick = ref(false)
const isLike = ref(false)
const totalLikeCnt = ref(0)
const curLikeCnt = ref(0)
const feedsLikeQueue = ref([] as HTMLElement[])

const like = () => {
  if (isClick.value) {
    return
  }
  isClick.value = true
  const list = getData(BlackListDataKey)[0].users as string[]
  // forEachFeedsCard异步执行顺序有问题，不能及时同步，用dqa代替
  const likeButtons = (
    Array.from(document.getElementsByClassName('bili-dyn-title__text')) as HTMLElement[]
  ).reduce((buttons, e) => {
    if (list.includes(e.textContent.trim())) {
      return buttons
    }
    const likeButton = e.closest('.bili-dyn-item__main').querySelector('.bili-dyn-action.like')
    if (likeButton && !likeButton.classList.contains('active')) {
      buttons.push(likeButton as HTMLElement)
    }
    return buttons
  }, [] as HTMLElement[])
  feedsLikeQueue.value.push(...likeButtons)
  totalLikeCnt.value = feedsLikeQueue.value.length
  curLikeCnt.value = 0
  isLike.value = true
  const t = window.setInterval(() => {
    if (feedsLikeQueue.value.length === 0) {
      isLike.value = false
      isClick.value = false
      clearInterval(t)
      return
    }
    const button = feedsLikeQueue.value.shift()
    button?.click()
    curLikeCnt.value++
  }, 1200)
}
</script>

<style lang="scss">
.manual-like {
  left: 5px;
  z-index: 1001;
  height: 30px;
  position: fixed;
  * {
    color: rgb(251, 114, 153);
  }
  #text {
    overflow: hidden;
    white-space: nowrap;
    max-width: 0px;
    transition: max-width 0.4s linear !important;
    &.like {
      max-width: 150px;
    }
  }
}
</style>
