<template>
  <div class="online-registry-item">
    <VIcon
      :size="18"
      :icon="icon"
      class="item-icon"
    />
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
        :disabled="installing"
        @click="install(getUrl(item))"
      >
        <VIcon icon="mdi-plus" :size="18" />
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
    <div
      v-if="description"
      class="item-description"
      v-html="description"
    >
    </div>
  </div>
</template>
<script lang="ts">
import { getDescriptionHTML } from '@/components/description'
import { cdnRoots } from '@/core/cdn-types'
import { meta } from '@/core/meta'
import { getGeneralSettings, settings } from '@/core/settings'
import { Toast } from '@/core/toast'
import {
  VIcon,
  VButton,
} from '@/ui'
import { DocSourceItem } from 'registry/lib/docs'

const getFeatureUrl = (item: DocSourceItem) => (
  `${cdnRoots[getGeneralSettings().cdnRoot](meta.compilationInfo.branch)}${item.fullAbsolutePath}`
)
const isFeatureInstalled = (item: DocSourceItem) => {
  const storageKey = `user${lodash.startCase((item.type))}s`
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
    getUrl: (pack: PackItem) => (
      pack.items.map(getFeatureUrl).join('\n')
    ),
    isInstalled: (pack: PackItem) => pack.items.every(isFeatureInstalled),
  },
}
export default Vue.extend({
  components: { VIcon, VButton },
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      typeMappings,
      ...typeMappings[this.item.type],
      description: getDescriptionHTML(this.item),
      installing: false,
      installed: false,
    }
  },
  created() {
    this.checkInstalled()
  },
  methods: {
    checkInstalled() {
      this.installed = this.isInstalled(this.item)
    },
    install(sourceUrls: string) {
      const urls = sourceUrls.split('\n')
        .map(it => it.trim())
        .filter(it => it !== '')
      Toast.show(urls.join('\n'), 'demo')
    },
  },
})
</script>
<style lang="scss">
@import "common";
@import "markdown";

.online-registry-item {
  @include h-center(4px);
  flex-wrap: wrap;
  padding: 8px 0;
  &:not(:last-child) {
    border-bottom: 1px solid #8882;
  }
  .item-badge {
    padding: 2px 4px;
    background-color: #8882;
    border-radius: 4px;
    font-size: 12px;
  }
  .item-display-name {
    font-weight: bold;
  }
  .item-description {
    flex: 1 0 100%;
    transition: opacity .2s ease-out;
    opacity: 0.5;
    font-size: 13px;
    margin-top: 4px;
    @include markdown();
  }
  .grow {
    flex: 1 0 0;
  }
  .item-action {
    .be-icon {
      margin-right: 6px;
    }
    .reinstall-button:not(:hover):not(:focus-within) {
      opacity: .5;
    }
  }
  &:hover .item-description {
    opacity: 1;
  }
}
</style>
