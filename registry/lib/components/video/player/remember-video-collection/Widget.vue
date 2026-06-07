<template>
  <div class="multiple-widgets">
    <VPopup
      v-model="open"
      class="be-rvc-widget-popup widgets-popup"
      :trigger-element="$refs.button"
    >
      <div class="be-rvc-widget-panel">
        <div class="be-rvc-widget-title">合集记忆</div>

        <div class="be-rvc-widget-tabs" role="tablist" aria-label="合集记忆功能页签">
          <button
            type="button"
            class="be-rvc-widget-tab"
            :class="{ active: activeTab === 'resume' }"
            @click="activeTab = 'resume'"
          >
            上次播放
          </button>
          <button
            type="button"
            class="be-rvc-widget-tab"
            :class="{ active: activeTab === 'manage' }"
            @click="activeTab = 'manage'"
          >
            记忆管理
          </button>
        </div>

        <div v-if="activeTab === 'resume'" class="be-rvc-widget-tab-panel">
          <div class="be-rvc-widget-card">
            <div class="be-rvc-widget-label">上次播放</div>
            <div class="be-rvc-widget-value" :class="{ empty: !state.lastPlayedLabel }">
              {{ lastPlayedText }}
            </div>
          </div>
          <div class="be-rvc-widget-card">
            <div class="be-rvc-widget-label">下一个</div>
            <div class="be-rvc-widget-value" :class="{ empty: !state.nextLabel }">
              {{ nextText }}
            </div>
          </div>
          <div
            v-if="state.available && state.lastPlayedLabel && !state.canJumpLast"
            class="be-rvc-widget-tip"
          >
            当前已经位于上次播放位置。
          </div>
          <div class="be-rvc-widget-actions">
            <VButton type="primary" :disabled="!state.canJumpLast" @click="handleJumpLast">
              跳转到上次播放
            </VButton>
            <VButton :disabled="!state.canJumpNext" @click="handleJumpNext">跳转到下一个</VButton>
          </div>
        </div>

        <div v-else class="be-rvc-widget-tab-panel">
          <div class="be-rvc-widget-card">
            <div class="be-rvc-widget-label">当前作用域</div>
            <div class="be-rvc-widget-value">
              <span>{{ scopeSummaryPrefixText }}</span>
              <span class="be-rvc-widget-count">{{ scopeSummaryCountText }}</span>
            </div>
            <div class="be-rvc-widget-hint">{{ state.clearDescription }}</div>
          </div>
          <div class="be-rvc-widget-card">
            <div class="be-rvc-widget-label">全部记忆</div>
            <div class="be-rvc-widget-value">
              <span>全部记忆 • </span>
              <span class="be-rvc-widget-count">{{ state.totalHistoryCount }} 个视频</span>
            </div>
            <div class="be-rvc-widget-hint">清除全部记忆是危险操作，确认后无法恢复。</div>
          </div>
          <div class="be-rvc-widget-actions">
            <VButton :disabled="!state.canClear" @click="handleClearHistory">
              {{ state.clearScopeButtonText }}
            </VButton>
            <template v-if="confirmClearAll">
              <div class="be-rvc-widget-danger-tip">
                这是危险操作，会清除所有合集记忆。确认后无法恢复。
              </div>
              <div class="be-rvc-widget-danger-actions">
                <VButton
                  type="primary"
                  class="be-rvc-widget-danger-confirm"
                  :disabled="!state.canClearAll"
                  @click="handleConfirmClearAll"
                >
                  确认清除全部记忆
                </VButton>
                <VButton @click="confirmClearAll = false">取消</VButton>
              </div>
            </template>
            <VButton
              v-else
              class="be-rvc-widget-danger"
              :disabled="!state.canClearAll"
              @click="confirmClearAll = true"
            >
              清除全部记忆
            </VButton>
          </div>
        </div>
      </div>
    </VPopup>
    <DefaultWidget ref="button" icon="mdi-history" @click="open = !open">
      <span>合集记忆</span>
    </DefaultWidget>
  </div>
</template>

<script lang="ts">
import { DefaultWidget, VButton, VPopup } from '@/ui'
import {
  clearAllRememberedHistory,
  clearRememberedHistory,
  getRememberVideoCollectionRuntimeState,
  jumpToRememberedNextVideo,
  jumpToRememberedVideo,
  subscribeRememberVideoCollectionRuntimeState,
  type RememberVideoCollectionRuntimeState,
} from './runtime'

type WidgetTab = 'resume' | 'manage'

