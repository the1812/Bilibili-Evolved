<template>
  <DefaultWidget
    name="导出图片"
    icon="mdi-export"
    :disabled="busy"
    @click="exportImages()"
  ></DefaultWidget>
</template>
<script lang="ts">
import { getBlob } from '@/core/ajax'
import { DownloadPackage } from '@/core/download'
import { getComponentSettings } from '@/core/settings'
import { Toast } from '@/core/toast'
import { retrieveImageUrl } from '@/core/utils'
import { logError } from '@/core/utils/log'
import { formatTitle, getTitleVariablesFromDate } from '@/core/utils/title'
import { DefaultWidget } from '@/ui'

export default Vue.extend({
  components: {
    DefaultWidget,
  },
  data() {
    return {
      busy: false,
    }
  },
  methods: {
    async exportImages() {
      const { columnFormat } = getComponentSettings('imageExporter').options
      const toast = Toast.info('下载中...', '导出图片')
      this.busy = true
      try {
        const publishDate = getTitleVariablesFromDate(
          new Date(
            // eslint-disable-next-line no-underscore-dangle
            (unsafeWindow.__INITIAL_STATE__?.readInfo?.publish_time ?? 0) * 1000,
          ),
        )
        const variables = {
          cv: document.URL.match(/read\/cv(\d+)/)?.at(1),
          publishYear: publishDate.year,
          publishMonth: publishDate.month,
          publishDay: publishDate.day,
          publishHour: publishDate.hour,
          publishMinute: publishDate.minute,
          publishSecond: publishDate.second,
          publishMillisecond: publishDate.millisecond,
        }

        const images: { name: string; extension: string; url: string }[] = []
        const bannerElement = dq('.banner-image .card-image__image') as HTMLDivElement
        const bannerUrl = retrieveImageUrl(bannerElement)
        if (bannerUrl) {
          images.push({
            ...bannerUrl,
            name: `${formatTitle(columnFormat, false, { n: '1', ...variables })}${
              bannerUrl.extension
            }`,
          })
          console.log(bannerElement, bannerUrl, images)
        }
        const articleImages = dqa('.article-content :is(img.normal-img, .normal-img img)')
        articleImages.forEach((image: HTMLElement) => {
          const url = retrieveImageUrl(image)
          if (url) {
            images.push({
              ...url,
              name: `${formatTitle(columnFormat, false, {
                n: (images.length + 1).toString(),
                ...variables,
              })}${url.extension}`,
            })
          }
        })
        if (images.length === 0) {
          Toast.info('此页面没有检测到任何可导出图片.', '图片导出')
          return
        }
        let downloadedCount = 0
        const imageBlobs = await Promise.all(
          images.map(async ({ url }) => {
            const blob = await getBlob(url)
            downloadedCount++
            toast.message = `下载中... (${downloadedCount}/${images.length})`
            return blob
          }),
        )
        const pack = new DownloadPackage()
        imageBlobs.forEach((blob, index) => pack.add(images[index].name, blob))

        await pack.emit(`${formatTitle(columnFormat, false, { n: '', ...variables })}.zip`)
      } catch (error) {
        logError(error)
      } finally {
        this.busy = false
        toast.close()
      }
    },
  },
})
</script>
