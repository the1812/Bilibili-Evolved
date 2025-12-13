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
      <div
        v-for="p of patterns"
        :key="p.key"
        class="pattern"
        :class="{ 'pattern-disabled': !p.enabled }"
      >
        <TextBox
          v-model="p.pattern"
          placeholder="支持正则表达式 /^xxx$/"
          type="text"
          @blur="savePatternConfig()"
          @keydown.enter="savePatternConfig()"
        />
        <div class="pattern-actions">
          <VIcon
            :title="p.enabled ? '已启用' : '已禁用'"
            :icon="p.enabled ? 'mdi-check' : 'mdi-cancel'"
            :size="16"
            @click.native="togglePattern(p)"
          />
          <VIcon
            title="删除"
            icon="mdi-trash-can-outline"
            :size="16"
            @click.native="deletePattern(p)"
          />
        </div>
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
      <FilterSideCard
        v-for="[id, type] of Object.entries(allSideCards)"
        :id="parseInt(id)"
        :key="id"
        :name="type.displayName"
        :block-side-cards="blockSideCards"
        @click="toggleBlockSide(parseInt(id))"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, defineAsyncComponent } from 'vue'
import {
  FeedsCard,
  type FeedsCardsManager,
  FeedsCardType,
  feedsCardTypes,
  forEachFeedsCard,
  RepostFeedsCard,
} from '@/components/feeds/api'
import { getComponentSettings } from '@/core/settings'
import { select } from '@/core/spin-query'
import { getRandomId } from '@/core/utils'
import { attributes, attributesSubtree } from '@/core/observer'
import { VIcon, TextBox, VButton } from '@/ui'
import { FeedsFilterOptions, FeedsFilterPatternConfig } from './options'
import { BlockableCard, hasBlockedPattern } from './pattern'

const FilterTypeSwitch = defineAsyncComponent(() => import('./FilterTypeSwitch.vue'))
const FilterSideCard = defineAsyncComponent(() => import('./FilterSideCard.vue'))

const { options } = getComponentSettings<FeedsFilterOptions>('feedsFilter')
const migratePatternConfig = () => {
  if (Array.isArray(options.patterns) && options.patterns.every(p => typeof p === 'string')) {
    options.patterns = options.patterns.map(p => ({
      pattern: p,
      enabled: true,
      key: getRandomId(),
    }))
  }
}
migratePatternConfig()

interface SideCardType {
  className: string
  displayName: string
}

const sideCards: { [id: number]: SideCardType } = {
  0: {
    className: 'profile',
    displayName: '个人资料',
  },
  // 1: {
  //   className: 'following-tags',
  //   displayName: '话题',
  // },
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
  7: {
    className: 'search-trendings',
    displayName: '热搜',
  },
}

if (getComponentSettings('extendFeedsLive').enabled) {
  delete sideCards[3]
}

const cardsManager = ref<FeedsCardsManager | null>(null)
const sideBlock = 'feeds-filter-side-block-'

const allTypes = ref<[string, FeedsCardType][]>([])
const patterns = reactive(lodash.cloneDeep(options.patterns))
const validPatterns = ref<FeedsFilterPatternConfig[]>([])
const newPattern = ref('')
const allSideCards = reactive(sideCards)
const blockSideCards = reactive([...options.sideCards])
const collapse = ref(true)

const updateValidPatterns = () => {
  validPatterns.value = lodash
    .uniqBy(patterns, p => p.pattern)
    .filter(p => p.pattern.trim() !== '' && p.enabled)
}

const updateCard = async (card: Readonly<FeedsCard>) => {
  const blockableCard: BlockableCard = {
    text: card.text,
    username: card.username,
  }
  if (card.type === feedsCardTypes.repost) {
    blockableCard.text += `\n${(card as RepostFeedsCard).repostText}`
  }
  const block = validPatterns.value.some(p => hasBlockedPattern(p.pattern, blockableCard))
  if (block) {
    card.element.classList.add('pattern-block')
  } else {
    card.element.classList.remove('pattern-block')
  }
}

const savePatternConfig = async () => {
  if (cardsManager.value !== null) {
    updateValidPatterns()
    cardsManager.value.cards.forEach(card => updateCard(card))
  }
  setTimeout(() => {
    options.patterns = lodash.cloneDeep(patterns)
  }, 100)
}

const deletePattern = (patternConfig: FeedsFilterPatternConfig) => {
  const index = patterns.findIndex(p => p.key === patternConfig.key)
  if (index !== -1) {
    patterns.splice(index, 1)
  }
  savePatternConfig()
}

const addPattern = (pattern: string) => {
  if (pattern.trim() === '') {
    return
  }
  patterns.push({
    pattern: pattern.trim(),
    enabled: true,
    key: getRandomId(),
  })
  savePatternConfig()
  newPattern.value = ''
}

const togglePattern = (patternConfig: FeedsFilterPatternConfig) => {
  patternConfig.enabled = !patternConfig.enabled
  savePatternConfig()
}

const updateBlockSide = () => {
  Object.entries(sideCards).forEach(([id, type]) => {
    const name = sideBlock + type.className
    if (blockSideCards.includes(parseInt(id))) {
      document.body.classList.add(name)
    } else {
      document.body.classList.remove(name)
    }
  })
}

const toggleBlockSide = (id: number) => {
  const index = blockSideCards.indexOf(id)
  const type = sideCards[id]
  if (index !== -1) {
    blockSideCards.splice(index, 1)
    document.body.classList.remove(sideBlock + type.className)
  } else {
    blockSideCards.push(id)
    document.body.classList.add(sideBlock + type.className)
  }
  options.sideCards = blockSideCards
}

onMounted(async () => {
  updateBlockSide()
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
  allTypes.value = Object.entries(feedsCardTypes)
    .concat(Object.entries(specialTypes))
    .filter(([, type]) => type.id <= 2048 && type.id !== 0)
    .map(([name, type]) => [name, lodash.clone(type)])

  updateValidPatterns()
  cardsManager.value = await forEachFeedsCard({
    added: card => {
      updateCard(card)
    },
  })
  if (cardsManager.value.managerType === 'v1') {
    const tab = tabBar.querySelector('.tab:nth-child(1) .tab-text') as HTMLAnchorElement
    attributes(tab, () => {
      document.body.classList.toggle('by-type', !tab.classList.contains('selected'))
    })
  }
  if (cardsManager.value.managerType === 'v2') {
    const mainContainer = (await select('.bili-dyn-home--member main')) as HTMLElement
    /** 类型过滤选中"全部" */
    const isAllTypesSelected = () => Boolean(dq('.bili-dyn-list-tabs__item:first-child.active'))
    /** 关注列表选中"全部动态" */
    const isAllUpsSelected = () => Boolean(dq('.bili-dyn-up-list__item:first-child.active'))
    attributesSubtree(mainContainer, () => {
      document.body.classList.toggle('by-type', isAllUpsSelected() && !isAllTypesSelected())
    })
  }
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
    color: var(--be-color-text-title, #eee);
    background-color: var(--be-color-panel-bg, #444);
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
      justify-content: space-between;
      position: relative;
      font-size: 12px;
      &:not(:last-child) {
        margin-bottom: 5px;
      }
      .be-icon {
        padding: 4px;
        cursor: pointer;
      }
      &-actions {
        @include absolute-v-center();
        right: 4px;
        @include h-center();
      }
      .be-textbox {
        padding-right: 52px;
      }
      &-disabled .be-textbox {
        opacity: 0.5;
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
