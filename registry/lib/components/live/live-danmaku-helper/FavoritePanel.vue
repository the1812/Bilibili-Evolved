<template>
  <div ref="element" class="live-danmaku-favorite-widget">
    <VPopup
      ref="popup"
      v-model="open"
      class="danmaku-favorite-popup widgets-popup"
      :trigger-element="$refs.favoriteButton"
    >
      <div class="danmaku-favorite-header">
        <TextBox v-model="keyword" placeholder="搜索收藏的弹幕" />
      </div>
      <ul v-if="filteredFavorites.length > 0" class="danmaku-favorite-list">
        <li
          v-for="(item, index) of filteredFavorites"
          :key="item + index"
          :title="'点击发送: ' + item"
          @click="send(item)"
        >
          <span class="danmaku-favorite-text">{{ item }}</span>
          <button class="danmaku-favorite-delete" title="删除收藏" @click.stop="remove(item)">
            <VIcon icon="mdi-close" :size="16" />
          </button>
        </li>
      </ul>
      <div v-else class="danmaku-favorite-empty">
        {{ keyword ? '没有匹配的收藏' : '还没有收藏的弹幕' }}
      </div>
    </VPopup>
    <DefaultWidget
      ref="favoriteButton"
      name="弹幕收藏库"
      icon="mdi-star-outline"
      @click="open = !open"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'
import { DefaultWidget, VPopup, VIcon, TextBox } from '@/ui'
import { LiveDanmakuHelperOptions } from './options'
import { sendDanmaku } from './sender'

const { options } = getComponentSettings<LiveDanmakuHelperOptions>('liveDanmakuHelper')

const element = ref<HTMLElement>()
const open = ref(false)
const keyword = ref('')

// 收藏写入发生在非 Vue 上下文（index.ts）且经由自定义设置代理，
// 这里通过设置监听同步到本地 ref，确保收藏后面板立即更新（规避响应式断裂）。
const favorites = ref<string[]>([...(options.favorites ?? [])])
const syncFavorites = (value: string[]) => {
  favorites.value = [...(value ?? [])]
}
addComponentListener('liveDanmakuHelper.favorites', syncFavorites, true)
onUnmounted(() => removeComponentListener('liveDanmakuHelper.favorites', syncFavorites))

const filteredFavorites = computed(() => {
  const search = keyword.value.trim().toLowerCase()
  if (!search) {
    return favorites.value
  }
  return favorites.value.filter(item => item.toLowerCase().includes(search))
})

const send = (text: string) => {
  sendDanmaku(text)
}

const remove = (text: string) => {
  options.favorites = (options.favorites ?? []).filter(item => item !== text)
}
</script>

<style lang="scss">
@import 'common';

.danmaku-favorite-popup {
  top: 50%;
  left: calc(100% + 8px);
  transform: scale(0.9) translateY(-50%);
  transform-origin: left;
  padding: 8px;
  width: 240px;
  max-height: calc(100vh - 150px);
  @include card();
  @include no-scrollbar();
  @include round-corner(8px);

  &.open {
    transform: scale(1) translateY(-50%);
  }

  body.settings-panel-dock-right & {
    right: calc(100% + 8px);
    left: unset;
    transform-origin: right;
  }

  &,
  & * {
    transition: 0.2s ease-out;
  }

  .danmaku-favorite-header {
    margin-bottom: 8px;
    .be-text-box {
      width: 100%;
    }
  }

  .danmaku-favorite-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
    max-height: calc(100vh - 230px);
    @include no-scrollbar();

    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
      padding: 6px 8px;
      cursor: pointer;
      @include round-corner(4px);

      &:hover {
        background-color: var(--theme-color-20, rgba(0, 161, 214, 0.2));
      }

      .danmaku-favorite-text {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 13px;
      }

      .danmaku-favorite-delete {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 2px;
        border: none;
        background-color: transparent;
        color: inherit;
        cursor: pointer;
        opacity: 0.5;
        @include round-corner(4px);

        &:hover {
          opacity: 1;
          background-color: #f44;
          color: #fff;
        }
      }
    }
  }

  .danmaku-favorite-empty {
    padding: 16px 8px;
    text-align: center;
    opacity: 0.6;
    font-size: 13px;
  }
}
</style>
