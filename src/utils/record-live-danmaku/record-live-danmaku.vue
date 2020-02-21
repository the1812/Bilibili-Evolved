<template>
  <div class="live-danmaku-recorder" :class="{opened}">
    <div class="header">
      <div class="title">记录弹幕</div>
      <div class="close" @click="opened = false">
        <Icon type="mdi" icon="close"></Icon>
      </div>
    </div>
    <div class="record-stats">已记录{{danmakus.length}}条弹幕</div>
    <div class="toggle-record" @click="isRecording = !isRecording">
      <template v-if="isRecording">
        <Icon type="mdi" icon="square"></Icon>记录中
      </template>
      <template v-else>
        <Icon type="mdi" icon="circle"></Icon>开始记录
      </template>
    </div>
    <div class="exports">
      <div class="export-xml" @click="exportXML()">导出XML</div>
      <div class="export-ass" @click="exportASS()">导出ASS</div>
    </div>
  </div>
</template>

<script lang="ts">
import { LiveDanmaku } from './live-socket'
export default {
  components: {
    Icon: () => import('../../style/icon.vue')
  },
  data() {
    return {
      isRecording: false,
      danmakus: [],
      opened: false
    }
  },
  async mounted() {
    const { LiveSocket } = await import('./live-socket')
    const socket = new LiveSocket(
      parseInt(document.URL.match(/live\.bilibili\.com\/(\d+)/)![1])
    )
    socket.addEventListener('danmaku', (e: CustomEvent<LiveDanmaku>) => {
      if (this.isRecording) {
        console.log(e.detail.content)
        this.danmakus.push(e.detail)
      }
    })
    await socket.start()
  },
  methods: {
    getXML() {
      const danmakus = this.danmakus.map((d: LiveDanmaku) => {
        const content = d.content
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;')
        return `<d p="${fixed(d.time / 1000, 3)},${d.type},${d.fontSize},${
          d.color
        },${d.sendTime},0,${d.userHash},0">${content}</d>`
      })
      const xml = `
<?xml version="1.0" encoding="UTF-8"?>
<i>
  ${danmakus.join('\n  ')}
</i>
      `.trim()
      return xml
    },
    exportXML() {
      console.log(this.getXML())
    },
    async exportASS() {
      const xml = this.getXML()
      console.log(xml)
    }
  }
}
</script>

<style lang="scss">
.live-danmaku-recorder {
  @mixin round {
    border-radius: 8px;
  }
  position: fixed;
  top: 100%;
  left: 0;
  transform: translateX(8px) translateY(calc(-100% - 8px)) scale(0.95);
  opacity: 0;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  z-index: 1000;
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.2) 0 4px 8px 0px;
  @include round();
  &.opened {
    transform: translateX(8px) translateY(calc(-100% - 8px));
    opacity: 1;
    pointer-events: initial;
  }
  body.dark & {
    background-color: #222;
  }
  &,
  & * {
    transition: 0.2s ease-out;
  }
  .header {
    display: flex;
    align-items: center;
    align-self: stretch;
    padding-bottom: 8px;
    .title {
      flex-grow: 1;
      font-weight: bold;
      font-size: 15px;
      color: black;
      padding-right: 16px;
      body.dark & {
        color: white;
      }
    }
    .close {
      cursor: pointer;
      .be-icon {
        font-size: 20px;
      }
      &:hover {
        color: var(--theme-color);
      }
    }
  }
  .record-stats {
    margin-top: 16px;
    margin-bottom: 8px;
  }
  .toggle-record {
    display: flex;
    align-items: center;
    padding: 8px;
    margin-bottom: 16px;
    background-color: var(--theme-color);
    color: var(--foreground-color);
    cursor: pointer;
    @include round();
    .be-icon {
      font-size: 14px;
      margin-right: 8px;
    }
  }
  .exports {
    align-self: stretch;
    & > * {
      @include round();
      cursor: pointer;
      padding: 8px;
      text-align: center;
      white-space: nowrap;
      background-color: #8882;
      &:hover {
        background-color: #8884;
      }
    }
    .export-ass {
      margin-top: 8px;
    }
  }
}
</style>