<template>
  <div class="settings-panel" :class="{ peek }">
    <div class="settings-panel-header">
      <VIcon icon="settings-outline" />
      <div class="title">设置</div>
      <div
        class="peek"
        title="透视"
        style="margin-left: auto"
        @mouseover="peek = true"
        @mouseout="peek = false"
      >
        <VIcon icon="eye" :size="18" />
      </div>
      <div class="close" @click="emit('close')">
        <VIcon icon="close" :size="18" />
      </div>
    </div>
    <div class="settings-panel-content">
      <div class="sidebar">
        <ComponentTags ref="componentTags" @change="searchFilter = $event" />
      </div>
      <div ref="mainContainer" class="main">
        <div ref="componentList" class="component-list">
          <div class="settings-panel-search-bar">
            <TextBox v-model="searchKeyword" class="settings-panel-search" placeholder="搜索" />
          </div>
          <div
            v-for="c of renderedComponents"
            :key="c.name"
            @click.capture="selectMultipleComponent($event, c.name)"
          >
            <ComponentSettings
              :class="{
                selected: selectedComponent?.name === c.name || batchSelection.includes(c.name),
              }"
              :component-data="c"
              :data-name="c.name"
              @click.native="selectComponent(c)"
            >
            </ComponentSettings>
          </div>
          <VEmpty v-if="renderedComponents.length === 0" />
        </div>
      </div>
      <VPopup
        class="component-detail-panel"
        :trigger-element="componentList"
        :open="Boolean(selectedComponent)"
        @popup-change="!$event && closePopper()"
      >
        <ComponentDetail
          v-if="selectedComponent"
          :key="selectedComponent.name"
          :component-data="selectedComponent"
          @close="closePopper()"
        />
      </VPopup>
    </div>
    <ComponentBatchActions
      :selection="batchSelection"
      :scroll-container="mainContainer"
      @close="clearBatchSelection"
    />
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { VIcon, TextBox, VPopup, VEmpty } from '@/ui'
import { getHook } from '@/plugins/hook'
import { ComponentMetadata, components } from '../component'
import { getFeatureAuthors } from '../author'
import { getDescriptionText } from '../description'
import ComponentBatchActions from './ComponentBatchActions.vue'
import ComponentSettings from './ComponentSettings.vue'
import ComponentDetail from './ComponentDetail.vue'
import ComponentTags from './ComponentTags.vue'
import type { SettingsTag } from './tag-filter'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (event: 'close'): void }>()

const mainContainer = ref<HTMLElement>()
const componentList = ref<HTMLElement>()
const componentTags = ref<InstanceType<typeof ComponentTags>>()
const allComponents = ref(components)
const renderedComponents = ref(components.filter(c => !c.hidden))
const selectedComponent = ref<ComponentMetadata>()
const batchSelection = ref<string[]>([])
const selectionAnchor = ref('')
const peek = ref(false)
const searchKeyword = ref('')
const searchFilter = ref<SettingsTag['filter']>(items => items)

const closePopper = () => {
  selectedComponent.value = undefined
}
const clearBatchSelection = () => {
  batchSelection.value = []
  selectionAnchor.value = ''
}
const selectMultipleComponent = (event: MouseEvent, name: string) => {
  if (!event.ctrlKey && !event.shiftKey) {
    return
  }
  event.stopPropagation()
  const selectedName = selectedComponent.value?.name
  if (selectedName) {
    const { before, after } = getHook('settingsPanel.componentDetail.close')
    before(selectedName)
    closePopper()
    after(selectedName)
  }
  const anchor = selectedName ?? selectionAnchor.value
  if (event.shiftKey) {
    const names = renderedComponents.value.map(c => c.name)
    const start = names.indexOf(anchor)
    const end = names.indexOf(name)
    if (start !== -1) {
      batchSelection.value = names.slice(Math.min(start, end), Math.max(start, end) + 1)
      selectionAnchor.value = anchor
      return
    }
    batchSelection.value = [name]
  } else {
    const selection = selectedName ? [selectedName] : batchSelection.value
    batchSelection.value = selection.includes(name)
      ? selection.filter(selected => selected !== name)
      : [...selection, name]
  }
  selectionAnchor.value = batchSelection.value.length > 0 ? name : ''
}
const selectComponent = (component: ComponentMetadata) => {
  clearBatchSelection()
  const closeHooks = getHook('settingsPanel.componentDetail.close')
  const openHooks = getHook('settingsPanel.componentDetail.open')
  const selectedName = selectedComponent.value?.name
  closeHooks.before(selectedName)
  closePopper()
  closeHooks.after(selectedName)
  if (selectedName === component.name) {
    return
  }
  openHooks.before(component.name)
  selectedComponent.value = component
  openHooks.after(component.name)
}

