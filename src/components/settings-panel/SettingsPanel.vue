<template>
  <div class="settings-panel" :class="{ collapsed, peek }">
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
      <div class="close" @click="$emit('close')">
        <VIcon icon="close" :size="18" />
      </div>
    </div>
    <div class="settings-panel-content">
      <div ref="sidebarContainer" class="sidebar">
        <ComponentTags ref="componentTags" @change="searchFilter = $event" />
      </div>
      <div ref="mainContainer" class="main">
        <div ref="componentList" class="component-list">
          <div class="settings-panel-search-bar">
            <TextBox v-model="searchKeyword" class="settings-panel-search" placeholder="搜索" />
            <VButton
              v-for="action of searchBarActions"
              :key="action.key"
              type="transparent"
              icon
              :title="
                typeof action.title === 'function' ? action.title(searchBarContext) : action.title
              "
              :disabled="action.disabled ? action.disabled(searchBarContext) : false"
            >
              <VIcon :icon="action.icon" :size="18" @click="action.run(searchBarContext)" />
            </VButton>
          </div>
          <div
            v-for="c of renderedComponents"
            :key="c.name"
            @click.ctrl.stop.capture="selectMultipleComponent(c)"
            @click.shift.stop.capture="selectMultipleComponent(c, true)"
          >
            <ComponentSettings
              :class="{ selected: isComponentSelected(c.name) }"
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
        ref="detailsPopup"
        class="component-detail-panel"
        :trigger-element="$refs.componentList"
        :open="componentDetailOpen"
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
  </div>
</template>

<script lang="ts">
import { VIcon, TextBox, VPopup, VEmpty, VButton } from '@/ui'
import { getHook } from '@/plugins/hook'
import { deleteValue } from '@/core/utils'
import ComponentSettings from './ComponentSettings.vue'
import { ComponentMetadata, ComponentTag, components } from '../component'
import ComponentDetail from './ComponentDetail.vue'
import ComponentTags from './ComponentTags.vue'
import { getDescriptionText } from '../description'
import { SearchBarActionContext, searchBarActions } from './search-bar-actions'

