<template>
  <div class="image-viewer-container" :class="{ open }" @click="detectOutside">
    <div ref="viewer" class="image-viewer">
      <div class="image-container">
        <img v-if="image" class="image" :src="image" />
      </div>
      <div class="close image-viewer-icon" title="关闭" @click="open = false">
        <VIcon :size="48" icon="mdi-close"></VIcon>
      </div>
      <a target="_blank" class="copy-link image-viewer-icon" title="复制原链接" @click="copyLink()">
        <VIcon v-if="copiedTimer" :size="48" icon="mdi-check"></VIcon>
        <VIcon v-else :size="48" icon="mdi-link"></VIcon>
      </a>
      <a target="_blank" class="new-tab image-viewer-icon" title="在新标签页打开" @click="newTab()">
        <VIcon :size="48" icon="mdi-open-in-new"></VIcon>
      </a>
      <a
        v-if="blobUrl"
        target="_blank"
        class="download image-viewer-icon"
        title="下载"
        :href="blobUrl"
        :download="filename"
      >
        <VIcon :size="48" icon="mdi-download"></VIcon>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { addComponentListener } from '../core/settings'
import { getFriendlyTitle } from '../core/utils/title'
import { getBlob } from '../core/ajax'
import VIcon from './icon/VIcon.vue'

export default Vue.extend({
  components: {
    VIcon,
  },
  props: {
    image: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      filename: '',
      open: false,
      blobUrl: '',
      keyHandler: null,
      copiedTimer: 0,
    }
  },
  watch: {
    async image(url: string) {
      if (this.blobUrl) {
        URL.revokeObjectURL(this.blobUrl)
      }
      if (!url) {
        this.blobUrl = ''
      }
      const blob = await getBlob(url)
      this.blobUrl = URL.createObjectURL(blob)
      this.updateFilename()
    },
  },
  mounted() {
    this.keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.open = false
      }
    }
    document.addEventListener('keydown', this.keyHandler)
    addComponentListener(
      'settingsPanel.filenameFormat',
      () => {
        this.updateFilename()
      },
      true,
    )
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.keyHandler)
  },
  methods: {
    async copyLink() {
      await navigator.clipboard.writeText(this.image)
      if (this.copiedTimer) {
        window.clearTimeout(this.copiedTimer)
      }
      this.copiedTimer = window.setTimeout(() => {
        this.copiedTimer = 0
      }, 2000)
    },
    newTab() {
      window.open(this.image, '_blank')
    },
    detectOutside(e: MouseEvent) {
      const container = this.$el
      const { viewer } = this.$refs
      if (e.target === container || e.target === viewer) {
        // this.$emit('change', false)
        this.open = false
      }
    },
    updateFilename() {
      const url = this.image as string
      if (!url) {
        this.filename = ''
        return
      }
      this.filename =
        getFriendlyTitle(document.URL.includes('/www.bilibili.com/bangumi/')) +
        url.substring(url.lastIndexOf('.'))
    },
  },
})
</script>

<style lang="scss" scoped>
.image-viewer-container {
  background: rgba(0, 0, 0, 0.85);
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100002;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  pointer-events: none;
  color: #eee;

  &,
  & * {
    transition: 0.2s ease-out;
  }
  &.open {
    opacity: 1;
    pointer-events: initial;
  }
  .image-viewer {
    width: 90%;
    height: 90%;
    display: grid;
    grid-template:
      'image close' 48px
      'image .' auto
      'image copy-link' 48px
      'image .' 12px
      'image new-tab' 48px
      'image .' 18px
      'image download' 48px / auto 48px;
    column-gap: 12px;
    justify-items: center;
    justify-content: stretch;
    align-items: center;
    align-content: stretch;
    transform: scale(0.95);
    .image-container {
      grid-area: image;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      .image {
        flex: 1 0 0;
        height: 0;
        object-fit: contain;
      }
    }
    .close {
      grid-area: close;
    }
    .download {
      grid-area: download;
    }
    .copy-link {
      grid-area: copy-link;
      transform: scale(0.95);
    }
    .new-tab {
      grid-area: new-tab;
      transform: scale(0.85);
    }
    .image-viewer-icon {
      cursor: pointer;
      width: 100%;
      height: 100%;
      transition: 0.2s ease-out;
      color: #eee;
      &:hover .be-icon {
        color: var(--theme-color);
      }
    }
  }
  &.open .image-viewer {
    transform: scale(1);
  }
}
</style>
