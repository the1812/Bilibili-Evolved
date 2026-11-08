<template>
  <MiniToast
    ref="root"
    class="online-registry-item-wrapper"
    theme="online-registry"
    v-bind="{ popperOptions }"
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
          @click="install()"
        >
          <VIcon icon="mdi-plus" :size="15" />
          {{ installing ? '正在安装' : '安装' }}
        </VButton>
        <VButton
          v-else
          class="reinstall-button"
          title="重新安装"
          :disabled="installing"
          @click="install()"
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
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { Placement } from '@popperjs/core'
import { installFeature } from '@/core/install-feature'
import { visibleInside } from '@/core/observer'
import {
  addComponentListener,
  getGeneralSettings,
  removeComponentListener,
  settings,
} from '@/core/settings'
import { logError } from '@/core/utils/log'
import { VIcon, VButton, MiniToast } from '@/ui'
import ComponentDescription from '../../ComponentDescription.vue'
import { SettingsPanelDockSide } from '../../dock'
import { ItemFilter } from './item-filter'
import type { RegistryItemData } from './types'

const props = withDefaults(
  defineProps<{ item: RegistryItemData; branch: string; itemFilter?: ItemFilter }>(),
  { itemFilter: ItemFilter.All },
)
const emit = defineEmits<{ (event: 'refresh'): void }>()
const typeMappings = {
  component: {
    icon: 'mdi-cube-scan',
    badge: '组件',
  },
  plugin: {
    icon: 'mdi-puzzle-outline',
    badge: '插件',
  },
  pack: {
    icon: 'mdi-package-variant-closed',
    badge: '合集包',
  },
}
// 开启侧轴钳制并关闭 tether, 避免提示框跟随条目滚出视口时将页面撑高
const popperOptions = {
  modifiers: [{ name: 'preventOverflow', options: { altAxis: true, tether: false } }],
}
const { icon, badge } = typeMappings[props.item.type]
const features = computed(() => (props.item.type === 'pack' ? props.item.items : [props.item]))
const root = ref<InstanceType<typeof MiniToast>>()
const installing = ref(false)
const installed = ref(false)
const virtual = ref(false)
const placement = ref<Placement>('right')
const hidden = computed(() => {
  if (props.itemFilter === ItemFilter.Installed) {
    return !installed.value
  }
  return props.itemFilter === ItemFilter.NotInstalled && installed.value
})

const checkInstalled = () => {
  installed.value = features.value.every(item => {
    const storageKey = `user${lodash.startCase(item.type)}s`
    return item.name in settings[storageKey]
  })
}
checkInstalled()
defineExpose({ checkInstalled })

const updatePlacement = (value: SettingsPanelDockSide) => {
  placement.value = value === SettingsPanelDockSide.Left ? 'right' : 'left'
}
addComponentListener('settingsPanel.dockSide', updatePlacement, true)
let visibilityObserver: IntersectionObserver
onMounted(() => {
  const element = root.value.$el as HTMLElement
  const [observer] = visibleInside(element, element.parentElement, '150% 0px', records => {
    records.forEach(record => {
      virtual.value = !record.isIntersecting
    })
  })
  visibilityObserver = observer
})
onUnmounted(() => {
  visibilityObserver?.disconnect()
  removeComponentListener('settingsPanel.dockSide', updatePlacement)
})

const install = async () => {
  try {
    installing.value = true
    const cdn = getGeneralSettings().cdnRoot
    await Promise.all(
      features.value.map(feature =>
        installFeature({
          kind: 'github',
          repo: feature.repo,
          ref: props.branch,
          path: feature.fullAbsolutePath,
          cdn,
        }),
      ),
    )
    checkInstalled()
    if (props.item.type === 'pack') {
      emit('refresh')
    }
  } catch (error) {
    logError(error)
  } finally {
    installing.value = false
  }
}
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
.tippy-box[data-theme~='online-registry'] {
  .tippy-content {
    max-height: calc(100vh - 14px);
    overflow-y: auto;
    overscroll-behavior: contain;
  }
}
</style>
