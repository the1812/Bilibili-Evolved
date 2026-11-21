import { onMounted, ref } from 'vue'
import { useScopedConsole } from '@/core/utils/log'
import {
  type InboxPage,
  type UnreadCounts,
  getInboxPage,
  getInboxUnread,
  markPrivateSessionRead,
  markSystemNoticesRead,
} from './inbox-api'
import { isInteractionCategory, type InboxCategory } from '../../shared/urls'

export const useAccountInbox = () => {
  const { error: logError } = useScopedConsole('仪表盘首页消息')
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
    } catch (error) {
      if (request === countsRequest) {
        logError(error)
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
    loading.value = true
    failed.value = false
    try {
      const result = await getInboxPage(category)
      if (request === listRequest) {
        confirmLoad.value = false
        page.value = result
      }
    } catch (error) {
      if (request === listRequest) {
        logError(error)
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

  const showCategory = (category?: InboxCategory) => {
    listRequest += 1
    selected.value = category
    page.value = undefined
    loading.value = false
    failed.value = false
    readStatus.value = ''
    confirmLoad.value = Boolean(
      category &&
        isInteractionCategory(category) &&
        (countsFailed.value || counts.value?.[category] !== 0),
    )
    if (category && !confirmLoad.value) {
      loadSelected()
    }
  }

  const selectCategory = (category: InboxCategory) => {
    if (!reading.value) {
      showCategory(selected.value === category ? undefined : category)
    }
  }

  const refreshInbox = async () => {
    const currentList = listRequest
    const pendingCounts = refresh()
    const currentCounts = countsRequest
    await pendingCounts
    if (
      selected.value &&
      !reading.value &&
      currentList === listRequest &&
      currentCounts === countsRequest
    ) {
      showCategory(selected.value)
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
      readStatus.value = '已标记为已读'
      await refresh()
    } catch (error) {
      logError(error)
      readStatus.value = '更新已读状态失败，请重试'
    } finally {
      reading.value = false
    }
  }

  onMounted(refresh)

  return {
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
  }
}
