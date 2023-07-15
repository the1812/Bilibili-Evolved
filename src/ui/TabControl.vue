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
        target="_blank"
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
    defaultTab: {
      type: String,
      required: false,
      default: '',
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
    const tabs = this.tabs as TabMappings
    return {
      selectedTabName:
        tabs.find((t: TabMapping) => t.name === this.defaultTab)?.name ?? tabs[0].name,
    }
  },
  computed: {
    selectedTab() {
      return this.tabs.find((t: TabMapping) => t.name === this.selectedTabName)
    },
  },
  mounted() {
    this.$emit('change', this.selectedTab.activeLink)
  },
  methods: {
    selectTab(tab: TabMapping) {
      if (this.selectedTabName !== tab.name) {
        this.selectedTabName = tab.name
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
@import './tabs';

.be-tab-control {
  display: flex;
  flex-direction: column;
  .default {
    &-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 8px 8px 0;
      @include tabs-style();
      .header-item {
        flex: 1;
        margin: 0 8px;
        &:empty {
          display: none;
        }
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
