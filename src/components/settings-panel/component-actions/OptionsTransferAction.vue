<template>
  <div class="component-action options-transfer-action" :title="item.title" @click="handleClick">
    <VIcon :icon="currentIcon" :size="16" />
    {{ displayName }}
  </div>
</template>
<script lang="ts">
import { getComponentSettings, getGeneralSettings } from '@/core/settings'
import { DownloadPackage } from '@/core/download'
import { pickFile } from '@/core/file-picker'
import { Toast } from '@/core/toast'
import { logError } from '@/core/utils/log'
import { getExportSettingsFilename } from '../utils'
import { VIcon } from '@/ui'
import { ComponentMetadata } from '../../component'
import { OptionsTransferActionItem } from './component-actions'

const hasTransferModifier = (e: MouseEvent | KeyboardEvent) => e.shiftKey

export default Vue.extend({
  components: {
    VIcon,
  },
  props: {
    item: {
      type: Object as () => OptionsTransferActionItem,
      required: true,
    },
    component: {
      type: Object as () => ComponentMetadata,
      required: true,
    },
  },
  data() {
    return {
      shiftPressed: false,
    }
  },
  computed: {
    displayName(): string {
      return this.shiftPressed ? this.item.shiftDisplayName : this.item.displayName
    },
    currentIcon(): string {
      return this.shiftPressed ? this.item.shiftIcon : this.item.icon
    },
    componentDisplayName(): string {
      return this.component.displayName
    },
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeyEvent)
    window.addEventListener('keyup', this.handleKeyEvent)
    window.addEventListener('blur', this.handleBlur)
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyEvent)
    window.removeEventListener('keyup', this.handleKeyEvent)
    window.removeEventListener('blur', this.handleBlur)
  },
  methods: {
    handleKeyEvent(e: KeyboardEvent) {
      this.shiftPressed = hasTransferModifier(e)
    },
    handleBlur() {
      this.shiftPressed = false
    },
    serialize(): string {
      const { name } = this.component
      const { options } = getComponentSettings(this.component)
      return JSON.stringify({ name, options }, undefined, 2)
    },
    async importOptions(json: string) {
      let parsed: { name?: unknown; options?: Record<string, unknown> }
      try {
        parsed = JSON.parse(json)
      } catch {
        Toast.error('选项 JSON 格式错误, 未能导入选项', this.componentDisplayName)
        return
      }
      const { name: importedName, options: importedOptions } = parsed ?? {}
      if (importedName !== this.component.name) {
        Toast.error('导入内容中的组件名称不匹配, 未能导入选项', this.componentDisplayName)
        return
      }
      if (!lodash.isPlainObject(importedOptions)) {
        Toast.error('导入内容中缺少有效的 options 字段', this.componentDisplayName)
        return
      }
      const { options } = getComponentSettings(this.component)
      for (const key of Object.keys(options)) {
        if (!(key in importedOptions)) {
          delete options[key]
        }
      }
      for (const [key, value] of Object.entries(importedOptions)) {
        if (!lodash.isEqual(options[key], value)) {
          options[key] = value
        }
      }
      Toast.success('选项已导入', this.componentDisplayName, 3000)
    },
    async handleClick(e: MouseEvent) {
      this.shiftPressed = hasTransferModifier(e)
      const isImport = this.item.mode === 'import'
      try {
        if (isImport) {
          const json = this.shiftPressed
            ? await navigator.clipboard.readText()
            : await pickFile({ accept: '.json' }).then(([file]) => file?.text())
          if (json) {
            await this.importOptions(json)
          }
        } else if (this.shiftPressed) {
          await navigator.clipboard.writeText(this.serialize())
          Toast.success('选项已复制到剪贴板', this.componentDisplayName, 3000)
        } else {
          const fileName = await getExportSettingsFilename(
            getGeneralSettings().exportSettingsFormat,
            {
              n: this.component.name,
              v: '',
              V: '',
            },
          )
          await DownloadPackage.single(`${fileName}.json`, this.serialize())
        }
      } catch (error) {
        logError(error)
      }
    },
  },
})
</script>
