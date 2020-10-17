<template>
  <div class="feeds-filter" :class="{collapse}">
    <div class="feeds-filter-header" @click="collapse = !collapse">
      <h1>动态过滤</h1>
      <icon type="mdi" icon="chevron-up"></icon>
    </div>
    <h2>类型</h2>
    <div class="filter-types">
      <filter-type-switch
        v-for="[name, type] of allTypes"
        :name="name"
        :type="type"
        :key="type.id"
      ></filter-type-switch>
    </div>
    <h2>关键词</h2>
    <div class="filter-patterns">
      <div class="pattern" v-for="p of patterns" :key="p">
        {{p}}
        <icon
          title="删除"
          type="mdi"
          icon="trash-can-outline"
          @click.native="deletePattern(p)"
        ></icon>
      </div>
    </div>
    <div class="add-pattern">
      <input
        placeholder="支持正则表达式 /^xxx$/"
        type="text"
        v-model="newPattern"
        @keydown.enter="addPattern(newPattern)"
      />
      <icon
        title="添加"
        type="mdi"
        icon="plus"
        @click.native="addPattern(newPattern)"
      ></icon>
    </div>
    <h2>侧边栏</h2>
    <div class="filter-side-card">
      <div
        class="filter-side-card-switch feeds-filter-swtich"
        v-for="[id, type] of Object.entries(allSideCards)"
        :key="id"
        @click="toggleBlockSide(id)"
      >
        <label :class="{disabled: sideDisabled(id)}">
          <span
            class="name"
            :class="{disabled: sideDisabled(id)}"
          >{{type.displayName}}</span>
          <icon class="disabled" type="mdi" icon="cancel"></icon>
          <icon type="mdi" icon="check"></icon>
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { FeedsCard, FeedsCardType, feedsCardsManager } from '../feeds-apis'
interface SideCardType {
  className: string
  displayName: string
}
const sideCards: { [id: number]: SideCardType } = {
  0: {
    className: 'profile',
    displayName: '个人资料',
  },
  1: {
    className: 'following-tags',
    displayName: '话题',
  },
  2: {
    className: 'notice',
    displayName: '公告栏',
  },
  3: {
    className: 'live',
    displayName: '正在直播',
  },
  // 4: {
  //   className: 'trending-tags',
  //   displayName: '热门话题'
  // }
  5: {
    className: 'most-viewed',
    displayName: '关注栏',
  },
}
let cardsManager: typeof feedsCardsManager
const sideBlock = 'feeds-filter-side-block-'
export default {
  components: {
    FilterTypeSwitch: () => import('./filter-type-switch.vue'),
    Icon: () => import('../../style/icon.vue'),
  },
  data() {
    return {
      allTypes: [] as [string, FeedsCardType][],
      patterns: [...settings.feedsFilterPatterns],
      newPattern: '',
      allSideCards: sideCards,
      blockSideCards: [...settings.feedsFilterSideCards],
      collapse: true,
    }
  },
  methods: {
    updateCard(card: FeedsCard) {
      const testPattern = (pattern: Pattern, text: string) => {
        if (pattern.startsWith('/') && pattern.endsWith('/')) {
          return new RegExp(pattern.slice(1, pattern.length - 1)).test(text)
        }
        return text.includes(pattern)
      }
      const block: boolean = (() => {
        return settings.feedsFilterPatterns.some(pattern => {
          const upNameMatch = pattern.match(/(.+) up:([^ ]+)/)
          if (upNameMatch) {
            return (
              testPattern(upNameMatch[1], card.text) &&
              testPattern(upNameMatch[2], card.username)
            )
          }
          return testPattern(pattern, card.text)
        })
      })()
      if (block) {
        card.element.classList.add('pattern-block')
      } else {
        card.element.classList.remove('pattern-block')
      }
    },
    deletePattern(pattern: Pattern) {
      const index = settings.feedsFilterPatterns.indexOf(pattern)
      if (index !== -1) {
        this.patterns.splice(index, 1)
      }
    },
    addPattern(pattern: Pattern) {
      if (pattern && !this.patterns.includes(pattern)) {
        this.patterns.push(pattern)
      }
      this.newPattern = ''
    },
    updateBlockSide() {
      Object.entries(sideCards).forEach(([id, type]) => {
        const name = sideBlock + type.className
        document.body.classList[
          this.blockSideCards.includes(id) ? 'add' : 'remove'
        ](name)
      })
    },
    toggleBlockSide(id: number) {
      const index = this.blockSideCards.indexOf(id)
      const type = sideCards[id]
      if (index !== -1) {
        this.blockSideCards.splice(index, 1)
        document.body.classList.remove(sideBlock + type.className)
      } else {
        this.blockSideCards.push(id)
        document.body.classList.add(sideBlock + type.className)
      }
      settings.feedsFilterSideCards = this.blockSideCards
    },
    sideDisabled(id: number) {
      return this.blockSideCards.includes(id)
    },
  },
  watch: {
    patterns() {
      settings.feedsFilterPatterns = this.patterns
      if (cardsManager) {
        cardsManager.cards.forEach(card => this.updateCard(_.clone(card)))
      }
    },
  },
  async mounted() {
    this.updateBlockSide()
    const tabBar = await SpinQuery.select('.feed-card .tab-bar')
    if (!tabBar) {
      console.error('tabBar not found')
      return
    }
    const tab = tabBar.querySelector(
      '.tab:nth-child(1) .tab-text',
    ) as HTMLAnchorElement
    Observer.attributes(tab, () => {
      document.body.classList.toggle(
        // 'enable-feeds-filter',
        'by-type',
        !tab.classList.contains('selected'),
      )
    })
    document.body.classList.add('enable-feeds-filter')
    const { feedsCardsManager, feedsCardTypes } = await import('../feeds-apis')
    const success = await feedsCardsManager.startWatching()
    if (!success) {
      console.error('feedsCardsManager.startWatching() failed')
      return
    }
    const specialTypes = {
      'self-repost': {
        id: -1,
        name: '自转发',
      } as FeedsCardType,
    }
    this.allTypes = Object.entries(feedsCardTypes)
      .concat(Object.entries(specialTypes))
      .filter(([name, type]) => type.id <= 2048)
      .map(([name, type]) => {
        return [name, _.clone(type)]
      })
    feedsCardsManager.cards.forEach(card => this.updateCard(_.clone(card)))
    feedsCardsManager.addEventListener('addCard', e => {
      const card = e.detail
      this.updateCard(card)
    })
    cardsManager = feedsCardsManager
  },
}
</script>

