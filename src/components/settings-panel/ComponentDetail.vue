<template>
  <div class="component-detail">
    <div v-if="!settings" class="component-not-found">
      未找到组件'{{ componentData.displayName }}' ({{ componentData.name }}), 可能已被卸载.
    </div>
    <template v-if="settings">
      <div class="component-detail-header">
        <div class="display-name">
          {{ componentData.displayName }}
        </div>
        <div class="component-detail-header-actions">
          <MiniToast
            v-if="menuActions.length > 0"
            placement="bottom-end"
            trigger="click"
            class="extra-actions-wrapper"
          >
            <div class="extra-actions">
              <VIcon icon="mdi-dots-vertical" :size="18" />
            </div>
            <template #toast>
              <div class="extra-actions-list">
                <div v-for="action of menuActions" :key="action.name">
                  <component
                    :is="action.component"
                    v-if="'component' in action"
                    :item="action"
                    :component="componentData"
                  />
                  <ComponentAction v-else :item="action" :component="componentData" />
                </div>
              </div>
            </template>
          </MiniToast>
          <VIcon class="close" icon="close" :size="18" @click="emit('close')" />
        </div>
      </div>
      <div class="component-detail-tags">
        <div v-for="t of componentData.tags" :key="t.name" class="tag">
          <div class="tag-color" :style="{ backgroundColor: t.color }"></div>
          {{ t.displayName }}
        </div>
      </div>
      <div v-if="actionButtons.length > 0" class="component-detail-operations">
        <template v-for="action of actionButtons">
          <component
            :is="action.component"
            v-if="'component' in action"
            :key="action.name"
            :item="action"
            :component="componentData"
          />
          <AsyncButton
            v-else
            :key="action.name"
            :title="action.title"
            @click="action.action(componentData)"
          >
            <VIcon :icon="action.icon" :size="16" />
            {{ action.displayName }}
          </AsyncButton>
        </template>
      </div>
      <div
        v-if="componentData.author || componentData.commitHash || devMode"
        class="component-detail-internal-data"
      >
        <FeatureAuthors
          :author="componentData.author"
          class="component-detail-feature-authors component-detail-metadata-row"
        />
        <div
          v-if="componentData.commitHash"
          class="component-detail-commit component-detail-metadata-row"
        >
          <VIcon icon="mdi-source-commit" :size="16" title="Commit" />
          <span>{{ commitLabel }}</span>
          <VIcon
            v-if="commitWarning"
            class="commit-warning"
            icon="mdi-alert-circle-outline"
            :size="14"
            :title="commitWarning"
          />
        </div>
        <div v-if="devMode" class="component-detail-internal-name component-detail-metadata-row">
          <VIcon icon="mdi-code-braces" :size="14" title="内部名称" />
          <span>{{ componentData.name }}</span>
        </div>
      </div>
      <div class="component-detail-separator"></div>
      <template
        v-if="(componentData.options && generatedOptions.length > 0) || componentData.extraOptions"
      >
        <div class="component-detail-options">
          <div class="component-detail-options-title">选项</div>
          <div v-for="[name, option] of generatedOptions" :key="name" class="generated-option">
            <ComponentOption
              :name="name"
              :display-name="option.displayName"
              :option="option"
              :component="componentData"
            ></ComponentOption>
          </div>
          <div v-if="componentData.extraOptions" class="extra-option">
            <component :is="componentData.extraOptions" :component-data="componentData"></component>
          </div>
          <slot></slot>
        </div>
        <div class="component-detail-separator"></div>
      </template>
      <template v-if="!(componentData.options && !componentData.description)">
        <ComponentDescription
          class="component-detail-description"
          :component-data="componentData"
        />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { AsyncButton, VIcon, MiniToast } from '@/ui'
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'
import { getFeatureUrl } from '@/core/feature-source'
import { matchingUpdateBranches, meta } from '@/core/meta'
import type { AutoUpdateOptions } from '../auto-update'
import type { ComponentMetadata } from '../component'
import ComponentDescription from './ComponentDescription.vue'
import ComponentOption from './ComponentOption.vue'
import FeatureAuthors from './FeatureAuthors.vue'
import {
  componentActions,
  componentActionButtons,
  ComponentAction as ActionFactory,
} from './component-actions/component-actions'
import ComponentAction from './component-actions/ComponentAction.vue'

