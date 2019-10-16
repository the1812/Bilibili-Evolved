<template>
  <div class="feeds-filter">
    <h1>动态过滤</h1>
    <h2>类型</h2>
    <div class="filter-types">
      <filter-type-switch v-for="[name, type] of allTypes" :name="name" :type="type" :key="type.id"></filter-type-switch>
    </div>
    <h2>关键词</h2>
    <div class="filter-patterns">
      <div class="pattern" v-for="p of patterns" :key="p">
        {{p}}
        <icon title="删除" type="mdi" icon="trash-can-outline" @click.native="deletePattern(p)"></icon>
      </div>
    </div>
    <div class="add-pattern">
      <input
        placeholder="支持正则表达式 /^xxx$/"
        type="text"
        v-model="newPattern"
        @keydown.enter="addPattern(newPattern)"
      />
      <icon title="添加" type="mdi" icon="plus" @click.native="addPattern(newPattern)"></icon>
    </div>
  </div>
</template>

<script lang="ts">
import { FeedsCard, FeedsCardType } from '../feeds-apis'
export default {
  components: {
    FilterTypeSwitch: () => import('./filter-type-switch.vue'),
    Icon: () => import('../../style/icon.vue')
  },
  methods: {
    updateCard(card: FeedsCard) {
      if (
        settings.feedsFilterPatterns.some(pattern => {
          if (pattern.startsWith('/') && pattern.endsWith('/')) {
            return new RegExp(pattern.slice(1, pattern.length - 1)).test(
              card.text
            )
          }
          return card.text.includes(pattern)
        })
      ) {
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
    }
  },
  watch: {
    patterns() {
      settings.feedsFilterPatterns = this.patterns
      if (this.feedsCardsManager !== null) {
        this.feedsCardsManager.cards.forEach((card: FeedsCard) =>
          this.updateCard(card)
        )
      }
    }
  },
  data() {
    return {
      allTypes: [] as [string, FeedsCardType][],
      patterns: [...settings.feedsFilterPatterns],
      newPattern: '',
      feedsCardsManager: null
    }
  },
  async mounted() {
    const tabBar = await SpinQuery.select('.feed-card .tab-bar')
    if (!tabBar) {
      console.error('tabBar not found')
      return
    }
    const tab = tabBar.querySelector(
      '.tab:nth-child(2) .tab-text'
    ) as HTMLAnchorElement
    Observer.attributes(tab, () => {
      document.body.classList[
        tab.classList.contains('selected') ? 'add' : 'remove'
      ]('enable-feeds-filter')
    })
    const { feedsCardsManager, feedsCardTypes } = await import('../feeds-apis')
    const success = await feedsCardsManager.startWatching()
    if (!success) {
      console.error('feedsCardsManager.startWatching() failed')
      return
    }
    this.allTypes = Object.entries(feedsCardTypes)
    feedsCardsManager.cards.forEach(card => this.updateCard(card))
    feedsCardsManager.addEventListener('addCard', (e: CustomEvent) => {
      const card = e.detail as FeedsCard
      this.updateCard(card)
    })
    this.feedsCardsManager = feedsCardsManager
  }
}
</script>

<style lang="scss">
body.enable-feeds-filter {
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
        'share': 2048
      )
  {
    &.feeds-filter-block-#{$name} .feed-card .card[data-type='#{$value}'] {
      display: none !important;
    }
  }
  .feed-card .card.pattern-block {
    display: none !important;
  }
}
.feeds-filter {
  background-color: white;
  width: 100%;
  padding: 12px 16px;
  float: left;
  border-radius: 4px;
  margin-top: 8px;
  box-sizing: border-box;
  display: none;
  flex-direction: column;

  body.enable-feeds-filter & {
    display: flex;
  }
  &,
  & * {
    transition: 0.2s ease-out;
  }
  body.dark & {
    color: #eee;
    background-color: #444;
  }
  h1 {
    font-weight: normal;
    font-size: 14px;
    margin: 0;
    margin-bottom: 14px;
  }
  h2 {
    font-weight: bold;
    font-size: 13px;
    margin: 0;
    margin-bottom: 8px;
  }
  .filter-types {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-bottom: 18px;
    .filter-type-switch {
      flex: 0 0 49%;
      &:not(:last-child) {
        margin-bottom: 4px;
      }
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
      background-color: #0001;
      font-size: 12px;
      &:not(:last-child) {
        margin-bottom: 4px;
      }
      .be-icon {
        font-size: 18px;
        cursor: pointer;
      }
    }
  }
  .add-pattern {
    display: flex;
    align-items: center;
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