<template>
  <div class="favorites-list">
    <div class="header">
      <FavoritesFolderSelect v-model="folder"></FavoritesFolderSelect>
      <div class="search">
        <TextBox v-model="search" linear placeholder="搜索"></TextBox>
      </div>
      <a class="operation" :href="playLink" title="播放全部" target="_blank">
        <VButton round class="play-all">
          <VIcon icon="mdi-play" :size="18"></VIcon>
        </VButton>
      </a>
      <a class="operation" :href="moreLink" title="查看更多" target="_blank">
        <VButton round class="more-info">
          <VIcon icon="mdi-dots-horizontal" :size="18"></VIcon>
        </VButton>
      </a>
    </div>
    <div class="content">
      <VLoading v-if="loading && !searching"></VLoading>
      <VEmpty v-else-if="!loading && !canLoadMore && filteredCards.length === 0"></VEmpty>
      <transition-group v-else name="cards" tag="div" class="cards">
        <div v-for="card of filteredCards" :key="card.id" class="favorite-card">
          <a class="favorites-cover-container" target="_blank" :href="getItemPlayLink(card)">
            <DpiImage
              class="cover"
              :src="card.coverUrl"
              :size="{ width: 130, height: 85 }"
            ></DpiImage>
            <div class="floating duration">{{ card.durationText }}</div>
            <div class="floating favorite-time">{{ card.favoriteTime }}</div>
          </a>
          <a class="title" target="_blank" :href="getItemPlayLink(card)" :title="card.title">{{
            card.title
          }}</a>
          <a
            v-if="card.upID"
            class="up"
            target="_blank"
            :href="'https://space.bilibili.com/' + card.upID"
            :title="card.upName"
          >
            <DpiImage placeholder-image class="face" :src="card.upFaceUrl" :size="20"></DpiImage>
            <div class="name">{{ card.upName }}</div>
          </a>
          <div v-else class="description">
            {{ card.description }}
          </div>
        </div>
        <ScrollTrigger
          v-if="canLoadMore"
          key="scroll-trigger"
          @trigger="scrollTrigger()"
        ></ScrollTrigger>
      </transition-group>
    </div>
  </div>
</template>
<script lang="ts">
import { VLoading, VEmpty, VIcon, VButton, TextBox, DpiImage, ScrollTrigger } from '@/ui'
import { formatDate, formatDuration } from '@/core/utils/formatters'
import { getUID } from '@/core/utils'
import { getJsonWithCredentials } from '@/core/ajax'
import { logError } from '@/core/utils/log'
import { VideoCard } from '@/components/feeds/video-card'
import { getComponentSettings } from '@/core/settings'
import { notSelectedFolder } from './favorites-folder'
import FavoritesFolderSelect from './FavoritesFolderSelect.vue'
import { popperMixin } from '../mixins'

/*
新版收藏夹 API
https://api.bilibili.com/x/v3/fav/resource/list?media_id=media_id&pn=1&ps=20&keyword=keyword&order=mtime&type=0&tid=0&platform=web
*/

