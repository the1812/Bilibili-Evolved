<template>
  <div class="widgets-panel">
    <div class="widgets-panel-header">
      <VIcon icon="widgets"></VIcon>功能
    </div>
    <!-- <div class="widgets-loading" v-if="loading">加载中...</div> -->
    <VEmpty v-if="!loading && widgets.length === 0" class="widgets-empty"></VEmpty>
    <transition-group name="widget-item" tag="div" class="widget-items">
      <component
        :is="w.component"
        v-for="w of widgets"
        :key="w.name"
        class="widget-item"
        :options="w.options"
      ></component>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { Widget } from '@/widgets/widget'
import { matchUrlPattern } from '@/core/utils'
import { registerAndGetData } from '../../plugins/data'
import { WidgetsPlugin } from '.'

const allWidgets: Widget[] = []
const widgetFilter = async (w: Widget) => {
  if (w.urlExclude && w.urlExclude.some(matchUrlPattern)) {
    return false
  }
  if (w.urlInclude && w.urlInclude.every(lodash.negate(matchUrlPattern))) {
    return false
  }
  if (w.condition) {
    const result = w.condition()
    if (
      result === true
      || (result instanceof Promise && (await result) === true)
    ) {
      return true
    }
    return false
  }
  return true
}
export default Vue.extend({
  components: {
    VIcon: () => import('@/ui/icon/VIcon.vue').then(m => m.default),
    VEmpty: () => import('@/ui/VEmpty.vue').then(m => m.default),
  },
  data() {
    return {
      allWidgets,
      widgets: [],
      loading: true,
    }
  },
  watch: {
    async allWidgets() {
      const widgets = []
      await Promise.all(
        this.allWidgets.map(async (w: Widget) => {
          if (await widgetFilter(w)) {
            widgets.push(w)
          }
        }),
      )
      this.widgets = widgets
      console.log(this.allWidgets, widgets)
    },
  },
  created() {
    // setTimeout(() => {
    registerAndGetData(WidgetsPlugin, allWidgets)
    this.$nextTick().then(() => (this.loading = false))
    // }, 300)
  },
})
</script>

<style lang="scss">
@import "common";
.widgets-panel {
  max-height: var(--panel-height);
  min-height: 80px;
  @include v-center();
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  padding: 16px;
  padding-right: 20px;
  // background-color: #f8f8f8;
  // border-radius: 0 8px 8px 0;
  // border: 1px solid #e8e8e8;
  // border-left-width: 0;
  // box-sizing: content-box;
  // overflow: auto;
  @include popup();
  @include no-scrollbar();
  @include text-color();
  // @include shadow();
  // body.dark & {
  //   background-color: #1a1a1a;
  //   border-color: #333;
  // }
  &-header {
    flex: 0 0 auto;
    @include h-center();
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 18px;
    .be-icon {
      margin-right: 6px;
    }
  }
  .widgets-loading,
  .widgets-empty {
    padding: 12px 0;
  }
  .widget-items {
    position: relative;
    @include v-stretch();
    align-items: flex-start;
    .widget-item {
      font-size: 14px;
      transition: .2s ease-out;
      display: flex;
      &-enter,
      &-leave-to {
        opacity: 0;
        transform: scale(0.9);
      }
      &-leave-active {
        transition: 0.24s cubic-bezier(0.22, 0.61, 0.36, 1);
        position: absolute;
        white-space: nowrap;
      }
      &:not(:last-child) {
        margin-bottom: 8px;
      }
    }
    .multiple-widgets {
      @include v-center();
      align-items: flex-start;
      position: relative;
      > .default-widget:not(:last-child) {
        margin-bottom: 8px;
      }
    }
  }
}
</style>
