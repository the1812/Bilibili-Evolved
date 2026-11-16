<template>
  <div class="component-tags-preview">
    <div
      v-for="expanded of [false, true]"
      :key="String(expanded)"
      :class="expanded ? 'component-tags' : 'icon-list'"
    >
      <div
        v-for="tag of tags"
        :key="tag.name"
        class="component-tags-item"
        :class="{ selected: page === 'list' && tag.name === tagName }"
        @click="emit('tag', tag.name)"
      >
        <VIcon :size="20" :icon="tag.icon" :style="{ color: tag.color }" />
        <template v-if="expanded">
          <div class="tag-name">{{ tag.displayName }}</div>
          <div class="tag-count">({{ tag.count }})</div>
        </template>
      </div>
      <div class="grow"></div>
      <div
        v-for="link of links"
        :key="link.name"
        class="component-tags-item"
        :class="{ selected: page === link.name }"
        @click="openLink(link.name)"
      >
        <VIcon :size="20" :icon="link.icon" />
        <div v-if="expanded" class="tag-name">{{ link.displayName }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VIcon } from '@/ui'
import type { SettingsTag } from './tag-filter'

const links = [
  { name: 'library', displayName: '功能库', icon: 'mdi-package-variant-closed' },
  { name: 'about', displayName: '关于', icon: 'mdi-information-outline' },
] as const
type Link = (typeof links)[number]['name']
type SubPage = Exclude<Link, 'library'>

defineProps<{ page: 'list' | SubPage; tagName: string; tags: SettingsTag[] }>()
const emit = defineEmits<{
  (event: 'tag', name: string): void
  (event: 'page', name: SubPage): void
}>()

const openLink = async (name: Link) => {
  if (name === 'library') {
    const { togglePopup } = await import('./sub-pages/online-registry/vm')
    togglePopup()
  } else {
    emit('page', name)
  }
}
</script>

<style lang="scss">
@import 'common';
.settings-panel-content .sidebar > * {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .component-tags-item {
    background-color: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    white-space: nowrap;
    padding: 8px;
    padding-right: 10px;
    font-size: 13px;
    .tag-name {
      margin-right: 4px;
      margin-left: 8px;
    }
    &:hover,
    &.selected {
      background-color: #8882;
    }
  }
  .icon-list,
  .component-tags {
    flex-grow: 1;
    max-height: calc(var(--panel-height) - var(--header-height));
    @include no-scrollbar();
    background-color: transparent;
    width: 40px;
    display: flex;
    flex-direction: column;
    .grow {
      flex-grow: 1;
    }
    .be-icon {
      margin-left: 2px;
    }
  }
  .component-tags {
    height: 100%;
    width: auto;
    position: absolute;
    top: 0;
    opacity: 0;
    transition: 0.2s ease-out;
    pointer-events: none;
    background-color: #fff;
    border-right: 1px solid #8882;

    body.dark & {
      background-color: var(--be-color-panel-bg, #222);
    }
  }
  .icon-list:hover ~ .component-tags,
  .component-tags:hover {
    opacity: 1;
    pointer-events: initial;
  }
}
</style>
