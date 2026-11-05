<template>
  <div class="rf-keyword-manager">
    <div class="rf-keyword-toolbar">
      <div class="rf-group-count">
        {{ generalGroup.keywords.filter(word => word.trim()).length }} 个通用词
        <span>{{ customGroups.length }} 个组合组</span>
      </div>
      <button type="button" @click="beginImport">批量添加</button>
      <button type="button" class="rf-primary" @click="addGroup">＋ 新建组合组</button>
    </div>
    <div class="rf-workspace">
      <aside class="rf-group-sidebar">
        <div class="rf-pinned-group">
          <button
            type="button"
            class="rf-group-item"
            :class="{ selected: selectedIsGeneral && !importing && !cardTitle }"
            :aria-current="selectedIsGeneral && !importing && !cardTitle ? 'true' : null"
            @click="selectGroup(generalId)"
          >
            <div>
              <strong>{{ generalName }}</strong>
              <span class="rf-status" :class="{ enabled: generalGroup.enabled }">{{
                generalGroup.enabled ? '启用' : '停用'
              }}</span>
            </div>
            <p>任一匹配</p>
          </button>
        </div>
        <div class="rf-group-search">
          <input v-model="query" type="search" aria-label="搜索关键词组" placeholder="搜索组合组" />
          <select v-model="status" aria-label="筛选关键词组状态">
            <option value="all">全部状态</option>
            <option value="enabled">已启用</option>
            <option value="disabled">已停用</option>
          </select>
        </div>
        <div class="rf-group-list" aria-label="关键词组列表">
          <button
            v-for="entry in pageEntries"
            :key="entry.group.id"
            type="button"
            class="rf-group-item"
            :class="{ selected: selectedId === entry.group.id && !importing && !cardTitle }"
            :aria-current="
              selectedId === entry.group.id && !importing && !cardTitle ? 'true' : null
            "
            @click="selectGroup(entry.group.id)"
          >
            <div>
              <strong>{{ entry.group.name || `第 ${entry.index + 1} 组` }}</strong
              ><span class="rf-status" :class="{ enabled: entry.group.enabled }">{{
                entry.group.enabled ? '启用' : '停用'
              }}</span>
            </div>
            <p>
              {{ entry.group.keywords.filter(word => word.trim()).join(' ＋ ') || '暂无关键词' }}
            </p>
          </button>
          <div v-if="!filtered.length" class="rf-empty">
            {{ customGroups.length ? '没有匹配的组合组' : '还没有组合组' }}
          </div>
        </div>
        <div class="rf-pagination">
          <button type="button" aria-label="上一页关键词组" :disabled="page <= 1" @click="page--">
            上一页</button
          ><span>{{ page }} / {{ pageCount }} · {{ filtered.length }} 组</span
          ><button
            type="button"
            aria-label="下一页关键词组"
            :disabled="page >= pageCount"
            @click="page++"
          >
            下一页
          </button>
        </div>
      </aside>
      <section v-if="cardTitle" class="rf-group-editor">
        <div class="rf-editor-heading">
          <h3>导入过滤词</h3>
          <button type="button" @click="cardTitle = ''">取消</button>
        </div>
        <p class="rf-source-title">{{ cardTitle }}</p>
        <label class="rf-field-label rf-import-word"
          >过滤词<input
            ref="importWord"
            v-model="cardWord"
            type="text"
            aria-label="导入的过滤词"
            placeholder="输入要过滤的标题内容"
            @keydown.enter.prevent="importCardWord"
        /></label>
        <button
          type="button"
          class="rf-primary"
          :disabled="!cardWord.trim()"
          @click="importCardWord"
        >
          加入通用过滤
        </button>
      </section>
      <section v-else-if="importing" class="rf-group-editor">
        <div class="rf-editor-heading">
          <h3>批量添加</h3>
          <button type="button" @click="importing = false">返回</button>
        </div>
        <p class="rf-help">每行一个通用词；用 | 连接需要同时匹配的词。</p>
        <textarea
          v-model="bulkText"
          aria-label="批量关键词组"
          placeholder="游戏 | 抽卡&#10;影视 | 解说&#10;关键词"
          spellcheck="false"
        ></textarea>
        <div class="rf-import-actions">
          <span>{{ importWordCount }} 个通用词 · {{ importGroupCount }} 个组合组</span
          ><button
            type="button"
            class="rf-primary"
            :disabled="!parsedGroups.length"
            @click="importGroups"
          >
            添加
          </button>
        </div>
      </section>
      <section v-else-if="selectedIsGeneral" class="rf-group-editor rf-general-editor">
        <div class="rf-editor-heading">
          <h3>{{ generalName }}</h3>
          <label class="rf-enabled-toggle"
            ><input v-model="generalGroup.enabled" type="checkbox" @change="queueSave" />启用</label
          >
        </div>
        <p class="rf-help">命中任一关键词即过滤</p>
        <form class="rf-general-add" @submit.prevent="addGeneralWord">
          <input
            v-model="newGeneralWord"
            type="text"
            aria-label="新增通用过滤词"
            placeholder="输入过滤词"
          />
          <button type="submit" :disabled="!newGeneralWord.trim()">＋ 添加</button>
        </form>
        <div class="rf-general-cards" role="list" aria-label="通用过滤词">
          <div
            v-for="(word, index) in generalGroup.keywords"
            :key="word"
            class="rf-general-card"
            :class="{ editing: editingGeneralIndex === index }"
            role="listitem"
          >
            <input
              v-if="editingGeneralIndex === index"
              ref="generalWordEditor"
              v-model="editingGeneralWord"
              type="text"
              aria-label="编辑通用过滤词"
              @blur="saveGeneralWord"
              @keydown.enter.prevent="saveGeneralWord"
              @keydown.esc.prevent="editingGeneralIndex = -1"
            />
            <button
              v-else
              type="button"
              class="rf-general-word"
              :title="word"
              :aria-label="`编辑过滤词：${word}`"
              @click="editGeneralWord(word)"
            >
              <span>{{ word }}</span>
            </button>
            <button
              type="button"
              class="rf-general-remove"
              :aria-label="`删除过滤词：${word}`"
              title="删除"
              @pointerdown.prevent
              @click="removeGeneralWord(word)"
            >
              ×
            </button>
          </div>
          <p v-if="!generalGroup.keywords.length" class="rf-help">还没有通用过滤词</p>
        </div>
        <span v-if="pending" class="rf-save-status" aria-live="polite">正在保存…</span>
      </section>
      <section v-else-if="selected" class="rf-group-editor">
        <div class="rf-editor-heading">
          <h3>{{ selected.name || `第 ${selectedIndex + 1} 组` }}</h3>
          <label class="rf-enabled-toggle"
            ><input v-model="selected.enabled" type="checkbox" @change="queueSave" />启用此组</label
          >
        </div>
        <label class="rf-field-label"
          >分组名称（可选）<input
            v-model="selected.name"
            type="text"
            aria-label="关键词组名称"
            placeholder="例如：游戏抽卡"
            @input="queueSave"
        /></label>
        <div class="rf-keyword-label"><strong>同组关键词</strong><span>同时匹配才过滤</span></div>
        <div class="rf-word-list">
          <div v-for="(word, index) in selected.keywords" :key="index" class="rf-word-row">
            <input
              v-model="selected.keywords[index]"
              type="text"
              :aria-label="`关键词 ${index + 1}`"
              placeholder="输入关键词"
              @input="queueSave"
            /><button
              type="button"
              :aria-label="`移除关键词 ${index + 1}`"
              @click="removeWord(index)"
            >
              移除
            </button>
          </div>
        </div>
        <button type="button" class="rf-add-word" @click="addWord">＋ 同组关键词</button>
        <div class="rf-editor-bottom">
          <span v-if="pending" class="rf-save-status" aria-live="polite">正在保存…</span>
          <button type="button" class="rf-danger" @click="removeSelected">
            {{ confirmDelete ? '确认删除此组' : '删除此组' }}
          </button>
        </div>
      </section>
      <section v-else class="rf-group-editor rf-editor-empty">
        <h3>管理你的关键词组</h3>
        <p>从左侧选择一组进行编辑，或创建新组。</p>
        <button type="button" class="rf-primary" @click="addGroup">＋ 新建组合组</button>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, nextTick, set, watch, onBeforeUnmount } from 'vue'
