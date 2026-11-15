<template>
  <div class="be-about-page">
    <div class="be-about-page-content">
      <div class="script-meta-info">
        <div class="meta-info-name">
          {{ meta.name }}
        </div>
        <div class="meta-info-version">
          {{ meta.compilationInfo.versionWithTag }}
        </div>
        <div class="meta-info-description">
          {{ meta.description }}
        </div>
      </div>
      <div class="script-links">
        <a
          target="_blank"
          href="https://github.com/the1812/Bilibili-Evolved"
          class="homepage script-link"
          title="主页"
        >
          <VButton type="transparent" icon>
            <VIcon icon="mdi-home-outline" :size="20" />
          </VButton>
        </a>
        <VButton
          v-if="feedbackSupported"
          type="transparent"
          icon
          class="feedback"
          title="反馈"
          @click="openFeedback()"
        >
          <VIcon icon="mdi-message-text-outline" :size="18" />
        </VButton>
        <a
          target="_blank"
          href="https://github.com/the1812/Bilibili-Evolved/releases"
          class="releases script-link"
          title="更新日志"
        >
          <VButton type="transparent" icon>
            <VIcon icon="mdi-update" :size="20" />
          </VButton>
        </a>
        <a
          target="_blank"
          href="https://github.com/the1812/Bilibili-Evolved/blob/preview/doc/donate.md"
          class="donate script-link"
          title="捐赠"
        >
          <VButton type="transparent" icon>
            <VIcon icon="mdi-heart-outline" :size="20" />
          </VButton>
        </a>
      </div>
      <div class="about-page-actions">
        <div class="about-page-action-buttons">
          <VButton
            v-for="action of actions"
            :key="action.name"
            :disabled="action.disabled || runningActions.includes(action.name)"
            class="about-page-action"
            @click="runAction(action, $event)"
          >
            <VIcon :icon="action.icon" :size="action.iconSize || 20" />
            {{ action.displayName }}
          </VButton>
        </div>
        <div class="tip">导出设置的文件命名格式可在通用设置中修改</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { meta } from '@/core/meta'
import { VButton, VIcon } from '@/ui'
import { feedbackSupported, openFeedback } from '../feedback'
import { aboutPageActions, type AboutPageAction } from './about-page'

const actions = ref(aboutPageActions)
const runningActions = ref<string[]>([])
const runAction = async (action: AboutPageAction, event: MouseEvent) => {
  if (action.disabled || runningActions.value.includes(action.name)) {
    return
  }
  runningActions.value.push(action.name)
  try {
    await action.run(event)
  } finally {
    runningActions.value = runningActions.value.filter(name => name !== action.name)
  }
}
</script>

<style lang="scss">
@import 'common';

.be-about-page {
  flex: 1;
  position: relative;
  box-sizing: border-box;
  min-height: 100%;
  padding: 28px 12px;
  border-radius: inherit;
  @include v-stretch();
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: url('./about-hexagons.svg?inline') repeat center;
    mask-image: linear-gradient(#000, transparent 50%, #000);
    pointer-events: none;
  }
  &-content {
    position: relative;
    margin-block: auto;
    @include v-stretch(12px);
    .script-meta-info {
      @include v-center(8px);
      text-align: center;
      padding: 0 24px;
      .meta-info {
        &-name {
          font-weight: 500;
          font-size: 18px;
        }
        &-version {
          font-size: 14px;
          color: var(--theme-color);
        }
        &-description {
          opacity: 0.5;
        }
      }
    }
    .script-links {
      @include h-center(4px);
      justify-content: center;
      .script-link {
        text-decoration: none;
      }
      .feedback .be-icon {
        transform: translateY(1px);
      }
    }
    .about-page-actions {
      @include v-stretch(8px);
    }
    .about-page-action-buttons {
      @include h-stretch(8px);
      flex-wrap: wrap;
      .about-page-action {
        flex: 1 0 auto;
        .be-icon {
          margin-right: 6px;
        }
      }
    }
  }
  .tip {
    text-align: center;
    opacity: 0.5;
  }
}
</style>
