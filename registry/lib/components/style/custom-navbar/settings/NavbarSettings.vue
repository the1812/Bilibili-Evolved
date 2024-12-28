<template>
  <VPopup
    ref="popup"
    v-model="open"
    class="custom-navbar-settings"
    fixed
    :lazy="false"
    :trigger-element="triggerElement"
  >
    <div class="navbar-settings-header">
      <VIcon class="title-icon" icon="mdi-sort" :size="24"></VIcon>
      <div class="title">顶栏布局设置</div>
      <div class="grow"></div>
      <div class="close" @click="open = false">
        <VIcon icon="close" :size="18"></VIcon>
      </div>
    </div>
    <div class="navbar-settings-content">
      <div class="navbar-settings-section">
        <div class="navbar-settings-section-title">边缘间距</div>
        <div class="navbar-settings-section-description">
          设定两侧边缘处的间距, 单位为百分比, 100%为整个顶栏的宽度.
          <br />空间不足时, 实际呈现的间距会自动缩小.
        </div>
        <div
          class="navbar-settings-section-content"
          @mouseover="peekPadding(true)"
          @mouseout="peekPadding(false)"
        >
          <VSlider v-model="padding" :min="0" :max="40" :step="0.5"></VSlider>
          <div class="padding-value">{{ padding.toFixed(1) }}%</div>
        </div>
      </div>
      <div v-if="isLogin" class="navbar-settings-section">
        <div class="navbar-settings-section-title">元素呈现</div>
        <div class="navbar-settings-section-description">
          按住并拖动可以调整顺序, 点击眼睛图标可以切换隐藏/显示.
        </div>
        <VLoading v-if="!loaded" />
        <div
          v-show="loaded"
          ref="navbarSortList"
          class="navbar-settings-section-content navbar-sort-list"
        >
          <div
            v-for="item of rendered.items"
            :key="item.name"
            class="navbar-sort-item"
            :class="{ 'navbar-hidden': item.hidden }"
            :data-name="item.name"
            @mouseover="peekItem(item, true)"
            @mouseout="peekItem(item, false)"
          >
            <div class="item-name">
              {{ item.displayName }}
            </div>
            <div class="toggle-visible">
              <VIcon
                :size="18"
                :icon="item.hidden ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                @click="toggleVisible(item)"
              ></VIcon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </VPopup>
</template>
<script lang="ts">
import { SortableEvent } from 'sortablejs'
import { VPopup, VIcon, VSlider, VLoading } from '@/ui'
import { addComponentListener } from '@/core/settings'
import { dqa, getUID } from '@/core/utils'
import { SortableJSLibrary } from '@/core/runtime-library'
import { getData } from '@/plugins/data'
import { CustomNavbarItem, CustomNavbarRenderedItems } from '../custom-navbar-item'
import { checkSequentialOrder, sortItems } from './orders'

const { navbarOptions } = CustomNavbarItem
const [rendered] = getData(CustomNavbarRenderedItems) as [
  {
    items: CustomNavbarItem[]
  },
]
export default Vue.extend({
  components: {
    VPopup,
    VIcon,
    VSlider,
    VLoading,
  },
  props: {
    triggerElement: {
      type: HTMLElement,
      default: null,
    },
  },
  data() {
    return {
      open: false,
      padding: navbarOptions.padding,
      rendered,
      hidden: navbarOptions.hidden,
      loaded: false,
      isLogin: Boolean(getUID()),
    }
  },
  watch: {
    padding: lodash.debounce((newValue: number) => {
      navbarOptions.padding = newValue
    }, 200),
  },
  async mounted() {
    addComponentListener('customNavbar.padding', (newValue: number) => {
      if (this.padding !== newValue) {
        this.padding = newValue
      }
    })
    const list: HTMLElement = this.$refs.navbarSortList
    const Sortable = await SortableJSLibrary
    Sortable.create(list, {
      delay: 100,
      forceFallback: true,
      onEnd: (e: SortableEvent) => {
        this.onSort(e)
      },
    })
    checkSequentialOrder(rendered.items)
    this.loaded = true
    // unsafeWindow.nsTest = {
    //   list,
    //   Sortable,
    // }
  },
  methods: {
    toggle() {
      this.$refs.popup.toggle()
    },
    peekPadding(peek: boolean) {
      dqa('.custom-navbar .padding').forEach(it => it.classList.toggle('peek', peek))
    },
    peekItem(item: CustomNavbarItem, peek: boolean) {
      item.element?.classList.toggle('peek', peek)
    },
    onSort(e: SortableEvent) {
      const container = this.$refs.navbarSortList as HTMLElement
      const element = e.item
      console.log(`${element.getAttribute('data-name')} ${e.oldIndex}->${e.newIndex}`)
      const ordersMap = Object.fromEntries(
        [...container.children].map((el, index) => [el.getAttribute('data-name') as string, index]),
      )
      this.rendered.items = sortItems(rendered.items, ordersMap)
    },
    toggleVisible(item: CustomNavbarItem) {
      if (navbarOptions.hidden.includes(item.name)) {
        lodash.pull(navbarOptions.hidden, item.name)
        item.hidden = false
        console.log('delete', item.name)
      } else {
        navbarOptions.hidden.push(item.name)
        item.hidden = true
        console.log('add', item.name)
      }
    },
  },
})
</script>
<style lang="scss">
@import 'common';
.custom-navbar-settings {
  @include popup();
  width: 400px;
  font-size: 14px;
  padding: 12px 12px 12px 18px;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%) scale(0.95);
  transition: 0.2s ease-out;
  z-index: 100002;
  &.open {
    transform: translateX(-50%) translateY(-50%) scale(1);
  }
  .navbar-settings-header {
    @include h-center();
    justify-content: space-between;
    .title {
      margin-left: 6px;
      font-size: 18px;
      @include semi-bold();
    }
    .grow {
      flex: 1;
    }
    .close {
      padding: 6px;
      cursor: pointer;
      transition: 0.2s ease-out;
      &:hover {
        color: var(--theme-color);
      }
    }
  }
  .navbar-settings-content {
    .navbar-settings-section {
      margin-top: 12px;
      > :not(:last-child) {
        margin-bottom: 6px;
      }
      &-title {
        font-size: 14px;
      }
      &-description {
        font-size: 12px;
        opacity: 0.6;
        line-height: 1.5;
      }
      &-content {
        @include h-center();
        flex-wrap: wrap;
        .be-slider {
          margin: 0 4px;
          flex: 1;
        }
        .padding-value {
          margin-left: 12px;
          width: 50px;
          text-align: end;
        }
        .navbar-sort-item {
          @include card();
          @include h-center();
          transition: none;
          white-space: nowrap;
          padding: 6px;
          padding-left: 8px;
          margin: 0 4px 4px 0;
          cursor: move;
          &:hover {
            border-color: var(--theme-color);
          }
          &.navbar-hidden {
            opacity: 0.5;
          }
          &.sortable-ghost {
            opacity: 0;
          }
          &.sortable-chosen {
            box-shadow: 0 4px 16px 0 rgb(0 0 0 / 16%);
            transform: scale(1.05);
          }
          &.sortable-drag {
            opacity: 1;
          }
          &.sortable-drag.navbar-hidden {
            opacity: 0.5;
          }
          .toggle-visible {
            margin-left: 6px;
            cursor: pointer;
          }
        }
      }
    }
  }
}
</style>
