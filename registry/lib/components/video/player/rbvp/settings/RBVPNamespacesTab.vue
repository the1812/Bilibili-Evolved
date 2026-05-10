<template>
  <div class="rbvp-section-content">
    <div class="rbvp-guide-card">
      <div class="rbvp-guide-title">命名空间</div>
      <div class="rbvp-guide-text">
        这里展示 RBVP
        当前已注册的命名空间，可查看主名称、描述与别名。规则动作里既可以使用主名称，也可以使用这里展示的别名；
        若该命名空间支持接管开关，也可以直接在这里切换，并同步写回对应组件设置。
      </div>
      <div class="rbvp-guide-meta">
        <span>当前共 {{ state.namespaceItems.length }} 个命名空间</span>
        <span>别名可直接用于动作名</span>
      </div>
    </div>
    <div v-if="state.namespaceItems.length === 0" class="rbvp-empty-state rbvp-namespace-empty">
      <div class="rbvp-empty-state-title">还没有已注册的命名空间</div>
      <div class="rbvp-empty-state-text">
        请先启用带 RBVP 兼容能力的组件或插件，注册成功后会自动出现在这里。
      </div>
    </div>
    <div v-else class="rbvp-namespace-list">
      <div v-for="item in state.namespaceItems" :key="item.name" class="rbvp-namespace-card">
        <div class="rbvp-namespace-header">
          <div class="rbvp-namespace-title-area">
            <div class="rbvp-section-title">{{ item.displayName }}</div>
            <div class="rbvp-namespace-main-name">{{ item.name }}</div>
          </div>
          <div class="rbvp-namespace-takeover">
            <span
              class="rbvp-namespace-takeover-status"
              :class="{
                active: item.takeoverSupported && item.takeoverState,
                disabled: !item.takeoverSupported,
              }"
            >
              {{
                item.takeoverSupported
                  ? item.takeoverState
                    ? 'RBVP 已接管'
                    : 'RBVP 未接管'
                  : '不支持接管切换'
              }}
            </span>
            <button
              v-if="item.takeoverSupported"
              type="button"
              class="rbvp-namespace-toggle"
              :class="{ active: item.takeoverState }"
              @click="actions.toggleNamespaceTakeover(item)"
            >
              {{ item.takeoverState ? '关闭接管' : '启用接管' }}
            </button>
          </div>
        </div>
        <div class="rbvp-namespace-description">{{ item.description }}</div>
        <div class="rbvp-namespace-meta-grid">
          <label class="rbvp-field">
            <span class="rbvp-field-label">主名称</span>
            <div class="rbvp-namespace-code">{{ item.name }}</div>
          </label>
          <label class="rbvp-field">
            <span class="rbvp-field-label">别名</span>
            <div v-if="item.aliases.length > 0" class="rbvp-namespace-tags">
              <span
                v-for="alias in item.aliases"
                :key="`${item.name}-${alias}`"
                class="rbvp-namespace-tag"
              >
                {{ alias }}
              </span>
            </div>
            <div v-else class="rbvp-field-hint">无</div>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
export default Vue.extend({
  name: 'RBVPNamespacesTab',
  props: {
    state: {
      type: Object,
      required: true,
    },
    actions: {
      type: Object,
      required: true,
    },
  },
})
</script>
<style lang="scss">
@import 'shared';

.rbvp-namespace-list {
  @extend %rbvp-flex-col-12;
}

.rbvp-namespace-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid #8883;
  border-radius: 8px;
  background-color: #8882;
  padding: 12px;
}

.rbvp-namespace-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.rbvp-namespace-title-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rbvp-namespace-main-name {
  width: fit-content;
  padding: 4px 8px;
  border-radius: 999px;
  background-color: var(--theme-color-10);
  color: var(--theme-color);
}

.rbvp-namespace-description {
  line-height: 1.6;
}

.rbvp-namespace-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.rbvp-namespace-takeover {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}

.rbvp-namespace-takeover-status {
  padding: 4px 8px;
  border-radius: 999px;
  background-color: #8883;
  font-weight: 500;

  &.active {
    background-color: var(--theme-color-10);
    color: var(--theme-color);
  }

  &.disabled {
    opacity: 0.72;
  }
}

.rbvp-namespace-toggle {
  border: none;
  border-radius: 999px;
  padding: 6px 12px;
  background-color: #8882;
  color: inherit;
  cursor: pointer;
  transition: background-color 0.2s ease-out, box-shadow 0.2s ease-out, color 0.2s ease-out;

  &:hover {
    background-color: #8884;
  }

  &.active {
    background-color: var(--theme-color-20);
    box-shadow: 0 0 0 1px var(--theme-color-40);
    color: var(--theme-color);
  }
}

.rbvp-namespace-empty {
  min-height: 220px;
}

@media (max-width: 900px) {
  .rbvp-namespace-header {
    flex-wrap: wrap;
  }

  .rbvp-namespace-meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>