const props = defineProps<{ componentData: ComponentMetadata }>()
const emit = defineEmits<{ (event: 'close' | 'mounted'): void }>()
const settings = computed(() => getComponentSettings(props.componentData))
const getVisibleActions = (factories: ActionFactory[]) => {
  if (props.componentData.configurable === false) {
    return []
  }
  return factories
    .map(factory => factory(props.componentData))
    .filter(action => action && (!('visible' in action) || action.visible !== false))
}
const menuActions = computed(() => getVisibleActions(componentActions))
const actionButtons = computed(() => getVisibleActions(componentActionButtons))
const devMode = ref(false)
const updateDevMode = (enabled: boolean) => {
  devMode.value = enabled
}
addComponentListener('settingsPanel.devMode', updateDevMode, true)
onUnmounted(() => removeComponentListener('settingsPanel.devMode', updateDevMode))
const generatedOptions = computed(() =>
  Object.entries(props.componentData.options ?? {}).filter(([, option]) => !option.hidden),
)
const updateSource = computed(() => {
  const { options } = getComponentSettings<AutoUpdateOptions>('autoUpdate')
  return options.urls.components[props.componentData.name]?.source
})
const githubRef = computed(() =>
  updateSource.value?.kind === 'github' ? updateSource.value.ref : undefined,
)
const commitLabel = computed(() => {
  const hash = props.componentData.commitHash?.substring(0, 9)
  return githubRef.value ? `${hash} (${githubRef.value})` : hash
})
const commitWarning = computed(() => {
  const url = getFeatureUrl(updateSource.value)
  if (/^http:\/\/localhost:\d+\/registry\/dist\/components\/.+\.js$/.test(url)) {
    return '当前组件的更新地址是本地开发链接, 不会随着检查更新而更新'
  }
  const { branch } = meta.compilationInfo
  const sourceBranch = githubRef.value
  if (
    sourceBranch &&
    sourceBranch !== branch &&
    !matchingUpdateBranches.get(branch)?.includes(sourceBranch)
  ) {
    return `当前本体分支为 ${branch}, 组件更新源分支为 ${sourceBranch}`
  }
  return undefined
})

onMounted(async () => {
  await nextTick()
  emit('mounted')
})
</script>

<style lang="scss">
@import 'common';

.component-detail {
  min-width: 264px;
  width: 264px;
  flex: 1;
  background-color: inherit;
  border-radius: 7px;
  overflow: auto;
  overscroll-behavior: contain;
  @include v-stretch();

  .extra-option {
    display: flow-root;
  }
  &-separator {
    height: 1px;
    border-bottom: 1px solid #8882;
    margin: 8px 0;
    flex-shrink: 0;
    align-self: stretch;
    box-sizing: border-box;
  }
  &-header {
    @include h-center(8px);
    justify-content: space-between;
    padding: 12px;
    background-color: inherit;
    position: sticky;
    top: 0;
    z-index: 2;

    .display-name {
      @include semi-bold();
      font-size: 16px;
    }
    &-actions {
      @include h-center(4px);
      flex-shrink: 0;
    }
    .close {
      cursor: pointer;
      &:hover {
        color: var(--theme-color);
      }
    }
    .extra-actions {
      cursor: pointer;
    }
    .extra-actions-list {
      width: max-content;
    }
    .tippy-content {
      padding: 4px;
    }
  }
  &-description {
    padding: 0 12px 6px;
  }
  &-tags {
    @include h-center();
    flex-wrap: wrap;
    padding: 0 8px 8px;
    .tag {
      @include h-center();
      @include card();
      @include round-bar(24);
      padding: 2px 6px;
      margin-right: 4px;
      margin-bottom: 4px;
      font-size: 12px;
      box-shadow: none;
      .tag-color {
        border-radius: 50%;
        width: 12px;
        height: 12px;
        margin-right: 4px;
      }
    }
  }
  &-internal-data {
    padding: 0 12px 0;
    color: var(--be-color-muted, #888);
    line-height: 20px;
    .component-detail-metadata-row {
      @include h-center(2px);
      transform: translateX(-2px);
    }
    .component-detail-internal-name > .be-icon {
      box-sizing: content-box;
      padding: 1px;
    }
    .commit-warning {
      color: #ff9800;
    }
  }
  &-operations {
    @include h-stretch(8px);
    flex-wrap: wrap;
    padding: 0 12px 8px;
    > * {
      flex: 1 0 auto;
      .be-icon {
        margin-right: 6px;
      }
    }
    &:empty {
      display: none;
    }
  }
  &-options {
    padding: 8px 12px;
    // flex: 1 0 0;
    // height: 0;
    // @include no-scrollbar();

    .component-detail-options-title {
      @include semi-bold();
      font-size: 14px;
      margin-bottom: 8px;
    }
    .generated-option:not(:last-child) {
      margin-bottom: 4px;
    }
  }
}
</style>
