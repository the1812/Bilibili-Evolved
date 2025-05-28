<template>
  <div class="be-live-list">
    <div class="be-live-list-header">
      <div class="be-live-list-title">
        正在直播
        <div class="be-live-list-count">({{ items.length }})</div>
      </div>
      <div class="be-live-list-actions">
        <div v-if="loaded" class="be-live-list-refresh" title="刷新" @click="fetchLiveList">
          <VIcon icon="mdi-refresh" :size="16" />
        </div>
        <a
          class="be-live-list-more"
          target="_blank"
          href="https://link.bilibili.com/p/center/index#/user-center/follow/1"
        >
          更多
          <VIcon icon="right-arrow" :size="14" />
        </a>
      </div>
    </div>
    <div class="be-live-list-search">
      <VIcon icon="search" :size="18" />
      <TextBox v-model="keyword" placeholder="搜索" />
    </div>
    <div class="be-live-list-content">
      <VLoading v-if="!loaded" />
      <VEmpty v-if="loaded && filteredItems.length === 0" />
      <a
        v-for="item of filteredItems"
        :key="item.roomid"
        class="be-live-list-item"
        target="_blank"
        :href="item.link"
      >
        <div class="be-live-list-item-avatar">
          <DpiImage :src="item.face" :alt="item.title" :size="36" />
        </div>
        <div class="be-live-list-item-info">
          <div class="be-live-list-item-title" :title="item.title">
            {{ decodeTitle(item.title) }}
          </div>
          <div class="be-live-list-item-user" :title="item.uname">
            {{ item.uname }}
          </div>
        </div>
      </a>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { VIcon, TextBox, DpiImage, VEmpty, VLoading } from '@/ui'
import { bilibiliApi, getJsonWithCredentials, getPages, responsiveGetPages } from '@/core/ajax'
import { FollowingListID, FollowingUserInfo, LiveInfo, RawFollowingListItem } from './types'
import { getUID } from '@/core/utils'
import { ExtendFeedsLiveOptions, UnselectedListID } from './options'
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'

const decodeTitle = (title: string) => {
  const textArea = document.createElement('textarea')
  textArea.innerHTML = title
  return textArea.value
}

const { options } = getComponentSettings<ExtendFeedsLiveOptions>('extendFeedsLive')
const items = ref<LiveInfo[]>([])
const pinnedUsers = ref<FollowingUserInfo[]>([])
const hiddenUsers = ref<FollowingUserInfo[]>([])
const loaded = ref(false)
const keyword = ref('')

const filteredItems = computed(() => {
  if (keyword.value) {
    return items.value.filter(it => {
      const matchField = (field: keyof LiveInfo) => {
        return it[field].toString().toLowerCase().includes(keyword.value.toLowerCase())
      }

      return matchField('title') || matchField('uname') || matchField('roomid') || matchField('uid')
    })
  }
  return items.value
})

const fetchRecommendLiveInfos = async (): Promise<LiveInfo[]> => {
  // 动态 portal 接口会获取推荐的 top30 直播。同时这个接口不会忽略悄悄关注的 up 的直播。
  const portalList = await getJsonWithCredentials(
    'https://api.bilibili.com/x/polymer/web-dynamic/v1/portal',
  )
  const recommendLiveItems =
    portalList.data.live_users?.items?.map(item => {
      const { jump_url, room_id, face, title, uname, mid } = item
      return {
        cover: face,
        face,
        uname,
        title,
        roomid: room_id,
        pic: '', // portal 接口没有
        online: 0, // portal 接口没有
        uid: mid,
        link: jump_url,
      }
    }) ?? []
  return recommendLiveItems
}

const mergeRecommendLiveInfos = (liveInfos: LiveInfo[], recommendLiveInfos: LiveInfo[]) => {
  // recommendItems 里的 pic 和 online 为默认值，但是 ui 也没用到。
  // 所以方便起见，直接拼接没出现在 recommendItems 里的 item
  const recommendRoomIds = recommendLiveInfos.map(item => item.roomid)
  const feedConcatItems = liveInfos.filter(item => !recommendRoomIds.includes(item.roomid))
  return lodash.concat(recommendLiveInfos, feedConcatItems)
}

const sortByUsers = (users: FollowingUserInfo[], descending = false) => {
  return (a: LiveInfo, b: LiveInfo) => {
    const aPinnedIndex = users.findIndex(it => it.mid === a.uid)
    const bPinnedIndex = users.findIndex(it => it.mid === b.uid)
    if (bPinnedIndex === -1 && aPinnedIndex === -1) {
      return 0
    }
    if (aPinnedIndex === -1) {
      return descending ? -1 : 1
    }
    if (bPinnedIndex === -1) {
      return descending ? 1 : -1
    }
    return aPinnedIndex - bPinnedIndex
  }
}

