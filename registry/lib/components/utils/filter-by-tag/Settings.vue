<template>
  <div class="be-filter-by-tag-panel">
    <div class="be-filter-by-tag-section">屏蔽标签</div>
    <div class="be-filter-by-tag-add">
      <div class="be-filter-by-tag-input">
        <TextBox
          :text="newTag"
          placeholder="输入要屏蔽的标签"
          @change="onTagInput"
          @keyup.enter.native="addTag"
        />
      </div>
      <VButton class="be-filter-by-tag-button" @click="addTag">添加</VButton>
    </div>
    <div class="be-filter-by-tag-hint">
      默认按「包含」匹配, 填 <code>原神</code> 也会屏蔽 <code>原神·枫丹</code>; 需要精确控制时写成
      <code>/正则/</code>, 例如 <code>/^原神$/</code>。
    </div>
    <div class="be-filter-by-tag-list">
      <div v-for="tag in tags" :key="tag" class="be-filter-by-tag-item">
        <span class="be-filter-by-tag-name">{{ tag }}</span>
        <span class="be-filter-by-tag-remove" title="移除" @click="removeTag(tag)">
          <VIcon icon="mdi-close" :size="16"></VIcon>
        </span>
      </div>
      <div v-if="tags.length === 0" class="be-filter-by-tag-empty">还没有屏蔽任何标签</div>
    </div>
    <div class="be-filter-by-tag-bulk">
      <textarea
        v-model="bulkText"
        class="be-filter-by-tag-textarea"
        placeholder="批量导入标签: 每行一个"
      ></textarea>
      <div class="be-filter-by-tag-bulk-actions">
        <VButton class="be-filter-by-tag-button" @click="importBulk">导入</VButton>
        <VButton class="be-filter-by-tag-button" @click="exportAll">复制全部</VButton>
        <VButton class="be-filter-by-tag-button" @click="clearTags">清空</VButton>
      </div>
    </div>

    <div class="be-filter-by-tag-section">屏蔽分类</div>
    <div class="be-filter-by-tag-hint">在首页推荐流、搜索页和视频页右侧相关推荐里生效。</div>
    <div class="be-filter-by-tag-types">
      <label v-for="category in categories" :key="category.id" class="be-filter-by-tag-type">
        <input
          type="checkbox"
          :checked="types.includes(category.id)"
          @change="toggleType(category.id, $event)"
        />
        <span>{{ category.displayName }}</span>
      </label>
    </div>

    <div class="be-filter-by-tag-section">UP 主白名单 (只对直播生效)</div>
    <div class="be-filter-by-tag-add">
      <div class="be-filter-by-tag-input">
        <TextBox
          :text="newUp"
          placeholder="输入 UP 主名称"
          @change="onUpInput"
          @keyup.enter.native="addUp"
        />
      </div>
      <VButton class="be-filter-by-tag-button" @click="addUp">添加</VButton>
    </div>
    <div class="be-filter-by-tag-hint">
      白名单内的 UP 主开启直播时, 即使勾选了「直播」也不会被屏蔽。
    </div>
    <div class="be-filter-by-tag-list">
      <div v-for="up in whitelist" :key="up" class="be-filter-by-tag-item">
        <span class="be-filter-by-tag-name">{{ up }}</span>
        <span class="be-filter-by-tag-remove" title="移除" @click="removeUp(up)">
          <VIcon icon="mdi-close" :size="16"></VIcon>
        </span>
      </div>
      <div v-if="whitelist.length === 0" class="be-filter-by-tag-empty">还没有添加白名单</div>
    </div>

    <div v-if="status" class="be-filter-by-tag-status">{{ status }}</div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { addComponentListener, removeComponentListener } from '@/core/settings'
import { TextBox, VButton, VIcon } from '@/ui'
import { BLOCK_CATEGORIES, COMPONENT_NAME, getFilterOptions } from './common'

const options = () => getFilterOptions()

const toArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((it): it is string => typeof it === 'string') : []

const categories = BLOCK_CATEGORIES
const tags = ref(toArray(options().blockedTags))
const types = ref(toArray(options().blockedTypes))
const whitelist = ref(toArray(options().whitelist))
const newTag = ref('')
const newUp = ref('')
const bulkText = ref('')
const status = ref('')

const saveTags = (next: string[]) => {
  tags.value = next
  options().blockedTags = [...next]
}

const saveTypes = (next: string[]) => {
  types.value = next
  options().blockedTypes = [...next]
}

const saveWhitelist = (next: string[]) => {
  whitelist.value = next
  options().whitelist = [...next]
}

const onTagInput = (value: string) => {
  newTag.value = value
}

const onUpInput = (value: string) => {
  newUp.value = value
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag.length === 0) {
    return
  }
  newTag.value = ''
  if (tags.value.includes(tag)) {
    status.value = `「${tag}」已经在列表里了`
    return
  }
  saveTags([...tags.value, tag])
  status.value = `已添加「${tag}」`
}

const removeTag = (tag: string) => {
  saveTags(tags.value.filter(it => it !== tag))
  status.value = `已移除「${tag}」`
}

