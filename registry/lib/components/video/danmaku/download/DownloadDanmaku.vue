<template>
  <div class="multiple-widgets">
    <DefaultWidget
      :disabled="disabled"
      name="下载弹幕 (XML)"
      icon="danmaku"
      @click="download('xml')"
    ></DefaultWidget>
    <DefaultWidget
      :disabled="disabled"
      name="下载弹幕 (JSON)"
      icon="danmaku"
      @click="download('json')"
    ></DefaultWidget>
    <DefaultWidget
      :disabled="disabled"
      name="下载弹幕 (ASS)"
      icon="danmaku"
      @click="download('ass')"
    ></DefaultWidget>
    <DefaultWidget
      :disabled="disabled"
      name="下载所有弹幕 (XML)"
      icon="danmaku"
      @click="downloadAll('xml')"
    ></DefaultWidget>
    <DefaultWidget
      :disabled="disabled"
      name="下载所有弹幕 (JSON)"
      icon="danmaku"
      @click="downloadAll('json')"
    ></DefaultWidget>
    <DefaultWidget
      :disabled="disabled"
      name="下载所有弹幕 (ASS)"
      icon="danmaku"
      @click="downloadAll('ass')"
    ></DefaultWidget>
  </div>
</template>

<script lang="ts">
import { DownloadPackage } from '@/core/download'
import { logError, useScopedConsole } from '@/core/utils/log'
import { getFriendlyTitle } from '@/core/utils/title'
import { addData } from '@/plugins/data'
import { DefaultWidget } from '@/ui'
import danmakuIcon from './danmaku.svg'
import { DanmakuDownloadType, getBlobByType } from './utils'
import { getJson } from '@/core/ajax'

const logger = useScopedConsole('下载弹幕')

addData('ui.icons', (icons: { [key: string]: string }) => {
  icons.danmaku = danmakuIcon
})

export default Vue.extend({
  components: {
    DefaultWidget,
  },
  data() {
    return {
      disabled: false,
    }
  },
  methods: {
    async download(type: DanmakuDownloadType) {
      try {
        this.disabled = true
        const title = getFriendlyTitle()
        const blob = await getBlobByType(type)
        await DownloadPackage.single(`${title}.${type}`, blob)
      } catch (error) {
        logError(error)
      } finally {
        this.disabled = false
      }
    },
    async downloadAll(type: DanmakuDownloadType) {
      try {
        this.disabled = true

        // 网址匹配正则
        const seasonUrl = /^https:\/\/www.bilibili.com\/bangumi\/play\/ss(\d+)/
        const episodeUrl = /^https:\/\/www.bilibili.com\/bangumi\/play\/ep(\d+)/

        // 获取番剧信息api地址
        let url = null
        let matches = seasonUrl.exec(document.URL)
        if (matches) {
          url = `https://api.bilibili.com/pgc/view/web/season?season_id=${matches[1]}`
        } else {
          matches = episodeUrl.exec(document.URL)
          if (matches) {
            url = `https://api.bilibili.com/pgc/view/web/season?ep_id=${matches[1]}`
          }
        }

        if (!url) {
          throw new Error('不支持的URL')
        }

        // 调用api获取剧集信息
        const json = await getJson(url)
        const episodes = lodash.get(json, 'result.episodes', []) as {
          aid: number
          cid: number
          share_copy: string
        }[]
        logger.info(`获取到剧集列表，数量：${episodes.length}`)

        // 下载弹幕
        const pack = new DownloadPackage()
        for (let i = 0; i < episodes.length; i++) {
          logger.info(`正在下载弹幕：${i + 1} / ${episodes.length}`)

          const ep = episodes[i]
          const input = { aid: ep.aid.toString(), cid: ep.cid.toString() }
          const blob = await getBlobByType(type, input)

          pack.add(`${ep.share_copy}.${type}`, blob)
        }

        logger.info('弹幕下载完成')
        const title = getFriendlyTitle()
        pack.emit(title)
      } catch (error) {
        logError(error)
      } finally {
        this.disabled = false
      }
    },
  },
})
</script>
