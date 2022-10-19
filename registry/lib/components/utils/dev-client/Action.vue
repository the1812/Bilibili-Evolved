<template>
  <div v-show="isConnected">
    <div v-if="canStartDebug" class="component-action dev-client-action" @click="startDebug">
      <VIcon v-if="busy" icon="mdi-network-outline" :size="16" />
      <VIcon v-else icon="mdi-play-network-outline" :size="16" />
      {{ busy ? '启动中' : '开始调试' }}
    </div>
    <div v-if="canStopDebug" class="component-action dev-client-action" @click="stopDebug">
      <VIcon v-if="busy" icon="mdi-network-outline" :size="16" />
      <VIcon v-else icon="mdi-minus-network-outline" :size="16" />
      {{ busy ? '停止中' : '停止调试' }}
    </div>
  </div>
</template>
<script lang="ts">
import { ComponentMetadata } from '@/components/types'
import { Toast } from '@/core/toast'
import { VIcon } from '@/ui'
import { DevClientEvents } from './client'
import { autoUpdateOptions, getDevClientOptions } from './options'
import { urlConverter } from './converter'

const options = getDevClientOptions()

export default Vue.extend({
  components: {
    VIcon,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    component: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      busy: false,
      autoUpdateComponents: autoUpdateOptions.urls.components,
      sessions: [],
      isConnected: false,
    }
  },
  computed: {
    autoUpdateRecord() {
      const metadata = this.component as ComponentMetadata
      return this.autoUpdateComponents[metadata.name]
    },
    componentUpdateUrl() {
      return this.autoUpdateRecord?.url
    },
    isDebugging() {
      return (
        this.componentUpdateUrl &&
        this.sessions.some((path: string) => {
          const { pathname } = new URL(this.componentUpdateUrl)
          return path === pathname
        })
      )
    },
    canStartDebug() {
      return !this.isDebugging && urlConverter.toDevUrl(this.componentUpdateUrl) !== null
    },
    canStopDebug() {
      return Boolean(this.isDebugging && this.componentUpdateUrl)
    },
  },
  async created() {
    const { devClient } = await import('./client')
    this.sessions = devClient.sessions
    this.isConnected = devClient.isConnected
    devClient.addEventListener(DevClientEvents.ServerChange, this.handleServerChange)
    devClient.addEventListener(DevClientEvents.SessionsUpdate, this.handleSessionsUpdate)
  },
  async beforeDestroy() {
    const { devClient } = await import('./client')
    devClient.removeEventListener(DevClientEvents.SessionsUpdate, this.handleSessionsUpdate)
  },
  methods: {
    handleSessionsUpdate(e: CustomEvent<string[]>) {
      this.sessions = e.detail
    },
    handleServerChange(e: CustomEvent<boolean>) {
      this.isConnected = e.detail
    },
    async handleClick(action: () => Promise<void>) {
      if (this.busy) {
        return
      }
      try {
        this.busy = true
        await action()
      } finally {
        this.busy = false
      }
    },
    async startDebug() {
      await this.handleClick(async () => {
        const { devClient } = await import('./client')
        const metadata = this.component as ComponentMetadata
        const devUrl = urlConverter.toDevUrl(this.componentUpdateUrl)
        // console.log('devUrl:', devUrl, 'autoUpdateRecord.url:', this.autoUpdateRecord.url)
        if (this.autoUpdateRecord.url !== devUrl) {
          options.devRecords[metadata.name] = {
            name: metadata.name,
            originalUrl: this.componentUpdateUrl,
          }
          this.autoUpdateRecord.url = devUrl
        }
        const toast = Toast.info('启动调试中...', 'DevClient')
        try {
          await devClient.startDebug(this.autoUpdateRecord.url)
        } catch (error) {
          console.error(error)
        } finally {
          toast.close()
        }
      })
    },
    async stopDebug() {
      await this.handleClick(async () => {
        const { devClient } = await import('./client')
        const metadata = this.component as ComponentMetadata
        const { pathname } = new URL(this.componentUpdateUrl)
        if (devClient.isConnected) {
          await devClient.stopDebug(pathname)
        }
        if (options.devRecords[metadata.name]) {
          this.autoUpdateRecord.url = options.devRecords[metadata.name].originalUrl
          delete options.devRecords[metadata.name]
        }
      })
    },
  },
})
</script>
