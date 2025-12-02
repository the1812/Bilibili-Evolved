<template>
  <div class="container">
    <p class="title">一键点亮粉丝勋章</p>
    <TextBox
      placeholder="直播间ID"
      :text="roomid"
      :change-on-blur="true"
      @change="handleRoomIdChange"
    ></TextBox>
    <AsyncButton @click="handleKeepAliveRequest">点亮!</AsyncButton>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TextBox, AsyncButton } from '@/ui'

import { validateRoomId, getLiveRoomId, keepAliveRequest } from './utils'
import { Toast } from '@/core/toast'

const roomid = ref(getLiveRoomId())
const handleRoomIdChange = (value: string) => {
  if (validateRoomId(value)) {
    roomid.value = value
  } else {
    roomid.value = ''
  }
}

const handleKeepAliveRequest = async () => {
  if (!roomid.value) {
    return
  }

  try {
    await keepAliveRequest(roomid.value)
    Toast.success('发送点亮勋章请求成功', '提示')
  } catch ({ message }) {
    Toast.error(`勋章点亮失败，原因: ${message}`, '提示')
  }
}
</script>

<style lang="scss" scoped>
@import 'common';

.container {
  display: flex;
  flex-flow: column;

  box-shadow: 0 0 0 1px #8884;
  order: -2;
  border-radius: 4px;
  padding: 6px 6px 6px 10px;
  @include v-stretch(6px);

  .title {
    @include semi-bold();
  }
}
</style>
