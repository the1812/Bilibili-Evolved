<template>
  <div
    class="bili-dyn-card-pgc__mark bili-dyn-card-video__mark"
    :class="{ active: isActive }"
    @click.prevent.stop="handleClick"
    @mouseleave="handleMouseLeave"
  >
    <div class="bili-dyn-card-pgc__mark__tip bili-dyn-card-video__mark__tip">
      {{ tipText }}
    </div>
  </div>
</template>

<script>
import { watchlaterList, toggleWatchlater } from '@/components/video/watchlater'

export default {
  data() {
    return {
      aid: null,
      watchlaterList,
      isActive: false,
      isLoading: false,
      feedback: '',
    }
  },

  computed: {
    tipText() {
      if (this.feedback) {
        return this.feedback
      }
      return this.isActive ? '移除' : '稍后再看'
    },
  },

  methods: {
    async getAidFromCard() {
      try {
        const link = this.$el.closest('a.bili-dyn-card-pgc')
        if (!link || !link.href) {
          return null
        }

        const response = await fetch(link.href, {
          credentials: 'include',
        })
        if (!response.ok) {
          return null
        }

        const html = await response.text()
        const doc = new DOMParser().parseFromString(html, 'text/html')
        const scripts = Array.from(doc.querySelectorAll('script'))

        for (const script of scripts) {
          const text = script.textContent || ''
          const match = text.match(/"aid"\s*:\s*(\d+)/)
          if (match) {
            return Number(match[1])
          }
        }
        return null
      } catch (e) {
        console.error('获取番剧 aid 失败:', e)
        return null
      }
    },

    async handleClick() {
      if (this.isLoading) {
        return
      }
      this.isLoading = true

      try {
        if (!this.aid) {
          this.aid = await this.getAidFromCard()
        }

        await toggleWatchlater(this.aid, !this.isActive)
        if (this.isActive === this.watchlaterList.includes(this.aid)) {
          return
        }

        this.isActive = !this.isActive
        this.feedback = this.isActive ? '已加稍后再看' : '已从稍后再看列表中移除'
      } finally {
        this.isLoading = false
      }
    },

    handleMouseLeave() {
      this.feedback = ''
    },
  },
}
</script>

<style lang="scss">
.bili-dyn-card-pgc__header {
  .bili-dyn-card-pgc__mark {
    opacity: 0;
    transition: opacity 0.2s cubic-bezier(0.22, 0.58, 0.12, 0.98);
    top: 31px !important;
    .bili-dyn-card-pgc__mark__tip {
      display: none !important;
      pointer-events: none;
    }
  }
  &:hover .bili-dyn-card-pgc__mark {
    opacity: 1;
    &:hover {
      .bili-dyn-card-pgc__mark__tip {
        display: block !important;
      }
    }
  }
}
.bili-dyn-card-pgc__tag {
  z-index: 1;
}
</style>
