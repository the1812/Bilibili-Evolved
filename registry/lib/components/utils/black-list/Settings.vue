<script setup lang="ts">
import { getComponentSettings } from '@/core/settings'
import { getUID, mountVueComponent } from '@/core/utils'
import { addData, getData } from '@/plugins/data'
import { VButton, VIcon } from '@/ui'
import type BlackListSettings from './BlackListSettings.vue'
import { BlackListDataKey } from './common'
import type { Options } from './index'

enum Kind {
  Name,
  Regex,
}

const settingPanels = [
  {
    kind: Kind.Name,
    description: '精确匹配列表',
  },
  {
    kind: Kind.Regex,
    description: '正则匹配列表',
  },
]

const login = Boolean(getUID())

type Instance = InstanceType<typeof BlackListSettings>

const getBackListSettingsInstance: (kind: Kind, button: EventTarget) => Promise<Instance> = (() => {
  const instance: Record<Kind, Promise<Instance> | undefined> = {
    [Kind.Name]: undefined,
    [Kind.Regex]: undefined,
  }
  let blackList: Options | undefined // will get from `getData(BlackListDataKey)[0]`
  const blackListOptions = getComponentSettings('blackList').options as Options

  return (kind: Kind, button: EventTarget): Promise<Instance> => {
    const load = async (): Promise<Instance> => {
      const optionName = {
        [Kind.Name]: 'up',
        [Kind.Regex]: 'upRegex',
      }
      const titleName = {
        [Kind.Name]: '精确匹配',
        [Kind.Regex]: '正则匹配',
      }

      if (!blackList) {
        blackList = getData(BlackListDataKey)[0]
      }

      const [el, vm] = mountVueComponent(await import('./BlackListSettings.vue'), {
        triggerElement: button as HTMLElement,
        list: lodash.cloneDeep(blackList[optionName[kind]]),
        save: (items: string[]) => {
          addData(BlackListDataKey, data => {
            data[optionName[kind]] = items
          })
          blackListOptions[optionName[kind]] = items
        },
        titleName: titleName[kind],
      })
      document.body.insertAdjacentElement('beforeend', el)
      return vm
    }

    if (!instance[kind]) {
      instance[kind] = load()
    }
    return instance[kind]
  }
})()

const loadBlackListSettings = async (kind: Kind, button: EventTarget): Promise<void> => {
  await getBackListSettingsInstance(kind, button)
}

const toggleSettings = async (kind: Kind, button: EventTarget): Promise<void> => {
  ;(await getBackListSettingsInstance(kind, button)).toggle()
}
</script>

<template>
  <div v-for="it in settingPanels" :key="it.kind" class="custom-black-list-extra-options">
    <VButton
      v-if="login"
      @mouseover="loadBlackListSettings(it.kind, $event.target)"
      @click="toggleSettings(it.kind, $event.target)"
    >
      {{ it.description }}<VIcon icon="right-arrow" :size="16"></VIcon>
    </VButton>
  </div>
</template>

<style lang="scss">
.custom-black-list-extra-options {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
</style>
