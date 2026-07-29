<template>
  <div ref="container" class="launch-bar" :class="{ open: isOpen }" @focusout="handleFocusOut">
    <div class="input-area">
      <div class="launch-bar-form">
        <input
          ref="input"
          class="input"
          type="text"
          role="combobox"
          autocomplete="off"
          aria-autocomplete="list"
          :aria-controls="listId"
          :aria-expanded="isOpen"
          :aria-activedescendant="activeItemId"
          :placeholder="recommended.word"
          :value="inputValue"
          @focus="openSuggestList"
          @input="handleSearch($event)"
          @keydown.enter.stop="handleEnter"
          @keydown.esc.stop="closeSuggestList"
          @keydown.shift.delete="handleDeleteActive"
          @keydown.up.stop="handleUp"
          @keydown.down.stop="handleDown"
        />
        <button class="submit" title="执行" tabindex="-1" @click="handleEnter">
          <VIcon icon="right-arrow" :size="20"></VIcon>
        </button>
      </div>
      <!-- <div class="input-active-bar"></div> -->
    </div>
    <div :id="listId" class="launch-bar-suggest-list" role="listbox">
      <div v-if="isHistory" class="launch-bar-history-list">
        <div v-if="actions.length === 0" class="history-empty be-launch-bar-suggest-item disabled">
          暂无搜索历史
        </div>
        <ActionItem
          v-for="(a, index) of actions"
          :id="getItemId(index)"
          :key="a.key"
          :action="a"
          :focused="a.key === activeActionKey"
          @delete-item="onDeleteItem(a.key)"
          @action="
            index === actions.length - 1 && onClearHistory()
            onAction()
          "
        />
      </div>
      <div v-if="!isHistory" class="launch-bar-action-list">
        <VEmpty
          v-if="actions.length === 0 && noOnlineActions"
          class="be-launch-bar-suggest-item disabled"
        ></VEmpty>
        <VLoading
          v-if="actions.length === 0 && !noOnlineActions"
          class="be-launch-bar-suggest-item disabled"
        ></VLoading>
        <ActionItem
          v-for="(a, index) of actions"
          :id="getItemId(index)"
          :key="a.key"
          :action="a"
          :focused="a.key === activeActionKey"
          @delete-item="onDeleteItem(a.key)"
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

type LaunchBarActionEntry = LaunchBarAction & {
  key: string
}

const container = ref<HTMLElement>()
const input = ref<HTMLInputElement>()
const listId = lodash.uniqueId('be-launch-bar-list-')
const getItemId = (index: number) => `${listId}-item-${index}`

const [actionProviders] = registerAndGetData(LaunchBarActionProviders, [
  searchProvider,
  historyProvider,
]) as [LaunchBarActionProvider[]]

const [recommended] = registerAndGetData('launchBar.recommended', {
  word: '搜索',
  href: 'https://search.bilibili.com/',
})

const actions = ref<LaunchBarActionEntry[]>([])
const activeActionKey = ref('')
const query = ref('')
const isOpen = ref(false)
const noOnlineActions = ref(false)

const activeActionIndex = computed(() =>
  actions.value.findIndex(action => action.key === activeActionKey.value),
)
const activeAction = computed(() => actions.value[activeActionIndex.value])
const activeItemId = computed(() =>
  activeActionIndex.value === -1 ? undefined : getItemId(activeActionIndex.value),
)
const inputValue = computed(() => activeAction.value?.suggestName ?? query.value)
const isHistory = computed(() => query.value.length === 0)

const setItemIndex = (index: number) => {
  const newIndex = lodash.clamp(index, -1, actions.value.length - 1)
  const newAction = actions.value[newIndex]
  const newActionKey = newAction?.key ?? ''
  if (activeActionKey.value !== newActionKey) {
    activeActionKey.value = newActionKey
    if (newAction?.suggestName) {
      if (
        query.value !== '' &&
        newAction.suggestName.toLowerCase().startsWith(query.value.toLowerCase())
      ) {
        nextTick(() => {
          input.value?.setSelectionRange(query.value.length, newAction.suggestName.length)
        })
      }
    }
  }
}
const resetFocus = () => setItemIndex(-1)
const nextItem = () => setItemIndex(activeActionIndex.value + 1)
const previousItem = () => setItemIndex(activeActionIndex.value - 1)

