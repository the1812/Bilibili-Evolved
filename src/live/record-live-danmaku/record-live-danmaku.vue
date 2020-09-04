<template>
  <div class="live-danmaku-recorder" :class="{opened}">
    <div class="header">
      <div class="title" v-if="!(collapsed && isRecording)">记录弹幕</div>
      <template v-if="collapsed && isRecording">
        <Icon type="mdi" icon="record-rec"></Icon>
        <div class="collapse-danmaku-count">{{danmakus.length}}</div>
      </template>
      <Icon
        class="collapse"
        type="mdi"
        :icon="collapsed ? 'chevron-up' : 'chevron-down'"
        @click.native="collapsed = !collapsed"
      ></Icon>
      <div class="close" @click="opened = false">
        <Icon type="mdi" icon="close"></Icon>
      </div>
    </div>
    <template v-if="!collapsed">
      <div class="record-stats">已记录{{danmakus.length}}条弹幕</div>
      <div class="loading-tip" v-if="loading">正在连接...</div>
      <div class="toggle-record" v-else @click="isRecording = !isRecording">
        <template v-if="isRecording">
          <Icon type="mdi" icon="square"></Icon>记录中
        </template>
        <template v-else>
          <Icon type="mdi" icon="circle"></Icon>开始记录
        </template>
      </div>
      <div class="exports">
        <div class="export-xml" @click="exportXML()">导出XML</div>
        <!-- <div class="export-ass" @click="exportASS()">导出ASS</div> -->
      </div>
    </template>
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
      isRecording: true,
      danmakus: [],
      opened: false,
      collapsed: false,
      loading: true
    }
  },
  async mounted() {
    try {
      const { LiveSocket } = await import('./live-socket')
      // 绕了一大圈拿 room id, 不知道为啥 URL 里那个数字有些直播间不是 room id
      const user = (await SpinQuery.select(
        '.header-info-ctnr .room-cover'
      )) as HTMLAnchorElement
      let roomID: string
      if (user !== null) {
        const uid = user.href.match(/space\.bilibili\.com\/(\d+)/)![1]
        const json = await Ajax.getJson(
          `https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid=${uid}`
        )
        roomID = _.get(
          json,
          'data.roomid',
          document.URL.match(/live\.bilibili\.com\/(\d+)/)![1]
        )
      } else {
        roomID = document.URL.match(/live\.bilibili\.com\/(\d+)/)![1]
      }
      const socket = new LiveSocket(parseInt(roomID))
      socket.addEventListener('danmaku', (e: CustomEvent<LiveDanmaku>) => {
        if (this.isRecording) {
          console.log(e.detail.content)
          this.danmakus.push(e.detail)
        }
      })
      await socket.start()
    } catch (error) {
      logError(error)
    } finally {
      this.loading = false
    }
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
    async exportXML() {
      const { getFriendlyTitle } = await import('../../video/title')
      const { DownloadVideoPackage } = await import(
        '../../video/download-video/download-video-package'
      )
      const pack = new DownloadVideoPackage()
      pack.add(getFriendlyTitle() + '.xml', this.getXML())
      await pack.emit()
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
  transform: translateX(8px) translateY(calc(-100% + 8px));
  opacity: 0;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  z-index: 1000;
  color: black;
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.2) 0 4px 8px 0px;
  border-radius: 8px 8px 0 0;
  min-width: 200px;
  &.opened {
    transform: translateX(8px) translateY(calc(-100%));
    opacity: 1;
    pointer-events: initial;
  }
  body.dark & {
    color: white;
    background-color: #282828;
  }
  &,
  & * {
    transition: 0.2s ease-out;
  }
  .header {
    display: flex;
    align-items: center;
    align-self: stretch;
    .collapse {
      cursor: pointer;
    }
    .collapse-danmaku-count {
      flex-grow: 1;
      padding-right: 24px;
    }
    .title {
      flex-grow: 1;
      font-weight: bold;
      font-size: 15px;
      padding-right: 16px;
    }
    .close {
      cursor: pointer;
      .be-icon {
        font-size: 20px;
      }
    }
  }
  .record-stats {
    margin-top: 16px;
    margin-bottom: 8px;
  }
  .loading-tip {
    margin-bottom: 16px;
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
    display: flex;
    align-items: center;
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
    .export-xml {
      flex: 2 0 0;
    }
    .export-ass {
      flex: 1 0 0;
      margin-left: 8px;
    }
  }
}
</style>