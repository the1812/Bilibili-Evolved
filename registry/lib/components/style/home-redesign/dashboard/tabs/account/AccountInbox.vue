<template>
  <div class="dashboard-home-account-inbox">
    <section class="dashboard-home-account-card" :aria-busy="countsLoading">
      <header class="dashboard-home-account-panel-heading">
        <h2>未读消息</h2>
        <a
          :href="dashboardUrls.messageCenter"
          aria-label="查看全部未读消息"
          target="_blank"
          rel="noopener"
        >
          查看全部
        </a>
      </header>
      <ul v-if="counts || !countsLoading" class="dashboard-home-account-list" role="list">
        <li v-for="(category, key) in inboxCategories" :key="key">
          <button
            type="button"
            class="dashboard-home-account-row dashboard-home-inbox-category"
            :aria-expanded="selected === key ? 'true' : 'false'"
            :aria-controls="selected === key ? 'dashboard-home-inbox-details' : undefined"
            :aria-disabled="reading ? 'true' : undefined"
            @click="selectCategory(key)"
          >
            <span class="dashboard-home-account-row-text">{{ category.label }}</span>
            <strong>{{ counts?.[key] ?? '—' }}</strong>
          </button>
        </li>
      </ul>
      <ListStatus
        v-if="(countsLoading && !counts) || countsFailed"
        :loading="countsLoading"
        :failed="countsFailed"
        error="未读数加载失败"
        @load="refresh"
      />
    </section>

    <section
      v-if="selected"
      id="dashboard-home-inbox-details"
      class="dashboard-home-account-card"
      :aria-busy="loading || reading"
    >
      <header class="dashboard-home-account-panel-heading">
        <h2>{{ inboxCategories[selected].label }}</h2>
        <a
          :href="inboxCategories[selected].url"
          :aria-label="'查看全部' + inboxCategories[selected].label"
          target="_blank"
          rel="noopener"
        >
          查看全部
        </a>
      </header>
      <p v-if="confirmLoad && !loading" class="dashboard-home-inbox-text">
        B 站可能在加载列表时将消息标为已读。
      </p>
      <ListStatus
        :loading="loading"
        :failed="failed"
        :has-more="confirmLoad"
        load-label="加载列表"
        @load="loadSelected"
      />
      <ul v-if="page?.entries.length" class="dashboard-home-account-list" role="list">
        <li v-for="entry in page.entries" :key="entry.id" class="dashboard-home-inbox-entry">
          <div class="dashboard-home-inbox-entry-heading">
            <component
              :is="entry.url ? 'a' : 'strong'"
              class="dashboard-home-inbox-entry-title"
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
            <button
              v-if="entry.acknowledgement"
              type="button"
              class="dashboard-home-action"
              :aria-disabled="reading ? 'true' : undefined"
              @click="markEntryRead(entry, $event)"
            >
              标为已读
            </button>
          </div>
        </li>
      </ul>
      <VEmpty v-else-if="!loading && !failed && !confirmLoad">暂无消息</VEmpty>
      <button
        v-if="page?.noticeCursor"
        type="button"
        class="dashboard-home-action"
        :aria-disabled="reading ? 'true' : undefined"
        @click="markEntryRead(undefined, $event)"
      >
        将系统通知标为已读
      </button>
      <p ref="readStatusElement" class="dashboard-home-inbox-result" role="status" tabindex="-1">
        {{ readStatus }}
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { formatDateTime } from '@/core/utils/formatters'
import { VEmpty } from '@/ui'
import ListStatus from '../../shared/ListStatus.vue'
import type { InboxPage } from './inbox-api'
import { dashboardUrls } from '../../shared/urls'
import { inboxCategories } from './inbox-categories'
import { useAccountInbox } from './use-account-inbox'

const {
  counts,
  countsLoading,
  countsFailed,
  selected,
  page,
  loading,
  failed,
  confirmLoad,
  reading,
  readStatus,
  refresh,
  refreshInbox,
  selectCategory,
  loadSelected,
  markRead,
} = useAccountInbox()

const readStatusElement = ref<HTMLElement>()
const markEntryRead = async (
  entry: InboxPage['entries'][number] | undefined,
  event: MouseEvent,
) => {
  const button = event.currentTarget as HTMLButtonElement
  await markRead(entry)
  await nextTick()
  if (event.detail === 0 && !button.isConnected && document.activeElement === document.body) {
    readStatusElement.value?.focus({ preventScroll: true })
  }
}
defineExpose({ refreshInbox })
</script>
