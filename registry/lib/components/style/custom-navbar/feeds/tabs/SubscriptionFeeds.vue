<template>
  <VideoCardList
    show-description
    :cards="cards"
    :loading="loading"
    :has-more-page="hasMorePage"
    @next-page="nextPage"
  />
</template>
<script lang="ts">
import { VideoCard } from '@/components/feeds/video-card'
import { formatCount, formatDuration } from '@/core/utils/formatters'
import { nextPageMixin } from './next-page'
import { formatPubTime, formatPubTimeText } from './video-card-pub-time'
import {
  createSubscriptionsLoader,
  getSubscriptionKindName,
  SubscriptionUpdate,
} from './subscriptions'
import VideoCardList from './VideoCardList.vue'

/** 拼出定长数字串作为卡片 id: 更新时间(10 位) + aid(15 位) + 订阅项 id(15 位) */
const toCardId = (updateTime: number, aid: number, subscriptionId: number) =>
  `${updateTime}`.padStart(10, '0') +
  `${aid}`.padStart(15, '0') +
  `${subscriptionId}`.padStart(15, '0')

/** 把「订阅项 + 最新更新」映射为列表卡片 */
const mapSubscriptionUpdate = ({ subscription, content }: SubscriptionUpdate) => {
  // 订阅流没有动态 ID: 定长拼接的 id 既当排序键(各段按更新时间倒序)又当 `:key`(不同订阅项也不重复)
  const updateTime = content.updateTime * 1000
  return {
    id: toCardId(content.updateTime, content.aid, subscription.id),
    aid: content.aid,
    bvid: content.bvid,
    // 收藏夹卡片打开收藏夹列表页, 合集卡片打开稿件页
    url: content.pageUrl,
    coverUrl: content.cover,
    title: content.title,
    duration: content.duration,
    durationText: formatDuration(content.duration),
    // 描述行标注这次更新来自哪个订阅(合集名 / 收藏夹名), 由 `show-description` 打开
    description: `${getSubscriptionKindName(subscription)}「${subscription.title}」`,
    // 时间显示这次更新的时间(合集新一集的发布时间 / 收藏夹最新一条的收藏时间)
    pubTime: formatPubTime(updateTime),
    pubTimeText: formatPubTimeText(updateTime),
    upFaceUrl: content.upFaceUrl,
    upName: content.upName,
    upID: content.upID,
    watchlater: true,
    playCount: formatCount(content.playCount),
  } as VideoCard
}

export default Vue.extend({
  components: {
    VideoCardList,
  },
  mixins: [
    // 订阅流没有对应的动态类型, 第三个参数是从「订阅的合集/收藏夹」取最新更新的数据源
    nextPageMixin(undefined, mapSubscriptionUpdate, createSubscriptionsLoader),
  ],
})
</script>
