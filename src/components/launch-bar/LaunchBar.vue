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
        <div v-if="actions.length === 0" class="history-empty suggest-item disabled" tabindex="0">
          暂无搜索历史
        </div>
        <ActionItem
          v-for="(a, index) of actions"
          :key="a.key"
          :action="a"
          @previous-item="previousItem($event, index)"
          @next-item="nextItem($event, index)"
          @delete-item="onDeleteItem($event, index)"
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
          class="suggest-item disabled"
        ></VEmpty>
        <VLoading
          v-if="actions.length === 0 && !noActions"
          tabindex="0"
          class="suggest-item disabled"
        ></VLoading>
        <ActionItem
          v-for="(a, index) of actions"
          :key="a.key"
          :action="a"
          @previous-item="previousItem($event, index)"
          @next-item="nextItem($event, index)"
          @delete-item="onDeleteItem($event, index)"
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
import { matchUrlPattern } from '@/core/utils'
import ActionItem from './ActionItem.vue'
import {
  LaunchBarActionProviders,
  LaunchBarActionProvider,
  LaunchBarAction,
} from './launch-bar-action'
import { searchProvider, search } from './search-provider'
import { historyProvider } from './history-provider'
import { ascendingSort } from '@/core/utils/sort'

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
  })
  const fuseResult = fuse.search(this.keyword)
  console.log(fuseResult)
  this.actions = sortActions(fuseResult.map(it => it.item).slice(0, 12))
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
    return {
      recommended,
      actions: [],
      keyword: '',
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
  },
  async mounted() {
    this.getActions()
    if (!matchUrlPattern(/^https?:\/\/search\.bilibili\.com/)) {
      return
    }
    select('#search-keyword').then((input: HTMLInputElement) => {
      if (!input) {
        return
      }
      this.keyword = input.value
      document.addEventListener('change', e => {
        if (!(e.target instanceof HTMLInputElement)) {
          return
        }
        if (e.target.id === 'search-keyword') {
          this.keyword = e.target.value
        }
      })
    })
  },
  methods: {
    getOnlineActions: lodash.debounce(getOnlineActions, 200),
    getActions,
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
      this.$refs.list.querySelector('.suggest-item:last-child').focus()
      e.preventDefault()
    },
    handleDown(e: KeyboardEvent) {
      if (e.isComposing) {
        return
      }
      this.$refs.list.querySelector('.suggest-item').focus()
      e.preventDefault()
    },
    previousItem(element: HTMLElement, index: number) {
      if (index === 0) {
        this.focus()
      } else {
        ;(element.previousElementSibling as HTMLElement).focus()
      }
    },
    nextItem(element: HTMLElement, index: number) {
      const lastItemIndex = this.actions.length - 1
      if (index !== lastItemIndex) {
        ;(element.nextElementSibling as HTMLElement).focus()
      } else {
        this.focus()
      }
    },
    search,
    onDeleteItem(element: HTMLElement, index: number) {
      this.previousItem(element, index)
      this.getActions()
    },
    onClearHistory() {
      this.focus()
      this.getActions()
    },
    onAction() {
      // this.focus()
      this.handleSelect()
    },
    focus() {
      this.$refs.input.focus()
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
