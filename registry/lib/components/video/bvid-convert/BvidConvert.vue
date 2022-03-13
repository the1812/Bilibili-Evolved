<template>
  <div class="bvid-convert">
    <template v-if="aid && bvid">
      <div class="bvid-convert-item">
        {{ aid }}
        <div class="bvid-convert-item-copy" title="复制链接" @click="copyLink('aid')">
          <VIcon :size="16" :icon="aidCopied ? 'mdi-check': 'mdi-link'" />
        </div>
      </div>
      <div class="bvid-convert-item">
        {{ bvid }}
        <div class="bvid-convert-item-copy" title="复制链接" @click="copyLink('bvid')">
          <VIcon :size="16" :icon="bvidCopied ? 'mdi-check': 'mdi-link'" />
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { videoChange } from '@/core/observer'
import { select } from '@/core/spin-query'
import { VIcon } from '@/ui'

enum CopyIdType {
  Aid = 'aid',
  Bvid = 'bvid',
}
const copyIds = [
  CopyIdType.Aid,
  CopyIdType.Bvid,
]
export default Vue.extend({
  components: { VIcon },
  data() {
    return {
      aid: '',
      aidCopied: false,
      bvid: '',
      bvidCopied: false,
    }
  },
  async mounted() {
    videoChange(async () => {
      this.aid = `av${unsafeWindow.aid}`
      this.bvid = unsafeWindow.bvid
      const link = await select('.av-link,.bv-link,.bvid-link') as HTMLElement
      if (link) {
        this.bvid = link.innerHTML.trim()
      }
    })
  },
  methods: {
    getParamCopyLink(data: CopyIdType) {
      const query = window.location.search
      if (copyIds.some(id => query.includes(`${id}=`))) {
        return `https://www.bilibili.com/video/${this[data]}`
      }
      return null
    },
    getTailingCopyLink(data: CopyIdType) {
      const query = window.location.search
      const url = document.URL.replace(query, '')
      return url.replace(/\/[^\/]+$/, `/${this[data]}`) + query
    },
    async copyLink(data: CopyIdType) {
      if (this[`${data}Copied`]) {
        return
      }
      const link = this.getParamCopyLink(data) ?? this.getTailingCopyLink(data)
      await navigator.clipboard.writeText(link)
      this[`${data}Copied`] = true
      setTimeout(() => (this[`${data}Copied`] = false), 1000)
    },
  },
})
</script>

<style lang="scss">
@import "common";
.bvid-convert {
  order: -1;
  flex-direction: column;
  border-radius: 4px;
  padding: 6px 8px;
  width: 100%;
  user-select: text;
  box-sizing: border-box;
  box-shadow: 0 0 0 1px #8884;
  @include default-background-color();
  &-item {
    font-size: 14px;
    @include h-center(6px);
    &-copy {
      transition: transform .3s ease-out;
      cursor: pointer;
      &:active {
        transform: scale(0.9);
      }
    }
  }
}
</style>
