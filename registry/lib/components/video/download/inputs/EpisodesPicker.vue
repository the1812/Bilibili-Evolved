<template>
  <div class="episodes-picker download-video-config-section">
    <div class="episodes-picker-header">
      <div class="episodes-picker-title">选集:</div>
      <div class="episodes-picker-checked-ratio">{{ formatRatio(episodeItems) }}</div>
      <EpisodeSelectActions :items="episodeItems" />
    </div>
    <div class="episodes-picker-items">
      <div v-if="episodeItems.length === 0" class="episodes-picker-empty">
        <VEmpty />
      </div>
      <div
        v-for="(section, sectionIndex) of episodeSections"
        :key="sectionIndex"
        class="episodes-picker-section-block"
      >
        <div
          v-if="section.title"
          class="episodes-picker-section"
          :class="{ collapsed: section.isCollapsed }"
          :title="section.title"
          @click="toggleSection(section)"
        >
          <VIcon class="episodes-picker-section-toggle" :size="14" icon="mdi-chevron-down" />
          <span class="episodes-picker-section-title">{{ section.title }}</span>
          <span class="episodes-picker-section-ratio">{{ formatRatio(section.entries) }}</span>
          <EpisodeSelectActions
            class="episodes-picker-section-actions"
            :items="section.entries"
            compact
          />
        </div>
        <transition
          name="episodes-picker-collapse"
          @enter="onSectionTransitionStart"
          @leave="onSectionTransitionStart"
          @after-enter="onSectionTransitionEnd"
          @after-leave="onSectionTransitionEnd"
        >
          <div v-show="!section.isCollapsed" class="episodes-picker-section-items">
            <div v-for="item of section.entries" :key="item.key" class="episodes-picker-item">
              <CheckBox
                v-model="item.isChecked"
                icon-position="left"
                :data-aid="item.inputItem.aid"
                :data-cid="item.inputItem.cid"
                :data-bvid="item.inputItem.bvid"
                @click.native="shiftSelect($event, item)"
              >
                <span class="episode-title">
                  {{ item.title }}
                </span>
                <span v-if="item.durationText" class="episode-duration">
                  {{ item.durationText }}
                </span>
              </CheckBox>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { VIcon, CheckBox, VEmpty } from '@/ui'
import type { EpisodeItem } from './episode-item'
import EpisodeSelectActions from './EpisodeSelectActions.vue'

interface EpisodeSection {
  title?: string
  isCollapsed: boolean
  entries: EpisodeItem[]
}

const buildEpisodeSections = (items: EpisodeItem[]): EpisodeSection[] => {
  const sections: EpisodeSection[] = []
  let lastSection: EpisodeSection | undefined
  items.forEach(item => {
    if (lastSection === undefined || lastSection.title !== item.sectionTitle) {
      lastSection = { title: item.sectionTitle, isCollapsed: false, entries: [] }
      sections.push(lastSection)
    }
    lastSection.entries.push(item)
  })
  return sections
}

const props = defineProps<{
  api: (options: { maxCheckedItems: number }) => Promise<EpisodeItem[]>
}>()

const episodeItems = ref<EpisodeItem[]>([])
const episodeSections = ref<EpisodeSection[]>([])
let lastCheckedEpisodeIndex = -1
const checkedInputItems = computed(() =>
  episodeItems.value.filter(it => it.isChecked).map(it => it.inputItem),
)

defineExpose({ checkedInputItems })

// 展开/折叠前固定为内容高度, 结束值由 CSS 类提供
const onSectionTransitionStart = (el: HTMLElement) => {
  el.style.height = `${el.scrollHeight}px`
}
const onSectionTransitionEnd = (el: HTMLElement) => {
  el.style.height = ''
}
const toggleSection = (section: EpisodeSection) => {
  section.isCollapsed = !section.isCollapsed
}
const formatRatio = (items: EpisodeItem[]) =>
  `(${items.filter(it => it.isChecked).length}/${items.length})`

const shiftSelect = (e: MouseEvent, item: EpisodeItem) => {
  const index = episodeItems.value.indexOf(item)
  if (!e.shiftKey || lastCheckedEpisodeIndex === -1) {
    lastCheckedEpisodeIndex = index
    return
  }
  episodeItems.value
    .slice(Math.min(lastCheckedEpisodeIndex, index) + 1, Math.max(lastCheckedEpisodeIndex, index))
    .forEach(it => {
      it.isChecked = !it.isChecked
    })
  lastCheckedEpisodeIndex = index
  e.preventDefault()
}

onBeforeMount(async () => {
  const items = await props.api({ maxCheckedItems: 32 })
  episodeItems.value = items
  episodeSections.value = buildEpisodeSections(items)
})
</script>
<style lang="scss">
@import 'common';
// 折叠高度与箭头旋转共用同一节奏, 保证两者协调
$collapse-transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
.episodes-picker {
  &-header {
    @include h-center();
  }
  &-checked-ratio {
    flex-grow: 1;
    margin-left: 4px;
  }
  &-items {
    max-height: 400px;
    overflow: auto;
    &:not(:empty) {
      margin-top: 4px;
      border: 1px solid #8884;
      border-radius: 6px;
    }
    .be-check-box {
      padding: 2px 6px;
      // VButton 的 .content-container 也会阻止收缩, 需一并放开
      .content-container,
      .text-container {
        min-width: 0;
      }
    }
    .episode-title {
      min-width: 0;
      overflow-wrap: break-word;
    }
    .episode-duration {
      margin-right: 4px;
      text-align: right;
      flex: 1 1 0;
      opacity: 0.5;
    }
  }
  &-section-block {
    border-bottom: 1px solid var(--be-color-card-border, #dfdfdf);
  }
  &-section {
    @include h-center();
    padding: 4px 6px;
    background-color: var(--be-color-card-bg, #eee);
    border-bottom: 1px solid var(--be-color-card-border, #dfdfdf);
    position: sticky;
    top: 0;
    z-index: 1;
    cursor: pointer;
    user-select: none;
    &-toggle {
      flex-shrink: 0;
      margin-right: 2px;
      opacity: 0.7;
      transition: transform $collapse-transition;
    }
    &.collapsed &-toggle {
      transform: rotate(-90deg);
    }
    &-title {
      min-width: 0;
      @include single-line();
      @include semi-bold();
    }
    &-ratio {
      margin-left: 4px;
      opacity: 0.5;
    }
    &-actions {
      margin-left: auto;
    }
  }
  &-empty {
    @include h-center();
    justify-content: center;
    padding: 4px 0;
  }
}
.episodes-picker-collapse-enter-active,
.episodes-picker-collapse-leave-active {
  overflow: hidden;
  transition: height $collapse-transition;
}
.episodes-picker-collapse-enter,
.episodes-picker-collapse-leave-to {
  height: 0 !important;
}
</style>
