<template>
  <span
    v-show="visible"
    id="dm-merger-count"
    class="dm-merger-count"
    :title="badgeTitle"
    @click="onClick"
  >
    <svg
      class="dm-merger-count__icon"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
    已合并 {{ totalCount }} 条
  </span>
</template>

<script lang="ts">
import { MERGER_COUNT_BADGE_EVENTS } from './contracts'

export default Vue.extend({
  name: 'MergerCountBadge',
  // 根实例挂载，外部状态由 vue-host 写入 $data
  data() {
    return {
      totalCount: 0,
      sourceCount: 0,
      visible: false,
    }
  },
  computed: {
    badgeTitle(): string {
      return `点击管理已合并的 ${this.sourceCount} 个弹幕源`
    },
  },
  methods: {
    onClick() {
      this.$emit(MERGER_COUNT_BADGE_EVENTS.OPEN)
    },
  },
})
</script>

<style scoped>
.dm-merger-count {
  color: #61666d;
  margin-left: 12px;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: color 0.3s;
}

.dm-merger-count:hover {
  color: #00aeec;
}

.dm-merger-count__icon {
  margin-right: 3px;
}
</style>
