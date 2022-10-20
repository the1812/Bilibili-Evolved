<template>
  <div role="list" class="upload-popup">
    <div role="listitem">
      <a target="_blank" href="https://member.bilibili.com/platform/upload/text/apply">专栏投稿</a>
    </div>
    <div role="listitem">
      <a target="_blank" href="https://member.bilibili.com/platform/upload/audio/frame">音频投稿</a>
    </div>
    <div role="listitem">
      <a target="_blank" href="https://member.bilibili.com/platform/upload/sticker">贴纸投稿</a>
    </div>
    <div role="listitem">
      <a target="_blank" href="https://member.bilibili.com/platform/upload/video/frame">视频投稿</a>
    </div>
    <div role="listitem">
      <a target="_blank" href="https://member.bilibili.com/platform/upload-manager/article"
        >投稿管理</a
      >
    </div>
    <div role="listitem">
      <a target="_blank" href="https://member.bilibili.com/platform/home">创作中心</a>
    </div>
  </div>
</template>
<script lang="ts">
import { popperMixin } from '../mixins'

export default Vue.extend({
  mixins: [popperMixin],
})
</script>
<style lang="scss" scoped>
@import '../nav-link';
.upload-popup {
  width: max-content;
  a {
    @include nav-link();
  }
}
</style>
