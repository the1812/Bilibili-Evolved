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
        <div
          v-for="t of componentData.tags"
          :key="t.name"
          class="tag"
        >
          <div class="tag-color" :style="{ backgroundColor: t.color }"></div>
          {{ t.displayName }}
        </div>
      </div>
      <div class="component-detail-separator"></div>
      <template
        v-if="componentData.options && generatedOptions.length > 0"
      >
        <div
          class="component-detail-options"
        >
          <div class="component-detail-options-title">
            选项
          </div>
          <div
            v-for="[name, option] of generatedOptions"
            :key="name"
            class="generated-option"
          >
            <ComponentOption
              :name="name"
              :display-name="option.displayName"
              :option="option"
              :component="componentData"
            ></ComponentOption>
          </div>
          <div v-if="componentData.extraOptions" class="extra-option">
            <component
              :is="componentData.extraOptions"
              :component-data="componentData"
            ></component>
          </div>
          <slot></slot>
        </div>
        <div class="component-detail-separator"></div>
      </template>
      <template v-if="!(componentData.options && !componentData.description)">
        <ComponentDescription
          :component-data="componentData"
        />
        <div class="component-detail-separator"></div>
      </template>
      <div class="component-detail-internal-data">
        <div class="component-detail-internal-data-item">
          内部名称: {{ componentData.name }}
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

export default Vue.extend({
  components: {
    SwitchBox,
    ComponentDescription,
    ComponentOption,
    VButton,
    VIcon,
  },
  mixins: [componentSettingsMixin],
  data() {
    return {
      virtual: false,
    }
  },
  computed: {
    generatedOptions() {
      return Object.entries(
        this.componentData.options as ComponentOptions,
      ).filter(([, option]) => !option.hidden)
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
@import "common";

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
    opacity: .5;
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