import { addComponentListener, removeComponentListener } from '@/core/settings'
import { componentName } from './options'
import { getOptions } from './runtime'
import { generalGroupId, generalGroupName, KeywordGroup } from './rules'
import {
  findKeywordGroups,
  GroupStatus,
  groupPageSize,
  parseKeywordGroups,
  prepareKeywordGroups,
  uniqueKeywords,
} from './groups'

const copyGroups = (): KeywordGroup[] =>
  prepareKeywordGroups(JSON.parse(JSON.stringify(getOptions().keywordGroups))).map(group => ({
    name: '',
    ...group,
  }))

const newGroup = (keywords: string[]): KeywordGroup => ({
  id: `${Date.now()}-${Math.random()}`,
  name: '',
  enabled: true,
  keywords,
})

/* eslint-disable @typescript-eslint/no-use-before-define */

const generalWordEditor = ref<HTMLInputElement[]>([])
const importWord = ref<HTMLInputElement>()

const groups = ref(copyGroups())

const generalId = ref(generalGroupId)

const generalName = ref(generalGroupName)

const newGeneralWord = ref('')

const editingGeneralIndex = ref(-1)

const editingGeneralWord = ref('')

const selectedId = ref('')

const query = ref('')

const status = ref('all' as GroupStatus)

const page = ref(1)

