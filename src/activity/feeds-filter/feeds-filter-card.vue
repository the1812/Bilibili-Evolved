<template>
  <div class="feeds-filter">
    <h1>动态过滤</h1>
    <h2>类型</h2>
    <div class="filter-types">
      <filter-type-switch v-for="[name, type] of allTypes" :name="name" :type="type" :key="type.id"></filter-type-switch>
    </div>
  </div>
</template>

<script lang="ts">
import { FeedsCard, FeedsCardType } from '../feeds-apis'
export default {
  components: {
    FilterTypeSwitch: () => import('./filter-type-switch.vue')
  },
  methods: {
    updateCard(card: FeedsCard) {
      if (
        settings.feedsFilterPatterns.some(pattern => {
          if (pattern instanceof RegExp) {
            return pattern.test(card.text)
          }
          return card.text.includes(pattern)
        })
      ) {
        card.element.style.display = 'none'
      } else {
        card.element.style.display = 'block'
      }
    }
  },
  data() {
    return {
      allTypes: [] as [string, FeedsCardType][]
    }
  },
  async mounted() {
    const { feedsCardsManager, feedsCardTypes } = await import('../feeds-apis')
    const success = await feedsCardsManager.startWatching()
    if (!success) {
      console.error('feedsCardsManager.startWatching() failed!')
    }
    this.allTypes = Object.entries(feedsCardTypes)
    feedsCardsManager.cards.forEach(card => this.updateCard(card))
    feedsCardsManager.addEventListener('addCard', (e: CustomEvent) => {
      const card = e.detail as FeedsCard
      this.updateCard(card)
    })
  }
}
</script>

<style lang="scss">
body {
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
}
.feeds-filter {
  background-color: white;
  width: 100%;
  padding: 12px 16px;
  float: left;
  border-radius: 4px;
  margin-top: 8px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  &, & * {
    transition: .2s ease-out;
  }
  body.dark & {
    color: #eee;
    background-color: #444;
  }
  h1 {
    font-weight: normal;
    font-size: 14px;
    margin: 0 {
      bottom: 14px;
    }
  }
  h2 {
    font-weight: bold;
    font-size: 12px;
    margin: 0 {
      bottom: 12px;
    }
  }
  .filter-types {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    .filter-type-switch {
      flex: 0 0 49%;
      &:not(:last-child) {
        margin-bottom: 4px;
      }
    }
  }
}
</style>