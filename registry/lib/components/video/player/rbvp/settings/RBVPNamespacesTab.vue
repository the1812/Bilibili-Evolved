<template>
  <div class="rbvp-section-content">
    <div v-if="!state.rbvpEnabled" class="rbvp-namespace-disabled-banner">
      <div class="rbvp-namespace-disabled-banner-title">RBVP 组件当前已关闭</div>
      <div class="rbvp-namespace-disabled-banner-text">
        即使存在已注册且已接管的命名空间，RBVP 也不会生效。请先在组件设置中启用 RBVP。
      </div>
    </div>
    <div class="rbvp-guide-card">
      <div class="rbvp-guide-title">命名空间</div>
      <div class="rbvp-guide-text">
        这里展示 RBVP 当前已注册的命名空间，可查看主名称、描述并自定义别名。别名会写入主规则文本的
        @alias
        指令，规则动作里既可以使用主名称，也可以使用别名；若该命名空间支持接管开关，也可以直接在这里切换，并同步写回对应组件设置。
      </div>
      <div class="rbvp-guide-meta">
        <span>当前共 {{ state.namespaceItems.length }} 个命名空间</span>
        <span>别名写入主规则文本的 @alias 指令</span>
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
          </div>
          <div class="rbvp-namespace-takeover">
            <span
              class="rbvp-namespace-takeover-status"
              :class="{
                active: item.takeoverState && item.componentEnabled,
                disabled: !item.componentEnabled,
              }"
            >
              {{
                !item.componentEnabled
                  ? '组件已关闭'
                  : item.takeoverState
                  ? 'RBVP 已接管'
                  : 'RBVP 未接管'
              }}
            </span>
            <SwitchBox
              v-if="item.componentEnabled"
              :checked="item.takeoverState"
              @change="actions.toggleNamespaceTakeover(item)"
            />
          </div>
        </div>
        <div class="rbvp-namespace-description">{{ item.description }}</div>
        <div class="rbvp-namespace-alias-area">
          <div class="rbvp-namespace-tags">
            <span class="rbvp-namespace-name-tag" :title="item.name">
              <span class="rbvp-namespace-name-flag">主名称</span>
              <span class="rbvp-namespace-tag-text">{{ item.name }}</span>
              <VIcon icon="mdi-lock" :size="12" class="rbvp-namespace-name-lock" />
            </span>
            <span
              v-for="alias in item.aliases"
              :key="`${item.name}-${alias}`"
              class="rbvp-namespace-tag"
              :title="alias"
            >
              <span class="rbvp-namespace-tag-text">{{ alias }}</span>
              <button
                type="button"
                class="rbvp-namespace-tag-remove"
                title="移除别名"
                @click.stop="actions.removeNamespaceAlias(item, alias)"
              >
                <VIcon icon="close" :size="12" />
              </button>
            </span>
            <button
              v-if="aliasEditing !== item.name"
              type="button"
              class="rbvp-namespace-alias-add"
              title="添加别名"
              @click.stop="startAliasInput(item.name)"
            >
              <VIcon icon="mdi-plus" :size="16" />
              <span>添加别名</span>
            </button>
            <div v-if="aliasEditing === item.name" class="rbvp-namespace-alias-input-row">
              <TextBox
                ref="aliasInput"
                :text="aliasInputs[item.name] ?? ''"
                class="rbvp-namespace-alias-input"
                placeholder="添加别名"
                @change="setAliasInput(item.name, $event)"
                @keyup.enter.native="submitAlias(item)"
                @keyup.esc.native="cancelAliasInput(item.name)"
              />
              <VButton
                type="primary"
                icon
                class="rbvp-namespace-alias-confirm"
                title="确认"
                @click="submitAlias(item)"
              >
                <VIcon icon="mdi-check" :size="14" />
              </VButton>
              <VButton
                icon
                class="rbvp-namespace-alias-cancel"
                title="取消"
                @click="cancelAliasInput(item.name)"
              >
                <VIcon icon="close" :size="12" />
              </VButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { SwitchBox, TextBox, VButton, VIcon } from '@/ui'

