<template>
  <VButton round class="manual-like" @click="like">
    <div id="text" :class="{ like: is_like }">
      正在点赞: {{ now_like_cnt }} / {{ tot_like_cnt }}
    </div>
    <VIcon v-show="!is_like" colored icon="like" :size="20" />
  </VButton>
</template>

<script lang="ts">
import { VButton, VIcon } from '@/ui'
import likeIcon from './like.svg'
import { addData } from '@/plugins/data'

addData('ui.icons', (icons: Record<string, string>) => {
  icons.like = likeIcon
})

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
      is_click: false,
      is_like: false,
      tot_like_cnt: 0,
      now_like_cnt: 0,
      feedsLikeQueue: [] as HTMLElement[],
    }
  },
  methods: {
    like() {
      if (this.is_click) {
        return
      }
      this.is_click = true
      // forEachFeedsCard异步执行顺序有问题，不能及时同步，用dqa代替
      const likeButtons = (dqa('.bili-dyn-title__text') as HTMLElement[]).flatMap(e => {
        if (this.list.includes(e.textContent)) {
          return []
        }
        const likeButton = e.closest('.bili-dyn-item__main').querySelector('.bili-dyn-action.like')
        return likeButton && !likeButton.classList.contains('active') ? likeButton : []
      })
      this.feedsLikeQueue.push(...likeButtons)
      this.tot_like_cnt = this.feedsLikeQueue.length
      this.now_like_cnt = 0
      this.is_like = true
      const t = window.setInterval(() => {
        if (this.feedsLikeQueue.length === 0) {
          this.is_like = false
          this.is_click = false
          clearInterval(t)
          return
        }
        const button = this.feedsLikeQueue.shift()
        button?.click()
        this.now_like_cnt++
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
