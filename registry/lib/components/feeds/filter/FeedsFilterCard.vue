<template>
  <div class="feeds-filter" :class="{ collapse, 'contents-only': contentsOnly }">
    <div v-if="!contentsOnly" class="feeds-filter-header" @click="collapse = !collapse">
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
        @keydown.enter="addNewPattern(newPattern)"
      />
      <VButton type="transparent" @click.native="addNewPattern(newPattern)">
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
import { ref, onMounted, defineAsyncComponent, watch } from 'vue'
import {
  FeedsCard,
  type FeedsCardsManager,
  FeedsCardType,
  feedsCardTypes,
  forEachFeedsCard,
  RepostFeedsCard,
} from '@/components/feeds/api'
import { select } from '@/core/spin-query'
import { attributes, attributesSubtree } from '@/core/observer'
import { VIcon, TextBox, VButton } from '@/ui'
import { BlockableCard, hasBlockedPattern } from './pattern'
import { useFeedsFilterState } from './state'

const FilterTypeSwitch = defineAsyncComponent(() => import('./FilterTypeSwitch.vue'))
const FilterSideCard = defineAsyncComponent(() => import('./FilterSideCard.vue'))

const { contentsOnly = false } = defineProps<{ contentsOnly?: boolean }>()

const {
  patterns,
  validPatterns,
  sideCards: allSideCards,
  blockSideCards,
  savePatternConfig,
  deletePattern,
  addPattern,
  togglePattern,
  toggleBlockSide,
  updateBlockSide,
} = useFeedsFilterState()

const cardsManager = ref<FeedsCardsManager | null>(null)
const allTypes = ref<[string, FeedsCardType][]>([])
const newPattern = ref('')
const collapse = ref(!contentsOnly)

const updateCard = async (card: Readonly<FeedsCard>) => {
  const blockableCard: BlockableCard = {
    text: card.text,
    username: card.username,
  }
  if (card.type === feedsCardTypes.repost) {
    blockableCard.text += `\n${(card as RepostFeedsCard).repostText}`
  }
  const block = validPatterns.value.some(pattern =>
    hasBlockedPattern(pattern.pattern, blockableCard),
  )
  if (block) {
    card.element.classList.add('pattern-block')
  } else {
    card.element.classList.remove('pattern-block')
  }
}

const updateCards = () => {
  if (cardsManager.value === null) {
    return
  }
  cardsManager.value.cards.forEach(card => updateCard(card))
}

const addNewPattern = (pattern: string) => {
  if (addPattern(pattern)) {
    newPattern.value = ''
  }
}

watch(validPatterns, () => {
  updateCards()
})

watch(blockSideCards, () => {
  updateBlockSide()
})

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

  cardsManager.value = await forEachFeedsCard({
    added: card => {
      updateCard(card)
    },
  })
  updateCards()
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
body.disable-feeds-filter,
body.disable-feeds-filter-card {
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

  &.contents-only {
    overflow: visible;
    > * {
      padding-left: 0;
      padding-right: 0;
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
