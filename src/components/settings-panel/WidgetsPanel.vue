<template>
  <div class="widgets-panel">
    <div class="widgets-panel-header"><VIcon icon="widgets"></VIcon>功能</div>
    <!-- <div class="widgets-loading" v-if="loading">加载中...</div> -->
    <VEmpty v-if="!loading && widgets.length === 0" class="widgets-empty">
      <div class="widgets-empty-content">
        空空如也哦 =￣ω￣=<br />
        可点此参考
        <a href="https://bilibili-evolved-doc.vercel.app/docs/user/settings" target="_blank">
          用户手册
        </a>
        以安装所需功能
      </div>
    </VEmpty>
    <div class="widget-items">
      <component
        :is="w.component"
        v-for="w of widgets"
        :key="w.name"
        class="widget-item"
        :options="w.options"
      ></component>
    </div>
  </div>
</template>

<script lang="ts">
import { Widget } from '@/components/widget'
import { deleteValue, matchUrlPattern } from '@/core/utils'
import { VIcon, VEmpty } from '@/ui'
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
    if (result === true || (result instanceof Promise && (await result) === true)) {
      return true
    }
    return false
  }
  return true
}
export default Vue.extend({
  components: {
    VIcon,
    VEmpty,
  },
  data() {
    unsafeWindow.allWidgets = allWidgets
    return {
      allWidgets,
      widgets: [],
      loading: true,
    }
  },
  watch: {
    allWidgets() {
      this.widgets = []
      this.allWidgets.forEach(async (w: Widget) => {
        const add = await widgetFilter(w)
        if (add) {
          this.widgets.push(w)
        } else {
          deleteValue(this.widgets, (widget: Widget) => widget.name === w.name)
        }
      })
      console.log('updated widgets', this.widgets)
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
@import 'common';
@import 'markdown';

.widgets-panel {
  max-height: var(--panel-height);
  min-height: 80px;
  @include v-center();
  justify-content: flex-start;
  align-items: flex-start;
  padding: 16px;
  padding-right: 20px;
  @include popup();
  @include text-color();
  &-header {
    flex: 0 0 auto;
    @include h-center();
    @include semi-bold();
    font-size: 18px;
    margin-bottom: 18px;
    .be-icon {
      margin-right: 6px;
    }
  }
  .widgets-loading,
  .widgets-empty {
    padding: 12px 0;
    .widgets-empty-content {
      @include markdown();
    }
  }
  .widget-items {
    position: relative;
    @include v-stretch(8px);
    align-items: flex-start;
    .widget-item {
      font-size: 14px;
      transition: 0.2s ease-out;
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
    }
    .multiple-widgets {
      @include v-stretch(8px);
      align-items: flex-start;
      position: relative;
    }
  }
}
</style>
