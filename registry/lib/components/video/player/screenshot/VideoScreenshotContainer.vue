<template>
  <div class="video-screenshot-container">
    <transition-group
      class="video-screenshot-list"
      name="video-screenshot-list"
      tag="div"
    >
      <VideoScreenshot
        v-for="screenshot of screenshots"
        :key="screenshot.id"
        :filename="screenshot.filename"
        :object-url="screenshot.url"
        :time="screenshot.time"
        @discard="discard(screenshot)"
      ></VideoScreenshot>
    </transition-group>
    <div v-show="showBatch" class="video-screenshot-batch">
      <a class="batch-link" style="display:none" :download="batchFilename"></a>
      <button @click="saveAll">
        <VIcon :size="18" icon="mdi-content-save"></VIcon>全部保存
      </button>
      <button @click="discardAll">
        <VIcon :size="18" icon="mdi-delete-forever"></VIcon>全部丢弃
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import { getFriendlyTitle } from '@/core/utils/title'
import { VIcon } from '@/ui'
import VideoScreenshot from './VideoScreenshot.vue'
import { Screenshot } from './screenshot'

export default Vue.extend({
  components: {
    VIcon,
    VideoScreenshot,
  },
  data() {
    return {
      screenshots: [],
      batchFilename: `${getFriendlyTitle()}.zip`,
    }
  },
  computed: {
    showBatch() {
      return this.screenshots.length >= 2
    },
  },
  methods: {
    discard(screenshot: Screenshot) {
      this.screenshots.splice(this.screenshots.indexOf(screenshot), 1)
      screenshot.revoke()
    },
    async saveAll() {
      const zip = new JSZip()
      this.screenshots.forEach((it: Screenshot) => {
        zip.file(it.filename, it.blob, {
          date: new Date(it.timeStamp),
        })
      })
      const blob = await zip.generateAsync({ type: 'blob' })
      const link = this.$el.querySelector('.batch-link')
      link.href = URL.createObjectURL(blob)
      link.click()
      URL.revokeObjectURL(link.href)
      link.href = ''
      this.discardAll()
    },
    discardAll() {
      this.screenshots.forEach((it: Screenshot) => it.revoke())
      this.screenshots = []
    },
  },
})
</script>
<style lang="scss" scoped>
.video-screenshot-container {
  position: relative;
  --screenshot-width: 240px;
  --screenshot-width-negative: calc(0px - var(--screenshot-width));
  --screenshot-height: 135px;
  --thumbnail-margin-vertical: 12px;
  --thumbnail-margin-horizontal: 24px;
  --screenshot-list-width: calc(
    2 * var(--thumbnail-margin-horizontal) + var(--screenshot-width)
  );
  .video-screenshot-disable & {
    display: none;
  }
  .video-screenshot-batch {
    position: fixed;
    bottom: 0;
    right: 0;
    z-index: 20000;
    display: flex;
    width: var(--screenshot-list-width);
    align-items: center;
    justify-content: space-evenly;
    button {
      background: #000c;
      color: #fff;
      border: none;
      border-radius: 10px 10px 0 0;
      font-size: 11pt;
      cursor: pointer;
      outline: 0 !important;
      padding: 8px 12px;
      display: flex;
      justify-content: center;
      align-items: center;
      .be-icon {
        margin-right: 4px;
      }
    }
  }
  .video-screenshot-list {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 20000;
    padding: var(--thumbnail-margin-vertical) 0;
    pointer-events: none;
    height: calc(100% - 2 * var(--thumbnail-margin-vertical) - 48px);
    width: var(--screenshot-list-width);
    overflow: auto;
    * {
      pointer-events: initial;
    }
    &-enter {
      opacity: 0;
      transform: translateX(var(--screenshot-width-negative));
    }
    &-leave-to {
      opacity: 0;
      transform: translateX(var(--screenshot-width));
    }
  }
}
</style>
