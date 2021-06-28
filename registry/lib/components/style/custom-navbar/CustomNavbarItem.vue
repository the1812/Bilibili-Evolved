<template>
  <div
    v-show="!item.hidden"
    class="custom-navbar-item"
    role="listitem"
    :data-name="item.name"
    :class="{ disabled: item.disabled, active: item.active }"
    :style="{ flex: item.flexStyle, order: item.order }"
  >
    <a
      v-if="item.href"
      class="main-content"
      :href="!item.active && !item.touch && item.href"
      @mouseover.self="requestPopup()"
    >
      <template v-if="typeof item.content === 'string'">{{ item.content }}</template>
      <component :is="item.content" v-else :item="item"></component>
    </a>
    <div
      v-else
      class="main-content"
      @click="!item.active && !item.touch && item.clickAction && item.clickAction($event)"
    >
      <template v-if="typeof item.content === 'string'">
        {{ item.content }}
      </template>
      <component :is="item.content" v-else :item="item"></component>
    </div>

    <div v-show="!item.active" class="notify-count">
      <template v-if="item.notifyCount > 0">
        {{ item.notifyCount }}
      </template>
    </div>
    <div ref="popupContainer" class="popup-container">
      <div v-if="item.popupContent" class="popup" :class="popupClasses(item)">
        <component
          :is="item.popupContent"
          v-if="item.requestedPopup"
          ref="popup"
          :container="$refs.popupContainer"
          :item="item"
        ></component>
      </div>
    </div>
    <div class="active-bar"></div>
  </div>
</template>

<script lang="ts">
// import { createPopper } from '@popperjs/core'
import { CustomNavbarItem } from './custom-navbar-item'

export default Vue.extend({
  props: {
    item: {
      type: CustomNavbarItem,
      required: true,
    },
  },
  async mounted() {
    const navbarItem = this.item as CustomNavbarItem
    navbarItem.contentMounted?.(navbarItem)
    // if (navbarItem.requestedPopup) {
    //   await this.$nextTick()
    //   this.initPopper()
    // }
  },
  methods: {
    popupClasses(item: CustomNavbarItem & { iframeName?: string }) {
      return {
        transparent: item.transparentPopup,
        'no-padding': item.noPopupPadding,
        'iframe-container': item.iframeName,
      }
    },
    triggerPopupShow: lodash.debounce(function trigger() {
      const { popup } = this.$refs
      if (!popup) {
        return
      }
      if ('popupShow' in popup && typeof popup.popupShow === 'function') {
        popup.popupShow()
      }
    }, 300),
    async requestPopup() {
      const { item } = this as {
        item: CustomNavbarItem
      }
      if (!item.requestedPopup && !item.disabled /* && !component.active */) {
        item.requestedPopup = true
        // await this.$nextTick()
        // this.initPopper()
      }
      this.triggerPopupShow()
    },
    // async initPopper() {
    //   const { popupContainer } = this.$refs
    //   const navbarItem = this.item as CustomNavbarItem
    //   console.log(navbarItem.name, this.$refs, popupContainer, navbarItem.popper)
    //   if (!popupContainer || navbarItem.popper) {
    //     console.log('return')
    //     return
    //   }
    //   console.log('createPopper', createPopper)
    //   navbarItem.popper = createPopper(navbarItem.element, popupContainer, {
    //     placement: 'bottom',
    //   })
    // },
  },
})
</script>

<style lang="scss">
.custom-navbar-item {
  color: inherit;
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;

  .active-bar {
    position: absolute;
    left: 0;
    bottom: 0;
    background-color: var(--theme-color);
    width: 100%;
    height: 3px;
    border-radius: 1.5px;
    display: none;
  }
  .custom-navbar.transparent & .active-bar,
  .custom-navbar.fill & .active-bar {
    background-color: rgba(0, 0, 0, 0.3);
  }
  &.active .active-bar {
    display: flex;
  }

  &.view-border::before {
    content: '';
    width: 94%;
    height: 94%;
    border: 2px dashed var(--navbar-foreground);
    position: absolute;
    top: 3%;
    left: 3%;
    box-sizing: border-box;
  }
  &:not(.disabled) {
    cursor: pointer;
    &:hover {
      // background: rgba(0, 0, 0, 0.1);
      background-color: #8882;
    }
  }
  &.disabled a {
    cursor: default;
  }

  .main-content {
    font-size: 10pt;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 10px;
    color: var(--navbar-foreground);
    user-select: none;
    &:hover {
      color: var(--navbar-foreground) !important;
    }
  }

  &.active .main-content {
    font-weight: bold;
    font-size: 11pt;
  }

  .popup {
    color: black;
    background: white;
    box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #8882;
    border-radius: 8px;
    transition: all 0.2s ease-out 0.2s;
    position: absolute;
    top: 100%;
    left: 50%;
    padding: 8px;
    pointer-events: none;
    opacity: 0;
    transform: translateX(-50%);
    cursor: default;

    body.dark & {
      color: #eee;
      background: #222;
    }

    &.iframe-container {
      border: none;
      box-shadow: none;
      iframe {
        box-shadow: rgba(0, 0, 0, 0.2) 0 4px 8px 0px;
      }
    }
    &.no-padding {
      padding: 0;
    }
    &.transparent {
      background-color: transparent !important;
      box-shadow: none;
    }
  }

  &:not(.disabled) .popup-container {
    position: absolute;
    top: calc(100% - 8px);
    left: 50%;
    transition: all 0.2s ease-out 0.2s;
    pointer-events: none;
  }

  &:not(.disabled):hover .popup-container {
    top: 100%;
    > .popup {
      // transform: translateY(0) translateX(-50%);
      pointer-events: initial;
      opacity: 1;
    }
  }

  a,
  a:hover {
    color: inherit !important;
    text-decoration: none;
  }

  .notify-count {
    position: absolute;
    left: 50%;
    top: 0;
    background-color: var(--theme-color);
    padding: 0 8px;
    display: flex;
    justify-content: center;
    font-size: 11px;
    transform: translateX(-50%);
    opacity: 0;
    line-height: 14px;
    white-space: nowrap;
    color: var(--foreground-color);
    border-radius: 0 0 8px 8px;

    &:not(:empty):not(.hidden) {
      opacity: 1;
    }
    &.dot {
      color: transparent;
      border-radius: 50%;
      width: 8px;
      height: 8px;
      padding: 0;
      top: 2px;
    }
  }
  .custom-navbar.fill & .notify-count {
    background-color: rgba(0, 0, 0, 0.3);
  }
}
</style>