<template>
  <div class="container">
    <p class="title">一键点亮粉丝勋章</p>
    <TextBox
      placeholder="直播间ID"
      :text="roomid"
      :change-on-blur="true"
      @change="handleRoomIdChange"
    ></TextBox>
    <div class="room-row">
      <AsyncButton title="填入当前直播间ID" @click="fillRoomId(getLiveRoomId)">当前</AsyncButton>
      <AsyncButton title="填入当前佩戴勋章所属的直播间ID" @click="fillRoomId(getWornMedalRoomId)">
        佩戴勋章
      </AsyncButton>
    </div>
    <TextBox
      placeholder="点赞次数"
      :text="clickTimes"
      :change-on-blur="true"
      @change="handleClickTimesChange"
    ></TextBox>
    <AsyncButton @click="handleKeepAliveRequest">点亮!</AsyncButton>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { TextBox, AsyncButton } from '@/ui'
import { validateRoomId, getLiveRoomId, getWornMedalRoomId, keepAliveRequest } from './utils'
import { Toast } from '@/core/toast'
import {
  getComponentSettings,
  addComponentListener,
  removeComponentListener,
} from '@/core/settings'
import { Options } from './index'

const { options } = getComponentSettings<Options>('badgeKeepalive')
const roomid = ref(getLiveRoomId())
const clickTimes = ref(options.defaultClickTimes)
const handleRoomIdChange = (value: string) => {
  if (validateRoomId(value)) {
    roomid.value = value
  } else {
    roomid.value = ''
  }
}
const handleClickTimesChange = (value: string) => {
  const parsedNum = parseInt(value)
  if (!isNaN(parsedNum)) {
    clickTimes.value = parsedNum.toString()
  }
}

const fillRoomId = async (getRoomId: () => string | Promise<string>) => {
  try {
    roomid.value = await getRoomId()
  } catch ({ message }) {
    Toast.error(`获取直播间ID失败，原因: ${message}`, '一键点亮直播间粉丝勋章')
  }
}

const syncClickTimes = (newValue: unknown) => (clickTimes.value = String(newValue))

onMounted(() => {
  addComponentListener('badgeKeepalive.defaultClickTimes', syncClickTimes, true)
})

onBeforeUnmount(() => {
  removeComponentListener('badgeKeepalive.defaultClickTimes', syncClickTimes)
})

const handleKeepAliveRequest = async () => {
  if (!roomid.value) {
    return
  }

  try {
    await keepAliveRequest(roomid.value, clickTimes.value)
    Toast.success('发送点亮勋章请求成功', '一键点亮直播间粉丝勋章', 3000)
  } catch ({ message }) {
    Toast.error(`勋章点亮失败，原因: ${message}`, '一键点亮直播间粉丝勋章')
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

  .room-row {
    @include h-stretch(6px);
  }
}
</style>