export default Vue.extend({
  components: {
    DefaultWidget,
    VButton,
    VPopup,
  },
  data() {
    return {
      open: false,
      activeTab: 'resume' as WidgetTab,
      confirmClearAll: false,
      state: getRememberVideoCollectionRuntimeState() as RememberVideoCollectionRuntimeState,
      unsubscribe: null as null | (() => void),
    }
  },
  computed: {
    lastPlayedText(): string {
      if (this.state.lastPlayedLabel) {
        return this.state.lastPlayedLabel
      }
      return this.state.available ? '当前作用域暂无上次播放记录' : '当前页面没有可用的合集记忆'
    },
    nextText(): string {
      if (this.state.nextLabel) {
        return this.state.nextLabel
      }
      return this.state.available ? '没有可跳转的下一个视频' : '当前页面没有可用的合集记忆'
    },
    scopeSummaryPrefixText(): string {
      if (this.state.scopeTitle) {
        return `${this.state.scopeTitle} \u2022 `
      }
      return `${this.state.scopeLabel} \u2022 `
    },
    scopeSummaryCountText(): string {
      return `${this.state.scopedHistoryCount} 个视频`
    },
  },
  watch: {
    open(value: boolean) {
      if (!value) {
        this.activeTab = 'resume'
        this.confirmClearAll = false
      }
    },
    activeTab(value: WidgetTab) {
      if (value !== 'manage') {
        this.confirmClearAll = false
      }
    },
  },
  mounted() {
    this.unsubscribe = subscribeRememberVideoCollectionRuntimeState(state => {
      this.state = state
      if (!state.canClearAll) {
        this.confirmClearAll = false
      }
    })
  },
  beforeDestroy() {
    this.unsubscribe?.()
    this.unsubscribe = null
  },
  methods: {
    async handleJumpLast() {
      if (await jumpToRememberedVideo()) {
        this.confirmClearAll = false
        this.open = false
      }
    },
    async handleJumpNext() {
      if (await jumpToRememberedNextVideo()) {
        this.confirmClearAll = false
        this.open = false
      }
    },
    handleClearHistory() {
      clearRememberedHistory()
      this.confirmClearAll = false
    },
    handleConfirmClearAll() {
      if (clearAllRememberedHistory()) {
        this.confirmClearAll = false
      }
    },
  },
})
</script>

<style lang="scss">
@import 'common';

.be-rvc-widget-popup {
  top: 50%;
  left: calc(100% + 8px);
  width: 304px;
  padding: 0;
  transform: translateY(-50%) scale(0.9);
  transform-origin: left;
  transition: 0.2s ease-out;
  @include default-background-color();
  @include shadow();
  @include round-corner(8px);
  border: none;

  &.open {
    transform: translateY(-50%) scale(1);
  }
  body.settings-panel-dock-right & {
    right: calc(100% + 8px);
    left: unset;
    transform-origin: right;
  }
}

.be-rvc-widget-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
}

.be-rvc-widget-title {
  font-size: 14px;
  font-weight: 600;
}

.be-rvc-widget-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.be-rvc-widget-tab {
  border: none;
  border-radius: 999px;
  padding: 7px 12px;
  background-color: #8881;
  color: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease-out, box-shadow 0.2s ease-out;

  &:hover {
    background-color: #8882;
  }

  &.active {
    background-color: var(--theme-color-20);
    box-shadow: 0 0 0 1px var(--theme-color-40);
    color: var(--theme-color);
  }
}

.be-rvc-widget-tab-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.be-rvc-widget-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background-color: #8881;
  border-radius: 8px;
}

.be-rvc-widget-label {
  font-size: 12px;
  opacity: 0.7;
}

.be-rvc-widget-value {
  line-height: 1.5;
  word-break: break-word;

  &.empty {
    opacity: 0.65;
  }
}

.be-rvc-widget-count {
  color: var(--theme-color);
  font-weight: 600;
}

.be-rvc-widget-tip,
.be-rvc-widget-hint {
  font-size: 12px;
  line-height: 1.5;
  opacity: 0.75;
}

.be-rvc-widget-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.be-rvc-widget-danger-tip {
  padding: 8px 10px;
  border-radius: 8px;
  background-color: rgb(244 63 94 / 10%);
  color: #b42318;
  font-size: 12px;
  line-height: 1.5;

  body.dark & {
    color: #ffb4b4;
  }
}

.be-rvc-widget-danger-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.be-rvc-widget-danger,
.be-rvc-widget-danger-confirm {
  &.be-button:not(.disabled) {
    box-shadow: 0 0 0 1px rgb(244 63 94 / 30%) !important;
    background-color: rgb(244 63 94 / 10%) !important;
    color: #b42318;

    body.dark & {
      color: #ffb4b4;
    }

    &:hover,
    &:focus-within {
      box-shadow: 0 0 0 1px rgb(244 63 94 / 45%) !important;
      background-color: rgb(244 63 94 / 16%) !important;
    }
  }
}
</style>
