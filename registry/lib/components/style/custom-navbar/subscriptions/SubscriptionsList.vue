<template>
  <div class="subscription-list">
    <VLoading v-if="loading"></VLoading>
    <VEmpty v-else-if="!loading && cards.length === 0"></VEmpty>
    <template v-else>
      <div class="subscription-content">
        <a
          v-for="card of cards"
          :key="card.id"
          class="subscription-card"
          :href="card.playUrl"
          target="_blank"
        >
          <div class="subscriptions-cover-container">
            <DpiImage class="cover" :src="card.coverUrl" :size="64"></DpiImage>
          </div>
          <div class="card-info">
            <h1 class="title" :title="card.title">{{ card.title }}</h1>
            <div class="progress-row">
              <div v-if="card.status" class="status" :class="'status-' + card.status">
                {{ card.statusText }}
              </div>
              <div
                v-if="card.progress"
                class="progress"
                :title="card.progress + ' | ' + card.latest"
              >
                {{ card.progress }} | {{ card.latest }}
              </div>
              <div v-else class="progress" :title="card.latest">{{ card.latest }}</div>
              <a class="info" :href="card.mediaUrl" target="_blank" title="详细信息">
                <VIcon icon="mdi-information-outline" :size="16"></VIcon>
              </a>
            </div>
          </div>
        </a>
      </div>
      <ScrollTrigger v-if="hasMorePage" @trigger="nextPage()"></ScrollTrigger>
    </template>
  </div>
</template>

<script lang="ts">
import { getUID } from '@/core/utils'
import { logError } from '@/core/utils/log'
import { DpiImage, VLoading, VEmpty, VIcon, ScrollTrigger } from '@/ui'
import { getJsonWithCredentials } from '@/core/ajax'
import { SubscriptionTypes } from './subscriptions'
import { SubscriptionItem, SubscriptionStatus, SubscriptionStatusFilter } from './types'

const getStatusText = (status: SubscriptionStatus) => {
  switch (status) {
    case SubscriptionStatus.ToView:
      return '想看'
    case SubscriptionStatus.Viewing:
    default:
      return '在看'
    case SubscriptionStatus.Viewed:
      return '看过'
  }
}
const subscriptionSorter = (a: SubscriptionItem, b: SubscriptionItem) => {
  let statusA = a.status
  if (statusA !== SubscriptionStatus.Viewed) {
    statusA = SubscriptionStatus.Viewed - statusA
  }
  let statusB = b.status
  if (statusB !== SubscriptionStatus.Viewed) {
    statusB = SubscriptionStatus.Viewed - statusB
  }
  return statusA - statusB
}
export default Vue.extend({
  components: {
    DpiImage,
    VLoading,
    VEmpty,
    VIcon,
    ScrollTrigger,
  },
  props: {
    filter: {
      type: [Object, null],
      default: null,
    },
    type: {
      type: String,
      default: SubscriptionTypes.Bangumi,
    },
  },
  data() {
    return {
      loading: true,
      hasMorePage: true,
      cards: [],
      page: 1,
    }
  },
  watch: {
    filter() {
      this.cards = []
      this.loading = true
      this.page = 1
      this.nextPage()
    },
  },
  async created() {
    this.nextPage()
  },
  methods: {
    async nextPage() {
      try {
        const filter = this.filter as SubscriptionStatusFilter
        const followStatus = filter.viewAll ? 0 : (filter.status as number)
        const params = new URLSearchParams({
          type: this.type !== SubscriptionTypes.Bangumi ? '2' : '1',
          pn: this.page,
          ps: '16',
          vmid: getUID(),
          follow_status: followStatus.toString(),
        })
        const json = await getJsonWithCredentials(
          `https://api.bilibili.com/x/space/bangumi/follow/list?${params}`,
        )
        if (json.code !== 0) {
          logError(`加载番剧信息失败: ${json.message}`)
          return
        }
        const newCards: SubscriptionItem[] = lodash
          .uniqBy(
            (lodash.get(json, 'data.list') as any[]).map(
              (item): SubscriptionItem => ({
                title: item.title,
                coverUrl: item.square_cover.replace('http:', 'https:'),
                latest: item.new_ep.index_show,
                progress: item.progress,
                id: item.season_id,
                status: item.follow_status,
                statusText: getStatusText(item.follow_status),
                playUrl: `https://www.bilibili.com/bangumi/play/ss${item.season_id}`,
                mediaUrl: `https://www.bilibili.com/bangumi/media/md${item.media_id}`,
              }),
            ),
            card => card.id,
          )
          .sort(subscriptionSorter)
        this.page++
        this.cards = this.cards.concat(newCards)
        this.hasMorePage = this.cards.length < json.data.total
      } finally {
        this.loading = false
      }
    },
  },
})
</script>

<style lang="scss">
@import 'common';

.subscription-list {
  width: 100%;
  box-sizing: border-box;
  padding: 0 8px;
  display: flex;
  align-items: center;
  flex-direction: column;
  .be-scroll-trigger {
    padding-bottom: 12px;
  }
  .subscription-content {
    align-self: stretch;
    display: flex;
    flex-direction: column;
    .subscription-card {
      position: relative;
      display: flex;
      margin-bottom: 12px;
      flex-shrink: 0;
      background-color: #fff;
      box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
      border: 1px solid #8882;
      $radius: 8px;
      border-radius: $radius;
      body.dark & {
        background-color: #2d2d2d;
        color: #eee;
      }
      .subscriptions-cover-container {
        height: 64px;
        width: 64px;
        border-radius: $radius 0 0 $radius;
        overflow: hidden;
        .cover {
          height: 100%;
          width: 100%;
        }
      }
      &:hover .cover {
        transform: scale(1.05);
      }
      .card-info {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 0 12px;
        max-width: calc(100% - 24px - 64px);
        box-sizing: content-box;
      }
      .info {
        padding: 2px;
        border-radius: 14px;
        line-height: 1;
        &:hover {
          color: var(--theme-color) !important;
        }
      }
      .progress-row {
        display: flex;
        padding-bottom: 8px;
        justify-content: space-between;
        align-self: stretch;
        align-items: center;
      }
      .status {
        padding: 0 4px;
        background-color: #8882;
        border: 1px solid #8884;
        border-radius: 4px;
        opacity: 0.75;
        &.status-2 {
          background-color: var(--theme-color-10);
          border-color: var(--theme-color-30);
          opacity: 1;
        }
      }
      .progress {
        white-space: nowrap;
        width: 0;
        flex-grow: 1;
        margin: 0 8px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .title {
        font-size: 14px;
        @include semi-bold();
        padding-top: 4px;
        color: inherit;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        margin: 0;
        flex: 1;
        @include h-center();
      }
      &:hover .title {
        color: var(--theme-color);
      }
    }
  }
}
</style>