const sortActions = <T extends LaunchBarAction>(actionsList: T[]) => {
  return [...actionsList].sort(ascendingSort(it => it.order ?? Infinity))
}

const generateKeys = (
  provider: LaunchBarActionProvider,
  actionsList: LaunchBarAction[],
): LaunchBarActionEntry[] =>
  actionsList.map(a => {
    const key = `${provider.name}.${a.name}`
    return {
      ...a,
      key,
    }
  })

const getOnlineActionsInternal = async () => {
  const currentQuery = query.value
  const onlineActions = (
    await Promise.all(
      actionProviders.map(async provider =>
        generateKeys(provider, await provider.getActions(currentQuery)),
      ),
    )
  ).flat()
  if (currentQuery !== query.value || isHistory.value) {
    return
  }
  const fuse = new Fuse(onlineActions, {
    keys: ['indexer', 'displayName', 'name', 'description', 'key'],
    includeScore: true,
    threshold: 0.1,
  })
  const fuseResult = fuse.search(currentQuery)
  console.log(fuseResult)
  actions.value = sortActions(fuseResult.map(it => it.item).slice(0, 13))
  if (activeActionIndex.value === -1) {
    resetFocus()
  }
  noOnlineActions.value = actions.value.length === 0
}

const getOnlineActions = lodash.debounce(getOnlineActionsInternal, 200)

const getActions = async () => {
  noOnlineActions.value = false
  if (isHistory.value) {
    actions.value = sortActions(
      generateKeys(historyProvider, await historyProvider.getActions(query.value)),
    )
    return
  }
  const actionsArray: LaunchBarActionEntry[] = []
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
      query.value = keywordFromParam
      resetFocus()
      getActions()
    }
  })
  await nextTick()
}

const focusInput = () => {
  input.value?.focus()
}

const openSuggestList = () => {
  isOpen.value = true
}

const closeSuggestList = () => {
  isOpen.value = false
  resetFocus()
}

const handleFocusOut = (event: FocusEvent) => {
  const nextTarget = event.relatedTarget as Node | null
  if (nextTarget && container.value?.contains(nextTarget)) {
    return
  }
  closeSuggestList()
}

const handleSelect = () => {
  isOpen.value = false
  resetFocus()
  emit('close')
}

const handleEnter = async (e?: KeyboardEvent | MouseEvent) => {
  if ((e as KeyboardEvent)?.isComposing) {
    return
  }
  if (activeAction.value) {
    await activeAction.value.action()
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
  if (query.value) {
    search(query.value)
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
  openSuggestList()
  previousItem()
  e.preventDefault()
}

const handleDown = (e: KeyboardEvent) => {
  if (e.isComposing) {
    return
  }
  openSuggestList()
  nextItem()
  e.preventDefault()
}

const handleSearch = (e: Event) => {
  query.value = (e.target as HTMLInputElement).value
  resetFocus()
  openSuggestList()
  getActions()
}

const onDeleteItem = async (actionKey: string) => {
  const deletedIndex = actions.value.findIndex(action => action.key === actionKey)
  const wasActive = activeActionKey.value === actionKey
  await getActions()
  if (wasActive) {
    setItemIndex(Math.min(deletedIndex, actions.value.length - 1))
  } else if (activeActionIndex.value === -1) {
    resetFocus()
  }
  openSuggestList()
  await nextTick()
  focusInput()
}

const handleDeleteActive = async (event: KeyboardEvent) => {
  const action = activeAction.value
  if (!action?.deleteAction) {
    return
  }
  event.preventDefault()
  await action.deleteAction()
  await onDeleteItem(action.key)
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
  focusInput,
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
  &.open {
    .input-active-bar {
      width: 100%;
    }
  }
  &.open .launch-bar-suggest-list {
    opacity: 1;
    transform: translateX(-50%);
    pointer-events: initial;
  }
}
</style>