const navbarOptions = getComponentSettings('customNavbar').options
interface FavoritesItemInfo extends Omit<VideoCard, 'type'> {
  type: number
  favoriteTimestamp: number
  favoriteTime: string
}
const MaxPageSize = 20
const favoriteItemFilter = (item: any): boolean => {
  if (navbarOptions.showDeadVideos) {
    return true
  }
  return item.attr !== 9 && item.attr !== 1 // 过滤掉已失效视频
}
const favoriteItemMapper = (item: any): FavoritesItemInfo => ({
  type: item.type,
  id: item.id,
  aid: item.id,
  bvid: item.bvid,
  coverUrl: item.cover.replace('http:', 'https:'),
  favoriteTimestamp: item.fav_time * 1000,
  favoriteTime: formatDate(new Date(item.fav_time * 1000)),
  title: item.title,
  description: item.intro,
  duration: item.duration,
  durationText:
    item.page > 1
      ? `${formatDuration(item.duration)} / ${item.page}P`
      : formatDuration(item.duration),
  playCount: item.cnt_info.play,
  danmakuCount: item.cnt_info.danmaku,
  upName: item.upper.name,
  upFaceUrl: item.upper.face.replace('http:', 'https:'),
  upID: item.upper.mid,
})
async function searchAllList() {
  if (!this.searching) {
    return
  }
  try {
    this.loading = true
    const jsonCurrent = await getJsonWithCredentials(
      `https://api.bilibili.com/x/v3/fav/resource/list?media_id=${this.folder.id}&pn=${this.searchPage}&ps=${MaxPageSize}&keyword=${this.search}&order=mtime&type=0&tid=0&platform=web`,
    )
    const jsonAll = await getJsonWithCredentials(
      `https://api.bilibili.com/x/v3/fav/resource/list?media_id=${this.folder.id}&pn=${this.searchPage}&ps=${MaxPageSize}&keyword=${this.search}&order=mtime&type=1&tid=0&platform=web`,
    )
    if (jsonCurrent.code !== 0 && jsonAll.code !== 0) {
      return
    }
    const currentItems = lodash.get(jsonCurrent, 'data.medias', []) || []
    const allItems = lodash.get(jsonAll, 'data.medias', []) || []
    this.searchPage++
    const results = lodash.uniqBy(
      this.filteredCards.concat(
        currentItems.filter(favoriteItemFilter).map(favoriteItemMapper),
        allItems.filter(favoriteItemFilter).map(favoriteItemMapper),
      ),
      (card: FavoritesItemInfo) => card.id,
    )
    this.filteredCards = results
    const noNewItems = currentItems.length + allItems.length === 0
    const lessThanPageSize = allItems.length < MaxPageSize
    if (noNewItems || lessThanPageSize) {
      this.hasMoreSearchPage = false
      return
    }
  } catch (error) {
    console.error(error)
  } finally {
    this.loading = false
  }
}
export default Vue.extend({
  components: {
    FavoritesFolderSelect,
    VLoading,
    VEmpty,
    VIcon,
    VButton,
    TextBox,
    DpiImage,
    ScrollTrigger,
  },
  mixins: [popperMixin],
  data() {
    return {
      loading: true,
      cards: [],
      filteredCards: [],
      page: 1,
      hasMorePage: true,
      searchPage: 1,
      hasMoreSearchPage: true,
      search: '',
      folder: notSelectedFolder,
    }
  },
  computed: {
    searching() {
      return this.search !== ''
    },
    moreLink() {
      const { id } = this.folder
      if (id === 0) {
        return `https://space.bilibili.com/${getUID()}/favlist`
      }
      return `https://space.bilibili.com/${getUID()}/favlist?fid=${id}`
    },
    playLink() {
      const { id } = this.folder
      if (id === 0) {
        return undefined
      }
      return `https://www.bilibili.com/medialist/play/ml${id}`
    },
    canLoadMore() {
      if (this.searching) {
        return this.hasMoreSearchPage
      }
      return this.hasMorePage
    },
  },
  watch: {
    folder() {
      this.changeList()
    },
    search(keyword: string) {
      if (keyword === '') {
        this.filteredCards = this.cards
        return
      }
      keyword = keyword.toLowerCase()
      this.hasMoreSearchPage = true
      this.searchPage = 1
      this.filteredCards = (this.cards as FavoritesItemInfo[]).filter(
        it => it.title.toLowerCase().includes(keyword) || it.upName.toLowerCase().includes(keyword),
      )
    },
  },
  methods: {
    async getCards() {
      const url = `https://api.bilibili.com/x/v3/fav/resource/list?media_id=${this.folder.id}&pn=${this.page}&ps=${MaxPageSize}&keyword=&order=mtime&type=0&tid=0&platform=web`
      const json = await getJsonWithCredentials(url)
      if (json.code !== 0) {
        throw new Error(`加载收藏夹内容失败: ${json.message}`)
      }
      if (!json.data.medias) {
        // 超过最后一页后返回空数组
        return []
      }
      return json.data.medias.filter(favoriteItemFilter).map(favoriteItemMapper)
    },
    async changeList() {
      if (this.folder.id === 0) {
        return
      }
      try {
        this.search = ''
        this.cards = []
        this.loading = true
        this.searchPage = 1
        this.hasMoreSearchPage = true
        this.page = 1
        this.hasMorePage = true
        this.cards = await this.getCards()
        this.filteredCards = this.cards
      } catch (error) {
        logError(error)
      } finally {
        this.loading = false
      }
    },
    async loadNextPage() {
      try {
        this.page++
        const cards = await this.getCards()
        this.cards.push(...cards)
        this.hasMorePage = cards.length !== 0 || this.cards.length < this.folder.count
      } catch (error) {
        logError(error)
      }
    },
    debounceSearchAllList: lodash.debounce(searchAllList, 200),
    scrollTrigger() {
      if (this.searching) {
        this.debounceSearchAllList()
      } else {
        this.loadNextPage()
      }
    },
    getItemPlayLink(item: FavoritesItemInfo) {
      switch (item.type) {
        default:
        case 2: {
          return `https://www.bilibili.com/video/${item.bvid}`
        }
        case 12: {
          return `https://www.bilibili.com/audio/au${item.id}`
        }
      }
    },
  },
})
</script>
<style lang="scss">
@import 'common';
@import '../popup';