const importing = ref(false)

const bulkText = ref('')

const cardTitle = ref('')

const cardWord = ref('')

const pending = ref(false)

const writing = ref(false)

const saveTimer = ref(undefined as number | undefined)

const confirmDelete = ref(false)

const generalGroup = computed((): KeywordGroup => {
  return groups.value.find(group => group.id === generalGroupId)
})

const customGroups = computed((): KeywordGroup[] => {
  return groups.value.filter(group => group.id !== generalGroupId)
})

const selectedIsGeneral = computed((): boolean => {
  return selectedId.value === generalGroupId
})

const filtered = computed(() => {
  return findKeywordGroups(customGroups.value, query.value, status.value)
})

const pageCount = computed((): number => {
  return Math.max(1, Math.ceil(filtered.value.length / groupPageSize))
})

const pageEntries = computed(() => {
  return filtered.value.slice((page.value - 1) * groupPageSize, page.value * groupPageSize)
})

const selected = computed((): KeywordGroup | undefined => {
  return groups.value.find(group => group.id === selectedId.value)
})

const selectedIndex = computed((): number => {
  return customGroups.value.findIndex(group => group.id === selectedId.value)
})

const parsedGroups = computed((): string[][] => {
  return parseKeywordGroups(bulkText.value)
})

const importWordCount = computed((): number => {
  return parsedGroups.value.filter(words => words.length === 1).length
})

const importGroupCount = computed((): number => {
  return parsedGroups.value.filter(words => words.length > 1).length
})

function syncGroups() {
  if (writing.value || pending.value) {
    return
  }
  groups.value = copyGroups()
  editingGeneralIndex.value = -1
  if (!selected.value) {
    selectedId.value = groups.value[0]?.id || ''
  }
}

function queueSave() {
  pending.value = true
  clearTimeout(saveTimer.value)
  saveTimer.value = window.setTimeout(flush, 250)
}

function flush() {
  saveGeneralWord()
  clearTimeout(saveTimer.value)
  saveTimer.value = undefined
  if (!pending.value) {
    return
  }
  writing.value = true
  getOptions().keywordGroups = JSON.parse(JSON.stringify(groups.value))
  writing.value = false
  pending.value = false
}

function addGeneralWord() {
  const word = newGeneralWord.value.trim()
  if (!word) {
    return
  }
  saveGeneralWord()
  generalGroup.value.keywords = uniqueKeywords([...generalGroup.value.keywords, word])
  newGeneralWord.value = ''
  queueSave()
}

