<template>
  <div class="be-tab-control">
    <div class="default-header">
      <slot name="tabs">
        <div class="default-tabs">
          <div
            v-for="t of tabs"
            :key="t.name"
            class="default-tab"
            :data-count="t.count > 0 ? t.count : null"
            :class="{ selected: t === selectedTab }"
            @click="selectTab(t)"
          >
            <div class="default-tab-name">
              {{ t.displayName }}
            </div>
          </div>
        </div>
      </slot>
      <div class="header-item">
        <slot name="header-item"></slot>
      </div>
      <a
        v-if="moreLink !== null && moreLink !== undefined"
        :href="typeof moreLink === 'function' ? moreLink(selectedTab) : moreLink"
        class="be-more-link"
      >
        <VButton :disabled="!moreLink" round>
          <slot name="more-link">
            查看更多
            <VIcon icon="mdi-dots-horizontal" :size="18"></VIcon>
          </slot>
        </VButton>
      </a>
    </div>
    <slot name="content">
      <div class="default-content">
        <transition name="content-transition">
          <component :is="selectedTab.component" v-bind="selectedTab.propsData"></component>
        </transition>
      </div>
    </slot>
  </div>
</template>

<script lang="ts">
import { TabMappings, TabMapping } from './tab-mapping'

export default Vue.extend({
  name: 'TabControl',
  components: {
    VButton: () => import('./VButton.vue').then(m => m.default),
    VIcon: () => import('./icon/VIcon.vue').then(m => m.default),
  },
  model: {
    prop: 'link',
    event: 'change',
  },
  props: {
    tabs: {
      type: Array,
      required: true,
      validator(mappings: TabMappings) {
        if (mappings.length === 0) {
          return false
        }
        return true
      },
    },
    link: {
      type: String,
      required: false,
      default: null,
    },
    moreLink: {
      type: [String, Function],
      default: null,
    },
  },
  data() {
    return {
      selectedTab: this.tabs[0] as TabMapping,
    }
  },
  mounted() {
    this.$emit('change', this.selectedTab.activeLink)
  },
  methods: {
    selectTab(tab: TabMapping) {
      if (this.selectedTab !== tab) {
        this.selectedTab = tab
        tab.count = 0
        this.$emit('change', this.selectedTab.activeLink)
      } else if (tab.activeLink) {
        window.open(tab.activeLink, '_blank')
      }
    },
  },
})
</script>

<style lang="scss">
@import './common';
.be-tab-control {
  display: flex;
  flex-direction: column;
  .default {
    &-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 8px 8px 0;
      .default-tabs {
        display: flex;
        padding: 6px 8px;
        // margin-bottom: 8px;
        .default-tab {
          font-size: 14px;
          position: relative;
          cursor: pointer;
          user-select: none;
          @include text-color();
          &:not(:last-child) {
            margin-right: 16px;
          }
          &::after {
            content: '';
            position: absolute;
            top: calc(100% + 4px);
            left: 50%;
            display: block;
            height: 3px;
            border-radius: 2px;
            width: 80%;
            background-color: var(--theme-color);
            transition: transform 0.2s ease-out;
            transform: translateX(-50%) scaleX(0);
          }
          &-name {
            transition: transform 0.2s ease-out;
            opacity: 0.5;
          }
          &.selected {
            .default-tab-name {
              font-weight: bold;
              transform: scale(1.1);
              opacity: 1;
            }
          }
          &.selected::after {
            transform: translateX(-50%) scaleX(1);
          }
          &:not(.selected)[data-count]::before {
            content: attr(data-count);
            position: absolute;
            bottom: calc(100% + 2px);
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px;
            font-size: 11px;
            border-radius: 10px;
            background-color: #fff;
            border: 1px solid #8882;
            height: 10px;
            min-width: 10px;
            box-sizing: content-box;
            line-height: 1;
            body.dark & {
              background-color: #333;
            }
          }
        }
      }
      .header-item {
        flex: 1;
        margin: 0 8px;
      }
      .be-more-link {
        .be-button {
          padding: 4px 6px 4px 10px;
          .be-icon {
            margin-left: 4px;
          }
        }
      }
    }
    &-content {
      display: flex;
      flex: 1;
      justify-content: center;
      padding: 6px 0;
      position: relative;
      max-height: 100%;
      @include no-scrollbar();
      .content-transition {
        &-enter,
        &-leave-to {
          opacity: 0;
          transform: translateY(-12px);
        }
        &-leave-active {
          position: absolute;
        }
        &-enter-active,
        &-leave-active {
          transition: 0.2s ease-out;
        }
      }
    }
  }
}
</style>
