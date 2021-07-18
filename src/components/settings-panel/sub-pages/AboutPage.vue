<template>
  <div class="be-about-page">
    <div class="be-about-page-header">
      <VIcon icon="mdi-information-outline" />
      <div class="title-text">
        关于
      </div>
    </div>
    <div class="be-about-page-content">
      <div class="script-meta-info">
        <div class="meta-info-name">
          {{ meta.name }}
        </div>
        <div class="meta-info-version">
          v{{ meta.version }}
        </div>
        <div class="meta-info-description">
          {{ meta.description }}
        </div>
        <div class="meta-info-commit">
          Commit Hash: {{ meta.compilationInfo.commitHash.substring(0, 8) }}
        </div>
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
import {
  VButton,
  VIcon,
} from '@/ui'
import { AboutPageAction, aboutPageActions } from './about-page'

export default Vue.extend({
  components: {
    VButton,
    VIcon,
  },
  data() {
    return {
      meta,
      aboutPageActions,
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
@import "common";

.be-about-page {
  flex: 1;
  &-header {
    @include h-center(6px);
    margin-bottom: 12px;
    .title-text {
      font-size: 16px;
      font-weight: bold;
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
          opacity: .5;
        }
      }
    }
    .about-page-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      .about-page-action {
        .be-icon {
          margin-right: 6px;
        }
      }
    }
  }
}
</style>
