<template>
  <div class="dashboard-home-account-inbox">
    <section class="dashboard-home-account-card" :aria-busy="countsLoading">
      <header class="dashboard-home-account-panel-heading">
        <h2>未读消息</h2>
        <a href="https://message.bilibili.com/" target="_blank" rel="noopener">查看全部</a>
      </header>
      <VLoading v-if="countsLoading && !counts" />
      <ul v-else class="dashboard-home-account-list" role="list">
        <li v-for="(category, key) in inboxCategories" :key="key">
          <button
            type="button"
            class="dashboard-home-account-row dashboard-home-inbox-category"
            :aria-expanded="selected === key ? 'true' : 'false'"
            :aria-controls="selected === key ? 'dashboard-home-inbox-details' : undefined"
            :disabled="reading"
            @click="selectCategory(key)"
          >
            <span class="dashboard-home-account-row-text">{{ category.label }}</span>
            <strong>{{ counts?.[key] ?? '—' }}</strong>
          </button>
        </li>
      </ul>
      <VButton v-if="countsFailed" @click="refresh">未读数加载失败，点击重试</VButton>
    </section>

    <section
      v-if="selected"
      id="dashboard-home-inbox-details"
      class="dashboard-home-account-card"
      :aria-busy="loading || reading"
    >
      <header class="dashboard-home-account-panel-heading">
        <h2>{{ inboxCategories[selected].label }}</h2>
        <a :href="inboxCategories[selected].url" target="_blank" rel="noopener">查看全部</a>
      </header>
      <template v-if="confirmLoad">
        <p class="dashboard-home-inbox-text">B 站可能在加载列表时将消息标为已读。</p>
        <VButton @click="loadSelected">加载列表</VButton>
      </template>
      <VLoading v-else-if="loading" />
      <VButton v-else-if="failed" @click="loadSelected">加载失败，点击重试</VButton>
      <ul v-else-if="page?.entries.length" class="dashboard-home-account-list" role="list">
        <li v-for="entry in page.entries" :key="entry.id" class="dashboard-home-inbox-entry">
          <div class="dashboard-home-account-panel-heading">
            <component
              :is="entry.url ? 'a' : 'strong'"
              :href="entry.url"
              :target="entry.url ? '_blank' : undefined"
              :rel="entry.url ? 'noopener' : undefined"
            >
              {{ entry.title }}
            </component>
            <time
              v-if="entry.timestamp"
              class="dashboard-home-account-muted"
              :datetime="new Date(entry.timestamp).toISOString()"
            >
              {{ formatDateTime(new Date(entry.timestamp)).slice(0, 16) }}
            </time>
          </div>
          <p v-if="entry.text" class="dashboard-home-inbox-text" v-text="entry.text" />
          <p
            v-if="entry.context"
            class="dashboard-home-inbox-text dashboard-home-account-muted"
            v-text="entry.context"
          />
          <div v-if="entry.unread > 0" class="dashboard-home-inbox-actions">
            <span>{{ entry.unread }} 条未读</span>
            <VButton v-if="entry.acknowledgement" :disabled="reading" @click="markRead(entry)">
              标为已读
            </VButton>
          </div>
        </li>
      </ul>
      <VEmpty v-else>暂无消息</VEmpty>
      <VButton v-if="page?.noticeCursor" :disabled="reading" @click="markRead()">
        将系统通知标为已读
      </VButton>
      <p v-if="readStatus" class="dashboard-home-inbox-text" role="status">{{ readStatus }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { formatDateTime } from '@/core/utils/formatters'
import { VButton, VEmpty, VLoading } from '@/ui'
import {
  type InboxCategory,
  type InboxPage,
  type UnreadCounts,
  getInboxPage,
  getInboxUnread,
  inboxCategories,
  isInteractionCategory,
  markPrivateSessionRead,
  markSystemNoticesRead,
} from './account-inbox'

const counts = ref<UnreadCounts>()
const countsLoading = ref(false)
const countsFailed = ref(false)
let countsRequest = 0
const refresh = async () => {
  const request = ++countsRequest
  countsLoading.value = true
  countsFailed.value = false
  try {
    const result = await getInboxUnread()
    if (request === countsRequest) {
      counts.value = result
    }
  } catch {
    if (request === countsRequest) {
      countsFailed.value = true
    }
  } finally {
    if (request === countsRequest) {
      countsLoading.value = false
    }
  }
}

const selected = ref<InboxCategory>()
const page = ref<InboxPage>()
const loading = ref(false)
const failed = ref(false)
const confirmLoad = ref(false)
const reading = ref(false)
const readStatus = ref('')
let listRequest = 0

const loadSelected = async () => {
  const category = selected.value
  if (!category || loading.value) {
    return
  }
  const request = ++listRequest
  const refreshUnread = confirmLoad.value
  confirmLoad.value = false
  loading.value = true
  failed.value = false
  try {
    const result = await getInboxPage(category)
    if (request === listRequest) {
      page.value = result
    }
  } catch {
    if (request === listRequest) {
      failed.value = true
    }
  } finally {
    if (request === listRequest) {
      loading.value = false
    }
    if (refreshUnread) {
      refresh()
    }
  }
}

const selectCategory = (category: InboxCategory) => {
  listRequest += 1
  selected.value = selected.value === category ? undefined : category
  page.value = undefined
  loading.value = false
  failed.value = false
  readStatus.value = ''
  confirmLoad.value = isInteractionCategory(category) && counts.value?.[category] !== 0
  if (selected.value && !confirmLoad.value) {
    loadSelected()
  }
}

const markRead = async (entry?: InboxPage['entries'][number]) => {
  const cursor = page.value?.noticeCursor
  if (reading.value || (!entry?.acknowledgement && !cursor)) {
    return
  }
  reading.value = true
  readStatus.value = ''
  try {
    if (entry?.acknowledgement) {
      await markPrivateSessionRead(entry.acknowledgement)
      entry.acknowledgement = undefined
      entry.unread = 0
    } else {
      await markSystemNoticesRead(cursor)
      page.value = { ...page.value, noticeCursor: undefined }
    }
    readStatus.value = '已标为已读'
    await refresh()
  } catch {
    readStatus.value = '更新已读状态失败，请重试'
  } finally {
    reading.value = false
  }
}

onMounted(refresh)
defineExpose({ refresh })
</script>
