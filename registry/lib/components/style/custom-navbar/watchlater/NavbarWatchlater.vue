<template>
  <div class="watchlater-list">
    <div class="header">
      <div class="watchlater-list-summary">共 {{ filteredCards.length }} 个</div>
      <div class="search">
        <TextBox v-model="search" linear placeholder="搜索"></TextBox>
      </div>
      <a
        class="operation"
        target="_blank"
        href="https://www.bilibili.com/medialist/play/watchlater"
      >
        <VButton class="round-button" title="播放全部" round>
          <VIcon icon="mdi-play" :size="18"></VIcon>
        </VButton>
      </a>
      <a class="operation" target="_blank" href="https://www.bilibili.com/watchlater/#/list">
        <VButton class="round-button" title="查看更多" round>
          <VIcon icon="mdi-dots-horizontal" :size="18"></VIcon>
        </VButton>
      </a>
    </div>
    <VLoading v-if="loading"></VLoading>
    <VEmpty v-else-if="!loading && cards.length === 0"></VEmpty>
    <transition-group v-else name="cards" tag="div" class="watchlater-list-content">
      <div v-for="(card, index) of filteredCards" :key="card.aid" class="watchlater-card">
        <a class="watchlater-cover-container" target="_blank" :href="card.href">
          <DpiImage
            class="cover"
            :src="card.coverUrl"
            :size="{ width: 130, height: 85 }"
          ></DpiImage>
          <div class="floating remove" title="移除" @click.prevent="remove(card.aid, index)">
            <VIcon icon="mdi-close" :size="16"></VIcon>
          </div>
          <div class="floating duration">{{ card.durationText }}</div>
          <div v-if="card.totalPages > 1" class="floating pages">
            {{ card.currentPage }}P / {{ card.totalPages }}P
          </div>
          <div v-if="card.percent" class="progress" :style="{ width: card.percent * 100 + '%' }" />
        </a>
        <a class="title" target="_blank" :href="card.href" :title="card.title">{{ card.title }}</a>
        <div class="info">
          <a
            class="up"
            target="_blank"
            :href="'https://space.bilibili.com/' + card.upID"
            :title="card.upName"
          >
            <DpiImage class="face" :src="card.upFaceUrl" :size="20"></DpiImage>
            <div class="name">{{ card.upName }}</div>
          </a>
          <div v-if="card.complete" class="viewed">已观看</div>
        </div>
      </div>
    </transition-group>
  </div>
</template>
<script lang="ts">
import { getComponentSettings } from '@/core/settings'
import { formatDuration } from '@/core/utils/formatters'
import {
  watchlaterList,
  getWatchlaterList,
  RawWatchlaterItem,
  toggleWatchlater,
} from '@/components/video/watchlater'
import { VLoading, VEmpty, TextBox, VButton, VIcon, DpiImage } from '@/ui'
import { popperMixin } from '../mixins'

interface WatchlaterCard {
  aid: number
  href: string
  coverUrl: string
  durationText: string
  duration: number
  complete: boolean
  title: string
  upName: string
  upFaceUrl: string
  upID: number
  currentPage?: number
  totalPages: number
  percent: number
}
export default Vue.extend({
  components: {
    VLoading,
    VEmpty,
    TextBox,
    VButton,
    VIcon,
    DpiImage,
  },
  mixins: [popperMixin],
  data() {
    const redirect = getComponentSettings('watchlaterRedirect')
    return {
      watchlaterList,
      loading: true,
      cards: [],
      filteredCards: [],
      search: '',
      redirect: redirect.enabled && redirect.options.navbar,
    }
  },
  watch: {
    search() {
      this.updateFilteredCards()
    },
  },
  async created() {
    try {
      await this.updateList()
    } finally {
      this.loading = false
    }
  },
  methods: {
    toggleWatchlater,
    popupRefresh() {
      this.updateList()
    },
    async updateList() {
      const rawList = await getWatchlaterList(true)
      if (!rawList) {
        this.cards = []
        return
      }
      const getLink = (item: RawWatchlaterItem) => {
        if (this.redirect) {
          return `https://www.bilibili.com/video/${item.bvid}`
        }
        return `https://www.bilibili.com/medialist/play/watchlater/${item.bvid}`
      }
      const cards = rawList.map(item => {
        const currentPage = item.pages?.find(p => p.cid === item.cid)
        const duration = currentPage?.duration ?? item.duration
        const href = (() => {
          if (!currentPage || !this.redirect) {
            return getLink(item)
          }
          const { page } = currentPage
          return page <= 1 ? getLink(item) : `${getLink(item)}?p=${page}`
        })()
        const percent = Math.round((1000 * item.progress) / duration) / 1000

        return {
          aid: item.aid,
          href,
          coverUrl: item.pic.replace('http:', 'https:'),
          durationText: formatDuration(duration),
          duration,
          complete: item.progress < 0 || percent > 0.95, // 进度过95%算看完, -1值表示100%
          title: item.title,
          upName: item.owner.name,
          upFaceUrl: item.owner.face.replace('http:', 'https:'),
          upID: item.owner.mid,
          currentPage: currentPage?.page,
          totalPages: item.videos,
          percent,
        } as WatchlaterCard
      })
      this.cards = cards
      if (this.search) {
        this.updateFilteredCards()
      } else {
        this.filteredCards = cards
      }
    },
    async remove(aid: number, index: number) {
      this.cards.splice(index, 1)
      await this.toggleWatchlater(aid)
    },
    updateFilteredCards: lodash.debounce(function updateFilteredCards() {
      const search = this.search.toLowerCase()
      const cardsList = this.$el.querySelector('.watchlater-list-content') as HTMLElement
      cardsList.scrollTo(0, 0)
      this.filteredCards = (this.cards as WatchlaterCard[]).filter(
        card =>
          card.title.toLowerCase().includes(search) || card.upName.toLowerCase().includes(search),
      )
    }, 100),
  },
})
</script>
<style lang="scss">
@import 'common';
@import '../popup';

