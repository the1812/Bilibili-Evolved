<template>
  <div class="launch-bar">
    <div class="input-area">
      <div class="launch-bar-form">
        <input
          ref="input"
          class="input"
          type="text"
          autocomplete="off"
          :placeholder="recommended.word"
          :value="keyword"
          @input="handleSearch($event)"
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
    <div class="launch-bar-suggest-list">
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
          :key="a.name"
          :action="a"
          :focused="index === itemIndex"
          @delete-item="onDeleteItem()"
          @action="
            index === actions.length - 1 && onClearHistory()
            onAction()
          "
        />
      </div>
      <div v-if="!isHistory" class="launch-bar-action-list">
        <VEmpty
          v-if="actions.length === 0 && noOnlineActions"
          tabindex="0"
          class="be-launch-bar-suggest-item disabled"
        ></VEmpty>
        <VLoading
          v-if="actions.length === 0 && !noOnlineActions"
          tabindex="0"
          class="be-launch-bar-suggest-item disabled"
        ></VLoading>
        <ActionItem
          v-for="(a, index) of actions"
          :key="a.name"
          :action="a"
          :focused="index === itemIndex"
          @delete-item="onDeleteItem()"
          @action="onAction()"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
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

const emit = defineEmits<{
  (event: 'close'): void
}>()

const input = ref<HTMLInputElement>()
const itemIndex = ref(-1)

const [actionProviders] = registerAndGetData(LaunchBarActionProviders, [
  searchProvider,
  historyProvider,
]) as [LaunchBarActionProvider[]]

const [recommended] = registerAndGetData('launchBar.recommended', {
  word: '搜索',
  href: 'https://search.bilibili.com/',
})

const actions = ref<LaunchBarAction[]>([])
const lastKeyword = ref('')
const keyword = ref('')
const noOnlineActions = ref(false)

const setItemIndex = (index: number) => {
  const newIndex = lodash.clamp(index, -1, actions.value.length - 1)
  if (itemIndex.value !== newIndex) {
    itemIndex.value = newIndex
    if (newIndex > -1 && actions.value[newIndex].suggestName) {
      keyword.value = actions.value[newIndex].suggestName
      if (
        lastKeyword.value !== '' &&
        keyword.value.toLowerCase().startsWith(lastKeyword.value.toLowerCase())
      ) {
        nextTick(() => {
          input.value?.setSelectionRange(lastKeyword.value.length, keyword.value.length)
        })
      }
    } else {
      keyword.value = lastKeyword.value
    }
  }
}
const resetFocus = () => setItemIndex(-1)
const nextItem = () => setItemIndex(itemIndex.value + 1)
const previousItem = () => setItemIndex(itemIndex.value - 1)

const hasFocus = computed(() => itemIndex.value > -1)
const focusedItem = computed(() => actions.value[itemIndex.value])
const isHistory = computed(() => keyword.value.length === 0)

const sortActions = (actionsList: LaunchBarAction[]) => {
  return [...actionsList].sort(ascendingSort(it => it.order ?? Infinity))
}

const generateKeys = (
  provider: LaunchBarActionProvider,
  actionsList: LaunchBarAction[],
): ({
  key: string
  provider: LaunchBarActionProvider
} & LaunchBarAction)[] =>
  actionsList.map(a => {
    const key = `${provider.name}.${a.name}`
    return {
      ...a,
      key,
      provider,
    }
  })

const getOnlineActionsInternal = async () => {
  const onlineActions = (
    await Promise.all(
      actionProviders.map(async provider =>
        generateKeys(provider, await provider.getActions(keyword.value)),
      ),
    )
  ).flat()
  if (isHistory.value) {
    return
  }
  const fuse = new Fuse(onlineActions, {
    keys: ['indexer', 'displayName', 'name', 'description', 'key'],
    includeScore: true,
    threshold: 0.1,
  })
  const fuseResult = fuse.search(keyword.value)
  console.log(fuseResult)
  actions.value = sortActions(fuseResult.map(it => it.item).slice(0, 13))
  noOnlineActions.value = actions.value.length === 0
}

const getOnlineActions = lodash.debounce(getOnlineActionsInternal, 200)

const getActions = async () => {
  noOnlineActions.value = false
  if (isHistory.value) {
    actions.value = sortActions(
      generateKeys(historyProvider, await historyProvider.getActions(keyword.value)),
    )
    return
  }
  const actionsArray: LaunchBarAction[] = []
  actions.value = actionsArray
  getOnlineActions()
}

const setupSearchPageSync = async () => {
  const selector = '#search-keyword, .search-input-el'
  const inputElement = (await select(selector)) as HTMLInputElement
  if (!inputElement) {
    return
  }
  urlChange(url => {
    const params = new URLSearchParams(url)
    const keywordFromParam = params.get('keyword')
    if (keywordFromParam !== null) {
      keyword.value = params.get('keyword') || ''
    }
  })
  await nextTick()
}

const handleSelect = () => {
  emit('close')
  // getActions()
}

const handleEnter = async (e?: KeyboardEvent | MouseEvent) => {
  if ((e as KeyboardEvent)?.isComposing) {
    return
  }
  if (hasFocus.value) {
    await focusedItem.value?.action()
    handleSelect()
    return
  }
  if (actions.value.length > 0 && !isHistory.value) {
    const [first] = actions.value as LaunchBarAction[]
    if (first.explicitSelect !== true) {
      first.action()
      return
    }
  }
  if (keyword.value) {
    search(keyword.value)
    handleSelect()
    return
  }
  window.open(recommended.href, '_blank')
  handleSelect()
}

const handleUp = (e: KeyboardEvent) => {
  if (e.isComposing) {
    return
  }
  previousItem()
  e.preventDefault()
}

const handleDown = (e: KeyboardEvent) => {
  if (e.isComposing) {
    return
  }
  nextItem()
  e.preventDefault()
}

const handleSearch = (e: Event) => {
  keyword.value = (e.target as HTMLInputElement).value
  lastKeyword.value = keyword.value
  resetFocus()
  getActions()
}

const onDeleteItem = () => {
  previousItem()
  getActions()
}

const onClearHistory = () => {
  resetFocus()
  getActions()
}

const onAction = () => {
  handleSelect()
}

onMounted(async () => {
  await getActions()
  if (matchUrlPattern(/^https?:\/\/search\.bilibili\.com/)) {
    await setupSearchPageSync()
  }
})

defineExpose({
  input,
  focusInput: resetFocus,
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
    transition: 0.2s all ease-out;
    border: 1px solid #8882;
    white-space: nowrap;
    border-radius: 8px;
    @include shadow();
    color: black;
    background-color: #fff;
    body.dark & {
      color: var(--be-color-text-title, #eee);
      background-color: var(--be-color-panel-bg, #222);
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
