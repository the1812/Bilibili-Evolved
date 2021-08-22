<template>
  <div class="component-detail">
    <div v-if="!settings" class="component-not-found">
      未找到组件'{{ componentData.displayName }}' ({{ componentData.name }}), 可能已被卸载.
    </div>
    <template v-if="settings">
      <div class="component-detail-header">
        <div class="display-name">
          {{ componentData.displayName }}
        </div>
        <VIcon class="close" icon="close" :size="18" @click="$emit('close')" />
      </div>
      <div class="component-detail-tags">
        <div v-for="t of componentData.tags" :key="t.name" class="tag">
          <div class="tag-color" :style="{ backgroundColor: t.color }"></div>
          {{ t.displayName }}
        </div>
      </div>
      <div class="component-detail-separator"></div>
      <template v-if="componentData.options && generatedOptions.length > 0">
        <div class="component-detail-options">
          <div class="component-detail-options-title">
            选项
          </div>
          <div v-for="[name, option] of generatedOptions" :key="name" class="generated-option">
            <ComponentOption
              :name="name"
              :display-name="option.displayName"
              :option="option"
              :component="componentData"
            ></ComponentOption>
          </div>
          <div v-if="componentData.extraOptions" class="extra-option">
            <component :is="componentData.extraOptions" :component-data="componentData"></component>
          </div>
          <slot></slot>
        </div>
        <div class="component-detail-separator"></div>
      </template>
      <template v-if="!(componentData.options && !componentData.description)">
        <ComponentDescription :component-data="componentData" />
        <div class="component-detail-separator"></div>
      </template>
      <div class="component-detail-internal-data">
        <div class="internal-name">
          内部名称: {{ componentData.name }}
        </div>
        <div v-if="componentActions.length > 0" class="extra-actions-wrapper">
          <div class="extra-actions">
            <VIcon icon="mdi-dots-vertical" :size="16" />
          </div>
          <div class="extra-actions-list">
            <ComponentAction
              v-for="a of componentActions"
              :key="a.name"
              class="extra-action-item"
              :item="a"
              :component="componentData"
            />
          </div>
        </div>
      </div>
      <!-- <div class="component-detail-separator"></div> -->
    </template>
  </div>
</template>

<script lang="ts">
import SwitchBox from '@/ui/SwitchBox.vue'
import { visible } from '@/core/observer'
import VButton from '@/ui/VButton.vue'
import VIcon from '@/ui/icon/VIcon.vue'
import { ComponentOptions } from '../component'
import ComponentDescription from './ComponentDescription.vue'
import ComponentOption from './ComponentOption.vue'
import { componentSettingsMixin } from './mixins'
import { componentActions } from './component-actions/component-actions'
import ComponentAction from './component-actions/ComponentAction.vue'

export default Vue.extend({
  components: {
    SwitchBox,
    ComponentDescription,
    ComponentOption,
    VButton,
    VIcon,
    ComponentAction,
  },
  mixins: [componentSettingsMixin],
  data() {
    return {
      virtual: false,
      componentActions,
    }
  },
  computed: {
    generatedOptions() {
      return Object.entries(this.componentData.options as ComponentOptions).filter(
        ([, option]) => !option.hidden,
      )
    },
  },
  async mounted() {
    const element = this.$el as HTMLElement
    visible(element, records => {
      records.forEach(record => {
        this.virtual = !record.isIntersecting
      })
    })
  },
})
</script>

<style lang="scss">
@import 'common';

.component-detail {
  min-width: 264px;
  width: 264px;
  &-separator {
    height: 1px;
    background-color: #8882;
    margin-bottom: 12px;
    flex-shrink: 0;
    align-self: stretch;
  }
  &-header {
    @include h-center();
    justify-content: space-between;
    margin-bottom: 12px;
    .display-name {
      font-weight: bold;
      font-size: 16px;
    }
    .close {
      cursor: pointer;
      &:hover {
        color: var(--theme-color);
      }
    }
  }
  .component-description:not(:last-child) {
    margin-bottom: 12px;
  }
  &-tags {
    @include h-center();
    flex-wrap: wrap;
    margin-bottom: 8px;
    .tag {
      @include h-center();
      @include card();
      @include round-bar(24);
      padding: 2px 6px;
      margin-right: 4px;
      margin-bottom: 4px;
      font-size: 12px;
      box-shadow: none;
      .tag-color {
        border-radius: 50%;
        width: 12px;
        height: 12px;
        margin-right: 4px;
      }
    }
  }
  &-internal-data {
    @include h-center();
    justify-content: space-between;

    .internal-name {
      opacity: 0.5;
    }
    .extra-actions-wrapper {
      position: relative;
      .extra-actions {
        padding: 4px;
        cursor: pointer;
        transform: translateX(2px);
      }
      .extra-actions-list {
        @include popup();
        padding: 4px;
        position: absolute;
        width: max-content;
        top: 100%;
        left: 50%;
        opacity: 0;
        pointer-events: none;
        transform: translateX(-50%) scaleY(0.8);
        transition: .2s ease-out;
        transform-origin: top;
      }
      .extra-actions:hover ~ .extra-actions-list,
      .extra-actions-list:hover {
        pointer-events: initial;
        opacity: 1;
        transform: translateX(-50%) scaleY(1);
      }
    }
    // margin-bottom: 12px;
    // &-item {
    //   margin-bottom: 6px;
    // }

  }
  &-operations {
    @include h-center();
    > * {
      flex: 1 0 0;
      &:not(:last-child) {
        margin-right: 8px;
      }
    }
  }
  &-options {
    margin-bottom: 12px;
    .component-detail-options-title {
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .generated-option:not(:last-child) {
      margin-bottom: 4px;
    }
  }
}
</style>
