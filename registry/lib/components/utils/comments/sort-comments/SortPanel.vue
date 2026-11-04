<template>
  <div
    v-show="panelVisible"
    class="sort-comments-panel"
    :class="{ minimized, dragging: isDragging }"
    :style="{
      right: posRight + 'px',
      bottom: posBottom + 'px',
      transform: 'scale(' + (minimized ? 1 : panelScale) + ')',
      transformOrigin: 'right bottom',
    }"
    @keydown.enter.stop
  >
    <button
      v-if="minimized"
      ref="restoreButton"
      type="button"
      class="panel-restore"
      title="展开评论排序"
      aria-label="展开评论排序"
      aria-expanded="false"
      @click="toggleMinimized"
    >
      <VIcon icon="mdi-sort" :size="24" aria-hidden="true" />
    </button>
    <template v-else>
      <div class="panel-header" @mousedown="startDrag">
        <span class="panel-title">评论排序</span>
        <button
          ref="minimizeButton"
          type="button"
          class="panel-minimize"
          title="最小化评论排序"
          aria-label="最小化评论排序"
          aria-expanded="true"
          @mousedown.stop
          @click="toggleMinimized"
        >
          <VIcon icon="mdi-minus" :size="18" aria-hidden="true" />
        </button>
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
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { VIcon } from '@/ui'
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
  components: { VIcon },
  data() {
    return {
      currentMode: CommentSortMode.Default as string,
      autoSort: true,
      panelVisible: true,
      minimized: false,
      modeGroups: MODE_GROUPS as typeof MODE_GROUPS,
      posRight: 20,
      posBottom: 120,
      panelScale: 1,
      isDragging: false,
      isResizing: false,
    }
  },
  watch: {
    panelVisible(visible: boolean) {
      if (visible) {
        this.$nextTick(this.clampPosition)
      }
    },
  },
  mounted() {
    this.loadPanelState()
    this.$nextTick(this.clampPosition)
    this.onWindowResize = () => {
      this.clampPosition()
    }
    window.addEventListener('resize', this.onWindowResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize)
  },
  methods: {
    loadPanelState() {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
        if (!saved || typeof saved !== 'object') {
          return
        }
        if (Number.isFinite(saved.right)) {
          this.posRight = saved.right
        }
        if (Number.isFinite(saved.bottom)) {
          this.posBottom = saved.bottom
        }
        if (Number.isFinite(saved.scale)) {
          this.panelScale = Math.max(0.5, Math.min(2, saved.scale))
        }
        if (typeof saved.minimized === 'boolean') {
          this.minimized = saved.minimized
        }
      } catch {
        // ignore
      }
    },
    savePanelState() {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            right: this.posRight,
            bottom: this.posBottom,
            scale: this.panelScale,
            minimized: this.minimized,
          }),
        )
      } catch {
        // ignore
      }
    },
    clampPosition() {
      if (!this.panelVisible) {
        return
      }
      const { width, height } = (this.$el as HTMLElement).getBoundingClientRect()
      // Keep the header controls reachable even when the scaled panel exceeds the viewport.
      this.posRight = Math.max(0, Math.min(window.innerWidth - width, this.posRight))
      this.posBottom = Math.min(Math.max(0, this.posBottom), window.innerHeight - height)
    },
    toggleMinimized() {
      this.minimized = !this.minimized
      this.$nextTick(() => {
        this.clampPosition()
        this.savePanelState()
        if (this.panelVisible) {
          const button = this.$refs[
            this.minimized ? 'restoreButton' : 'minimizeButton'
          ] as HTMLButtonElement
          button?.focus({ preventScroll: true })
        }
      })
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
        this.savePanelState()
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
        this.$nextTick(() => {
          this.clampPosition()
          this.savePanelState()
        })
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
  --panel-btn-bg: rgba(0, 0, 0, 0.06);
  --panel-btn-bg-hover: rgba(0, 0, 0, 0.12);
  --panel-resize-color: rgba(0, 0, 0, 0.25);
  background: rgba(255, 255, 255, 0.9);
  color: #18191c;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  padding: 8px 10px;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 140px;
  transition: opacity 0.2s;
  user-select: none;

  body.dark & {
    --panel-btn-bg: var(--be-color-button-bg, rgba(255, 255, 255, 0.1));
    --panel-btn-bg-hover: var(--be-color-button-bg-hover, rgba(255, 255, 255, 0.25));
    --panel-resize-color: rgba(255, 255, 255, 0.3);
    background: var(--be-color-popup-bg, rgba(0, 0, 0, 0.9));
    color: var(--be-color-text-title, #fff);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
}
.sort-comments-panel.dragging {
  transition: none;
}
.sort-comments-panel.minimized {
  min-width: 0;
  padding: 0;
  gap: 0;
  border-radius: 50%;
}
.panel-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 12px;
  text-align: center;
  letter-spacing: 1px;
  cursor: move;
  padding: 2px 0;
}
.panel-title {
  flex: 1;
}
.panel-minimize,
.panel-restore {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: none;
  color: inherit;
  background: transparent;
  cursor: pointer;
  &:hover {
    background: var(--panel-btn-bg-hover);
  }
  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
}
.panel-minimize {
  padding: 4px;
  border-radius: 4px;
}
.panel-restore {
  box-sizing: border-box;
  width: 40px;
  height: 40px;
  padding: 8px;
  border-radius: 50%;
}
.panel-modes {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.panel-btn {
  background: var(--panel-btn-bg);
  border: none;
  border-radius: 6px;
  color: inherit;
  padding: 6px 8px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.15s;
  text-align: center;
  width: 100%;
}
.panel-btn:hover {
  background: var(--panel-btn-bg-hover);
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
  background: linear-gradient(135deg, transparent 50%, var(--panel-resize-color) 50%);
  border-radius: 0 0 12px 0;
}
</style>