let searchRevision = 0
const updateRenderedComponents = async () => {
  const revision = ++searchRevision
  const visibleComponents = allComponents.value.filter(c => !c.hidden)
  const keyword = searchKeyword.value.toLowerCase()
  if (!keyword) {
    renderedComponents.value = searchFilter.value(visibleComponents)
    return
  }
  const matches = await Promise.all(
    visibleComponents.map(async c => {
      const text = [
        c.name,
        c.displayName,
        ...c.tags.flatMap(t => [t.name, t.displayName]),
        ...getFeatureAuthors(c.author).map(author => `@${author.name}`),
        await getDescriptionText(c),
      ]
        .join('\n')
        .toLowerCase()
      return text.includes(keyword)
    }),
  )
  if (revision === searchRevision && keyword === searchKeyword.value.toLowerCase()) {
    renderedComponents.value = searchFilter.value(
      visibleComponents.filter((_, index) => matches[index]),
    )
  }
}

watch(
  () => props.open,
  open => {
    if (!open) {
      clearBatchSelection()
    }
  },
)
watch(renderedComponents, items => {
  batchSelection.value = batchSelection.value.filter(name => items.some(item => item.name === name))
})
const updateSearch = lodash.debounce(updateRenderedComponents, 200)
watch(searchKeyword, updateSearch)
onUnmounted(updateSearch.cancel)
watch(searchFilter, () => {
  searchKeyword.value = ''
  updateRenderedComponents()
})
watch(
  () => allComponents.value.slice(),
  items => {
    updateRenderedComponents()
    componentTags.value?.refreshTags()
    if (selectedComponent.value && !items.some(c => c.name === selectedComponent.value.name)) {
      closePopper()
    }
  },
)
</script>

<style lang="scss">
@import 'common';

.settings-panel-popup {
  z-index: 1000;
  .settings-panel {
    @include shadow();
    @include v-stretch();
    --header-height: 50px;
    --settings-panel-background: #fff;
    background-color: var(--settings-panel-background);
    position: relative;
    overscroll-behavior: contain;
    border-radius: 8px;
    color: black;
    border: 1px solid #8882;
    box-sizing: content-box;
    width: auto;
    min-width: 320px;
    height: var(--panel-height);
    transition: opacity 0.2s 0.2s ease-out;
    body.dark & {
      --settings-panel-background: var(--be-color-panel-bg, #222);
      color: var(--be-color-text-title, #eee);
      // border-color: #333;
    }
    .settings-panel-header {
      box-sizing: border-box;
      height: var(--header-height);
      padding: 12px;
      border-bottom: 1px solid #8882;
      @include h-center(8px);
      @include text-color();
      // body.dark & {
      //   border-color: #333;
      // }
      .title {
        font-size: 18px;
        @include semi-bold();
      }
      .collaspe {
        .be-icon {
          font-size: 28px;
        }
      }
      .peek {
        cursor: pointer;
      }
      .collaspe,
      .close {
        .be-icon {
          cursor: pointer;
          transition: 0.2s ease-out;
          &:hover {
            color: var(--theme-color);
          }
        }
      }
    }
    .settings-panel-content {
      flex: 1;
      display: flex;
      max-height: calc(var(--panel-height) - var(--header-height));
      .sidebar {
        display: flex;
        flex-direction: column;
        z-index: 2;
      }
      .main {
        flex: 1;
        padding: 0;
        position: relative;
        @include no-scrollbar();
        .be-empty {
          min-height: 36px;
          padding: 7px;
        }
        .component-list {
          display: grid;
          grid-template-columns: auto;
          gap: 0;
          width: auto;
          margin: 0;
          // > * {
          //   margin-right: 12px;
          //   margin-bottom: 12px;
          // }

          .transition {
            &-move,
            &-enter-active,
            &-leave-active {
              transition: all 0.5s ease;
            }
            &-enter-from,
            &-leave-to {
              opacity: 0;
              transform: translateY(-30px);
            }
            &-leave-active {
              position: absolute;
            }
          }

          .settings-panel-search-bar {
            @include h-center();
            background-color: var(--settings-panel-background);
            height: 36px;
            box-sizing: border-box;
            border-bottom: 1px solid #8882;
            position: sticky;
            top: 0;
            z-index: 1;
            .settings-panel-search {
              align-self: stretch;
              font-size: 13px;
              box-shadow: none;
              input {
                padding: 4px 10px;
              }
            }
          }
        }
        > * {
          flex: 1;
        }
      }
    }
    .component-detail-panel {
      @include popup();
      @include v-stretch();
      top: 50%;
      left: calc(100% - 12px);
      height: calc(100% - 22px);
      z-index: -1;
      transform: translateZ(0) translateY(-50%) translateX(calc(-48% * var(--direction)));
      transition: transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1),
        opacity 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
      padding-left: 12px;
      body.settings-panel-dock-right & {
        left: unset;
        right: calc(100% - 12px);
        padding: 0 12px 0 0;
      }
      &.open {
        transform: translateZ(0) translateY(-50%) translateX(0);
      }
    }
    &.peek {
      opacity: 0.1;
    }
  }
}
</style>
