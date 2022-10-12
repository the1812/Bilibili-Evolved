<template>
  <div class="navbar-channel" :data-channel-id="channelId">频道</div>
</template>

<script lang="ts">
import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'

export default Vue.extend({
  data() {
    return {
      channelId: null,
    }
  },
  async created() {
    const { channel_id } = await bilibiliApi(
      getJsonWithCredentials('https://api.bilibili.com/x/web-interface/web/channel/red'),
    )
    if (!channel_id) {
      return
    }
    this.channelId = channel_id
  },
})
</script>