const toggleType = (id: string, event: Event) => {
  const checked = Boolean((event.target as HTMLInputElement | null)?.checked)
  const next = checked
    ? Array.from(new Set([...types.value, id]))
    : types.value.filter(it => it !== id)
  saveTypes(next)
  const name = BLOCK_CATEGORIES.find(category => category.id === id)?.displayName ?? id
  status.value = checked ? `已屏蔽分类「${name}」` : `已取消屏蔽分类「${name}」`
}

const addUp = () => {
  const up = newUp.value.trim()
  if (up.length === 0) {
    return
  }
  newUp.value = ''
  if (whitelist.value.includes(up)) {
    status.value = `「${up}」已经在白名单里了`
    return
  }
  saveWhitelist([...whitelist.value, up])
  status.value = `已把「${up}」加入白名单`
}

const removeUp = (up: string) => {
  saveWhitelist(whitelist.value.filter(it => it !== up))
  status.value = `已把「${up}」移出白名单`
}

const importBulk = () => {
  const incoming = bulkText.value
    .split('\n')
    .map(it => it.trim())
    .filter(it => it.length > 0)
  if (incoming.length === 0) {
    status.value = '没有可导入的内容'
    return
  }
  const merged = Array.from(new Set([...tags.value, ...incoming]))
  const added = merged.length - tags.value.length
  saveTags(merged)
  bulkText.value = ''
  status.value = `导入完成, 新增 ${added} 项, 当前共 ${merged.length} 项`
}

const exportAll = async () => {
  const text = tags.value.join('\n')
  if (text.length === 0) {
    status.value = '列表为空, 没有可复制的内容'
    return
  }
  try {
    await navigator.clipboard.writeText(text)
    status.value = `已复制 ${tags.value.length} 项到剪贴板`
  } catch {
    bulkText.value = text
    status.value = '复制到剪贴板失败, 已填入下方文本框, 请手动复制'
  }
}

const clearTags = () => {
  if (tags.value.length === 0) {
    return
  }
  saveTags([])
  status.value = '已清空屏蔽列表'
}

const listeners = [
  {
    name: 'blockedTags',
    fn: (value: unknown) => {
      tags.value = toArray(value)
    },
  },
  {
    name: 'blockedTypes',
    fn: (value: unknown) => {
      types.value = toArray(value)
    },
  },
  {
    name: 'whitelist',
    fn: (value: unknown) => {
      whitelist.value = toArray(value)
    },
  },
]

onMounted(() => {
  listeners.forEach(({ name, fn }) => addComponentListener(`${COMPONENT_NAME}.${name}`, fn))
})

onBeforeUnmount(() => {
  listeners.forEach(({ name, fn }) => removeComponentListener(`${COMPONENT_NAME}.${name}`, fn))
})
</script>

<style lang="scss">
.be-filter-by-tag-panel {
  display: flex;
  flex-direction: column;
  padding: 8px 4px;
  font-size: 14px;
}
.be-filter-by-tag-section {
  margin: 12px 0 6px;
  font-weight: bold;
  &:first-child {
    margin-top: 0;
  }
}
.be-filter-by-tag-add {
  display: flex;
  align-items: center;
}
.be-filter-by-tag-input {
  flex-grow: 1;
  margin-right: 8px;
}
.be-filter-by-tag-button {
  flex-shrink: 0;
  margin: 4px;
}
.be-filter-by-tag-hint {
  margin: 6px 0;
  font-size: 12px;
  line-height: 1.5;
  opacity: 0.7;
  code {
    padding: 0 3px;
    border-radius: 3px;
    background-color: rgba(127, 127, 127, 0.2);
  }
}
.be-filter-by-tag-types {
  display: flex;
  flex-wrap: wrap;
}
.be-filter-by-tag-type {
  display: flex;
  align-items: center;
  margin: 4px 16px 4px 0;
  cursor: pointer;
  input {
    margin-right: 6px;
    cursor: pointer;
  }
}
.be-filter-by-tag-list {
  display: flex;
  flex-wrap: wrap;
  margin: 4px 0;
}
.be-filter-by-tag-item {
  display: flex;
  align-items: center;
  margin: 4px 8px 4px 0;
  padding: 2px 6px 2px 10px;
  border: 1px solid rgba(127, 127, 127, 0.4);
  border-radius: 12px;
}
.be-filter-by-tag-name {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.be-filter-by-tag-remove {
  display: flex;
  align-items: center;
  margin-left: 4px;
  cursor: pointer;
  opacity: 0.6;
  &:hover {
    opacity: 1;
  }
}
.be-filter-by-tag-empty {
  opacity: 0.6;
}
.be-filter-by-tag-bulk {
  display: flex;
  flex-direction: column;
  margin-top: 6px;
}
.be-filter-by-tag-textarea {
  box-sizing: border-box;
  width: 100%;
  height: 72px;
  padding: 6px;
  border: 1px solid rgba(127, 127, 127, 0.4);
  border-radius: 4px;
  background-color: transparent;
  color: inherit;
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
}
.be-filter-by-tag-bulk-actions {
  display: flex;
  align-items: center;
}
.be-filter-by-tag-status {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.7;
}
</style>