const defaultSearchFilter = (items: ComponentMetadata[]) => items
export default {
  name: 'SettingsPanel',
  components: {
    VIcon,
    TextBox,
    VPopup,
    VButton,
    VEmpty,
    ComponentSettings,
    ComponentDetail,
    ComponentTags,
  },
  data() {
    return {
      components,
      renderedComponents: components.filter(c => !c.hidden),
      selectedComponent: null,
      selectedComponents: [],
      componentDetailOpen: false,
      collapsed: false,
      peek: false,
      searchKeyword: '',
      searchFilter: defaultSearchFilter,
      searchBarActions,
    }
  },
  computed: {
    isComponentSelected() {
      return (name: string) =>
        this.selectedComponents.some((c: ComponentMetadata) => c.name === name)
    },
    tags() {
      const renderedComponents = this.renderedComponents as ComponentMetadata[]
      let tags = [] as (ComponentTag & { count: number })[]
      renderedComponents.forEach(it =>
        it.tags.forEach(t => {
          tags.push({ count: 0, ...t })
        }),
      )
      const counts = lodash.countBy(tags, (t: ComponentTag) => t.name)
      tags = lodash.uniqBy(tags, t => t.name)
      tags.forEach(t => (t.count = counts[t.name]))
      return tags
    },
    searchBarContext(): SearchBarActionContext {
      return lodash.pick(
        this,
        'components',
        'selectedComponent',
        'selectedComponents',
        'searchKeyword',
        'searchFilter',
      )
    },
  },
  watch: {
    searchKeyword: lodash.debounce(function searchKeywordWatch() {
      // if (this.searchKeyword !== '') {
      //   this.$refs.componentTags?.reset()
      // }
      this.updateRenderedComponents()
    }, 200),
    searchFilter() {
      // if (this.searchFilter !== defaultSearchFilter) {
      this.searchKeyword = ''
      this.selectedComponents = []
      // }
      this.updateRenderedComponents()
    },
    components() {
      this.updateRenderedComponents()
      this.$refs.componentTags.refreshTags()
      if (
        !this.components.some((c: ComponentMetadata) => c.name === this.selectedComponent?.name)
      ) {
        this.selectedComponent = null
      }
    },
  },
  methods: {
    closePopper() {
      this.selectedComponent = null
      this.selectedComponents = []
      this.componentDetailOpen = false
    },
    selectMultipleComponent(component: ComponentMetadata, listSelect = false) {
      if (this.selectedComponent && listSelect) {
        // handle shift + click
        const { name } = component
        const { name: selectedComponentName } = this.selectedComponent as ComponentMetadata
        const list = this.renderedComponents as ComponentMetadata[]
        let startIdx = list.findIndex(c => c.name === selectedComponentName)
        let endIdx = list.findIndex(c => c.name === name)
        if (startIdx > endIdx) {
          // if start index is greater than end index, swap them
          ;[startIdx, endIdx] = [endIdx, startIdx]
        }
        this.selectedComponents = list.slice(startIdx, endIdx + 1)
        return
      }
      const selectedList = this.selectedComponents as ComponentMetadata[]
      const selectedComponent = selectedList.find(c => c.name === component.name)
      if (selectedComponent) {
        deleteValue(selectedList, c => c.name === selectedComponent.name)
      } else {
        selectedList.push(component)
      }
    },
    selectComponent(component: ComponentMetadata) {
      this.selectedComponents = []
      const closeHooks = getHook('settingsPanel.componentDetail.close')
      const openHooks = getHook('settingsPanel.componentDetail.open')
      const selectedName = this.selectedComponent?.name
      const isAlreadySelected = this.componentDetailOpen && selectedName === component.name
      closeHooks.before(selectedName)
      this.closePopper()
      closeHooks.after(selectedName)
      if (isAlreadySelected) {
        return
      }
      openHooks.before(component.name)
      this.selectedComponents.push(component)
      this.selectedComponent = component
      this.componentDetailOpen = true
      openHooks.after(component.name)
    },
    async updateRenderedComponents() {
      const textMap: Record<string, string> = await (async () => {
        if (!this.searchKeyword) {
          return {}
        }
        return Object.fromEntries(
          await Promise.all(
            components.map(async c => [
              c.name,
              [
                c.name,
                c.displayName,
                c.tags.map(t => `${t.name}\n${t.displayName}`).join('\n'),
                await getDescriptionText(c),
              ]
                .join('\n')
                .toLowerCase(),
            ]),
          ),
        )
      })()
      const internalFiltered = components.filter(c => {
        if (c.hidden) {
          return false
        }
        if (this.searchKeyword) {
          const text = textMap[c.name]
          if (!text) {
            return false
          }
          return text.includes(this.searchKeyword.toLowerCase())
        }
        return true
      })
      // if (this.searchKeyword) {
      //   console.log('updateRenderedComponents', this.searchKeyword)
      //   this.renderedComponents = internalFiltered
      //   return
      // }
      // console.log('updateRenderedComponents', this.searchKeyword)
      this.renderedComponents = this.searchFilter(internalFiltered)
    },
  },
}
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
      --settings-panel-background: #222;
      color: #eee;
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
            padding-right: 8px;
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
      @include card();
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
    &.collapsed {
      height: auto;
      transform: translateY(calc(50% - 45vh));
      .header,
      body.dark & .header {
        border-color: transparent;
      }
      .sidebar,
      .main {
        opacity: 0;
        padding: 0;
        pointer-events: none;
      }
      .sidebar {
        display: none;
      }
      opacity: 0.3;
      &:hover {
        opacity: 1;
      }
    }
    &.peek {
      opacity: 0.1;
    }
  }
}
</style>
