<template>
  <VPopup v-model="panelVisible" fixed :auto-close="false" :esc-close="true" class="cie-panel">
    <div class="cie-header" @pointerdown="onDragStart">
      <h3>评论图片下载</h3>
      <div class="cie-header-actions">
        <button type="button" class="cie-close-button" title="关闭" @click="panelVisible = false">
          ×
        </button>
      </div>
    </div>
    <div class="cie-stats">{{ statsText }}</div>
    <button
      type="button"
      class="cie-download-all"
      :disabled="items.length === 0"
      @click="downloadAllComments"
    >
      全部下载
    </button>
    <div class="cie-content">
      <p v-if="items.length === 0" class="cie-empty">暂无包含图片的评论</p>
      <button
        v-for="item in items"
        :key="item.commentId"
        type="button"
        class="cie-item"
        @click="downloadSingleComment(item)"
      >
        <div class="cie-item-content">
          <div class="cie-item-info">
            <span class="cie-item-username">{{ item.userName }}</span>
            <span class="cie-item-message" :title="item.content">{{ truncate(item.content) }}</span>
            <span v-if="item.time" class="cie-item-time">{{ formatTimestamp(item.time) }}</span>
          </div>
          <span class="cie-item-count">[{{ item.pictures.length }}张]</span>
        </div>
      </button>
    </div>
  </VPopup>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VPopup } from '@/ui'
import { commentImageList, panelVisible } from './store'
import { downloadSingleComment, downloadAllComments } from './download'

const items = computed(() => commentImageList.value)
const statsText = computed(() => `共找到 ${items.value.length} 条包含图片的评论`)

const truncate = (text: string) => (text.length > 10 ? `${text.substring(0, 10)}...` : text)

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`
}

let dragOffsetX = 0
let dragOffsetY = 0
let panelEl: HTMLElement | null = null
let headerEl: HTMLElement | null = null

const onDragMove = (e: PointerEvent) => {
  if (!panelEl) {
    return
  }
  const rect = panelEl.getBoundingClientRect()
  const maxLeft = Math.max(0, window.innerWidth - rect.width)
  const maxTop = Math.max(0, window.innerHeight - rect.height)
  const nextLeft = Math.min(Math.max(e.clientX - dragOffsetX, 0), maxLeft)
  const nextTop = Math.min(Math.max(e.clientY - dragOffsetY, 0), maxTop)
  panelEl.style.left = `${nextLeft}px`
  panelEl.style.top = `${nextTop}px`
}

const onDragEnd = () => {
  if (headerEl?.hasPointerCapture?.(0)) {
    headerEl.releasePointerCapture(0)
  }
  document.removeEventListener('pointermove', onDragMove)
  document.removeEventListener('pointerup', onDragEnd)
}

const onDragStart = (e: PointerEvent) => {
  if (e.button !== 0) {
    return
  }
  if ((e.target as HTMLElement).closest('.cie-header-actions')) {
    return
  }
  if (!panelEl) {
    panelEl = (e.target as HTMLElement).closest('.cie-panel')
  }
  if (!panelEl) {
    return
  }
  const rect = panelEl.getBoundingClientRect()
  dragOffsetX = e.clientX - rect.left
  dragOffsetY = e.clientY - rect.top
  panelEl.style.left = `${rect.left}px`
  panelEl.style.top = `${rect.top}px`
  panelEl.style.right = 'auto'
  headerEl = e.currentTarget as HTMLElement
  headerEl.setPointerCapture(e.pointerId)
  e.preventDefault()
  document.addEventListener('pointermove', onDragMove)
  document.addEventListener('pointerup', onDragEnd)
}
</script>

<style lang="scss">
@import 'common';

.cie-panel {
  position: fixed;
  top: 70px;
  right: 20px;
  z-index: 9999;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: min(400px, calc(100vw - 40px));
  max-height: min(600px, calc(100vh - 90px));
  padding: 10px;
  @include popup();

  &.close {
    pointer-events: none;
    opacity: 0;
  }

  &.open {
    pointer-events: initial;
    opacity: 1;
  }
}

.cie-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
  cursor: move;
  user-select: none;
  touch-action: none;

  body.dark & {
    border-bottom-color: #333;
  }

  h3 {
    margin: 0;
    @include text-color;
    font-size: 16px;
  }
}

.cie-header-actions {
  display: flex;
  align-items: center;
  cursor: default;
}

.cie-close-button {
  appearance: none;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
}

.cie-stats {
  margin-bottom: 10px;
  padding: 5px 0;
  border-bottom: 1px solid #eee;
  color: #666;
  font-size: 12px;

  body.dark & {
    border-bottom-color: #333;
    color: #cfd8e6;
  }
}

.cie-download-all {
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
  border: none;
  border-radius: 3px;
  background-color: #00a1d6;
  color: #fff;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.cie-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  @include no-scrollbar();
}

.cie-empty {
  color: #999;
  text-align: center;
  padding: 20px;

  body.dark & {
    color: #888;
  }
}

.cie-item {
  display: block;
  width: 100%;
  margin-bottom: 5px;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 3px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;

  body.dark & {
    border-color: #333;
  }

  &:hover {
    background-color: #f5f5f5;

    body.dark & {
      background-color: #1e2226;
    }
  }
}

.cie-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cie-item-info {
  display: flex;
  flex: 1;
  align-items: center;
  overflow: hidden;
}

.cie-item-username {
  margin-right: 5px;
  font-weight: bold;
  white-space: nowrap;
}

.cie-item-message {
  flex: 1;
  margin: 0 5px;
  @include single-line();
}

.cie-item-time {
  margin-left: 5px;
  color: #999;
  font-size: 11px;
  white-space: nowrap;

  body.dark & {
    color: #888;
  }
}

.cie-item-count {
  margin-left: 10px;
  color: #00a1d6;
  white-space: nowrap;
}
</style>
