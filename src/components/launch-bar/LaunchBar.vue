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
            () => {
              index === actions.length - 1 && onClearHistory()
              onAction()
            }
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
          @action="onAction"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Fuse from 'fuse.js'
import { defineComponent, ref, reactive, type Ref } from 'vue'

import { select } from '@/core/spin-query'
import { matchUrlPattern } from '@/core/utils'
import { registerAndGetData } from '@/plugins/data'
import { VEmpty, VIcon, VLoading } from '@/ui'

import ActionItem from './ActionItem.vue'
import { historyProvider } from './history-provider'
import type { LaunchBarAction, LaunchBarActionProvider } from './launch-bar-action'
import { LaunchBarActionProviders } from './launch-bar-action'
import { search, searchProvider } from './search-provider'
import { ascendingSort } from '@/core/utils/sort'

const [actionProviders] = registerAndGetData(LaunchBarActionProviders, [
  searchProvider,
  historyProvider,
]) as [LaunchBarActionProvider[]]

interface LaunchBarActionData extends LaunchBarAction {
  key: string
  provider: LaunchBarActionProvider
}

const sortActions = (actions: LaunchBarActionData[]): LaunchBarActionData[] => {
  return [...actions].sort(ascendingSort(it => it.order ?? Infinity))
}
const generateKeys = (
  provider: LaunchBarActionProvider,
  actions: LaunchBarAction[],
): LaunchBarActionData[] =>
  actions.map(a => {
    const key = `${provider.name}.${a.name}`
    return {
      ...a,
      key,
      provider,
    }
  })
async function getOnlineActions(this: InstanceType<typeof ThisComponent>) {
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
async function getActions(this: InstanceType<typeof ThisComponent>) {
  this.noActions = false
  if (this.isHistory) {
    this.actions = sortActions(
      generateKeys(historyProvider, await historyProvider.getActions(this.keyword)),
    )
    return
  }
  this.actions = []
  this.getOnlineActions().then()
}

const [recommended] = registerAndGetData(
  'launchBar.recommended',
  reactive({
    word: '搜索',
    href: 'https://search.bilibili.com/',
  }),
)
const ThisComponent = defineComponent({
  components: {
    VIcon,
    VLoading,
    VEmpty,
    ActionItem,
  },
  emits: ['close'],
  setup: () => ({
    input: ref(null) as Ref<HTMLInputElement | null>,
    list: ref(null) as Ref<HTMLDivElement | null>,
  }),
  data() {
    return {
      recommended,
      actions: [] as ({
        key: string
        provider: LaunchBarActionProvider
      } & LaunchBarAction)[],
      keyword: '',
      noActions: false,
    }
  },
  computed: {
    isHistory(): boolean {
      return this.keyword.length === 0
    },
  },
  watch: {
    keyword() {
      this.getActions()
    },
  },
  async mounted() {
    this.getActions().then()
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
    getOnlineActions: lodash.debounce(getOnlineActions, 200) as unknown as () => Promise<void>,
    getActions,
    handleSelect() {
      this.$emit('close')
      this.getActions()
    },
    async handleEnter(e: KeyboardEvent | MouseEvent) {
      if ('isComposing' in e && e.isComposing) {
        return
      }
      if (this.actions.length > 0 && !this.isHistory) {
        const [first] = this.actions
        if (first.explicitSelect === false) {
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
      ;(this.list.querySelector('.suggest-item:last-child') as HTMLElement).focus()
      e.preventDefault()
    },
    handleDown(e: KeyboardEvent) {
      if (e.isComposing) {
        return
      }
      ;(this.list.querySelector('.suggest-item') as HTMLElement).focus()
      e.preventDefault()
    },
    previousItem(e: KeyboardEvent | MouseEvent, index: number) {
      if (index === 0) {
        this.focus()
      } else {
        ;((e.currentTarget as HTMLElement).previousElementSibling as HTMLElement).focus()
      }
    },
    nextItem(e: KeyboardEvent, index: number) {
      const lastItemIndex = this.actions.length - 1
      if (index !== lastItemIndex) {
        ;((e.currentTarget as HTMLElement).nextElementSibling as HTMLElement).focus()
      } else {
        this.focus()
      }
    },
    search,
    onDeleteItem(e: KeyboardEvent | MouseEvent, index: number) {
      this.previousItem(e, index)
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
      this.input.focus()
    },
  },
})
export default ThisComponent
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
