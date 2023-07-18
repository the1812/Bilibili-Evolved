<template>
  <div class="be-dev-client">
    <div class="title">DevClient</div>
    <div class="connection-status">
      <template v-if="isConnected">
        <div class="status-dot connected" />
        <div class="status-text">已连接</div>
        <AsyncButton title="断开连接" @click="disconnect">
          <VIcon icon="mdi-stop" :size="14" />
          断开连接
        </AsyncButton>
      </template>
      <template v-else>
        <div class="status-dot disconnected" />
        <div class="status-text">未连接</div>
        <AsyncButton title="连接" @click="connect">
          <VIcon icon="mdi-play" :size="14" />
          连接
        </AsyncButton>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import { AsyncButton, VIcon } from '@/ui'
import type { DevClient } from './client'
import { DevClientEvents } from './client'

export default Vue.extend({
  components: {
    AsyncButton,
    VIcon,
  },
  data() {
    return {
      client: null,
      isConnected: false,
    }
  },
  async created() {
    const { devClient } = await import('./client')
    this.client = devClient
    this.updateConnectionStatus()
    devClient.addEventListener(DevClientEvents.ServerChange, this.updateConnectionStatus)
  },
  beforeDestroy() {
    const devClient = this.client as DevClient
    devClient.removeEventListener(DevClientEvents.ServerChange, this.updateConnectionStatus)
  },
  methods: {
    async connect() {
      return this.client.createSocket(true)
    },
    disconnect() {
      this.client.closeSocket()
    },
    updateConnectionStatus() {
      this.isConnected = this.client.isConnected
    },
  },
})
</script>
<style lang="scss" scoped>
@import 'common';

.be-dev-client {
  box-shadow: 0 0 0 1px #8884;
  order: -2;
  border-radius: 4px;
  padding: 6px 6px 6px 10px;
  @include v-stretch(6px);
  body.dark & {
    background-color: #333;
  }
  .title {
    @include semi-bold();
  }
  .connection-status {
    @include h-center(6px);
    font-size: 12px;
    .status-dot {
      height: 8px;
      width: 8px;
      border-radius: 50%;
      &.connected {
        background-color: #81c785;
      }
      &.disconnected {
        background-color: #78909c;
      }
    }
    .be-button {
      margin-left: 4px;
      padding-left: 4px;
      .be-icon {
        margin-right: 4px;
      }
    }
  }
}
</style>
