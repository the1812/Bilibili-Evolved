<template>
  <div class="settings-panel" :class="{ collasped, peek }">
    <div class="settings-panel-header">
      <VIcon icon="settings-outline" />
      <div class="title">
        设置
      </div>
      <div class="settings-panel-search">
        <VIcon icon="search" :size="18" />
        <TextBox v-model="searchKeyword" placeholder="搜索"></TextBox>
      </div>
      <div
        class="peek"
        title="透视"
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
          <ComponentSettings
            v-for="c of renderedComponents"
            :key="c.name"
            :class="{ selected: selectedComponent === c }"
            :component-data="c"
            :data-name="c.name"
            @click.native="selectComponent(c)"
          >
          </ComponentSettings>
          <VEmpty v-if="renderedComponents.length === 0" />
        </div>
      </div>
      <VPopup
        ref="detailsPopup"
        class="component-detail-panel"
        :trigger-element="$refs.componentList"
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
  </div>
</template>

<script lang="ts">
import {
  VIcon,
  TextBox,
  VPopup,
  VEmpty,
} from '@/ui'
import { createPopper } from '@popperjs/core'
import { dq } from '@/core/utils'
import { addComponentListener } from '@/core/settings'
import { getHook } from '@/plugins/hook'
import ComponentSettings from './ComponentSettings.vue'
import {
  ComponentMetadata, ComponentTag, components,
} from '../component'
import ComponentDetail from './ComponentDetail.vue'
import ComponentTags from './ComponentTags.vue'
import { getDescriptionText } from '../description'

let activePopper: ReturnType<typeof createPopper>
const defaultSearchFilter = (items: ComponentMetadata[]) => items
export default {
  name: 'SettingsPanel',
  components: {
    VIcon,
    TextBox,
    VPopup,
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
      collasped: false,
      peek: false,
      searchKeyword: '',
      searchFilter: defaultSearchFilter,
    }
  },
  computed: {
    tags() {
      const renderedComponents = this.renderedComponents as ComponentMetadata[]
      let tags = [] as (ComponentTag & { count: number })[]
      renderedComponents.forEach(it => it.tags.forEach(t => {
        tags.push({ count: 0, ...t })
      }))
      const counts = lodash.countBy(tags, (t: ComponentTag) => t.name)
      tags = lodash.uniqBy(tags, t => t.name)
      tags.forEach(t => (t.count = counts[t.name]))
      return tags
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
      // }
      this.updateRenderedComponents()
    },
    components() {
      this.updateRenderedComponents()
      this.$refs.componentTags.refreshTags()
      if (!this.components.some((c: ComponentMetadata) => (
        c.name === this.selectedComponent?.name
      ))) {
        this.selectedComponent = null
      }
    },
  },
  mounted() {
    addComponentListener('settingsPanel.dockSide', () => {
      activePopper?.update()
    })
  },
  methods: {
    closePopper() {
      activePopper?.destroy()
      this.selectedComponent = null
    },
    selectComponent(component: ComponentMetadata) {
      const closeHooks = getHook('settingsPanel.componentDetail.close')
      const openHooks = getHook('settingsPanel.componentDetail.open')
      const selectedName = this.selectedComponent?.name
      const isAlreadySelected = selectedName === component.name
      closeHooks.before(selectedName)
      this.closePopper()
      closeHooks.after(selectedName)
      if (isAlreadySelected) {
        return
      }
      openHooks.before(component.name)
      this.selectedComponent = component
      activePopper = createPopper(
        dq(`.component-settings[data-name=${component.name}]`),
        this.$refs.detailsPopup.$el,
        {
          placement: 'right',
        },
      )
      openHooks.after(component.name)
    },
    updateRenderedComponents() {
      const internalFiltered = components.filter(c => {
        if (c.hidden) {
          return false
        }
        if (this.searchKeyword) {
          const text = [
            c.name,
            c.displayName,
            c.tags.map(t => `${t.name}\n${t.displayName}`).join('\n'),
            getDescriptionText(c),
          ]
          return text.join('\n').toLowerCase().includes(this.searchKeyword.toLowerCase())
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
@import "common";

.settings-panel-popup {
  z-index: 1000;
  .settings-panel {
    @include shadow();
    position: relative;
    overscroll-behavior: contain;
    border-radius: 8px;
    background-color: #fff;
    color: black;
    border: 1px solid #8882;
    box-sizing: content-box;
    display: flex;
    flex-direction: column;
    width: auto;
    min-width: 320px;
    height: var(--panel-height);
    --header-height: 50px;
    transition: opacity 0.2s 0.2s ease-out;
    body.dark & {
      background-color: #222;
      color: #eee;
      // border-color: #333;
    }
    .settings-panel-header {
      box-sizing: border-box;
      height: var(--header-height);
      padding: 12px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #8882;
      @include text-color();
      // body.dark & {
      //   border-color: #333;
      // }
      .title {
        margin-left: 6px;
        font-size: 18px;
        font-weight: bold;
      }
      .settings-panel-search {
        flex-grow: 1;
        @include h-center();
        justify-content: center;
        .be-textbox {
          flex: 0 0 120px;
        }
        .be-icon {
          margin-right: 8px;
          opacity: 0.5;
        }
      }
      .collaspe {
        .be-icon {
          font-size: 28px;
        }
      }
      .peek {
        margin-right: 8px;
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
        z-index: 1;
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
        }
        > * {
          flex: 1;
        }
      }
    }
    .component-detail-panel {
      @include card();
      padding: 12px;
    }
    &.collasped {
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
