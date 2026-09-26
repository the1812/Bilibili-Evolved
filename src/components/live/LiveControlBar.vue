<template>
  <div ref="element" class="be-live-control-bar-extend">
    <div
      v-for="item of items"
      :key="item.name"
      class="tip-wrap be-live-control-bar-item"
      :style="{ order: item.order }"
      :data-name="item.name"
    >
      <div class="tip panel">{{ item.displayName }}</div>
      <button type="button" :aria-label="item.displayName" @click="item.action($event)">
        <VIcon :size="24" :icon="item.icon" />
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, shallowRef, watch, onMounted } from 'vue'
import { VIcon } from '@/ui'
import { childListSubtree } from '@/core/observer'
import { select } from '@/core/spin-query'
import { raiseEvent } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'
import type {
  LiveControlBarApi,
  LiveControlBarItem,
  LiveControlBarCallbacks,
} from './live-control-bar'

const element = ref<HTMLElement>()
const items = ref<LiveControlBarItem[]>([])
const controller = shallowRef<HTMLElement>()
const controlBar = shallowRef<HTMLElement>()
const controllerSelector =
  ':is(.bilibili-live-player-video-controller, .web-player-controller-wrap:not(.web-player-controller-bg))'
const controlBarSelector = `${controllerSelector} .control-area`

onMounted(async () => {
  const player = await select<HTMLElement>('.live-player-mounter')
  if (!player) {
    return
  }
  childListSubtree(player, () => {
    controller.value = dq(player, controllerSelector) as HTMLElement
    controlBar.value = dq(player, controlBarSelector) as HTMLElement
  })
})
watch(controlBar, bar => {
  if (!bar) {
    return
  }
  const volume = dq(bar, '.volume')
  if (volume) {
    volume.insertAdjacentElement('afterend', element.value)
  } else {
    dq(bar, '.left-area')?.appendChild(element.value)
  }
})
const waitForControlBar = (config: LiveControlBarCallbacks) => {
  const init = lodash.once(config.init ?? lodash.noop)
  const stopInit = watch(controller, container => container && init(container), { immediate: true })
  const stopCallback = watch(controlBar, bar => bar && config.callback?.(bar), { immediate: true })
  return () => {
    stopInit()
    stopCallback()
  }
}
const setControlBarLocked = (locked: boolean) => {
  unsafeWindow.EmbedPlayer?.instance?.changeCtrlVisible?.(true, !locked)
  document.documentElement.classList.toggle('be-live-control-bar-locked', locked)
}
const withControlBar: LiveControlBarApi['withControlBar'] = async callback => {
  const livePlayer = await select<HTMLElement>('.live-player-mounter')
  const console = useScopedConsole('withControlBar')
  if (!livePlayer) {
    console.warn('livePlayer not found')
    return
  }
  try {
    raiseEvent(livePlayer, 'mousemove')
    const bar = await select(() => dq(livePlayer, controlBarSelector) as HTMLElement, {
      queryInterval: 100,
    })
    if (!bar) {
      console.warn('controlBar not found')
      return
    }
    await callback(bar)
  } finally {
    if (!document.documentElement.classList.contains('be-live-control-bar-locked')) {
      raiseEvent(livePlayer, 'mouseleave')
    }
  }
}
const addControlBarButton = (button: LiveControlBarItem) => {
  if (!items.value.some(item => item.name === button.name)) {
    items.value.push(button)
  }
}
const removeControlBarButton = (name: string) => {
  const index = items.value.findIndex(item => item.name === name)
  if (index !== -1) {
    items.value.splice(index, 1)
  }
}

defineExpose({
  waitForControlBar,
  setControlBarLocked,
  withControlBar,
  addControlBarButton,
  removeControlBarButton,
} satisfies LiveControlBarApi)
</script>

<style lang="scss">
html.be-live-control-bar-locked #live-player {
  cursor: default !important;
}

.be-live-control-bar-extend {
  display: flex;
  align-items: center;
}
.be-live-control-bar-item.tip-wrap {
  position: relative;

  .tip.panel {
    visibility: hidden;
    opacity: 0;
    translate: 0 10px;
    padding: 6px 10px;
    line-height: 21px;
    white-space: nowrap;
    transition: 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
  }

  &:hover .tip.panel,
  &:focus-within .tip.panel {
    visibility: visible;
    opacity: 0.9;
    translate: 0 0;
  }
}

.be-live-control-bar-item button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  background: none;
  color: #fff;
  cursor: pointer;
  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: -2px;
  }

  &:hover .be-icon {
    animation: 0.2s be-live-control-icon-zoom;
  }

  @keyframes be-live-control-icon-zoom {
    50% {
      width: 28px;
      height: 28px;
      font-size: 28px;
    }
  }
}
</style>
