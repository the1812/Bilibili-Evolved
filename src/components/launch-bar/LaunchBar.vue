<template>
  <div class="launch-bar">
    <div class="input-area">
      <div class="launch-bar-form">
        <input
          ref="input"
          v-model="keyword"
          class="input"
          type="text"
          autocomplete="off"
          :placeholder="recommended.word"
          @keydown.enter.stop="handleEnter"
          @keydown.up.stop="handleUp"
          @keydown.down.stop="handleDown"
        />
        <button class="submit" title="执行" tabindex="-1" @click="handleEnter">
          <VIcon icon="right-arrow" :size="20"></VIcon>
        </button>
      </div>
      <!-- <div class="input-active-bar"></div> -->
    </div>
    <div ref="list" class="launch-bar-suggest-list">
      <div v-if="isHistory" class="launch-bar-history-list">
        <div
          v-if="actions.length === 0"
          class="history-empty be-launch-bar-suggest-item disabled"
          tabindex="0"
        >
          暂无搜索历史
        </div>
        <ActionItem
          v-for="(a, index) of actions"
          :key="a.key"
          :action="a"
          @previous-item="previousItem()"
          @next-item="nextItem()"
          @delete-item="onDeleteItem(index)"
          @action="
            index === actions.length - 1 && onClearHistory()
            onAction(a)
          "
        />
      </div>
      <div v-if="!isHistory" class="launch-bar-action-list">
        <VEmpty
          v-if="actions.length === 0 && noActions"
          tabindex="0"
          class="be-launch-bar-suggest-item disabled"
        ></VEmpty>
        <VLoading
          v-if="actions.length === 0 && !noActions"
          tabindex="0"
          class="be-launch-bar-suggest-item disabled"
        ></VLoading>
        <ActionItem
          v-for="(a, index) of actions"
          :key="a.key"
          :action="a"
          @previous-item="previousItem()"
          @next-item="nextItem()"
          @delete-item="onDeleteItem(index)"
          @action="onAction(a)"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Fuse from 'fuse.js'
import { VIcon, VLoading, VEmpty } from '@/ui'
import { registerAndGetData } from '@/plugins/data'
import { select } from '@/core/spin-query'
import { ascendingSort } from '@/core/utils/sort'
import { matchUrlPattern } from '@/core/utils'
import { urlChange } from '@/core/observer'
import ActionItem from './ActionItem.vue'
import {
  LaunchBarActionProviders,
  LaunchBarActionProvider,
  LaunchBarAction,
} from './launch-bar-action'
import { searchProvider, search } from './search-provider'
import { historyProvider } from './history-provider'
import { FocusTarget } from './focus-target'

const [actionProviders] = registerAndGetData(LaunchBarActionProviders, [
  searchProvider,
  historyProvider,
]) as [LaunchBarActionProvider[]]

const sortActions = (actions: LaunchBarAction[]) => {
  return [...actions].sort(ascendingSort(it => it.order ?? Infinity))
}
const generateKeys = (
  provider: LaunchBarActionProvider,
  actions: LaunchBarAction[],
): ({
  key: string
  provider: LaunchBarActionProvider
} & LaunchBarAction)[] =>
  actions.map(a => {
    const key = `${provider.name}.${a.name}`
    return {
      ...a,
      key,
      provider,
    }
  })
async function getOnlineActions() {
  const onlineActions = (
    await Promise.all(
      actionProviders.map(async provider =>
        generateKeys(provider, await provider.getActions(this.keyword)),
      ),
    )
  ).flat()
  if (this.isHistory) {
    return
  }
  const fuse = new Fuse(onlineActions, {
    keys: ['indexer', 'displayName', 'name', 'description', 'key'],
    includeScore: true,
    threshold: 0.1,
  })
  const fuseResult = fuse.search(this.keyword)
  console.log(fuseResult)
  this.actions = sortActions(fuseResult.map(it => it.item).slice(0, 13))
  this.noActions = this.actions.length === 0
}
async function getActions() {
  this.noActions = false
  if (this.isHistory) {
    this.actions = sortActions(
      generateKeys(historyProvider, await historyProvider.getActions(this.keyword)),
    )
    return
  }
  const actions: LaunchBarAction[] = []
  this.actions = actions
  this.getOnlineActions()
}

