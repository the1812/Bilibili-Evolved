<template>
  <DefaultWidget
    name="查看头像"
    icon="mdi-account-circle-outline"
    @click="viewAvatar()"
  ></DefaultWidget>
</template>

<script lang="ts">
import { getJson } from '@/core/ajax'
import { select } from '@/core/spin-query'
import { Toast } from '@/core/toast'
import { DefaultWidget, showImage } from '@/ui'

type SpaceCardResponse = {
  data?: {
    card?: {
      face?: string
    }
  }
}

const getUid = () => {
  const match = location.href.match(/space\.bilibili\.com\/(\d+)/)
  return match?.[1] ?? null
}

const normalizeAvatarUrl = (url: string) => {
  const httpsUrl = url.startsWith('//') ? `https:${url}` : url.replace('http:', 'https:')
  return httpsUrl.replace(/@[^/?]+(?=($|[?#]))/, '')
}

const avatarSelectors = ['.space-header img[src*="/bfs/face/"]', '.h-avatar img']

const getAvatarUrlFromDom = () => {
  for (const selector of avatarSelectors) {
    const element = document.querySelector(selector)
    if (!(element instanceof HTMLImageElement)) {
      continue
    }
    if (element.src) {
      return normalizeAvatarUrl(element.src)
    }
  }
  return ''
}

const getAvatarUrlFromApi = async (uid: string) => {
  const cardJson = await getJson<SpaceCardResponse>(
    `https://api.bilibili.com/x/web-interface/card?mid=${uid}`,
  )
  const cardFace = cardJson.data?.card?.face
  return cardFace ? normalizeAvatarUrl(cardFace) : ''
}

export default Vue.extend({
  components: {
    DefaultWidget,
  },
  data() {
    return {
      imageUrl: '',
      loading: true,
    }
  },
  async mounted() {
    await this.resolveImageUrl()
  },
  methods: {
    async resolveImageUrl() {
      const uid = getUid()
      if (!uid) {
        this.loading = false
        return
      }
      try {
        this.loading = true
        this.imageUrl = getAvatarUrlFromDom()
        if (this.imageUrl) {
          return
        }

        const domAvatar = await select(() => getAvatarUrlFromDom() || null, {
          maxRetry: 8,
          queryInterval: 300,
        })
        this.imageUrl = domAvatar ?? ''
        if (this.imageUrl) {
          return
        }

        this.imageUrl = await getAvatarUrlFromApi(uid)
      } finally {
        this.loading = false
      }
    },
    async viewAvatar() {
      if (!this.imageUrl) {
        await this.resolveImageUrl()
      }
      if (!this.imageUrl) {
        Toast.error('未能获取当前用户头像地址', '查看头像', 3000)
        return
      }
      showImage(this.imageUrl)
    },
  },
})
</script>
