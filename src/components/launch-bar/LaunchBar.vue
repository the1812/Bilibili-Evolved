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
          @keydown.down.prevent.stop="$refs.list.querySelector('.suggest-item').focus()"
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
        <div
          v-for="(a, index) of actions"
          :key="a.name"
          tabindex="0"
          class="history-item suggest-item"
          :title="a.name"
          @click.self="a.action()"
          @keydown.enter.stop="a.action()"
          @keydown.shift.delete.stop="deleteHistory($event, index)"
          @keydown.up.stop.prevent="previousItem($event, index)"
          @keydown.down.stop.prevent="nextItem($event, index)"
        >
          <div
            class="name"
            @click="a.action()"
          >
            {{ a.name }}
          </div>
          <div
            class="delete-history"
            title="删除此项"
            @click="deleteHistory($event, index)"
          >
            <VIcon icon="cancel" :size="18"></VIcon>
          </div>
        </div>
        <div
          v-if="actions.length > 0"
          class="clear-history suggest-item"
          tabindex="0"
          @click="clearHistory()"
          @keydown.enter.stop="clearHistory()"
          @keydown.up.prevent.stop="previousItem($event, actions.length)"
          @keydown.down.prevent.stop="nextItem($event, actions.length)"
        >
          <VIcon icon="mdi-trash-can-outline" :size="18"></VIcon>清除搜索历史
        </div>
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
        <div
          v-for="(a, index) of actions"
          :key="a.name"
          tabindex="0"
          class="action-item suggest-item"
          :title="a.name"
          @click="a.action()"
          @keydown.enter.stop="a.action()"
          @keydown.up.prevent.stop="previousItem($event, index)"
          @keydown.down.prevent.stop="nextItem($event, index)"
        >
          <div class="suggest-item-content">
            <div v-if="a.icon" class="suggest-item-icon">
              <VIcon :icon="a.icon" :size="16" />
            </div>
            <div class="suggest-item-title">
              <component
                :is="a.content"
                v-if="a.content"
                class="suggest-item-name"
                :name="a.name"
              ></component>
              <div v-else class="suggest-item-name">
                {{ a.title || a.name }}
              </div>
              <div v-if="a.description" class="suggest-item-description">
                {{ a.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {
  VIcon,
  VLoading,
  VEmpty,
} from '@/ui'
import { registerAndGetData } from '@/plugins/data'
import { select } from '@/core/spin-query'
import { matchUrlPattern } from '@/core/utils'
import Fuse from 'fuse.js'
import {
  LaunchBarActionProviders,
  LaunchBarActionProvider,
  LaunchBarAction,
} from './launch-bar-action'
import { searchProvider, search } from './search-provider'
import {
  historyProvider,
  deleteHistoryItem as del,
  clearHistoryItems as clear,
} from './history-provider'

const [actionProviders] = registerAndGetData(LaunchBarActionProviders, [
  searchProvider,
]) as [LaunchBarActionProvider[]]
async function getOnlineActions() {
  const onlineActions = (await Promise.all(
    actionProviders.map(provider => provider.getActions(this.keyword)),
  )).flat()
  const fuse = new Fuse(onlineActions, {
    keys: ['indexer', 'name', 'displayName', 'description'],
  })
  const fuseResult = fuse.search(this.keyword)
  console.log(fuseResult)
  this.actions = fuseResult.map(it => it.item)
  this.noActions = this.actions.length === 0
}
async function getActions() {
  this.noActions = false
  if (this.isHistory) {
    this.actions = await historyProvider.getActions(this.keyword)
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
    if (!matchUrlPattern(/^http:\/\/search\.bilibili\.com/)) {
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
    async handleEnter() {
      if (this.keyword.length > 0) {
        const providers = [...actionProviders].reverse()
        for (const p of providers) {
          if (p.getEnterAction) {
            const action = p.getEnterAction(this.keyword)
            if (action !== null) {
              action(this.keyword)
              return
            }
          }
        }
      } else {
        window.open(this.recommended.href, '_blank')
      }
    },
    previousItem(e: KeyboardEvent, index: number) {
      if (index === 0) {
        this.focus()
      } else {
        ((e.currentTarget as HTMLElement).previousElementSibling as HTMLElement).focus()
      }
    },
    nextItem(e: KeyboardEvent, index: number) {
      const lastItemIndex = this.actions.length - (this.isHistory ? 0 : 1)
      if (index !== lastItemIndex) {
        ((e.currentTarget as HTMLElement).nextElementSibling as HTMLElement).focus()
      }
    },
    search,
    deleteHistory(e: Event, index: number) {
      this.previousItem(e, index)
      del(this.actions[index].name)
      this.getActions()
    },
    clearHistory() {
      this.focus()
      clear()
      this.getActions()
    },
    focus() {
      this.$refs.input.focus()
    },
  },
})
</script>
<style lang="scss">
@import "common";
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
    .suggest-item {
      outline: none !important;
      padding: 6px 6px 6px 10px;
      cursor: pointer;
      &.disabled {
        cursor: default;
        @include h-center();
        justify-content: center;
      }
      &:not(.disabled):hover,
      &:not(.disabled):focus-within {
        background-color: #8882;
      }
      &:first-child {
        padding-top: 8px;
        border-radius: 7px 7px 0 0;
      }
      &:last-child {
        padding-bottom: 8px;
        border-radius: 0 0 7px 7px;
      }
      &-content {
        @include h-center();
      }
      &-icon {
        margin-right: 6px;
      }
      &-title {
        @include v-stretch();
        flex: 1 0 auto;
      }
      &-name {
        max-width: 100%;
      }
      &-description {
        opacity: .5;
        font-size: smaller;
      }
    }
    .action-item {
      > * {
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .history-item {
      @include h-center(8px);
      .name {
        flex: 1 0 auto;
        max-width: calc(100% - 28px);
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .delete-history {
        opacity: 0.5;
        &:hover {
          opacity: 1;
        }
      }
    }
    .clear-history {
      @include h-center(6px);
      opacity: 0.5;
      justify-content: center;
      &:hover,
      &:focus-within {
        opacity: 1;
      }
    }
  }
  &:focus-within {
    .input-active-bar {
      width: 100%;
    }
    .launch-bar-suggest-list {
      opacity: 1;
      transform: translateX(-50%);
      pointer-events: initial;
    }
  }
}
</style>
