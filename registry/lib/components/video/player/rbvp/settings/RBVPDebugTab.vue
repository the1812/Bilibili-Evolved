<template>
  <div class="rbvp-rules-editor">
    <div
      v-if="!state.rbvpEnabled"
      class="rbvp-namespace-disabled-banner"
    >
      <div class="rbvp-namespace-disabled-banner-title">
        RBVP 组件当前已关闭
      </div>
      <div class="rbvp-namespace-disabled-banner-text">
        即使存在已注册且已接管的命名空间，RBVP 也不会生效。请先在组件设置中启用 RBVP。
      </div>
    </div>
    <div class="rbvp-guide-card">
      <div class="rbvp-guide-title">调试视图</div>
      <div class="rbvp-guide-text">
        这里会展示最近一次规则匹配时，对各命名空间的尝试路径，便于确认命中的是哪一行、为什么生效或为什么跳过。
      </div>
    </div>
    <div class="rbvp-status-card rbvp-debug-card">
      <div class="rbvp-status-card-label">调试面板</div>
      <div class="rbvp-status-card-value">{{ state.debugSnapshotSummary }}</div>
      <div v-if="state.debugNamespaces.length > 0" class="rbvp-debug-toolbar">
        <div class="rbvp-field-hint">
          当前共 {{ state.debugNamespaces.length }} 个命名空间调试记录
        </div>
        <div class="rbvp-rule-create-actions">
          <VButton @click="expandAllDebugNamespaces()">全部展开</VButton>
          <VButton @click="collapseAllDebugNamespaces()">全部收起</VButton>
        </div>
      </div>
      <div v-if="state.debugNamespaces.length === 0" class="rbvp-field-hint">暂无调试记录</div>
      <div v-else class="rbvp-debug-list">
        <div
          v-for="item in state.debugNamespaces"
          :key="item.namespace"
          class="rbvp-debug-namespace-card"
        >
          <div class="rbvp-debug-namespace-header">
            <div class="rbvp-debug-namespace-title">
              <div class="rbvp-section-title">{{ item.displayName }}</div>
              <div class="rbvp-namespace-main-name">{{ item.namespace }}</div>
            </div>
            <div class="rbvp-debug-namespace-actions">
              <span
                class="rbvp-namespace-takeover-status"
                :class="{ active: item.matched, disabled: !item.matched }"
              >
                {{ item.matched ? `第 ${item.line} 行命中` : '未命中' }}
              </span>
              <button
                type="button"
                class="rbvp-icon-button"
                :title="isDebugNamespaceExpanded(item.namespace) ? '收起细节' : '展开细节'"
                @click="toggleDebugNamespace(item.namespace)"
              >
                <VIcon
                  :icon="
                    isDebugNamespaceExpanded(item.namespace) ? 'mdi-chevron-up' : 'mdi-chevron-down'
                  "
                  :size="16"
                />
              </button>
            </div>
          </div>
          <div class="rbvp-debug-namespace-summary">{{ item.summary }}</div>
          <div v-if="isDebugNamespaceExpanded(item.namespace)" class="rbvp-debug-steps">
            <div
              v-for="(step, index) in item.steps"
              :key="`${item.namespace}-${index}`"
              class="rbvp-debug-step"
              :class="{
                matched: step.matched === true,
                failed: step.matched === false,
                'execute-failed': step.type === 'execute' && step.matched === false,
              }"
              :style="{ paddingLeft: `${12 + step.depth * 16}px` }"
            >
              <span class="rbvp-debug-step-marker">{{ getDebugStepMarker(step) }}</span>
              <span class="rbvp-debug-step-text">{{ step.message }}</span>
            </div>
          </div>
          <div v-else class="rbvp-field-hint">已收起调试追踪细节</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { VButton, VIcon } from '@/ui'
import { getDebugStepMarker } from './helpers'

export default Vue.extend({
  name: 'RBVPDebugTab',
  components: {
    VButton,
    VIcon,
  },
  props: {
    state: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      collapsedDebugNamespaces: {} as Record<string, boolean>,
    }
  },
  watch: {
    'state.debugNamespaces': {
      immediate: true,
      deep: true,
      handler() {
        this.syncDebugNamespaceCollapseState()
      },
    },
  },
  methods: {
    getDebugStepMarker,
    syncDebugNamespaceCollapseState() {
      const nextState: Record<string, boolean> = {}
      const namespaces = Array.isArray(this.state.debugNamespaces) ? this.state.debugNamespaces : []
      namespaces.forEach((item: { namespace: string; matched?: boolean }) => {
        nextState[item.namespace] = this.collapsedDebugNamespaces[item.namespace] ?? !item.matched
      })
      this.collapsedDebugNamespaces = nextState
    },
    isDebugNamespaceExpanded(namespace: string) {
      return !this.collapsedDebugNamespaces[namespace]
    },
    toggleDebugNamespace(namespace: string) {
      this.$set(this.collapsedDebugNamespaces, namespace, this.isDebugNamespaceExpanded(namespace))
    },
    expandAllDebugNamespaces() {
      const nextState: Record<string, boolean> = {}
      const namespaces = Array.isArray(this.state.debugNamespaces) ? this.state.debugNamespaces : []
      namespaces.forEach((item: { namespace: string }) => {
        nextState[item.namespace] = false
      })
      this.collapsedDebugNamespaces = nextState
    },
    collapseAllDebugNamespaces() {
      const nextState: Record<string, boolean> = {}
      const namespaces = Array.isArray(this.state.debugNamespaces) ? this.state.debugNamespaces : []
      namespaces.forEach((item: { namespace: string }) => {
        nextState[item.namespace] = true
      })
      this.collapsedDebugNamespaces = nextState
    },
  },
})
</script>
<style lang="scss">
@import 'shared';

.rbvp-namespace-disabled-banner {
  border: 1px solid #f5a6234d;
  border-radius: 8px;
  background-color: #f5a6231a;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &-title {
    font-size: 13px;
    font-weight: 600;
  }

  &-text {
    line-height: 1.6;
    opacity: 0.78;
  }
}

.rbvp-debug-card {
  gap: 10px;
}

.rbvp-debug-toolbar {
  @extend %rbvp-flex-header;
}

.rbvp-debug-list {
  @extend %rbvp-flex-col-12;
}

.rbvp-debug-namespace-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  background-color: rgb(127 127 127 / 8%);
}

.rbvp-debug-namespace-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.rbvp-debug-namespace-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rbvp-debug-namespace-title {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rbvp-debug-namespace-summary {
  line-height: 1.6;
  color: var(--theme-color);
}

.rbvp-debug-steps {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rbvp-debug-step {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding-top: 6px;
  padding-bottom: 6px;
  border-radius: 6px;
  background-color: #8882;
  line-height: 1.5;

  &.matched {
    color: var(--theme-color);
  }

  &.failed {
    opacity: 0.82;
  }

  &.execute-failed {
    color: #ff6b6b;
    background-color: rgba(255, 107, 107, 0.12);
    border: 1px solid rgba(255, 107, 107, 0.2);
    opacity: 1;
  }
}

.rbvp-debug-step-marker {
  min-width: 14px;
  font-weight: 600;
}

.rbvp-debug-step-text {
  flex: 1;
  word-break: break-word;
}

@media (max-width: 900px) {
  .rbvp-debug-toolbar,
  .rbvp-debug-namespace-header,
  .rbvp-rule-create-actions {
    flex-wrap: wrap;
  }
}
</style>
