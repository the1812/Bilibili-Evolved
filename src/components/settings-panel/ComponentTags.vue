<template>
  <div class="component-tags-preview">
    <VPopup
      v-model="selectedSubPageOpen"
      :lazy="false"
      :trigger-element="selectedSubPageTrigger"
      class="settings-panel-sub-page"
    >
      <keep-alive>
        <component :is="selectedSubPage" v-if="selectedSubPage" />
      </keep-alive>
    </VPopup>
    <div class="icon-list">
      <div
        v-for="t of tags"
        :key="t.name"
        class="component-tags-item"
        :class="{ selected: t.name === selectedTagName }"
        @click="selectTag(t)"
      >
        <VIcon :size="20" :icon="t.icon" :style="{ color: t.color }" />
      </div>
      <div class="grow"></div>
      <div
        v-for="t of subPages"
        :key="t.name"
        class="component-tags-item"
      >
        <VIcon :size="20" :icon="t.icon" :style="{ color: 'inherit' }" />
      </div>
    </div>
    <div class="component-tags">
      <div
        v-for="t of tags"
        :key="t.name"
        class="component-tags-item"
        :class="{ selected: t.name === selectedTagName }"
        @click="selectTag(t)"
      >
        <VIcon :size="20" :icon="t.icon" :style="{ color: t.color }" />
        <div class="tag-name">
          {{ t.displayName }}
        </div>
        <div class="tag-count">
          ({{ t.count }})
        </div>
      </div>
      <div class="grow"></div>
      <div
        v-for="t of subPages"
        :key="t.name"
        class="component-tags-item"
        @click="openSubPage($event, t.component)"
      >
        <VIcon :size="20" :icon="t.icon" :style="{ color: 'inherit' }" />
        <div class="tag-name">
          {{ t.displayName }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Executable, VueModule } from '@/core/common-types'
import { ascendingSort } from '@/core/utils/sort'
import VIcon from '@/ui/icon/VIcon.vue'
import VPopup from '@/ui/VPopup.vue'
import { ComponentMetadata, components, ComponentTag } from '../component'
import { subPages } from './sub-pages'

export default Vue.extend({
  components: { VIcon, VPopup },
  // props: {
  //   components: {
  //     type: Array,
  //     required: true,
  //     default: () => [],
  //   },
  // },
  data() {
    return {
      tags: [],
      selectedTagName: 'all',
      subPages,
      selectedSubPage: null,
      selectedSubPageOpen: false,
      selectedSubPageTrigger: null,
    }
  },
  created() {
    this.refreshTags()
  },
  methods: {
    refreshTags() {
      let tags = [] as (ComponentTag & { count: number })[]
      const renderedComponents = components.filter(c => !c.hidden)
      renderedComponents.forEach(it => it.tags.forEach(t => {
        tags.push({ count: 0, ...t })
      }))
      const counts = lodash.countBy(tags, (t: ComponentTag) => t.name)
      tags = lodash.uniqBy(tags, t => t.name)
      tags.forEach(t => (t.count = counts[t.name]))
      this.tags = [{
        name: 'all',
        displayName: '全部',
        color: 'inherit',
        icon: 'mdi-shape-outline',
        order: 0,
        count: renderedComponents.length,
      } as ComponentTag, ...tags].sort(ascendingSort(it => it.order))
    },
    reset() {
      this.selectedTagName = 'all'
    },
    selectTag(tag: ComponentTag) {
      this.selectedTagName = tag.name
      this.$emit('change', (c: ComponentMetadata) => {
        if (tag.name === 'all') {
          return true
        }
        return c.tags.some(t => t.name === tag.name)
      })
    },
    async openSubPage(e: MouseEvent, component: Executable<VueModule>) {
      if (this.selectedSubPage === component) {
        this.selectedSubPageOpen = !this.selectedSubPageOpen
        return
      }
      this.selectedSubPage = component
      this.selectedSubPageTrigger = e.currentTarget
      await this.$nextTick()
      this.selectedSubPageOpen = true
    },
  },
})
</script>

<style lang="scss">
@import "common";
.sidebar > * {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .settings-panel-sub-page {
    font-size: 13px;
    top: 12px;
    transition: .15s cubic-bezier(0.22, 0.61, 0.36, 1);
    transform: translateX(calc(-12px * var(--direction)));
    min-width: 372px;
    padding: 12px;
    box-sizing: border-box;
    @include card();
    &.open {
      transform: translateX(0);
    }
    .sub-page-row {
      @include h-center();
      justify-content: space-between;
      flex-shrink: 0;
      &:not(:last-child) {
        margin-bottom: 12px;
      }
    }
    .separator {
      height: 1px;
      background-color: #8882;
      width: 100%;
    }
  }
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
    transition: .2s ease-out;
    pointer-events: none;
    background-color: #fff;
    border-right: 1px solid #8882;

    body.dark & {
      background-color: #222;
    }
  }
  .icon-list:hover ~ .component-tags,
  .component-tags:hover {
    opacity: 1;
    pointer-events: initial;
  }
}
</style>
