<template>
  <div
    v-show="!item.hidden"
    class="custom-navbar-item"
    role="listitem"
    :data-name="item.name"
    :class="{ disabled: item.disabled, active: item.active, 'input-within': inputWithin }"
    :style="{ flex: item.flexStyle, order: item.order }"
  >
    <CustomNavbarLink
      v-if="item.href"
      :new-tab="newTab"
      class="main-content"
      :href="!item.active && !item.touch && item.href"
      @mouseover.self="requestPopup()"
    >
      <template v-if="typeof item.content === 'string'">
        {{ item.content }}
      </template>
      <component :is="item.content" v-else :item="item"></component>
    </CustomNavbarLink>
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
    <div
      ref="popupContainer"
      class="popup-container"
      @focusin="toggleInputWithin($event, true)"
      @focusout="toggleInputWithin($event, false)"
    >
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
import { addComponentListener, removeComponentListener } from '@/core/settings'
import CustomNavbarLink from './CustomNavbarLink.vue'
import { CustomNavbarItem } from './custom-navbar-item'

const isOpenInNewTab = (item: CustomNavbarItem) => {
  const { name } = item
  const options = CustomNavbarItem.navbarOptions
  if (name in options.openInNewTabOverrides) {
    return options.openInNewTabOverrides[name]
  }
  return options.openInNewTab
}
export default Vue.extend({
  components: {
    CustomNavbarLink,
  },
  props: {
    item: {
      type: CustomNavbarItem,
      required: true,
    },
  },
  data() {
    return {
      newTab: isOpenInNewTab(this.item),
      cancelListeners: none,
      inputWithin: false,
    }
  },
  mounted() {
    const navbarItem = this.item as CustomNavbarItem
    navbarItem.contentMounted?.(navbarItem)
    const listener = () => {
      this.updateLinkOption()
    }
    addComponentListener('customNavbar.openInNewTabOverrides', listener)
    addComponentListener('customNavbar.openInNewTab', listener)
    this.cancelListeners = () => {
      removeComponentListener('customNavbar.openInNewTabOverrides', listener)
      removeComponentListener('customNavbar.openInNewTab', listener)
    }
  },
  beforeDestroy() {
    this.cancelListeners?.()
  },
  methods: {
    toggleInputWithin(e: FocusEvent, value: boolean) {
      if (!(e.target instanceof HTMLInputElement)) {
        this.inputWithin = false
        return
      }
      this.inputWithin = value
    },
    updateLinkOption() {
      this.newTab = isOpenInNewTab(this.item)
    },
    popupClasses(item: CustomNavbarItem & { iframeName?: string }) {
      return {
        transparent: item.transparentPopup,
        'no-padding': item.noPopupPadding,
        'iframe-container': item.iframeName,
      }
    },
    triggerPopupShow: lodash.debounce(function trigger(initialPopup: boolean) {
      const { popup } = this.$refs
      if (!popup) {
        return
      }
      const allowRefresh =
        CustomNavbarItem.navbarOptions.refreshOnPopup &&
        popup.popupRefresh &&
        typeof popup.popupRefresh === 'function'
      if (!initialPopup && allowRefresh) {
        popup.popupRefresh()
      }
      if (popup.popupShow && typeof popup.popupShow === 'function') {
        popup.popupShow()
      }
    }, 300),
    async requestPopup() {
      const { item } = this as {
        item: CustomNavbarItem
      }
      /** 惰性加载的, 要在鼠标经过时加载 popup */
      if (item.disabled) {
        return
      }
      if (!item.requestedPopup) {
        item.requestedPopup = true
        this.triggerPopupShow(true)
        return
      }
      this.triggerPopupShow(false)
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
@import 'common';

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
    transition: none;
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
    @include semi-bold();
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
      &:not(.transparent) iframe {
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

  &:not(.disabled):hover,
  &:not(.disabled).input-within {
    .popup-container {
      top: 100%;
      > .popup {
        // transform: translateY(0) translateX(-50%);
        pointer-events: initial;
        opacity: 1;
      }
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

    html:not([data-navbar-notify-style='hidden']) &:not(:empty):not(.hidden) {
      opacity: 1;
    }
    html[data-navbar-notify-style='dot'] &,
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
