<template>
  <div class="custom-navbar" :class="styles" role="navigation">
    <div class="left-pad padding"></div>
    <div class="custom-navbar-items" role="list">
      <NavbarItem v-for="item of items" :key="item.name" :item="item"></NavbarItem>
    </div>
    <div class="right-pad padding"></div>
  </div>
</template>

<script lang="ts">
import { addComponentListener } from '@/core/settings'
import { getUID } from '@/core/utils'
import { ascendingSort } from '@/core/utils/sort'
import { registerAndGetData } from '@/plugins/data'
import { getBuiltInItems } from './built-in-items'
import {
  CustomNavbarItemInit,
  CustomNavbarItem,
  CustomNavbarItems,
  CustomNavbarRenderedItems,
} from './custom-navbar-item'
import CustomNavbarItemComponent from './CustomNavbarItem.vue'
import { checkTransparentFill } from './transparent-fill'

const [initItems] = registerAndGetData(CustomNavbarItems, getBuiltInItems())
const [renderedItems] = registerAndGetData(CustomNavbarRenderedItems, {
  items: [] as CustomNavbarItem[],
})
const getItems = () => {
  const isLogin = Boolean(getUID())
  const items = (initItems as CustomNavbarItemInit[])
    .filter(it => {
      if (it.loginRequired && !isLogin) {
        return false
      }
      return true
    })
    .map(it => new CustomNavbarItem(it))
    .sort(ascendingSort(it => it.order))
  renderedItems.items = items
  return items
}
export default Vue.extend({
  components: {
    NavbarItem: CustomNavbarItemComponent,
  },
  data() {
    return {
      initItems,
      items: getItems(),
      styles: [],
      height: CustomNavbarItem.navbarOptions.height,
    }
  },
  watch: {
    initItems() {
      this.items = getItems()
    },
  },
  async mounted() {
    addComponentListener(
      'customNavbar.height',
      (value: number) => {
        document.documentElement.style.setProperty('--navbar-height', `${value}px`)
      },
      true,
    )
    await checkTransparentFill(this)
  },
  methods: {
    toggleStyle(value: boolean, style: string) {
      if (value && !this.styles.includes(style)) {
        this.styles.push(style)
      } else if (!value && this.styles.includes(style)) {
        this.styles.splice(this.styles.indexOf(style), 1)
      }
    },
  },
})
</script>

<style lang="scss">
@import 'common';

.van-message-box {
  z-index: 10002 !important;
}

html {
  --navbar-height: 50px;
  --navbar-foreground: #555;
  --navbar-background: white;
  --navbar-bounds-padding: 10%;
  // --navbar-blur-opacity: 0.7;
  --navbar-icon-size: 24px;
}

body.custom-navbar-loading::after {
  content: '';
  height: var(--navbar-height);
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: white;
  z-index: 10001;
}
body.dark.custom-navbar-loading::after {
  background-color: #333;
}
body.fixed-navbar {
  .left-panel {
    .adaptive-scroll .scroll-content {
      top: var(--navbar-height) !important;
    }
  }
  &.enable-feeds-filter .left-panel,
  .right-panel {
    .adaptive-scroll .scroll-content {
      top: calc(var(--navbar-height) + 8px) !important;
    }
  }
  .bili-feed4 .header-channel,
  .search-fixed-header {
    display: none !important;
  }
}

.custom-navbar *,
.custom-navbar {
  transition: all 0.2s ease-out;
  -webkit-tap-highlight-color: transparent;
  outline: none !important;
}

.custom-navbar {
  position: absolute;
  body.fixed-navbar & {
    position: fixed;
  }
  body.player-mode-blackmask & {
    visibility: hidden;
  }
  top: 0;
  left: 0;
  height: var(--navbar-height);
  width: 100%;
  background-color: var(--navbar-background);
  color: var(--navbar-foreground);
  z-index: 10001;
  display: flex;
  justify-content: center;
  line-height: normal;

  @include on-fullscreen {
    z-index: 1;
  }
  // &:not(.fill) .custom-navbar-iconfont {
  //   color: var(--theme-color);
  // }
  svg.inherit-color {
    path {
      fill: var(--navbar-foreground);
    }
    &.stroke {
      &,
      path {
        fill: transparent;
        stroke: var(--navbar-foreground);
      }
    }
  }
  &.fill:not(.transparent) {
    svg.inherit-color {
      path {
        fill: var(--foreground-color-d);
      }
      &.stroke {
        &,
        path {
          fill: transparent;
          stroke: var(--navbar-foreground-d);
        }
      }
    }
  }

  &.shadow:not(.transparent) {
    box-shadow: #0002 0 1px 10px 1px;
  }
  body.dark &.shadow:not(.transparent) {
    box-shadow: #0004 0px 2px 10px 1px;
  }

  &.blur:not(.transparent) {
    backdrop-filter: blur(24px);
    --navbar-background: #fffc;
  }

  body.dark &:not(.fill):not(.transparent) {
    --navbar-background: #222;
    --navbar-foreground: #eee;
    &.blur {
      --navbar-background: #2228;
    }
  }
  &.transparent {
    --navbar-background: transparent;
    --navbar-foreground: #eee;
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: calc(2 * var(--navbar-height));
      background-image: linear-gradient(to bottom, #000a 0, #0004 65%, transparent 100%);
      pointer-events: none;
    }
  }
  &.fill:not(.transparent) {
    --navbar-background: var(--theme-color);
    --navbar-foreground: var(--foreground-color-d);
    height: var(--navbar-height);
    width: 100%;
    &.blur {
      --navbar-background: var(--theme-color-60);
    }
  }
  &.fill.shadow:not(.transparent) {
    box-shadow: var(--theme-color-30) 0px 2px 10px 1px;
  }

  .custom-navbar-items {
    display: flex;
    align-items: center;
    justify-content: space-between;
    // margin: var(--navbar-bounds-padding);
    height: 100%;
    flex: 1 0 auto;
    color: inherit;
  }

  .padding {
    max-width: var(--navbar-bounds-padding);
    flex: 1 1 0;
    transition: none;
    position: relative;
  }
  .padding,
  .custom-navbar-items > * {
    &.peek::after {
      content: '';
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      border: 2px dashed;
    }
    &.left-pad::after {
      left: 0;
    }
    &.right-pad::after {
      right: 0;
    }
  }
  ~ .bili-gallery {
    z-index: 10002;
  }
}
</style>
