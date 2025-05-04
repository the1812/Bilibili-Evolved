<template>
  <VButton round class="manual-like" @click="like">
    <div id="text" :class="{ like: isLike }">正在点赞: {{ curLikeCnt }} / {{ totalLikeCnt }}</div>
    <VIcon v-show="!isLike" colored icon="like" :size="20" />
  </VButton>
</template>

<script lang="ts">
import { VButton, VIcon } from '@/ui'

export default Vue.extend({
  components: {
    VButton,
    VIcon,
  },
  props: {
    list: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      isClick: false,
      isLike: false,
      totalLikeCnt: 0,
      curLikeCnt: 0,
      feedsLikeQueue: [] as HTMLElement[],
    }
  },
  methods: {
    like() {
      if (this.isClick) {
        return
      }
      this.isClick = true
      // forEachFeedsCard异步执行顺序有问题，不能及时同步，用dqa代替
      const likeButtons = (
        Array.from(document.getElementsByClassName('bili-dyn-title__text')) as HTMLElement[]
      ).reduce((buttons, e) => {
        if (this.list.includes(e.textContent.trim())) {
          return buttons
        }
        const likeButton = e.closest('.bili-dyn-item__main').querySelector('.bili-dyn-action.like')
        if (likeButton && !likeButton.classList.contains('active')) {
          buttons.push(likeButton as HTMLElement)
        }
        return buttons
      }, [] as HTMLElement[])
      this.feedsLikeQueue.push(...likeButtons)
      this.totalLikeCnt = this.feedsLikeQueue.length
      this.curLikeCnt = 0
      this.isLike = true
      const t = window.setInterval(() => {
        if (this.feedsLikeQueue.length === 0) {
          this.isLike = false
          this.isClick = false
          clearInterval(t)
          return
        }
        const button = this.feedsLikeQueue.shift()
        button?.click()
        this.curLikeCnt++
      }, 1200)
    },
  },
})
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
