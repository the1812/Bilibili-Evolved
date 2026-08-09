<template>
  <div
    class="sort-comments-panel"
    :class="{ hidden: !panelVisible, dragging: isDragging }"
    :style="{
      right: posRight + 'px',
      bottom: posBottom + 'px',
      transform: 'scale(' + panelScale + ')',
      transformOrigin: 'right bottom',
    }"
  >
    <div class="panel-header" @mousedown="startDrag">
      评论排序
    </div>
    <div class="panel-modes">
      <button
        v-for="mode in modeGroups"
        :key="mode.key"
        class="panel-btn"
        :class="{ active: isGroupActive(mode.key) }"
        @click="handleModeClick(mode.key)"
      >
        {{ getModeLabel(mode.key) }}
      </button>
    </div>
    <div class="panel-toggle" @click="toggleAuto">
      <span class="dot" :class="{ manual: !autoSort }" />
      <span>{{ autoSort ? '自动排序' : '点击排序' }}</span>
    </div>
    <div class="resize-handle" @mousedown="startResize" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { CommentSortMode } from './options'

const MODE_GROUPS = [
  { key: 'default', modes: [CommentSortMode.Default] },
  { key: 'likes', modes: [CommentSortMode.LikesDescending, CommentSortMode.LikesAscending] },
  { key: 'time', modes: [CommentSortMode.TimeDescending, CommentSortMode.TimeAscending] },
  { key: 'level', modes: [CommentSortMode.LevelDescending, CommentSortMode.LevelAscending] },
] as const

const GROUP_LABELS: Record<string, string> = {
  default: '默认',
  likes: '👍 点赞',
  time: '🕐 时间',
  level: '⭐ 等级',
}

const STORAGE_KEY = 'sort-comments-panel'

export default defineComponent({
  data() {
    return {
      currentMode: CommentSortMode.Default as string,
      autoSort: true,
      panelVisible: true,
      modeGroups: MODE_GROUPS as typeof MODE_GROUPS,
      posRight: 20,
      posBottom: 120,
      panelScale: 1,
      isDragging: false,
      isResizing: false,
    }
  },
  mounted() {
    this.loadPosition()
    this.onWindowResize = () => {
      this.clampPosition()
    }
    window.addEventListener('resize', this.onWindowResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize)
  },
  methods: {
    loadPosition() {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
        if (typeof saved.right === 'number') {
          this.posRight = saved.right
        }
        if (typeof saved.bottom === 'number') {
          this.posBottom = saved.bottom
        }
        if (typeof saved.scale === 'number') {
          this.panelScale = Math.max(0.5, Math.min(2, saved.scale))
        }
      } catch {
        // ignore
      }
      this.clampPosition()
    },
    savePosition() {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            right: this.posRight,
            bottom: this.posBottom,
            scale: this.panelScale,
          }),
        )
      } catch {
        // ignore
      }
    },
    clampPosition() {
      this.posRight = Math.max(0, Math.min(window.innerWidth - 50, this.posRight))
      this.posBottom = Math.max(0, Math.min(window.innerHeight - 50, this.posBottom))
    },
    startDrag(e: MouseEvent) {
      if ((e.target as HTMLElement).closest('.panel-btn, .panel-toggle, .resize-handle')) {
        return
      }
      e.preventDefault()
      const startX = e.clientX
      const startY = e.clientY
      const startRight = this.posRight
      const startBottom = this.posBottom
      this.isDragging = true

      const onMove = (ev: MouseEvent) => {
        this.posRight = Math.max(
          0,
          Math.min(window.innerWidth - 50, startRight + (startX - ev.clientX)),
        )
        this.posBottom = Math.max(
          0,
          Math.min(window.innerHeight - 50, startBottom + (startY - ev.clientY)),
        )
      }
      const onEnd = () => {
        this.isDragging = false
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onEnd)
        this.savePosition()
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onEnd)
    },
    startResize(e: MouseEvent) {
      e.stopPropagation()
      e.preventDefault()
      const startY = e.clientY
      const startScale = this.panelScale
      this.isResizing = true

      const onMove = (ev: MouseEvent) => {
        const dy = startY - ev.clientY
        this.panelScale = Math.max(0.5, Math.min(2, startScale + dy * 0.005))
      }
      const onEnd = () => {
        this.isResizing = false
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onEnd)
        this.savePosition()
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onEnd)
    },
    getModeLabel(key: string): string {
      const label = GROUP_LABELS[key] || key
      const group = this.modeGroups.find(g => g.key === key)
      if (!group || group.modes.length === 1) {
        return label
      }
      const isAsc = this.currentMode === group.modes[1]
      return `${label} ${isAsc ? '▲' : '▼'}`
    },
    isGroupActive(key: string): boolean {
      const group = this.modeGroups.find(g => g.key === key)
      if (!group) {
        return false
      }
      return group.modes.includes(this.currentMode as CommentSortMode)
    },
    handleModeClick(key: string) {
      const group = this.modeGroups.find(g => g.key === key)
      if (!group) {
        return
      }
      if (this.isGroupActive(key)) {
        const currentIndex = group.modes.indexOf(this.currentMode as CommentSortMode)
        const nextMode = group.modes[(currentIndex + 1) % group.modes.length]
        this.$emit('mode-change', nextMode)
      } else {
        this.$emit('mode-change', group.modes[0])
      }
    },
    toggleAuto() {
      this.$emit('auto-toggle', !this.autoSort)
    },
  },
})
</script>

<style lang="scss" scoped>
.sort-comments-panel {
  position: fixed;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 8px 10px;
  color: #fff;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 140px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: opacity 0.2s;
  user-select: none;
}
.sort-comments-panel.dragging {
  transition: none;
}
.sort-comments-panel.hidden {
  opacity: 0;
  pointer-events: none;
}
.panel-header {
  font-weight: 600;
  font-size: 12px;
  opacity: 0.7;
  text-align: center;
  letter-spacing: 1px;
  cursor: move;
  padding: 2px 0;
}
.panel-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: #fff;
  padding: 6px 8px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.15s;
  text-align: center;
  width: 100%;
}
.panel-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}
.panel-btn.active {
  background: rgba(0, 161, 214, 0.5);
}
.panel-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  opacity: 0.8;
  cursor: pointer;
  padding: 3px 0;
}
.panel-toggle:hover {
  opacity: 1;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4caf50;
  transition: background 0.2s;
}
.dot.manual {
  background: #ff9800;
}
.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
  background: linear-gradient(
    135deg,
    transparent 50%,
    rgba(255, 255, 255, 0.3) 50%
  );
  border-radius: 0 0 12px 0;
}
</style>