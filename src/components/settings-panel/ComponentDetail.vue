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
      <!-- <div class="component-detail-separator"></div> -->
      <template
        v-if="(componentData.options && generatedOptions.length > 0) || componentData.extraOptions"
      >
        <div class="component-detail-options">
          <div class="component-detail-options-title">选项</div>
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
        <!-- <div class="component-detail-separator"></div> -->
      </template>
      <template v-if="!(componentData.options && !componentData.description)">
        <ComponentDescription
          class="component-detail-description"
          :component-data="componentData"
        />
        <!-- <div class="component-detail-separator"></div> -->
      </template>
      <div class="component-detail-grow"></div>
      <div class="component-detail-internal-data">
        <div v-if="componentData.commitHash" class="component-detail-internal-data-row">
          <div class="internal-name">Commit: {{ componentData.commitHash.substring(0, 9) }}</div>
        </div>
        <div class="component-detail-internal-data-row">
          <div class="internal-name">内部名称: {{ componentData.name }}</div>
          <MiniToast
            v-if="componentData.configurable !== false && componentActions.length > 0"
            placement="bottom"
            trigger="click"
            class="extra-actions-wrapper"
          >
            <div class="extra-actions">
              <VIcon icon="mdi-dots-vertical" :size="16" />
            </div>
            <template #toast>
              <div class="extra-actions-list">
                <div v-for="a of componentActions" :key="a.name">
                  <component
                    :is="a.component"
                    v-if="a.component"
                    :item="a"
                    :component="componentData"
                  />
                  <ComponentAction
                    v-else
                    v-show="a.visible !== false"
                    class="extra-action-item"
                    :item="a"
                    :component="componentData"
                  />
                </div>
              </div>
            </template>
          </MiniToast>
        </div>
      </div>
      <!-- <div class="component-detail-separator"></div> -->
    </template>
  </div>
</template>

<script lang="ts">
import { VButton, VIcon, SwitchBox, MiniToast } from '@/ui'
import { visible } from '@/core/observer'
import { OptionsMetadata } from '../component'
import ComponentDescription from './ComponentDescription.vue'
import ComponentOption from './ComponentOption.vue'
import { componentSettingsMixin } from './mixins'
import { componentActions, ComponentConfigAction } from './component-actions/component-actions'
import ComponentAction from './component-actions/ComponentAction.vue'

export default Vue.extend({
  components: {
    ComponentDescription,
    ComponentOption,
    ComponentAction,
    VButton,
    VIcon,
    SwitchBox,
    MiniToast,
  },
  mixins: [componentSettingsMixin],
  data() {
    return {
      virtual: false,
      componentActions: componentActions
        .map(factory => factory((this as any).componentData))
        .filter(it => {
          if (it === undefined) {
            return false
          }
          if ((it as ComponentConfigAction).visible === false) {
            return false
          }
          return true
        }),
    }
  },
  computed: {
    generatedOptions() {
      return Object.entries((this.componentData.options ?? {}) as OptionsMetadata).filter(
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
    await this.$nextTick()
    this.$emit('mounted')
    console.log(this.componentActions)
  },
})
</script>

<style lang="scss">
@import 'common';

.component-detail {
  min-width: 264px;
  width: 264px;
  flex: 1;
  background-color: inherit;
  border-radius: 7px;
  overflow: auto;
  @include v-stretch();

  .extra-option {
    display: flow-root;
  }
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
    padding: 12px;
    background-color: inherit;
    position: sticky;
    top: 0;
    z-index: 2;

    .display-name {
      @include semi-bold();
      font-size: 16px;
    }
    .close {
      cursor: pointer;
      &:hover {
        color: var(--theme-color);
      }
    }
  }
  &-description:not(:last-child) {
    padding: 12px 12px 0;
    // max-height: 9em;
    // line-height: 1.5;
    // @include no-scrollbar();
  }
  &-tags {
    @include h-center();
    flex-wrap: wrap;
    padding: 0 8px 8px;
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
    @include v-stretch();
    justify-content: center;
    flex-shrink: 0;
    position: sticky;
    bottom: 0;
    min-height: 24px;
    box-sizing: content-box;
    background-color: inherit;
    padding: 8px 12px;

    &-row {
      @include h-center();
      justify-content: space-between;
      line-height: 24px;
    }

    .internal-name {
      opacity: 0.5;
    }
    .tippy-content {
      padding: 4px;
    }
    .extra-actions-wrapper {
      position: relative;
      transform: translateX(2px);

      .extra-actions {
        padding: 4px;
        cursor: pointer;
      }
      .extra-actions-list {
        width: max-content;
      }
      //   @include popup();
      //   padding: 4px;
      //   position: absolute;
      //   width: max-content;
      //   top: 100%;
      //   left: 50%;
      //   opacity: 0;
      //   pointer-events: none;
      //   transform: translateX(-50%) scaleY(0.8);
      //   transition: 0.2s ease-out;
      //   transform-origin: top;
      // }
      // .extra-actions:hover ~ .extra-actions-list,
      // .extra-actions-list:hover {
      //   pointer-events: initial;
      //   opacity: 1;
      //   transform: translateX(-50%) scaleY(1);
      // }
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
    padding: 8px 12px;
    // flex: 1 0 0;
    // height: 0;
    // @include no-scrollbar();

    .component-detail-options-title {
      @include semi-bold();
      font-size: 14px;
      margin-bottom: 8px;
    }
    .generated-option:not(:last-child) {
      margin-bottom: 4px;
    }
  }
  &-grow {
    flex: 1;
  }
}
</style>
