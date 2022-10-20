<template>
  <DefaultWidget
    name="替换更新链接"
    icon="mdi-file-replace-outline"
    :disabled="busy"
    @click="replaceBranch()"
  ></DefaultWidget>
</template>
<script lang="ts">
import { getComponentSettings } from '@/core/settings'
import { Toast } from '@/core/toast'
import { logError } from '@/core/utils/log'
import { DefaultWidget } from '@/ui'

export default Vue.extend({
  components: {
    DefaultWidget,
  },
  data() {
    return {
      busy: false,
    }
  },
  methods: {
    async replaceBranch() {
      const targetBranch = window.prompt('输入希望替换成的分支名称')
      if (!targetBranch) {
        return
      }
      this.busy = true
      try {
        const { options } = getComponentSettings('autoUpdate')
        Object.values(options.urls).forEach((features: Record<string, { url: string }>) => {
          Object.values(features).forEach(record => {
            const indirectRaw = /^(https:\/\/github\.com\/.+\/Bilibili-Evolved\/raw\/)(.+?)(\/)/
            if (indirectRaw.test(record.url)) {
              record.url = record.url.replace(indirectRaw, `$1${targetBranch}$3`)
              return
            }
            const directRaw =
              /^(https:\/\/raw\.githubusercontent\.com\/.+\/Bilibili-Evolved\/)(.+?)(\/)/
            if (directRaw.test(record.url)) {
              record.url = record.url.replace(directRaw, `$1${targetBranch}$3`)
              return
            }
            const jsDelivr = /^(https:\/\/cdn\.jsdelivr\.net\/gh\/.+\/Bilibili-Evolved@)(.+?)(\/)/
            if (jsDelivr.test(record.url)) {
              record.url = record.url.replace(jsDelivr, `$1${targetBranch}$3`)
              return
            }
            console.log('skip record', record)
          })
        })
        Toast.info('替换完成', '替换更新链接', 3000)
      } catch (error) {
        logError(error)
      } finally {
        this.busy = false
      }
    },
  },
})
</script>
