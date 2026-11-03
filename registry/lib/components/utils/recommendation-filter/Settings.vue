<template>
  <div class="be-recommendation-filter-settings">
    <template v-if="props.page === 'settings'">
      <section class="filter-section">
        <strong>窗口大小</strong>
        <div class="rf-size-fields">
          <label
            >宽度（px）<input
              v-model.number="form.windowWidth"
              type="number"
              min="640"
              max="2000"
              step="20"
              aria-label="窗口宽度"
              @change="save('windowWidth')"
          /></label>
          <label
            >高度（px）<input
              v-model.number="form.windowHeight"
              type="number"
              min="420"
              max="1400"
              step="20"
              aria-label="窗口高度"
              @change="save('windowHeight')"
          /></label>
        </div>
        <button type="button" @click="resetWindow">恢复默认窗口</button>
      </section>
      <section class="filter-section">
        <label
          ><input
            :checked="state.showFiltered"
            type="checkbox"
            @change="togglePreview"
          />临时显示已过滤内容与原因</label
        >
      </section>
    </template>
    <template v-else>
      <section class="filter-section">
        <label
          ><input
            v-model="form.followedExempt"
            type="checkbox"
            @change="save('followedExempt')"
          />已关注豁免（仅首页）</label
        >
      </section>
      <section class="filter-section">
        <label
          ><input
            v-model="form.durationEnabled"
            type="checkbox"
            @change="save('durationEnabled')"
          />过滤时长低于</label
        >
        <div class="filter-row">
          <input
            v-model.number="form.minimumMinutes"
            type="number"
            min="0"
            step="1"
            aria-label="最低时长分钟"
            @change="save('minimumMinutes')"
          />分
          <input
            v-model.number="form.minimumSeconds"
            type="number"
            min="0"
            max="59"
            step="1"
            aria-label="最低时长秒"
            @change="save('minimumSeconds')"
          />秒
        </div>
      </section>
      <section class="filter-section">
        <label
          ><input
            v-model="form.viewsEnabled"
            type="checkbox"
            @change="save('viewsEnabled')"
          />过滤播放量低于</label
        >
        <div class="filter-row">
          <input
            v-model.number="form.minimumViews"
            type="number"
            min="0"
            step="1"
            aria-label="最低播放量"
            @change="save('minimumViews')"
          />次
        </div>
      </section>
      <section class="filter-section">
        <label
          ><input
            v-model="form.ageEnabled"
            type="checkbox"
            @change="save('ageEnabled')"
          />过滤过旧视频（仅首页）</label
        >
        <div class="filter-row">
          发布超过<input
            v-model.number="form.maximumAgeDays"
            type="number"
            min="1"
            step="1"
            aria-label="最大发布天数"
            @change="save('maximumAgeDays')"
          />天
        </div>
      </section>
    </template>
  </div>
</template>
<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { addComponentListener, removeComponentListener } from '@/core/settings'
import { getOptions, setShowFiltered, uiState } from './runtime'
import { componentName } from './options'

const fields = [
  'windowWidth',
  'windowHeight',
  'followedExempt',
  'durationEnabled',
  'minimumMinutes',
  'minimumSeconds',
  'viewsEnabled',
  'minimumViews',
  'ageEnabled',
  'maximumAgeDays',
] as const

const copyOptions = () => Object.fromEntries(fields.map(key => [key, getOptions()[key]]))

const props = defineProps({ page: { type: String, default: 'rules' } })
const emit = defineEmits(['reset-window'])
const form = ref(copyOptions())
const state = uiState

function syncForm() {
  form.value = copyOptions()
}

function save(key: (typeof fields)[number]) {
  const target: Record<string, unknown> = getOptions()
  target[key] = form.value[key]
  syncForm()
}

function resetWindow() {
  getOptions().windowWidth = 960
  getOptions().windowHeight = 760
  emit('reset-window')
}

function togglePreview(event: Event) {
  setShowFiltered((event.target as HTMLInputElement).checked)
}

fields.forEach(key => addComponentListener(`${componentName}.${key}`, syncForm))

onBeforeUnmount(() => {
  fields.forEach(key => removeComponentListener(`${componentName}.${key}`, syncForm))
})
</script>
