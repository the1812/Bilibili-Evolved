<template>
  <div class="bvid-convert">
    <BvidConvertRow v-for="id in ids" :id="id" :key="id" :copy-link="copyLink" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { VideoInfo } from '@/components/video/video-info'
import { videoChange } from '@/core/observer'
import { getComponentSettings } from '@/core/settings'
import { select } from '@/core/spin-query'
import { matchUrlPattern } from '@/core/utils'
import { getFriendlyTitle } from '@/core/utils/title'
import { bangumiUrls } from '@/core/utils/urls'
import { BvidConvertOptions } from '.'
import BvidConvertRow from './BvidConvertRow.vue'

const { options } = getComponentSettings<BvidConvertOptions>('bvidConvert')
const copyIds = ['aid', 'bvid']
type LinkProvider = (context: { id: string; query: string }) => string
const linkProviders: LinkProvider[] = [
  // 参数类页面, 如 festival
  ({ id, query }) => {
    if (copyIds.some(copyId => query.includes(`${copyId}=`))) {
      return `https://www.bilibili.com/video/${id}/`
    }
    return null
  },
  // 番剧
  ({ id }) => {
    if (bangumiUrls.some(u => matchUrlPattern(u))) {
      return `https://www.bilibili.com/video/${id}/`
    }
    return null
  },
  // 普通视频
  ({ id, query }) => {
    const params = new URLSearchParams(query)
    const newQuery = new URLSearchParams()
    for (const key of ['p', 't']) {
      const value = params.get(key)
      if (value) {
        newQuery.set(key, value)
      }
    }
    return `https://www.bilibili.com/video/${id}/${
      newQuery.size > 0 ? `?${newQuery.toString()}` : ''
    }`
  },
]
const aid = ref('')
const bvid = ref('')
const ids = computed(() => [aid.value ? `av${aid.value}` : '', bvid.value].filter(Boolean))

onMounted(() => {
  videoChange(async () => {
    aid.value = unsafeWindow.aid?.toString() ?? ''
    bvid.value = unsafeWindow.bvid
    const link = (await select('.av-link,.bv-link,.bvid-link')) as HTMLElement
    if (link) {
      bvid.value = link.innerHTML.trim()
    }
  })
})

const createMarkdown = (link: string, title: string, coverUrl: string) => {
  const label = title.replace(/[\\`*_[\]<>!]/g, '\\$&')
  const markdown = title ? `[${label}](${link})` : link
  return coverUrl ? `${markdown}\n\n![视频封面](${coverUrl})` : markdown
}

const getImageDataUrl = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`下载视频封面失败: ${response.status}`)
  }
  const blob = await response.blob()
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

const createHtml = async (link: string, title: string, coverUrl: string) => {
  const anchor = document.createElement('a')
  anchor.href = link
  anchor.textContent = title || link
  if (!coverUrl) {
    return anchor.outerHTML
  }
  const image = document.createElement('img')
  image.src = await getImageDataUrl(coverUrl)
  image.alt = '视频封面'
  return `<div><p>${anchor.outerHTML}</p><p>${image.outerHTML}</p></div>`
}

const createContent = async (link: string, title: string, copyOptions: BvidConvertOptions) => {
  const { copyWithCover, copyFormat } = copyOptions
  const coverUrl = copyWithCover ? (await new VideoInfo(aid.value).fetchInfo()).coverUrl : ''
  return copyFormat === 'Markdown'
    ? createMarkdown(link, title, coverUrl)
    : createHtml(link, title, coverUrl)
}

const copyLink = async (id: string) => {
  const context = {
    query: location.search,
    id,
  }
  const link = linkProviders.map(p => p(context)).filter(it => it !== null)[0]
  const copyOptions = { ...options }
  const { copyWithTitle, copyFormat } = copyOptions
  const title = copyWithTitle ? getFriendlyTitle() : ''
  const text = title ? `${title} ${link}` : link
  const content = createContent(link, title, copyOptions)
  const mimeType = copyFormat === 'Markdown' ? 'text/plain' : 'text/html'
  const clipboardData = {
    [mimeType]: content.then(value => new Blob([value], { type: mimeType })),
  }
  if (copyFormat === 'HTML') {
    clipboardData['text/plain'] = Promise.resolve(new Blob([text], { type: 'text/plain' }))
  }
  await navigator.clipboard.write([new ClipboardItem(clipboardData)])
}
</script>

<style lang="scss">
.bvid-convert {
  order: -1;
  flex-direction: column;
  border-radius: 4px;
  padding: 6px 8px;
  user-select: text;
  box-sizing: border-box;
  box-shadow: 0 0 0 1px #8884;
  background-color: #fff;
  body.dark & {
    background-color: var(--be-color-card-bg, #333);
  }
}
</style>
