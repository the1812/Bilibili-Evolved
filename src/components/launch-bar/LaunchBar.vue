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
          @keydown.enter="handleEnter"
          @keydown.down.prevent="$refs.list.querySelector('.suggest-item').focus()"
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
          @click="a.action()"
          @keydown.enter="a.action()"
          @keydown.shift.delete="deleteHistory($event, index)"
          @keydown.up.prevent="previousItem($event, index)"
          @keydown.down.prevent="nextItem($event, index)"
        >
          <div class="name">
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
          @keydown.enter="clearHistory()"
          @keydown.up.prevent="previousItem($event, actions.length)"
          @keydown.down.prevent="nextItem($event, actions.length)"
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
          @keydown.enter="a.action()"
          @keydown.up.prevent="previousItem($event, index)"
          @keydown.down.prevent="nextItem($event, index)"
        >
          <component :is="a.content" v-if="a.content" :name="a.name"></component>
          <template v-else>
            {{ a.name }}
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { registerAndGetData } from '@/plugins/data'
import { dqa } from '@/core/utils'
import {
  LaunchBarActionProviders,
  LaunchBarActionProvider,
  LaunchBarAction,
} from './launch-bar-action'
import { searchProvider, search } from './search-provider'
import {
  historyProvider,
  deleteHistory as del,
  clearHistory as clear,
} from './history-provider'

const [actionProviders] = registerAndGetData(LaunchBarActionProviders, [
  searchProvider,
]) as [LaunchBarActionProvider[]]
async function getActions() {
  this.noActions = false
  if (this.isHistory) {
    this.actions = await historyProvider.getActions(this.keyword)
    return
  }
  const actions: LaunchBarAction[] = []
  this.actions = actions
  await Promise.all(
    actionProviders.map(async provider => {
      actions.push(...(await provider.getActions(this.keyword)))
    }),
  )
  this.noActions = actions.length === 0
}

const [recommended] = registerAndGetData('launchBar.recommended', {
  word: '搜索',
  href: 'https://search.bilibili.com/',
})
export default Vue.extend({
  components: {
    VIcon: () => import('@/ui/icon/VIcon.vue').then(m => m.default),
    VLoading: () => import('@/ui/VLoading.vue').then(m => m.default),
    VEmpty: () => import('@/ui/VEmpty.vue').then(m => m.default),
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
    keyword(input: string) {
      if (input.length === 0) {
        this.getActions()
      } else {
        this.debounceGetActions()
      }
    },
  },
  async mounted() {
    this.getActions()
  },
  methods: {
    debounceGetActions: lodash.debounce(getActions, 200),
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
        this.$refs.input.focus()
      } else {
        ((e.target as HTMLElement).previousElementSibling as HTMLElement).focus()
      }
    },
    nextItem(e: KeyboardEvent, index: number) {
      if (index !== dqa('.launch-bar .suggest-item').length - 1) {
        ((e.target as HTMLElement).nextElementSibling as HTMLElement).focus()
      }
    },
    search,
    deleteHistory(e: Event, index: number) {
      del(this.actions[index].name)
      this.previousItem(e, index)
      this.getActions()
    },
    clearHistory() {
      clear()
      this.$refs.input.focus()
      this.getActions()
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
  display: flex;
  align-items: center;
  .input-area {
    display: flex;
    flex-direction: column;
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
      padding: 6px 14px;
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
        margin-top: 6px;
        border-radius: 2px 2px 0 0;
      }
      &:last-child {
        margin-bottom: 6px;
        border-radius: 0 0 2px 2px;
      }
      .badge-item {
        display: flex;
        align-items: center;
        .badge {
          padding: 2px 6px;
          border-radius: 4px;
          background-color: #8882;
          margin-right: 6px;
        }
      }
    }
    .action-item {
      > * {
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .history-item {
      display: flex;
      align-items: center;
      .name {
        flex: 1 0 auto;
        max-width: calc(100% - 28px);
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: 8px;
      }
      .delete-history {
        opacity: 0.5;
        &:hover {
          opacity: 1;
        }
      }
    }
    .clear-history {
      display: flex;
      align-items: center;
      justify-content: center;
      .be-icon {
        margin-right: 6px;
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
