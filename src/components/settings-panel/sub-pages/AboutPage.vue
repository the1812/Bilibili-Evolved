<template>
  <div class="be-about-page">
    <div class="be-about-page-header">
      <VIcon icon="mdi-information-outline" />
      <div class="title-text">关于</div>
    </div>
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
        <!-- <div class="meta-info-commit">
          Commit Hash: {{ meta.compilationInfo.commitHash.substring(0, 8) }}
        </div> -->
      </div>
      <div v-if="feedbackSupported" class="script-links">
        <a
          target="_blank"
          href="https://github.com/the1812/Bilibili-Evolved"
          class="homepage script-link"
        >
          <VButton>
            <VIcon icon="mdi-home-outline" :size="20" />
            主页
          </VButton>
        </a>
        <a
          target="_blank"
          href="https://github.com/the1812/Bilibili-Evolved/issues"
          class="feedback script-link"
        >
          <VButton>
            <VIcon icon="mdi-message-text-outline" :size="18" />
            反馈
          </VButton>
        </a>
        <a
          target="_blank"
          href="https://github.com/the1812/Bilibili-Evolved/releases"
          class="releases script-link"
        >
          <VButton>
            <VIcon icon="mdi-update" :size="20" />
            更新日志
          </VButton>
        </a>
        <a
          target="_blank"
          href="https://github.com/the1812/Bilibili-Evolved/blob/preview/doc/donate.md"
          class="donate script-link"
        >
          <VButton>
            <VIcon icon="mdi-heart-outline" :size="18" />
            捐赠
          </VButton>
        </a>
      </div>
      <div class="about-page-actions">
        <VButton
          v-for="action of aboutPageActions"
          :key="action.name"
          :disabled="action.disabled"
          class="about-page-action"
          @click="runAction(action, $event)"
        >
          <VIcon :icon="action.icon" :size="action.iconSize || 20" />
          {{ action.displayName }}
        </VButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { meta } from '@/core/meta'
import { formatDateTime } from '@/core/utils/formatters'
import { VButton, VIcon } from '@/ui'
import { AboutPageAction, aboutPageActions } from './about-page'

const feedbackSupported = (() => {
  const namespace = GM_info.scriptMetaStr.match(/@namespace\s*(.+)/)
  if (!namespace || !namespace[1]) {
    return true
  }
  if (namespace[1].includes('greasyfork')) {
    return false
  }
  return true
})()

export default Vue.extend({
  components: {
    VButton,
    VIcon,
  },
  data() {
    return {
      meta,
      aboutPageActions,
      feedbackSupported,
    }
  },
  methods: {
    formatDateTime,
    async runAction(action: AboutPageAction, event: MouseEvent) {
      action.disabled = true
      try {
        await action.run(event)
      } finally {
        action.disabled = false
      }
    },
  },
})
</script>

<style lang="scss">
@import 'common';

.be-about-page {
  flex: 1;
  &-header {
    @include h-center(6px);
    margin-bottom: 12px;
    .title-text {
      font-size: 16px;
      @include semi-bold();
      flex: 1 0 auto;
    }
  }
  &-content {
    @include v-stretch(24px);
    .script-meta-info {
      @include v-center(8px);
      text-align: center;
      padding: 0 24px;
      .meta-info {
        &-name {
          font-weight: 500;
          font-size: 22px;
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
      .script-link {
        @include h-stretch();
        .be-button {
          flex: 1;
        }
      }
    }
    .script-links,
    .about-page-actions {
      @include h-stretch(8px);
      flex-wrap: wrap;
      .script-link,
      .about-page-action {
        flex: 1 0 auto;
        .be-icon {
          margin-right: 6px;
        }
      }
    }
  }
}
</style>
