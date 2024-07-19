<template>
  <div class="feeds-filter" :class="{ collapse }">
    <div class="feeds-filter-header" @click="collapse = !collapse">
      <h1>动态过滤</h1>
      <VIcon icon="mdi-chevron-up" />
    </div>
    <h2>类型</h2>
    <div class="filter-types">
      <FilterTypeSwitch v-for="[name, type] of allTypes" :key="type.id" :name="name" :type="type" />
    </div>
    <h2>关键词</h2>
    <div class="filter-patterns">
      <div v-for="p of patterns" :key="p" class="pattern">
        {{ p }}
        <VIcon
          title="删除"
          icon="mdi-trash-can-outline"
          :size="16"
          @click.native="deletePattern(p)"
        />
      </div>
    </div>
    <div class="add-pattern">
      <TextBox
        v-model="newPattern"
        placeholder="支持正则表达式 /^xxx$/"
        type="text"
        @keydown.enter="addPattern(newPattern)"
      />
      <VButton type="transparent" @click.native="addPattern(newPattern)">
        <VIcon title="添加" icon="mdi-plus" :size="18" />
      </VButton>
    </div>
    <h2>板块</h2>
    <div class="filter-side-card">
      <div
        v-for="[id, type] of Object.entries(allSideCards)"
        :key="id"
        class="filter-side-card-switch feeds-filter-switch"
        @click="toggleBlockSide(id)"
      >
        <label :class="{ disabled: sideDisabled(id) }">
          <span class="name" :class="{ disabled: sideDisabled(id) }">{{ type.displayName }}</span>
          <VIcon :size="16" class="disabled" icon="mdi-cancel"></VIcon>
          <VIcon :size="16" icon="mdi-check"></VIcon>
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  FeedsCard,
  FeedsCardType,
  feedsCardTypes,
  forEachFeedsCard,
  RepostFeedsCard,
} from '@/components/feeds/api'
import { getComponentSettings } from '@/core/settings'
import { select } from '@/core/spin-query'
import { attributes, attributesSubtree } from '@/core/observer'
import { VIcon, TextBox, VButton } from '@/ui'
import { FeedsFilterOptions } from './options'
import { hasBlockedPattern } from './pattern'

const { options } = getComponentSettings<FeedsFilterOptions>('feedsFilter')
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
  6: {
    className: 'compose',
    displayName: '发布动态',
  },
}
if (getComponentSettings('extendFeedsLive').enabled) {
  delete sideCards[3]
}
let cardsManager: typeof import('@/components/feeds/api').feedsCardsManager
const sideBlock = 'feeds-filter-side-block-'