const [recommended] = registerAndGetData('launchBar.recommended', {
  word: '搜索',
  href: 'https://search.bilibili.com/',
})
export default Vue.extend({
  components: {
    VIcon,
    VLoading,
    VEmpty,
    ActionItem,
  },
  data() {
    const focusTarget = new FocusTarget(0)
    return {
      recommended,
      actions: [],
      keyword: '',
      focusTarget,
      noActions: false,
    }
  },
  computed: {
    isHistory() {
      return this.keyword.length === 0
    },
  },
  watch: {
    keyword() {
      this.getActions()
    },
    actions() {
      this.focusTarget.reset(this.actions.length)
    },
  },
  async mounted() {
    await this.getActions()
    if (matchUrlPattern(/^https?:\/\/search\.bilibili\.com/)) {
      await this.setupSearchPageSync()
    }
    this.focusTarget.addEventListener('index-change', () => {
      this.handleIndexUpdate()
    })
  },
  methods: {
    getOnlineActions: lodash.debounce(getOnlineActions, 200),
    getActions,
    async setupSearchPageSync() {
      const selector = '#search-keyword, .search-input-el'
      const input = (await select(selector)) as HTMLInputElement
      if (!input) {
        return
      }
      urlChange(url => {
        const params = new URLSearchParams(url)
        const keywordFromParam = params.get('keyword')
        if (keywordFromParam !== null) {
          this.keyword = params.get('keyword')
        }
      })
      await this.$nextTick()
    },
    handleSelect() {
      this.$emit('close')
      this.getActions()
    },
    async handleEnter(e: KeyboardEvent) {
      if (e.isComposing) {
        return
      }
      if (this.actions.length > 0 && !this.isHistory) {
        const [first] = this.actions as LaunchBarAction[]
        if (first.explicitSelect !== true) {
          first.action()
          return
        }
      }
      if (this.keyword) {
        search(this.keyword)
        this.handleSelect()
        return
      }
      window.open(this.recommended.href, '_blank')
      this.handleSelect()
    },
    handleUp(e: KeyboardEvent) {
      if (e.isComposing) {
        return
      }
      this.focusTarget.previous()
      e.preventDefault()
    },
    handleDown(e: KeyboardEvent) {
      if (e.isComposing) {
        return
      }
      this.focusTarget.next()
      e.preventDefault()
    },
    async handleIndexUpdate() {
      await this.$nextTick()
      if (!this.focusTarget.hasFocus) {
        this.focusInput()
        return
      }
      this.focusSuggestItem(this.focusTarget.index + 1)
    },
    previousItem() {
      this.focusTarget.previous()
    },
    nextItem() {
      this.focusTarget.next()
    },
    search,
    onDeleteItem(index: number) {
      this.focusTarget.setFocus(index)
      this.focusTarget.previous()
      this.getActions()
    },
    onClearHistory() {
      this.focusInput()
      this.getActions()
    },
    onAction() {
      this.handleSelect()
    },
    focusInput() {
      this.$refs.input.focus()
    },
    focusSuggestItem(nth: number) {
      this.$refs.list.querySelector(`.be-launch-bar-suggest-item:nth-child(${nth})`)?.focus()
    },
  },
})
</script>
<style lang="scss">
@import 'common';
.launch-bar {
  --color: black;
  color: var(--color);
  position: relative;
  @include h-center();
  .input-area {
    display: flex;
    flex-direction: column;
    flex: 1;
    .recommended-target {
      display: none;
    }
    .launch-bar-form {
      flex: 1;
      display: flex;
      .input {
        flex: 1;
        padding: 8px;
        background-color: transparent;
        border: none;
        outline: none !important;
        color: inherit;
        box-sizing: border-box;
        width: 15vw;
        font-size: inherit;
        &::placeholder {
          color: inherit !important;
          opacity: 0.8;
        }
      }
      .submit {
        color: inherit;
        padding: 4px;
        background: transparent;
        border: none;
        outline: none !important;
        cursor: pointer;
      }
    }
    .input-active-bar {
      flex: 0 0 auto;
      align-self: flex-start;
      height: 2px;
      width: 0;
      border-radius: 1px;
      background-color: var(--theme-color);
      transition: 0.3s ease-in-out;
    }
  }
  .launch-bar-suggest-list {
    position: absolute;
    top: 100%;
    left: 50%;
    opacity: 0;
    width: 100%;
    transform: translateX(-50%) translateY(-4px);
    pointer-events: none;
    // transition: 0.2s ease-out;
    border: 1px solid #8882;
    white-space: nowrap;
    border-radius: 8px;
    @include shadow();
    color: black;
    background-color: #fff;
    body.dark & {
      color: #eee;
      background-color: #222;
    }
    .suggest-highlight {
      color: var(--theme-color);
      font-style: normal;
    }
  }
  &:focus-within {
    .input-active-bar {
      width: 100%;
    }
  }
  &:focus-within .launch-bar-suggest-list,
  .launch-bar-suggest-list:focus-within {
    opacity: 1;
    transform: translateX(-50%);
    pointer-events: initial;
  }
}
</style>