.custom-navbar .favorites-list {
  width: 380px;
  @include navbar-popup-height();
  font-size: 12px;
  @include v-stretch();
  justify-content: center;
  .be-empty,
  .be-loading {
    align-self: center;
    flex: 1;
  }
  .be-scroll-trigger {
    text-align: center;
  }
  .header {
    @include h-stretch();
    justify-content: space-between;
    margin: 16px 12px;
    .search {
      flex: 1;
      margin-left: 8px;
      .be-textbox {
        height: 100%;
      }
    }
    .list-select {
      flex-shrink: 0;
      height: 26px;
    }
    .dropdown-popup {
      max-height: 300px;
      @include no-scrollbar();
    }
    .operation {
      margin-left: 8px;
    }
    .more-info {
      @include h-center();
      @include round-bar(26);
      padding: 4px;
    }
    .play-all {
      @include h-center();
      @include round-bar(26);
      padding: 4px;
    }
  }
  .content {
    @include v-stretch();
    @include no-scrollbar();
    justify-content: space-between;
    flex-grow: 1;
    .floating {
      @include round-bar(20);
      @include h-center();
      background-color: #000c;
      color: white;
      justify-content: center;
      cursor: pointer;
    }
    .cards {
      flex: 1;
      scroll-behavior: smooth;
      position: relative;
      @include no-scrollbar();
      padding: 0 12px;
      padding-bottom: 12px;
      &-enter,
      &-leave-to {
        opacity: 0;
        transform: translateY(-16px) scale(0.9);
      }
      &-leave-active {
        transition: 0.24s cubic-bezier(0.22, 0.61, 0.36, 1);
        position: absolute;
        &.be-scroll-trigger {
          width: 100%;
          padding-bottom: 12px;
        }
      }
      .favorite-card {
        cursor: pointer;
        flex-shrink: 0;
        border-radius: 8px;
        box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
        border: 1px solid #8882;
        color: black;
        background-color: #fff;
        display: grid;
        grid-template:
          'cover title' 2fr
          'cover info' 1fr / 130px 1fr;
        height: 85px;
        body.dark & {
          background-color: #282828;
          color: #eee;
        }
        &:not(:last-child) {
          margin-bottom: 12px;
        }
        &:hover .cover {
          transform: scale(1.05);
        }
        .favorites-cover-container {
          grid-area: cover;
          overflow: hidden;
          border-radius: 8px 0 0 8px;
          position: relative;
          $padding: 6px;
          .favorite-time {
            top: $padding;
            left: $padding;
            padding: 0 6px;
          }
          .duration {
            left: $padding;
            bottom: $padding;
            padding: 0 6px;
          }
          .floating {
            position: absolute;
            opacity: 0;
            font-size: 11px;
          }
          .cover {
            object-fit: cover;
          }
        }
        &:hover {
          .floating {
            opacity: 1;
          }
        }
        .title {
          grid-area: title;
          font-size: 13px;
          @include semi-bold();
          @include max-line(2);
          -webkit-box-align: start;
          margin: 0;
          margin-top: 8px;
          padding: 0 10px;
          &:hover {
            color: var(--theme-color) !important;
          }
        }
        .up {
          flex: 0 1 auto;
          padding: 2px 10px 2px 2px;
          margin: 0 8px 6px;
          justify-self: start;
          align-self: center;
          max-width: calc(100% - 16px);
          @include h-center();
          @include round-bar(24);
          border: 1px solid #8882;
          &:hover {
            background-color: #8882;
          }
          .face {
            border-radius: 50%;
            margin-right: 6px;
            height: 20px;
            width: 20px;
            object-fit: cover;
            body.dark &.placeholder {
              filter: invert(0.9);
            }
          }
          .name {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            font-size: 11px;
          }
          &:hover .name {
            color: var(--theme-color);
          }
        }
        .description {
          @include single-line();
          margin: 4px 10px;
        }
      }
    }
  }
}
</style>
