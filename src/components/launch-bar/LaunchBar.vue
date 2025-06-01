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
            onAction()
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
          @action="onAction()"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import Fuse from 'fuse.js'
import { computed, onMounted, reactive, ref, useTemplateRef, watch } from 'vue'
import { VIcon, VLoading, VEmpty } from '@/ui'
import { registerAndGetData } from '@/plugins/data'
import { select } from '@/core/spin-query'
import { ascendingSort } from '@/core/utils/sort'
import { matchUrlPattern } from '@/core/utils'
import { urlChange } from '@/core/observer'
import ActionItem from './ActionItem.vue'
import {
  LaunchBarActionProviders,
  type LaunchBarActionProvider,
  type LaunchBarAction,
} from './launch-bar-action'
import { searchProvider, search } from './search-provider'
import { historyProvider } from './history-provider'
import { FocusTarget } from './focus-target'

const [actionProviders] = registerAndGetData(LaunchBarActionProviders, [
  searchProvider,
  historyProvider,
]) as [LaunchBarActionProvider[]]

const sortActions = (actions: SearchAction[]) => {
  return [...actions].sort(ascendingSort(it => it.order ?? Number.POSITIVE_INFINITY))
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

const [recommended] = registerAndGetData('launchBar.recommended', {
  word: '搜索',
  href: 'https://search.bilibili.com/',
})
type SearchAction = {
  key: string
  provider: LaunchBarActionProvider
} & LaunchBarAction
const emits = defineEmits(['close'])
const input = useTemplateRef('input')
const list = useTemplateRef('list')
const focusTarget = reactive(new FocusTarget(0))
const keyword = ref('')
const noActions = ref(false)
const actions = ref<SearchAction[]>([])
const isHistory = computed(() => keyword.value.length === 0)
const getOnlineActions = lodash.debounce(async () => {
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
  //   console.log(fuseResult)
  actions.value = sortActions(fuseResult.map(it => it.item).slice(0, 13))
  noActions.value = actions.value.length === 0
}, 200)
const getActions = async () => {
  noActions.value = false
  if (isHistory.value) {
    actions.value = sortActions(
      generateKeys(historyProvider, await historyProvider.getActions(keyword.value)),
    )
    return
  }
  actions.value = []
  getOnlineActions()
}

watch(keyword, () => {
  getActions()
})
watch(actions, () => {
  focusTarget.reset(actions.value.length)
})

const setupSearchPageSync = async () => {
  const selector = '#search-keyword, .search-input-el'
  const searchInput = (await select(selector)) as HTMLInputElement
  if (!searchInput) {
    return
  }
  urlChange(url => {
    const params = new URLSearchParams(url)
    const keywordFromParam = params.get('keyword')
    if (keywordFromParam !== null) {
      keyword.value = keywordFromParam
    }
  })
  //   await this.$nextTick()
}
const focusInput = () => {
  input.value.focus()
}
const handleSelect = () => {
  emits('close')
  getActions()
}
const handleEnter = async (e: KeyboardEvent | MouseEvent) => {
  if ((e as KeyboardEvent).isComposing) {
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
const focusSuggestItem = (nth: number) => {
  ;(
    list.value.querySelector(`.be-launch-bar-suggest-item:nth-child(${nth})`) as HTMLDivElement
  )?.focus()
}
const handleUp = (e: KeyboardEvent) => {
  if (e.isComposing) {
    return
  }
  focusTarget.previous()
  e.preventDefault()
}
const handleDown = (e: KeyboardEvent) => {
  if (e.isComposing) {
    return
  }
  focusTarget.next()
  e.preventDefault()
}
const handleIndexUpdate = async () => {
  //   await this.$nextTick()
  if (!focusTarget.hasFocus) {
    focusInput()
    return
  }
  focusSuggestItem(focusTarget.index + 1)
}
const previousItem = () => {
  focusTarget.previous()
}
const nextItem = () => {
  focusTarget.next()
}
const onDeleteItem = (index: number) => {
  focusTarget.setFocus(index)
  focusTarget.previous()
  getActions()
}

const onClearHistory = () => {
  focusInput()
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
  focusTarget.addEventListener('index-change', () => {
    handleIndexUpdate()
  })
})
defineExpose({
  input,
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