<style lang="scss">
@import 'src/style/common';
body.enable-feeds-filter:not(.disable-feeds-filter) {
  @each $name,
    $value
      in (
        'repost': 1,
        'textWithImages': 2,
        'text': 4,
        'video': 8,
        'miniVideo': 16,
        'column': 64,
        'audio': 256,
        'bangumi': 512,
        'liveRecord': 2047,
        'share': 2048
      )
  {
    &:not(.by-type).feeds-filter-block-#{$name}
      .feed-card
      .card[data-type='#{$value}'] {
      display: none !important;
    }
  }
  @each $name in ('self-repost') {
    &:not(.by-type).feeds-filter-block-#{$name}
      .feed-card
      .card[data-#{$name}] {
      display: none !important;
    }
  }
  $side-block: 'feeds-filter-side-block';
  .left-panel,
  .right-panel {
    .scroll-content > * {
      margin: 0 !important;
      margin-bottom: 8px !important;
    }
  }
  .left-panel {
    > :not(:last-child) {
      margin: 0 !important;
      margin-bottom: 8px !important;
    }
  }
  .left-panel .user-panel.f-left {
    float: none !important;
  }
  &.#{$side-block}-profile {
    .left-panel .user-wrapper {
      display: none !important;
    }
  }
  &.#{$side-block}-following-tags {
    .left-panel .tag-panel,
    .right-panel .new-topic-panel {
      display: none !important;
    }
  }
  &.#{$side-block}-notice {
    .right-panel .notice-panel {
      display: none !important;
    }
  }
  &.#{$side-block}-live {
    .left-panel .live-panel {
      display: none !important;
    }
  }
  &.#{$side-block}-trending-tags {
    .right-panel .tag-panel {
      display: none !important;
    }
  }
  &.#{$side-block}-most-viewed {
    .card-list .most-viewed-panel {
      display: none !important;
    }
  }
  .feed-card .card.pattern-block {
    display: none !important;
  }
}
.adaptive-scroll {
  > div:first-child:empty {
    display: none !important;
  }
  .scroll-content {
    position: static !important;
    top: unset !important;
    bottom: unset !important;
  }
}
.feeds-filter {
  background-color: white;
  width: 100%;
  padding: 12px 16px;
  // float: left;
  border-radius: 4px;
  box-sizing: border-box;
  display: none;
  flex-direction: column;
  overflow: auto;
  max-height: 80vh;
  @include no-scrollbar();

  body.enable-feeds-filter:not(.disable-feeds-filter) & {
    display: flex;
  }
  &,
  & * {
    transition: 0.2s ease-out;
    transition-property: border-color, color, background-color;
  }
  body.dark & {
    color: #eee;
    background-color: #444;
  }
  .feeds-filter-header {
    cursor: pointer;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    h1 {
      font-weight: normal;
      font-size: 14px;
      margin: 0;
    }
  }
  &.collapse {
    .feeds-filter-header {
      margin-bottom: 0;
      .be-icon {
        transform: rotate(180deg);
      }
    }
    > :not(.feeds-filter-header) {
      display: none;
    }
  }
  h2 {
    font-weight: bold;
    font-size: 13px;
    margin: 0;
    margin-bottom: 8px;
  }
  .feeds-filter-swtich {
    &:not(:last-child) {
      margin-bottom: 4px;
    }
    label {
      cursor: pointer;
      margin: 0;
      padding: 4px 8px;
      border-radius: 4px;
      background-color: transparent;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid #8884;

      .name {
        font-size: 12px;
      }
      .disabled {
        color: var(--theme-color) !important;
      }
      &:hover {
        background-color: #8882;
      }
      input {
        display: none;
      }
      .be-icon {
        font-size: 16px;
        &.disabled {
          display: none;
        }
      }
      &.disabled {
        .be-icon {
          display: none;
          &.disabled {
            display: block;
          }
        }
      }
    }
  }
  .filter-type-switch {
    flex: 0 0 49%;
  }
  .filter-side-card-switch {
    flex: 0 0 100%;
  }
  .filter-types {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-bottom: 18px;
  }
  body.by-type & {
    h2:nth-of-type(1),
    .filter-types {
      display: none;
    }
  }
  .filter-patterns {
    &:not(:empty) {
      margin-bottom: 8px;
    }
    .pattern {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 8px;
      border-radius: 4px;
      background-color: transparent;
      font-size: 12px;
      border: 1px solid #8884;
      &:not(:last-child) {
        margin-bottom: 4px;
      }
      .be-icon {
        font-size: 16px;
        cursor: pointer;
      }
    }
  }
  .add-pattern {
    display: flex;
    align-items: center;
    margin-bottom: 18px;
    input {
      color: inherit;
      background-color: transparent;
      font-size: 12px;
      border: 1px solid #8884;
      border-radius: 4px;
      outline: none !important;
      padding: 4px;
      flex: 1 0 0;
      width: 0;
      &:focus {
        border-color: var(--theme-color);
      }
    }
    .be-icon {
      font-size: 18px;
      cursor: pointer;
      margin-left: 8px;
    }
  }
}
</style>