.custom-navbar .watchlater-list {
  @include navbar-popup-height();
  width: 380px;
  font-size: 12px;
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  align-items: center;

  @mixin floating-button-background {
    background-color: #000c;
  }
  .round-button {
    @include round-bar(26);
    @include h-center();
    justify-content: center;
    cursor: pointer;
    width: 26px;
  }
  .floating {
    @include round-bar(20);
    @include h-center();
    @include floating-button-background();
    color: white;
    justify-content: center;
    cursor: pointer;
  }
  .header {
    @include h-center();
    justify-content: space-between;
    align-self: stretch;
    margin: 16px 12px;
    .watchlater-list-summary {
      margin-right: 6px;
    }
    .search {
      position: relative;
      flex-grow: 1;
      align-self: stretch;
      margin-right: 8px;
      .be-textbox {
        height: 100%;
      }
    }
    .operations {
      @include h-center();
      .round-button {
        &:not(:last-child) {
          margin-right: 4px;
        }
      }
    }
    .operation:not(:last-child) {
      margin-right: 8px;
    }
    .more-info {
      @include h-center();
      @include round-bar(28);
      padding: 4px 6px 4px 10px;
    }
  }
  .be-empty,
  .be-loading {
    flex: 1;
  }
  &-content {
    flex: 1;
    align-self: stretch;
    scroll-behavior: smooth;
    position: relative;
    @include no-scrollbar();
    padding: 0 12px;
    padding-bottom: 12px;
    .watchlater-card {
      &.cards-enter,
      &.cards-leave-to {
        opacity: 0;
        transform: translateY(-16px) scale(0.9);
      }
      &.cards-leave-active {
        transition: 0.24s cubic-bezier(0.22, 0.61, 0.36, 1);
        position: absolute;
      }
      cursor: pointer;
      flex-shrink: 0;
      border-radius: 8px;
      color: black;
      background-color: #fff;
      box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
      border: 1px solid #8882;
      display: grid;
      // grid-template:
      //   "cover" 120px
      //   "title" auto
      //   "info" auto / 200px;
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
      .watchlater-cover-container {
        grid-area: cover;
        overflow: hidden;
        border-radius: 8px 0 0 8px;
        position: relative;
        $padding: 6px;
        .floating {
          position: absolute;
          opacity: 0;
          font-size: 11px;
        }
        .remove {
          top: $padding;
          left: $padding;
          width: 20px;
        }
        .duration {
          left: $padding;
          bottom: $padding;
          padding: 0 6px;
        }
        .pages {
          top: $padding;
          right: $padding;
          padding: 0 6px;
        }
        .cover {
          object-fit: cover;
        }
        .progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          border-radius: 1px;
          background-color: var(--theme-color);
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
        margin: 0;
        margin-top: 8px;
        padding: 0 10px;
        @include max-line(2);
        &:hover {
          color: var(--theme-color) !important;
        }
      }
      .info {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        grid-area: info;
        margin: 6px 8px;
        .viewed {
          opacity: 0.75;
          font-size: 11px;
          margin: 2px 0;
        }
      }
      .up {
        flex: 0 1 auto;
        padding: 2px 10px 2px 2px;
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
    }
  }
}
</style>
