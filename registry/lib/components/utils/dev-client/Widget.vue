<template>
  <div class="be-dev-client">
    <div class="title">DevClient</div>
    <div v-if="clientId" class="client-id">{{ clientId }}</div>
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
<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { AsyncButton, VIcon } from '@/ui'
import { devClient, DevClientEvents } from './client'

const clientId = ref(devClient.clientId)
const isConnected = ref(devClient.isConnected)
const connect = () => devClient.createSocket(true)
const disconnect = () => devClient.disconnect()
const updateConnectionStatus = () => {
  isConnected.value = devClient.isConnected
}
const updateClientId = () => {
  clientId.value = devClient.clientId
}
devClient.addEventListener(DevClientEvents.ServerChange, updateConnectionStatus)
devClient.addEventListener(DevClientEvents.ClientIdUpdate, updateClientId)
onUnmounted(() => {
  devClient.removeEventListener(DevClientEvents.ServerChange, updateConnectionStatus)
  devClient.removeEventListener(DevClientEvents.ClientIdUpdate, updateClientId)
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
    background-color: var(--be-color-card-bg, #333);
  }
  .title {
    @include semi-bold();
  }
  .client-id {
    font-family: monospace;
    font-size: 12px;
    color: var(--be-color-muted, #888);
    user-select: all;
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
