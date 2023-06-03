<template>
  <MiniToast
    class="online-registry-item-wrapper"
    :placement="placement"
    container="body"
    :delay="[200, 0]"
    :offset="[0, 12]"
    :class="{ virtual, hidden }"
  >
    <div v-if="!virtual" class="online-registry-item">
      <VIcon :size="18" :icon="icon" class="item-icon" />
      <div class="item-badge">
        {{ badge }}
      </div>
      <div class="item-display-name">
        {{ item.displayName }}
      </div>
      <div class="grow"></div>
      <div class="item-action">
        <VButton
          v-if="!installed"
          class="install-button"
          title="安装"
          type="primary"
          :disabled="installing"
          @click="install(getUrl(item))"
        >
          <VIcon icon="mdi-plus" :size="15" />
          {{ installing ? '正在安装' : '安装' }}
        </VButton>
        <VButton
          v-else
          class="reinstall-button"
          title="重新安装"
          :disabled="installing"
          @click="install(getUrl(item))"
        >
          {{ installing ? '正在安装' : '已安装' }}
        </VButton>
      </div>
    </div>
    <template #toast>
      <ComponentDescription v-if="item.description" :component-data="item" />
    </template>
  </MiniToast>
</template>
<script lang="ts">
import { DocSourceItem } from 'registry/lib/docs'
import { cdnRoots } from '@/core/cdn-types'
import { installFeature } from '@/core/install-feature'
import { visibleInside } from '@/core/observer'
import { addComponentListener, getGeneralSettings, settings } from '@/core/settings'
import { logError } from '@/core/utils/log'
import { VIcon, VButton, MiniToast } from '@/ui'
import ComponentDescription from '../../ComponentDescription.vue'
import { SettingsPanelDockSide } from '../../dock'
import { ItemFilter } from './item-filter'

const getFeatureUrl = (item: DocSourceItem, branch: string) => {
  const cdnRootFn = cdnRoots[getGeneralSettings().cdnRoot]
  const cdnRoot = cdnRootFn(branch, item.owner)
  return `${cdnRoot}${item.fullAbsolutePath}`
}
const isFeatureInstalled = (item: DocSourceItem) => {
  const storageKey = `user${lodash.startCase(item.type)}s`
  return item.name in settings[storageKey]
}
type PackItem = { items: DocSourceItem[] }
const typeMappings = {
  component: {
    icon: 'mdi-cube-scan',
    badge: '组件',
    getUrl: getFeatureUrl,
    isInstalled: isFeatureInstalled,
  },
  plugin: {
    icon: 'mdi-puzzle-outline',
    badge: '插件',
    getUrl: getFeatureUrl,
    isInstalled: isFeatureInstalled,
  },
  style: {
    icon: 'mdi-tune',
    badge: '样式',
    getUrl: getFeatureUrl,
    isInstalled: isFeatureInstalled,
  },
  pack: {
    icon: 'mdi-package-variant-closed',
    badge: '合集包',
    getUrl: (pack: PackItem, branch: string) =>
      pack.items.map(it => getFeatureUrl(it, branch)).join('\n'),
    isInstalled: (pack: PackItem) => pack.items.every(isFeatureInstalled),
  },
}
export default Vue.extend({
  components: { VIcon, VButton, MiniToast, ComponentDescription },
  props: {
    item: {
      type: Object,
      required: true,
    },
    branch: {
      type: String,
      required: true,
    },
    itemFilter: {
      type: String,
      default: ItemFilter.All,
    },
  },
  data() {
    const { icon, badge, getUrl, isInstalled } = typeMappings[this.item.type]
    return {
      icon,
      badge,
      getUrl: (item: PackItem) => getUrl(item, this.branch),
      isInstalled,
      installing: false,
      installed: false,
      virtual: false,
      placement: 'right',
    }
  },
  computed: {
    hidden() {
      switch (this.itemFilter) {
        case ItemFilter.All:
        default: {
          return false
        }
        case ItemFilter.Installed: {
          return !this.installed
        }
        case ItemFilter.NotInstalled: {
          return this.installed
        }
      }
    },
  },
  created() {
    this.checkInstalled()
    addComponentListener(
      'settingsPanel.dockSide',
      (value: SettingsPanelDockSide) => {
        this.placement = value === SettingsPanelDockSide.Left ? 'right' : 'left'
      },
      true,
    )
  },
  mounted() {
    const element = this.$el as HTMLElement
    visibleInside(element, element.parentElement, '150% 0px', records => {
      records.forEach(record => {
        this.virtual = !record.isIntersecting
      })
    })
  },
  methods: {
    checkInstalled() {
      this.installed = this.isInstalled(this.item)
    },
    async install(sourceUrls: string) {
      const urls = sourceUrls
        .split('\n')
        .map(it => it.trim())
        .filter(it => it !== '')
      try {
        this.installing = true
        await Promise.all(urls.map(async url => installFeature(url)))
        this.checkInstalled()
        if (this.item.type === 'pack') {
          this.$emit('refresh')
        }
      } catch (error) {
        logError(error)
      } finally {
        this.installing = false
      }
    },
  },
})
</script>
<style lang="scss">
@import 'common';
@import 'markdown';

.online-registry-item-wrapper {
  min-height: 39px;
  position: relative;
  &.hidden {
    display: none;
  }
  &::before {
    content: '';
    opacity: 0;
    transition: opacity 0.2s ease-out;
    position: absolute;
    pointer-events: none;
    top: 50%;
    left: 12px;
    transform: translateY(-50%);
    width: calc(100% - 24px);
    height: 20px;
    background-color: #8882;
    display: flex;
  }
  &.virtual::before {
    opacity: 1;
  }
}
.online-registry-item {
  @include h-center(4px);
  flex-wrap: wrap;
  padding: 8px 12px;
  &:hover {
    background-color: #8881;
  }
  &:not(:last-child) {
    border-bottom: 1px solid #8882;
  }
  .item-badge {
    padding: 2px 4px;
    border: 1px solid #8882;
    border-radius: 4px;
    font-size: 12px;
  }
  .item-display-name {
    @include semi-bold();
  }
  .grow {
    flex: 1 0 0;
  }
  .item-action {
    font-size: 12px;
    .be-icon {
      margin-right: 6px;
    }
    .reinstall-button:not(:hover):not(:focus-within) {
      opacity: 0.5;
    }
  }
  &:hover .item-description {
    opacity: 1;
  }
}
.online-registry-description {
  font-size: 13px;
  @include markdown();
  word-break: break-all;
}
</style>
