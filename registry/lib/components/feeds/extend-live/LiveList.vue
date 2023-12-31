<template>
  <div class="be-live-list">
    <div class="be-live-list-header">
      <div class="be-live-list-title">
        正在直播
        <div class="be-live-list-count">({{ items.length }})</div>
      </div>
      <div class="be-live-list-actions">
        <div v-if="loaded" class="be-live-list-refresh" title="刷新" @click="refresh">
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
<script lang="ts">
import { VIcon, TextBox, DpiImage, VEmpty, VLoading } from '@/ui'
import { getJsonWithCredentials, responsiveGetPages } from '@/core/ajax'

const decodeTitle = (title: string) => {
  const textArea = document.createElement('textarea')
  textArea.innerHTML = title
  return textArea.value
}

interface LiveInfo {
  cover: string
  face: string
  uname: string
  title: string
  roomid: number
  pic: string
  online: number
  uid: number
  link: string
}

export default Vue.extend({
  components: {
    VIcon,
    TextBox,
    DpiImage,
    VEmpty,
    VLoading,
  },
  data() {
    return {
      items: [],
      loaded: false,
      keyword: '',
    }
  },
  computed: {
    filteredItems() {
      if (this.keyword) {
        return (this.items as LiveInfo[]).filter(it => {
          const matchField = (field: keyof LiveInfo) => {
            return it[field].toString().toLowerCase().includes(this.keyword.toLowerCase())
          }
          return (
            matchField('title') || matchField('uname') || matchField('roomid') || matchField('uid')
          )
        })
      }
      return this.items
    },
  },
  created() {
    this.refresh()
  },
  methods: {
    decodeTitle,
    async refresh() {
      try {
        this.items = []
        this.loaded = false
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

        const [allItems, recommendItems] = await Promise.all([promise, this.fetchRecommendItems()])
        this.items = this.sortByRecommend(allItems, recommendItems)
      } finally {
        this.loaded = true
      }
    },

    async fetchRecommendItems(): Promise<LiveInfo[]> {
      // 动态portal接口会获取推荐的top30直播。同时这个接口不会忽略悄悄关注的up的直播。
      const portalList = await getJsonWithCredentials(
        'https://api.bilibili.com/x/polymer/web-dynamic/v1/portal',
      )
      const recommendLiveItems = portalList.data.live_users.items.map(item => {
        const { jump_url, room_id, face, title, uname, mid } = item
        return {
          cover: face,
          face,
          uname,
          title,
          roomid: room_id,
          pic: '', // portal接口没有
          online: 0, // portal接口没有
          uid: mid,
          link: jump_url,
        }
      })
      return recommendLiveItems
    },

    sortByRecommend(feedItems: LiveInfo[], recommendItems: LiveInfo[]) {
      // recommendItems里的pic和online为默认值，但是ui也没用到。
      // 所以方便起见，直接拼接没出现在recommendItems里的item
      const recommendRoomIds = recommendItems.map(item => item.roomid)
      const feedConcatItems = feedItems.filter(item => !recommendRoomIds.includes(item.roomid))
      return lodash.concat(recommendItems, feedConcatItems)
    },
  },
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
