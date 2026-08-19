<template>
  <div class="component-action options-transfer-action" :title="item.title" @click="handleClick">
    <VIcon :icon="currentIcon" :size="16" />
    {{ displayName }}
  </div>
</template>
<script lang="ts">
import { getComponentSettings } from '@/core/settings'
import { DownloadPackage } from '@/core/download'
import { pickFile } from '@/core/file-picker'
import { Toast } from '@/core/toast'
import { logError } from '@/core/utils/log'
import { VIcon } from '@/ui'
import { ComponentMetadata } from '../../component'
import { isMac, OptionsTransferActionItem } from './component-actions'

const hasTransferModifier = (e: MouseEvent | KeyboardEvent) => (isMac ? e.metaKey : e.ctrlKey)

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
      ctrlPressed: false,
    }
  },
  computed: {
    displayName(): string {
      return this.ctrlPressed ? this.item.ctrlDisplayName : this.item.displayName
    },
    currentIcon(): string {
      return this.ctrlPressed ? this.item.ctrlIcon : this.item.icon
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
      this.ctrlPressed = hasTransferModifier(e)
    },
    handleBlur() {
      this.ctrlPressed = false
    },
    serialize(): string {
      const { name } = this.component
      const { options } = getComponentSettings(this.component)
      return JSON.stringify({ name, options }, undefined, 2)
    },
    async applyImportedOptions(json: string) {
      let parsed: { options?: Record<string, unknown> }
      try {
        parsed = JSON.parse(json)
      } catch {
        Toast.error('选项 JSON 格式错误, 未能导入选项', this.componentDisplayName)
        return
      }
      const { options: importedOptions } = parsed
      if (
        typeof importedOptions !== 'object' ||
        importedOptions === null ||
        Array.isArray(importedOptions) ||
        Object.keys(importedOptions).length === 0
      ) {
        Toast.error('导入内容中缺少有效的 options 字段', this.componentDisplayName)
        return
      }
      const { options } = getComponentSettings(this.component)
      Object.assign(options, importedOptions)
      Toast.success('选项已导入', this.componentDisplayName, 3000)
    },
    async handleClick(e: MouseEvent) {
      this.ctrlPressed = hasTransferModifier(e)
      const isImport = this.item.mode === 'import'
      try {
        if (isImport) {
          const json = this.ctrlPressed
            ? await navigator.clipboard.readText()
            : await pickFile({ accept: '.json' }).then(([file]) => file?.text())
          if (json) {
            await this.applyImportedOptions(json)
          }
        } else if (this.ctrlPressed) {
          await navigator.clipboard.writeText(this.serialize())
          Toast.success('选项已复制到剪贴板', this.componentDisplayName, 3000)
        } else {
          await DownloadPackage.single(
            `${this.componentDisplayName}-Bilibili Evolved.json`,
            this.serialize(),
          )
        }
      } catch (error) {
        logError(error instanceof Error ? error : String(error))
      }
    },
  },
})
</script>
