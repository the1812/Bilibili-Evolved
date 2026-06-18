<template>
  <div class="dm-result-wrapper" :data-bvid="video.bvid">
    <div class="dm-result-item" @click="onItemClick">
      <div class="dm-checkbox" :class="{ checked }" @click.stop="onToggleSelect"></div>

      <div class="dm-result-cover-box">
        <img
          class="dm-result-cover"
          :src="coverUrl"
          referrerpolicy="no-referrer"
          @click.stop="onOpenVideo"
        />
        <div v-if="durationText" class="dm-result-duration">{{ durationText }}</div>
      </div>

      <div class="dm-result-info">
        <div class="dm-result-title" :title="plainTitle">{{ plainTitle }}</div>
        <div class="dm-result-meta">UP: {{ video.author }} · {{ video.play }}播放</div>
      </div>

      <div class="dm-expand-btn" @click.stop="onToggleExpand">
        <svg
          class="dm-arrow-icon"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="var(--text3, #999)"
          :style="arrowStyle"
        >
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
        </svg>
      </div>
    </div>

    <div v-show="expanded" :id="detailsId" class="dm-inline-details">
      <div v-if="detailsLoading" class="dm-details-loading">加载分P中...</div>
      <slot v-else name="details"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import type { MergerSearchVideo } from '../contracts'

function formatDuration(duration?: number | string): string {
  if (!duration) {
    return ''
  }

  if (typeof duration === 'string') {
    return duration
  }

  const h = Math.floor(duration / 3600)
  const m = Math.floor((duration % 3600) / 60)
  const s = duration % 60

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

function stripHtmlTags(title: string): string {
  return title.replace(/<[^>]+>/g, '')
}

export default Vue.extend({
  name: 'VideoResultCard',
  props: {
    video: {
      type: Object as () => MergerSearchVideo,
      required: true,
    },
    checked: {
      type: Boolean,
      default: false,
    },
    expanded: {
      type: Boolean,
      default: false,
    },
    detailsLoading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    plainTitle(): string {
      return stripHtmlTags(this.video.title)
    },
    coverUrl(): string {
      const { pic } = this.video
      return pic.startsWith('//') ? `https:${pic}` : pic
    },
    durationText(): string {
      return formatDuration(this.video.duration)
    },
    detailsId(): string {
      return `dm-details-${this.video.bvid}`
    },
    arrowStyle(): { transform: string; transition: string } {
      return {
        transform: this.expanded ? 'rotate(-180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s',
      }
    },
  },
  methods: {
    onToggleSelect() {
      this.$emit('toggle-select')
    },
    onOpenVideo() {
      this.$emit('open-video')
    },
    onToggleExpand() {
      this.$emit('toggle-expand')
    },
    onItemClick(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (target.closest('.dm-checkbox')) {
        return
      }
      if (target.closest('.dm-result-cover')) {
        return
      }
      if (target.closest('.dm-expand-btn')) {
        return
      }
      this.onToggleExpand()
    },
  },
})
</script>

<style scoped>
.dm-result-wrapper {
  border-bottom: 1px solid var(--line_light, #f0f0f0);
}

.dm-result-item {
  display: flex;
  gap: 12px;
  padding: 10px;
  cursor: pointer;
  align-items: center;
}

.dm-result-cover-box {
  width: 110px;
  height: 70px;
  border-radius: 4px;
  overflow: hidden;
  background: #e7e7e7;
  flex-shrink: 0;
  position: relative;
}

.dm-result-cover-box .dm-result-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.dm-result-duration {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 11px;
  padding: 1px 4px;
  border-radius: 2px;
  font-weight: 500;
}

.dm-result-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.dm-result-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text1, #222);
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.dm-result-meta {
  font-size: 12px;
  color: var(--text3, #999);
}

.dm-expand-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: background 0.2s;
}

.dm-inline-details {
  background: var(--bg2, #f9f9f9);
  padding: 10px;
  border-top: 1px solid var(--line_light, #eee);
}

.dm-details-loading {
  text-align: center;
  color: var(--text3, #999);
  padding: 20px;
}
</style>