export default Vue.extend({
  name: 'RBVPNamespacesTab',
  components: { SwitchBox, TextBox, VButton, VIcon },
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
  data() {
    return {
      aliasInputs: {} as Record<string, string>,
      aliasEditing: '' as string,
    }
  },
  methods: {
    submitAlias(item: { name: string }) {
      const value = (this.aliasInputs[item.name] ?? '').trim()
      if (!value) {
        return
      }
      this.actions.addNamespaceAlias(item, value)
      this.$set(this.aliasInputs, item.name, '')
      this.aliasEditing = ''
    },
    setAliasInput(name: string, value: string) {
      this.$set(this.aliasInputs, name, value)
    },
    startAliasInput(name: string) {
      this.aliasEditing = name
      if (!(name in this.aliasInputs)) {
        this.$set(this.aliasInputs, name, '')
      }
      this.$nextTick(() => {
        const ref = this.$refs.aliasInput as Vue[] | Vue | undefined
        const target = Array.isArray(ref) ? ref[0] : ref
        const focus = (target as { focus?: () => void } | undefined)?.focus
        if (typeof focus === 'function') {
          focus.call(target)
        }
      })
    },
    cancelAliasInput(name: string) {
      this.$set(this.aliasInputs, name, '')
      if (this.aliasEditing === name) {
        this.aliasEditing = ''
      }
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

.rbvp-namespace-description {
  line-height: 1.6;
}

.rbvp-namespace-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
}

.rbvp-namespace-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  background-color: rgb(127 127 127 / 10%);
  color: inherit;
  font-size: 12px;
  height: 28.5px;
  box-sizing: border-box;
  max-width: 100px;
  min-width: 0;
}

.rbvp-namespace-name-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  padding-right: 12px;
  border-radius: 999px;
  background-color: rgb(127 127 127 / 10%);
  color: inherit;
  font-size: 12px;
  height: 28.5px;
  box-sizing: border-box;
  max-width: 100%;
  min-width: 0;
}

.rbvp-namespace-name-flag {
  flex: 0 0 auto;
  padding: 2px 6px;
  border-radius: 999px;
  background-color: rgb(127 127 127 / 14%);
  font-size: 11px;
  opacity: 0.78;
}

.rbvp-namespace-name-lock {
  flex: 0 0 auto;
  opacity: 0.6;
}
.rbvp-namespace-tag-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.rbvp-namespace-name-tag .rbvp-namespace-tag-text {
  overflow: visible;
  text-overflow: clip;
}

.rbvp-namespace-tag-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 999px;
  padding: 0;
  width: 16px;
  height: 16px;
  background-color: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s ease-out;

  &:hover {
    opacity: 1;
  }
}

.rbvp-namespace-alias-input-row {
  display: flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  max-width: 100%;
  white-space: nowrap;
}

.rbvp-namespace-alias-input-row .rbvp-namespace-alias-input {
  flex: 0 0 160px;
  max-width: 100%;
}

.rbvp-namespace-alias-confirm,
.rbvp-namespace-alias-cancel {
  flex: 0 0 auto;
  width: 28.5px !important;
  height: 28.5px !important;
  min-width: 28.5px !important;
  min-height: 28.5px !important;
  padding: 0 !important;
}

.rbvp-namespace-alias-area {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rbvp-namespace-alias-add {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border: 1px dashed var(--theme-color);
  border-radius: 999px;
  background-color: var(--theme-color-10);
  color: var(--theme-color);
  cursor: pointer;
  height: 28.5px;
  box-sizing: border-box;
  transition: background-color 0.2s ease-out, border-color 0.2s ease-out;

  &:hover {
    background-color: var(--theme-color-20);
  }
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

.rbvp-namespace-empty {
  min-height: 220px;
}

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

@media (max-width: 900px) {
  .rbvp-namespace-header {
    flex-wrap: wrap;
  }
}
</style>