function editGeneralWord(word: string) {
  saveGeneralWord()
  editingGeneralIndex.value = generalGroup.value.keywords.indexOf(word)
  editingGeneralWord.value = word
  nextTick(() => {
    const input = (generalWordEditor.value as HTMLInputElement[])?.[0]
    input?.focus({
      preventScroll: true,
    })
    input?.select()
  })
}

function saveGeneralWord() {
  const index = editingGeneralIndex.value
  if (index < 0) {
    return
  }
  const word = editingGeneralWord.value.trim()
  editingGeneralIndex.value = -1
  if (!word || word === generalGroup.value.keywords[index]) {
    return
  }
  set(generalGroup.value.keywords, index, word)
  generalGroup.value.keywords = uniqueKeywords(generalGroup.value.keywords)
  queueSave()
}

function removeGeneralWord(word: string) {
  if (generalGroup.value.keywords[editingGeneralIndex.value] === word) {
    editingGeneralIndex.value = -1
  } else {
    saveGeneralWord()
  }
  const index = generalGroup.value.keywords.indexOf(word)
  if (index >= 0) {
    generalGroup.value.keywords.splice(index, 1)
    queueSave()
  }
}

function selectGroup(id: string) {
  flush()
  cardTitle.value = ''
  selectedId.value = id
  importing.value = false
  confirmDelete.value = false
}

function revealGroup(group: KeywordGroup) {
  cardTitle.value = ''
  query.value = ''
  status.value = 'all'
  selectedId.value = group.id
  importing.value = false
  confirmDelete.value = false
  nextTick(() => {
    page.value =
      group.id === generalGroupId ? 1 : Math.ceil(customGroups.value.length / groupPageSize)
  })
  queueSave()
}

function addGroup() {
  flush()
  const group = newGroup([''])
  groups.value.push(group)
  revealGroup(group)
}

function addWord() {
  selected.value?.keywords.push('')
  queueSave()
}

function removeWord(index: number) {
  selected.value?.keywords.splice(index, 1)
  queueSave()
}

function removeSelected() {
  if (selectedIsGeneral.value) {
    return
  }
  if (!confirmDelete.value) {
    confirmDelete.value = true
    return
  }
  const index = groups.value.findIndex(group => group.id === selectedId.value)
  if (index < 0) {
    return
  }
  groups.value.splice(index, 1)
  selectedId.value = groups.value[Math.min(index, groups.value.length - 1)]?.id || ''
  confirmDelete.value = false
  queueSave()
}

function beginImport() {
  flush()
  cardTitle.value = ''
  importing.value = true
  bulkText.value = ''
}

function beginCardImport(title: string) {
  flush()
  cardTitle.value = title
  cardWord.value = title
  importing.value = false
  nextTick(() => {
    const input = importWord.value as HTMLInputElement
    input.focus({
      preventScroll: true,
    })
    input.select()
  })
}

function importCardWord() {
  const word = cardWord.value.trim()
  if (!word) {
    return
  }
  generalGroup.value.keywords = uniqueKeywords([...generalGroup.value.keywords, word])
  revealGroup(generalGroup.value)
  flush()
}

function importGroups() {
  if (!parsedGroups.value.length) {
    return
  }
  const words = parsedGroups.value.filter(group => group.length === 1).flat()
  const groupsToAdd = parsedGroups.value.filter(group => group.length > 1).map(newGroup)
  generalGroup.value.keywords = uniqueKeywords([...generalGroup.value.keywords, ...words])
  groups.value.push(...groupsToAdd)
  bulkText.value = ''
  revealGroup(groupsToAdd[groupsToAdd.length - 1] || generalGroup.value)
  flush()
}

watch(query, () => {
  page.value = 1
})

watch(status, () => {
  page.value = 1
})

watch(pageCount, () => {
  page.value = Math.min(page.value, pageCount.value)
})

selectedId.value = generalGroupId

addComponentListener(`${componentName}.keywordGroups`, syncGroups)

onBeforeUnmount(() => {
  flush()
  removeComponentListener(`${componentName}.keywordGroups`, syncGroups)
})

defineExpose({ flush, beginCardImport })
</script>