export default Vue.extend({
  components: {
    FilterTypeSwitch: () => import('./FilterTypeSwitch.vue'),
    VIcon,
    TextBox,
    VButton,
  },
  data() {
    return {
      allTypes: [] as [string, FeedsCardType][],
      patterns: [...options.patterns],
      newPattern: '',
      allSideCards: sideCards,
      blockSideCards: [...options.sideCards],
      collapse: true,
    }
  },
  watch: {
    patterns() {
      options.patterns = this.patterns
      if (cardsManager) {
        cardsManager.cards.forEach(card => this.updateCard(lodash.clone(card)))
      }
    },
  },
  async mounted() {
    this.updateBlockSide()
    const tabBar = await select('.feed-card .tab-bar, .bili-dyn-list-tabs__list')
    if (!tabBar) {
      console.error('tabBar not found')
      return
    }
    document.body.classList.add('enable-feeds-filter')
    const specialTypes = {
      'self-repost': {
        id: -1,
        name: '自转发',
      } as FeedsCardType,
    }
    this.allTypes = Object.entries(feedsCardTypes)
      .concat(Object.entries(specialTypes))
      .filter(([, type]) => type.id <= 2048)
      .map(([name, type]) => [name, lodash.clone(type)])
    cardsManager = await forEachFeedsCard({
      added: card => {
        this.updateCard(lodash.clone(card))
      },
    })
    if (cardsManager.managerType === 'v1') {
      const tab = tabBar.querySelector('.tab:nth-child(1) .tab-text') as HTMLAnchorElement
      attributes(tab, () => {
        document.body.classList.toggle('by-type', !tab.classList.contains('selected'))
      })
    }
    if (cardsManager.managerType === 'v2') {
      const mainContainer = (await select('.bili-dyn-home--member main')) as HTMLElement
      /** 类型过滤选中"全部" */
      const isAllTypesSelected = () => Boolean(dq('.bili-dyn-list-tabs__item:first-child.active'))
      /** 关注列表选中"全部动态" */
      const isAllUpsSelected = () => Boolean(dq('.bili-dyn-up-list__item:first-child.active'))
      attributesSubtree(mainContainer, () => {
        document.body.classList.toggle('by-type', isAllUpsSelected() && !isAllTypesSelected())
      })
    }
  },
  methods: {
    updateCard(card: FeedsCard) {
      const blockableCard = {
        ...card,
      }
      if (card.type === feedsCardTypes.repost) {
        blockableCard.text += `\n${(card as RepostFeedsCard).repostText}`
      }
      const block = options.patterns.some(p => hasBlockedPattern(p, blockableCard))
      if (block) {
        card.element.classList.add('pattern-block')
      } else {
        card.element.classList.remove('pattern-block')
      }
    },
    deletePattern(pattern: string) {
      const index = options.patterns.indexOf(pattern)
      if (index !== -1) {
        this.patterns.splice(index, 1)
      }
    },
    addPattern(pattern: string) {
      if (pattern && !this.patterns.includes(pattern)) {
        this.patterns.push(pattern)
      }
      this.newPattern = ''
    },
    updateBlockSide() {
      Object.entries(sideCards).forEach(([id, type]) => {
        const name = sideBlock + type.className
        document.body.classList[this.blockSideCards.includes(id) ? 'add' : 'remove'](name)
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
      options.sideCards = this.blockSideCards
    },
    sideDisabled(id: number) {
      return this.blockSideCards.includes(id)
    },
  },
})
</script>

<style lang="scss">
@import 'common';
@import './blocker';

body.enable-feeds-filter:not(.disable-feeds-filter) {
  @include type-block();
  @include side-block();
  @include pattern-block();
  @include plugin-block();
}
body.disable-feeds-filter {
  .feeds-filter-section {
    display: none;
  }
}
.feeds-filter {
  background-color: white;
  font-size: 12px;
  width: 100%;
  border-radius: 4px;
  box-sizing: border-box;
  display: none;
  flex-direction: column;
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
  & > * {
    padding-left: 16px;
    padding-right: 16px;
    &:first-child {
      padding-top: 12px;
    }
    &:last-child {
      padding-bottom: 12px;
    }
  }
  body.dark & {
    color: #eee;
    background-color: #444;
  }
  .feeds-filter-header {
    cursor: pointer;
    padding-bottom: 14px;
    position: sticky;
    top: 0;
    background-color: inherit;
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
      padding-bottom: 12px;
      .be-icon {
        transform: rotate(180deg);
      }
    }
    > :not(.feeds-filter-header) {
      display: none;
    }
  }
  h2 {
    @include semi-bold();
    font-size: 13px;
    margin: 0;
    margin-bottom: 8px;
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
      margin-bottom: 4px;
    }
    .pattern {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 6px;
      border-radius: 4px;
      font-size: 12px;
      border: 1px solid #8884;
      &:not(:last-child) {
        margin-bottom: 4px;
      }
      .be-icon {
        cursor: pointer;
      }
    }
  }
  .add-pattern {
    display: flex;
    align-items: center;
    margin-bottom: 18px;
    input {
      font-size: 12px;
    }
    .be-button {
      margin-left: 6px;
      padding: 4px 6px;
    }
  }
}
</style>
