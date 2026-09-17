<template>
  <div class="episodes-picker download-video-config-section">
    <div class="episodes-picker-header">
      <div class="episodes-picker-title">选集:</div>
      <div class="episodes-picker-checked-ratio">{{ formatRatio(episodeItems) }}</div>
      <div class="episodes-picker-actions">
        <VButton
          v-for="action of selectActions"
          :key="action.name"
          :class="action.name"
          :title="action.title"
          type="transparent"
          @click="applySelectAction(action, episodeItems)"
        >
          <VIcon :size="16" :icon="action.icon" />
        </VButton>
      </div>
    </div>
    <div class="episodes-picker-items">
      <div v-if="episodeItems.length === 0" class="episodes-picker-empty">
        <VEmpty />
      </div>
      <div v-for="(section, sectionIndex) of episodeSections" :key="sectionIndex">
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
          <VButton
            v-for="action of selectActions"
            :key="action.name"
            :title="action.title"
            type="transparent"
            @click.stop="applySelectAction(action, section.entries)"
          >
            <VIcon :size="14" :icon="action.icon" />
          </VButton>
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
<script lang="ts">
import { VButton, VIcon, CheckBox, VEmpty } from '@/ui'
import { EpisodeItem } from './episode-item'

interface EpisodeSection {
  title?: string
  isCollapsed: boolean
  entries: EpisodeItem[]
}

interface SelectAction {
  name: string
  title: string
  icon: string
  /** 目标选中状态, 省略时表示反选 */
  isChecked?: boolean
}

const selectActions: SelectAction[] = [
  {
    name: 'select-all',
    title: '全选',
    icon: 'mdi-checkbox-multiple-marked-circle',
    isChecked: true,
  },
  {
    name: 'deselect-all',
    title: '全不选',
    icon: 'mdi-checkbox-multiple-blank-circle-outline',
    isChecked: false,
  },
  { name: 'invert-selection', title: '反选', icon: 'mdi-circle-slice-4' },
]

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

export default Vue.extend({
  components: {
    VButton,
    VIcon,
    CheckBox,
    VEmpty,
  },
  props: {
    api: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      selectActions,
      episodeItems: [] as EpisodeItem[],
      episodeSections: [] as EpisodeSection[],
      maxCheckedItems: 32,
      lastCheckedEpisodeIndex: -1,
    }
  },
  computed: {
    checkedInputItems() {
      return this.episodeItems.filter(it => it.isChecked).map(it => it.inputItem)
    },
  },
  created() {
    this.getEpisodeItems()
  },
  methods: {
    // 展开/折叠前固定为内容高度, 结束值由 CSS 类提供
    onSectionTransitionStart(el: HTMLElement) {
      el.style.height = `${el.scrollHeight}px`
    },
    onSectionTransitionEnd(el: HTMLElement) {
      el.style.height = ''
    },
    toggleSection(section: EpisodeSection) {
      section.isCollapsed = !section.isCollapsed
    },
    formatRatio(items: EpisodeItem[]) {
      return `(${items.filter(it => it.isChecked).length}/${items.length})`
    },
    applySelectAction(action: SelectAction, items: EpisodeItem[]) {
      items.forEach(it => {
        it.isChecked = action.isChecked ?? !it.isChecked
      })
    },
    shiftSelect(e: MouseEvent, item: EpisodeItem) {
      const index = this.episodeItems.indexOf(item)
      if (!e.shiftKey || this.lastCheckedEpisodeIndex === -1) {
        // console.log('set lastCheckedEpisodeIndex', index)
        this.lastCheckedEpisodeIndex = index
        return
      }
      this.episodeItems
        .slice(
          Math.min(this.lastCheckedEpisodeIndex, index) + 1,
          Math.max(this.lastCheckedEpisodeIndex, index),
        )
        .forEach(it => {
          it.isChecked = !it.isChecked
        })
      // console.log(
      //   'shift toggle',
      //   Math.min(this.lastCheckedEpisodeIndex, index) + 1,
      //   Math.max(this.lastCheckedEpisodeIndex, index),
      // )
      this.lastCheckedEpisodeIndex = index
      e.preventDefault()
    },
    async getEpisodeItems() {
      if (this.episodeItems.length > 0) {
        return
      }
      const items: EpisodeItem[] = await this.api(this)
      this.episodeItems = items
      this.episodeSections = buildEpisodeSections(items)
    },
  },
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
  &-actions {
    @include h-center();
    .be-button {
      padding: 4px;
      &.invert-selection .be-icon {
        font-size: 14px;
      }
      &.select-all .be-icon,
      &.deselect-all .be-icon {
        transform: translateY(1px);
      }
    }
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
  &-section {
    @include h-center();
    padding: 4px 6px;
    background-color: #8882;
    border-bottom: 1px solid #8882;
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
      flex: 1 1 0;
      min-width: 0;
      @include single-line();
      @include semi-bold();
    }
    &-ratio {
      margin-left: 4px;
      opacity: 0.5;
    }
    .be-button {
      padding: 2px;
      margin-left: 2px;
      .be-icon {
        transform: translateY(1px);
      }
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
