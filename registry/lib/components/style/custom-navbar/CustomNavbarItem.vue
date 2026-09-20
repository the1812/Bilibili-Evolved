<template>
  <div
    v-show="!item.hidden"
    class="custom-navbar-item"
    role="listitem"
    :data-name="item.name"
    :class="{
      disabled: item.disabled,
      active: item.active,
      'input-within': inputWithin,
      'popup-shown': popupShown,
    }"
    :style="{ flex: item.flexStyle, order: item.order }"
    @mouseenter="togglePopup(true)"
    @mouseleave="togglePopup(false)"
  >
    <CustomNavbarLink
      v-if="item.href"
      :new-tab="newTab"
      class="main-content"
      :href="!item.active && !item.touch && item.href"
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
          @hook:mounted="popupShown && refreshPopup()"
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

/** 保证同一时间只有一个弹窗 */
let hideShownPopup: (() => void) | null = null

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
      popupShown: false,
      popupTimer: null as any,
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
    this.setPopupShown(false)
  },
  methods: {
    /** 划入停留片刻才展开(避免从浏览器标签栏往页面里划时被带出来), 划出留出鼠标划到弹窗的时间 */
    togglePopup(shown: boolean) {
      clearTimeout(this.popupTimer)
      if (shown && (this.item.disabled || this.popupShown)) {
        return
      }
      this.popupTimer = setTimeout(() => this.setPopupShown(shown), 200)
    },
    /** 展开时接管别的按钮的弹窗 */
    setPopupShown(shown: boolean) {
      clearTimeout(this.popupTimer)
      if (shown) {
        // 内容是懒加载的, 到要展开时才挂载, 免得只是路过就发请求
        const { item } = this as { item: CustomNavbarItem }
        item.requestedPopup = true
        hideShownPopup?.()
        hideShownPopup = () => this.setPopupShown(false)
        this.refreshPopup()
      } else if (this.popupShown) {
        // 只在收起自己时清理, 免得清掉接管后的新弹窗
        hideShownPopup = null
      }
      this.popupShown = shown
    },
    /** 通知面板内容已经展开, 内容没挂载时由挂载钩子补一次 */
    refreshPopup() {
      const { popup } = this.$refs
      if (!popup) {
        return
      }
      const { refreshOnPopup } = CustomNavbarItem.navbarOptions
      if (refreshOnPopup && typeof popup.popupRefresh === 'function') {
        popup.popupRefresh()
      }
      if (typeof popup.popupShow === 'function') {
        popup.popupShow()
      }
    },
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
  transition: 0.2s background-color ease-out;

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
    overflow: unset;
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
    border: 1px solid var(--be-color-popup-border, #8882);
    border-radius: 8px;
    transition: opacity 0.2s ease-out;
    position: absolute;
    top: 100%;
    left: 50%;
    padding: 8px;
    pointer-events: none;
    opacity: 0;
    transform: translateX(-50%);
    cursor: default;

    body.dark & {
      color: var(--be-color-text-content, #eee);
      background: var(--be-color-popup-bg, #222);
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
    > * {
      @include default-transition();
    }
  }

  &:not(.disabled) .popup-container {
    position: absolute;
    top: calc(100% - 8px);
    left: 50%;
    pointer-events: none;
    transition: all 0.2s ease-out;
  }

  // 展开只认 .popup-shown: 用 :hover 时鼠标从浏览器标签栏划进页面会顺带带出面板; :has 保证内容挂载前不展开
  &:not(.disabled).popup-shown .popup-container:has(> .popup > *),
  &:not(.disabled).input-within .popup-container {
    top: 100%;
    > .popup {
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
