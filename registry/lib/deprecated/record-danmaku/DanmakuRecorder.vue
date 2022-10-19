<template>
  <div class="live-danmaku-recorder" :class="{ opened }">
    <div class="header">
      <div v-show="!(collapsed && isRecording)" class="title">记录弹幕</div>
      <template v-if="collapsed && isRecording">
        <VIcon icon="mdi-record-rec"></VIcon>
        <div class="collapse-danmaku-count">
          {{ danmakus.length }}
        </div>
      </template>
      <VButton type="transparent" class="collapse" @click="collapsed = !collapsed">
        <VIcon :size="20" :icon="collapsed ? 'mdi-chevron-up' : 'mdi-chevron-down'"></VIcon>
      </VButton>
      <VButton type="transparent" class="close" @click="opened = false">
        <VIcon :size="20" icon="mdi-close"></VIcon>
      </VButton>
    </div>
    <template v-if="!collapsed">
      <div class="record-stats">已记录{{ danmakus.length }}条弹幕</div>
      <div v-if="loading" class="loading-tip">正在连接...</div>
      <VButton v-else class="toggle-record" type="primary" @click="isRecording = !isRecording">
        <template v-if="isRecording"> <VIcon icon="mdi-square" :size="14"></VIcon>记录中 </template>
        <template v-else> <VIcon icon="mdi-circle" :size="14"></VIcon>开始记录 </template>
      </VButton>
      <div class="exports">
        <VButton class="export-xml" @click="exportXML()"> 导出XML </VButton>
        <!-- <div class="export-ass" @click="exportASS()">导出ASS</div> -->
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { select } from '@/core/spin-query'
import { getJson } from '@/core/ajax'
import { logError } from '@/core/utils/log'
import { fixed } from '@/core/utils'
import { DownloadPackage } from '@/core/download'
import { LiveDanmaku } from '@/components/live/live-socket'
import { VIcon, VButton } from '@/ui'

export default {
  components: {
    VIcon,
    VButton,
  },
  data() {
    return {
      isRecording: true,
      danmakus: [],
      opened: false,
      collapsed: false,
      loading: true,
    }
  },
  async mounted() {
    try {
      const { LiveSocket } = await import('@/components/live/live-socket')
      // 绕了一大圈拿 room id, 不知道为啥 URL 里那个数字有些直播间不是 room id
      const user = (await select('.header-info-ctnr .room-cover')) as HTMLAnchorElement
      const uidMatch = user.href.match(/space\.bilibili\.com\/(\d+)/)
      if (!uidMatch) {
        throw new Error(`无法获取 UID: ${user.href}`)
      }
      const uid = uidMatch[1]
      const json = await getJson(
        `https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid=${uid}`,
      )
      const roomIDMatch = document.URL.match(/live\.bilibili\.com\/(\d+)/)
      if (!roomIDMatch) {
        throw new Error(`无法获取 Room ID: ${document.URL}`)
      }
      const roomID = lodash.get(json, 'data.roomid', roomIDMatch[1])
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
        return `<d p="${fixed(d.time / 1000, 3)},${d.type},${d.fontSize},${d.color},${
          d.sendTime
        },0,${d.userHash},0">${content}</d>`
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
      const { getFriendlyTitle } = await import('@/core/utils/title')
      DownloadPackage.single(`${getFriendlyTitle()}.xml`, this.getXML())
    },
    async exportASS() {
      const xml = this.getXML()
      console.log(xml)
    },
  },
}
</script>

<style lang="scss" scoped>
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
    .collapse,
    .close {
      padding: 2px;
    }
    .collapse .be-icon {
      transform: scale(1.2);
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
  }
  .record-stats {
    margin-top: 16px;
    margin-bottom: 8px;
  }
  .loading-tip {
    margin-bottom: 16px;
  }
  .toggle-record {
    // display: flex;
    // align-items: center;
    // padding: 8px;
    margin-bottom: 16px;
    font-size: 13px;
    padding: 6px 8px;
    // background-color: var(--theme-color);
    // color: var(--foreground-color);
    // cursor: pointer;
    // @include round();
    .be-icon {
      // font-size: 14px;
      margin-right: 8px;
    }
  }
  .exports {
    align-self: stretch;
    // display: flex;
    // align-items: center;
    & > * {
      padding: 6px 0;
      // @include round();
      // cursor: pointer;
      // padding: 8px;
      // text-align: center;
      // white-space: nowrap;
      // background-color: #8882;
      // &:hover {
      //   background-color: #8884;
      // }
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
