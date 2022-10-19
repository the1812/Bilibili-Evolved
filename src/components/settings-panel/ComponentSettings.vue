<template>
  <div class="component-settings" :class="{ virtual }">
    <template v-if="!virtual">
      <div class="component-settings-row">
        <TagRing :tags="componentData.tags" />
        <div class="display-name">
          {{ componentData.displayName }}
        </div>
        <SwitchBox v-if="componentData.configurable !== false" v-model="settings.enabled" />
        <VIcon v-else icon="right-arrow" class="details-arrow" :size="18" />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import marked from 'marked'
import { getComponentSettings } from '@/core/settings'
import SwitchBox from '@/ui/SwitchBox.vue'
import VIcon from '@/ui/icon/VIcon.vue'
import { visibleInside } from '@/core/observer'
import { dq } from '@/core/utils'
import TagRing from './TagRing.vue'
import { getSelectedLanguage } from '../i18n/helpers'
import { ComponentMetadata } from '../component'

export default Vue.extend({
  components: {
    SwitchBox,
    TagRing,
    VIcon,
  },
  props: {
    componentData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      settings: getComponentSettings(this.componentData),
      virtual: false,
    }
  },
  async mounted() {
    const element = this.$el as HTMLElement
    const container = dq('.settings-panel-content .main') as HTMLElement
    if (!container) {
      console.log('settings container not found, virtual scroll will be disabled!')
      return
    }
    visibleInside(element, container, '150% 0px', records => {
      records.forEach(record => {
        this.virtual = !record.isIntersecting
      })
    })
  },
  methods: {
    markdown(input: string) {
      return marked(input)
    },
    descriptionI18n(component: ComponentMetadata) {
      const { description, options } = component
      if (!description) {
        if (options && Object.keys(options).length > 0) {
          const count = Object.keys(options).length
          return `${count}个选项`
        }
        return '暂无说明'
      }
      if (typeof description === 'string') {
        return description
      }
      return description[getSelectedLanguage()] || description['zh-CN']
    },
  },
})
</script>

<style lang="scss">
@import 'common';
@import 'markdown';

.component-settings {
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  overflow: hidden;
  padding: 7px 12px 7px 7px;
  width: 100%;
  min-height: 36px;
  position: relative;
  cursor: pointer;
  transition: 0.2s ease-out;
  user-select: none;

  &::after {
    content: '';
    opacity: 0;
    transition: opacity 0.2s ease-out;
    position: absolute;
    top: 0;
    left: 10px;
    height: 100%;
    width: calc(100% - 20px);
    pointer-events: none;
    $color: #8882;
    background-image: repeating-linear-gradient(
      to bottom,
      #0000,
      #0000 10px,
      $color 10px,
      $color 30px,
      #0000 30px,
      #0000 38px,
      $color 38px,
      $color 50px,
      #0000 50px
    );
  }
  &.virtual {
    &::after {
      opacity: 1;
    }
    .component-settings-row {
      display: none;
    }
  }
  // .main-tag-background {
  //   position: absolute;
  //   transform: rotate(-15deg);
  //   right: 4px;
  //   top: 4px;
  //   opacity: 0.1;
  //   pointer-events: none;
  // }
  .component-settings-row {
    @include h-center();
    justify-content: space-between;
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }
  .display-name {
    font-size: 14px;
    height: 20px;
    flex: 1 0 auto;
    margin-left: 6px;
    width: 200px;
    @include single-line();
    @include h-center();
  }
  .details-arrow {
    opacity: 0.75;
    width: 32px;
    justify-content: flex-end;
  }
  // .description {
  //   @include max-line(2);
  //   height: 36px;
  // }
  // .tags {
  //   @include h-center();
  //   .tag {
  //     height: 12px;
  //     width: 12px;
  //     border-radius: 50%;
  //     &:not(:last-child) {
  //       margin-right: 4px;
  //     }
  //   }
  // }
  .be-switch-box {
    margin: 0;
  }

  &:hover {
    background-color: #8881;
    .options-count {
      opacity: 1;
    }
  }
  &.selected {
    background-color: #8882;
  }
}
</style>
