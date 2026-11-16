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
        <ComponentTags
          :page="page"
          :tag-name="activeTag.name"
          :tags="tags"
          @tag="selectTag"
          @page="selectPage"
        />
      </div>
      <div ref="mainContainer" class="main">
        <div v-show="page === 'list'" ref="componentList" class="component-list">
          <div class="settings-panel-search-bar">
            <TextBox v-model="searchKeyword" class="settings-panel-search" placeholder="搜索" />
          </div>
          <div
            v-for="feature of renderedFeatures"
            :key="feature.name"
            @click.capture="selectMultipleFeatures($event, feature.name)"
          >
            <ComponentSettings
              :class="{
                selected: selectedName === feature.name || batchSelection.includes(feature.name),
              }"
              :feature="feature"
              :data-name="feature.name"
              @click.native="selectFeature(feature)"
            />
          </div>
          <VEmpty v-if="renderedFeatures.length === 0" />
        </div>
        <keep-alive>
          <component :is="subPages[page]" v-if="page !== 'list'" />
        </keep-alive>
      </div>
      <VPopup
        class="component-detail-panel"
        :trigger-element="componentList"
        :open="Boolean(selectedFeature)"
        @popup-change="!$event && closeDetail()"
        @transitionend.self="clearClosedDetail"
      >
        <FeatureDetail
          v-if="displayedFeature"
          :key="displayedFeature.name"
          :feature="displayedFeature"
          :features="features"
          @close="closeDetail"
          @open-feature="selectFeature"
        />
      </VPopup>
    </div>
    <FeatureBatchActions
      :selection="selectedBatchFeatures"
      :scroll-container="mainContainer"
      @close="clearBatchSelection"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onUnmounted, ref, shallowRef, watch } from 'vue'
import { VIcon, TextBox, VPopup, VEmpty } from '@/ui'
import FeatureBatchActions from './FeatureBatchActions.vue'
import ComponentSettings from './ComponentSettings.vue'
import FeatureDetail from './FeatureDetail.vue'
import ComponentTags from './ComponentTags.vue'
import { useSettingsFeatures, type SettingsFeature } from './settings-feature'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (event: 'close'): void }>()

const subPages = {
  about: defineAsyncComponent(() => import('./sub-pages/AboutPage.vue')),
}
type Page = 'list' | keyof typeof subPages

const mainContainer = ref<HTMLElement>()
const componentList = ref<HTMLElement>()
const { features, tags } = useSettingsFeatures()
const page = ref<Page>('list')
const tagName = ref<string>()
const activeTag = computed(
  () => tags.value.find(tag => tag.name === tagName.value) ?? tags.value[0],
)
const selectedName = ref<string>()
const selectedFeature = computed(() =>
  features.value.find(feature => feature.name === selectedName.value),
)
const displayedFeature = shallowRef<SettingsFeature>()
const batchSelection = ref<string[]>([])
const selectionAnchor = ref('')
const peek = ref(false)
const searchKeyword = ref('')
const matchedFeatures = shallowRef<SettingsFeature[]>(features.value)
const renderedFeatures = computed(() => activeTag.value.filter(matchedFeatures.value))
const selectedBatchFeatures = computed(() =>
  renderedFeatures.value.filter(feature => batchSelection.value.includes(feature.name)),
)

const clearSelectedFeature = () => {
  selectedName.value = undefined
}
const closeDetail = () => selectedFeature.value?.closeDetail(clearSelectedFeature)
const clearClosedDetail = (event: TransitionEvent) => {
  if (event.propertyName === 'transform' && !selectedFeature.value) {
    displayedFeature.value = undefined
  }
}
const clearBatchSelection = () => {
  batchSelection.value = []
  selectionAnchor.value = ''
}
const selectMultipleFeatures = (event: MouseEvent, name: string) => {
  if (!event.ctrlKey && !event.shiftKey) {
    return
  }
  event.stopPropagation()
  const selected = selectedName.value
  closeDetail()
  const anchor = selected ?? selectionAnchor.value
  if (event.shiftKey) {
    const names = renderedFeatures.value.map(feature => feature.name)
    const start = names.indexOf(anchor)
    const end = names.indexOf(name)
    if (start !== -1) {
      batchSelection.value = names.slice(Math.min(start, end), Math.max(start, end) + 1)
      selectionAnchor.value = anchor
      return
    }
    batchSelection.value = [name]
  } else {
    const selection = selected ? [selected] : batchSelection.value
    batchSelection.value = selection.includes(name)
      ? selection.filter(item => item !== name)
      : [...selection, name]
  }
  selectionAnchor.value = batchSelection.value.length > 0 ? name : ''
}
const selectFeature = (feature: SettingsFeature) => {
  clearBatchSelection()
  const previous = selectedName.value
  closeDetail()
  if (previous === feature.name) {
    return
  }
  feature.openDetail(() => {
    selectedName.value = feature.name
  })
}
const selectPage = (next: Page) => {
  if (next === page.value) {
    return
  }
  closeDetail()
  clearBatchSelection()
  page.value = next
  nextTick(() => mainContainer.value?.scrollTo(0, 0))
}

let searchRevision = 0
const updateMatchedFeatures = async () => {
  const revision = ++searchRevision
  const candidates = features.value
  const keyword = searchKeyword.value.toLowerCase()
  if (!keyword) {
    matchedFeatures.value = candidates
    return
  }
  const matches = await Promise.all(
    candidates.map(async feature => (await feature.searchText()).toLowerCase().includes(keyword)),
  )
  if (revision === searchRevision && keyword === searchKeyword.value.toLowerCase()) {
    matchedFeatures.value = candidates.filter((_, index) => matches[index])
  }
}

const selectTag = (name: string) => {
  if (name !== activeTag.value.name) {
    closeDetail()
    searchKeyword.value = ''
    updateMatchedFeatures()
  }
  tagName.value = name
  selectPage('list')
}

watch(
  () => props.open,
  open => {
    if (!open) {
      clearBatchSelection()
    }
  },
)
watch(renderedFeatures, items => {
  const names = new Set(items.map(feature => feature.name))
  batchSelection.value = batchSelection.value.filter(name => names.has(name))
})
const updateSearch = lodash.debounce(updateMatchedFeatures, 200)
watch(searchKeyword, updateSearch)
onUnmounted(updateSearch.cancel)
watch(features, updateMatchedFeatures)
watch(selectedFeature, (feature, previous) => {
  if (feature) {
    displayedFeature.value = feature
  } else if (selectedName.value) {
    previous?.closeDetail(clearSelectedFeature)
  }
})
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
    width: 320px;
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