const fetchFollowingLists = async () => {
  const fetchFollowingList = async (id: FollowingListID) => {
    if (id === UnselectedListID || id === undefined) {
      return []
    }
    const list = await bilibiliApi<RawFollowingListItem[]>(
      getJsonWithCredentials('https://api.bilibili.com/x/relation/tags'),
    )
    const response = await getPages<FollowingUserInfo>({
      api: page =>
        getJsonWithCredentials(
          `https://api.bilibili.com/x/relation/tag?tagid=${id}&pn=${page}&ps=500&mid=${getUID()}`,
        ),
      getList: json => lodash.get(json, 'data', []),
      getTotal: () => list.find(it => it.tagid === id)?.count ?? 0,
    })
    return response
  }

  await Promise.all([
    fetchFollowingList(options.pinnedListID)
      .then(users => {
        pinnedUsers.value = users
      })
      .catch(() => {
        pinnedUsers.value = []
      }),
    fetchFollowingList(options.hiddenListID)
      .then(users => {
        hiddenUsers.value = users
      })
      .catch(() => {
        hiddenUsers.value = []
      }),
  ])
}

const fetchLiveList = async () => {
  try {
    items.value = []
    loaded.value = false
    const [, promise] = responsiveGetPages<LiveInfo>({
      api: page =>
        getJsonWithCredentials(
          `https://api.live.bilibili.com/xlive/web-ucenter/v1/xfetter/GetWebList?page=${page}`,
        ),
      getList: json =>
        lodash.get(json, 'data.list', []).map(item => {
          const { face, uname, title, room_id, cover_from_user, online, uid, link } = item
          return {
            cover: face,
            face,
            uname,
            title,
            roomid: room_id,
            pic: cover_from_user,
            online,
            uid,
            link,
          }
        }),
      getTotal: json => lodash.get(json, 'data.count', 0),
    })

    const [allItems, recommendItems] = await Promise.all([promise, fetchRecommendLiveInfos()])
    const sortedItems = mergeRecommendLiveInfos(allItems, recommendItems)
      .sort(sortByUsers(pinnedUsers.value, false))
      .filter(item => !hiddenUsers.value.some(user => user.mid === item.uid))
    items.value = sortedItems
  } finally {
    loaded.value = true
  }
}

const initializeLiveList = async () => {
  await fetchFollowingLists()
  await fetchLiveList()
}
addComponentListener('extendFeedsLive.pinnedListID', initializeLiveList)
addComponentListener('extendFeedsLive.hiddenListID', initializeLiveList)
onMounted(() => {
  initializeLiveList()
})
onBeforeUnmount(() => {
  removeComponentListener('extendFeedsLive.pinnedListID', initializeLiveList)
  removeComponentListener('extendFeedsLive.hiddenListID', initializeLiveList)
})
</script>
<style lang="scss">
@import 'common';

.be-live-list {
  @include v-stretch(12px);
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 12px;
  color: #000;
  background-color: #fff;

  body.dark & {
    background-color: #444;
    color: #eee;
  }

  &-header {
    @include h-center();
    justify-content: space-between;
  }

  &-title {
    @include h-center(4px);
    font-size: 14px;
  }

  &-count {
    opacity: 0.5;
    font-size: 12px;
  }

  &-actions {
    @include h-center(4px);
  }

  &-refresh {
    cursor: pointer;
    padding: 2px;

    .be-icon {
      opacity: 0.5;
      transition: 0.35s ease-out;
    }

    &:hover .be-icon {
      transform: rotate(360deg);
      opacity: 1;
      color: var(--theme-color);
    }
  }

  &-more {
    opacity: 0.5;
    padding: 2px;
    cursor: pointer;
    @include h-center();

    &:hover {
      opacity: 1;
      color: var(--theme-color);
    }
  }

  &-search {
    @include h-center(8px);

    .be-icon {
      opacity: 0.6;
    }

    .be-textbox {
      flex-grow: 1;
    }
  }

  &-content {
    @include no-scrollbar();
    @include v-stretch(8px);
    // 默认状态
    max-height: calc(100vh - 358px);

    // 开启过滤器
    body.enable-feeds-filter & {
      max-height: calc(100vh - 414px);
    }

    // 禁掉 profile 后
    body.feeds-filter-side-block-profile & {
      max-height: calc(100vh - 218px);
    }
  }

  &-item {
    @include h-center(8px);
    cursor: pointer;

    &-avatar {
      overflow: hidden;
      border-radius: 50%;
      display: flex;
      border: 1px solid #8884;
    }

    &-info {
      @include v-stretch(2px);
      flex-grow: 1;
      width: 0;
    }

    &-title,
    &-user {
      @include single-line();
    }

    &-title {
      font-size: 14px;
      transition: 0.2s ease-out;
    }

    &-user {
      opacity: 0.6;
    }

    &:hover &-title {
      color: var(--theme-color);
    }
  }
}
</style>
