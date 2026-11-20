<template>
  <div class="dashboard-home-account-inbox">
    <section class="dashboard-home-account-card" :aria-busy="countsLoading">
      <header class="dashboard-home-account-panel-heading">
        <h2>未读消息</h2>
        <a :href="messageCenter" target="_blank" rel="noopener">查看全部</a>
      </header>
      <ul v-if="counts || !countsLoading" class="dashboard-home-account-list" role="list">
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
        <a :href="inboxCategories[selected].url" target="_blank" rel="noopener">查看全部</a>
      </header>
      <p v-if="confirmLoad && !loading" class="dashboard-home-inbox-text">
        B 站可能在加载列表时将消息标为已读。
      </p>
      <ListStatus
        v-if="loading || failed"
        :loading="loading"
        :failed="failed"
        @load="loadSelected"
      />
      <VButton v-else-if="confirmLoad" @click="loadSelected">加载列表</VButton>
      <ul v-else-if="page?.entries.length" class="dashboard-home-account-list" role="list">
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
import { formatDateTime } from '@/core/utils/formatters'
import { VButton, VEmpty } from '@/ui'
import { inboxCategories, messageCenter } from '../../shared/urls'
import ListStatus from '../../shared/ListStatus.vue'
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

defineExpose({ refreshInbox })
</script>
