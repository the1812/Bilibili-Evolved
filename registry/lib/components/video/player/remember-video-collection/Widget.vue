<template>
  <div class="be-remember-episodes">
    <div class="title">记忆合集</div>
    <div v-if="hasRecord" class="resume-info">
      <div class="resume-label">续播点：</div>
      <div class="resume-target" :title="resumeTargetFull">{{ resumeTargetDesc }}</div>
    </div>
    <div v-else class="no-record">当前合集无记忆</div>
    <div class="actions">
      <AsyncButton :disabled="!hasRecord" title="跳转续播" @click="jumpToResume">
        <VIcon icon="mdi-play-circle-outline" :size="14" />
        跳转续播
      </AsyncButton>
      <AsyncButton :disabled="!hasRecord" title="清空记忆" @click="clearMemory">
        <VIcon icon="mdi-delete-sweep-outline" :size="14" />
        清空记忆
      </AsyncButton>
    </div>
  </div>
</template>
<script lang="ts">
import { AsyncButton, VIcon } from '@/ui'
import { getComponentSettings } from '@/core/settings'
import { Toast } from '@/core/toast'
import { getRememberState, jumpToEpisode, memoryUpdate$, clearSeasonMemory } from './shared'
import type { RememberOptions } from './shared'

const { options } = getComponentSettings<RememberOptions>('rememberEpisodes')

export default Vue.extend({
  components: {
    AsyncButton,
    VIcon,
  },
  data() {
    return {
      hasRecord: false,
      resumeTargetDesc: '',
      resumeTargetFull: '',
      unsubscribe: null as (() => void) | null,
    }
  },
  created() {
    this.updateRecordInfo()
    // 使用 mini-rxjs 的 Subject 订阅记忆更新事件
    this.unsubscribe = memoryUpdate$.subscribe(() => {
      this.updateRecordInfo()
    })
  },
  beforeDestroy() {
    // 取消订阅
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  },
  methods: {
    updateRecordInfo() {
      const rememberState = getRememberState()
      if (!rememberState) {
        this.hasRecord = false
        this.resumeTargetDesc = ''
        this.resumeTargetFull = ''
        return
      }
      const seasonRecord = options.seasonMap[rememberState.seasonId]
      if (!seasonRecord) {
        this.hasRecord = false
        this.resumeTargetDesc = ''
        this.resumeTargetFull = ''
        return
      }

      this.hasRecord = true

      // 计算续播目标描述
      const { lastBvid, lastPage, nextBvid, nextPage } = seasonRecord
      const targetBvid = options.resumeNext && nextBvid ? nextBvid : lastBvid
      const targetPage = options.resumeNext && nextPage ? nextPage : lastPage

      const targetEpisode = rememberState.episodes.find(it => it.bvid === targetBvid)
      const targetTitle = targetEpisode?.title ?? targetBvid

      this.resumeTargetDesc = targetPage > 1 ? `${targetTitle} P${targetPage}` : targetTitle
      this.resumeTargetFull = options.resumeNext
        ? `T+1 模式：将跳转到 ${this.resumeTargetDesc}`
        : `将跳转到 ${this.resumeTargetDesc}`
    },
    async jumpToResume() {
      const rememberState = getRememberState()
      if (!rememberState) {
        return
      }
      const seasonRecord = options.seasonMap[rememberState.seasonId]
      if (!seasonRecord) {
        return
      }

      const { lastBvid, lastPage, nextBvid, nextPage } = seasonRecord
      const targetBvid = options.resumeNext && nextBvid ? nextBvid : lastBvid
      const targetPage = options.resumeNext && nextPage ? nextPage : lastPage

      const ok = await jumpToEpisode(targetBvid, targetPage)
      if (ok) {
        const targetEpisode = rememberState.episodes.find(it => it.bvid === targetBvid)
        const targetTitle = targetEpisode?.title ?? targetBvid
        const targetDesc = targetPage > 1 ? `${targetTitle} P${targetPage}` : targetTitle
        Toast.success(`已跳转到：${targetDesc}`, '记忆合集', 2000)
      }
    },
    clearMemory() {
      const success = clearSeasonMemory(options)
      if (success) {
        this.hasRecord = false
        this.resumeTargetDesc = ''
        this.resumeTargetFull = ''
        Toast.success('已清空当前合集的观看记忆', '记忆合集', 2000)
      }
    },
  },
})
</script>
<style lang="scss" scoped>
@import 'common';

.be-remember-episodes {
  box-shadow: 0 0 0 1px #8884;
  order: -2;
  border-radius: 4px;
  padding: 6px 6px 6px 10px;
  @include v-stretch(6px);
  body.dark & {
    background-color: var(--be-color-card-bg, #333);
  }
  .title {
    @include semi-bold();
  }
  .resume-info {
    @include h-center(4px);
    font-size: 12px;
    .resume-label {
      color: #888;
    }
    .resume-target {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .no-record {
    font-size: 12px;
    color: #888;
  }
  .actions {
    @include h-center(6px);
    .be-button {
      padding-left: 4px;
      .be-icon {
        margin-right: 4px;
      }
    }
  }
}
</style>
