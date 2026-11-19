import { computed, onMounted, ref } from 'vue'
import { bilibiliApi, getJsonWithCredentials, postTextWithCredentials } from '@/core/ajax'
import { getCsrf } from '@/core/utils'
import { logError } from '@/core/utils/log'

const historyRecordingUrl = 'https://api.bilibili.com/x/v2/history/shadow'
// Keep pending updates and the confirmed state across tab switches.
const paused = ref<boolean>()
const busy = ref(false)

export const useHistoryRecording = (uid: string) => {
  const action = computed(() => {
    if (paused.value === undefined) {
      return {
        label: busy.value ? '正在读取历史记录状态' : '重试读取历史记录状态',
        icon: 'mdi-refresh',
      }
    }
    return paused.value
      ? { label: '继续记录历史', icon: 'mdi-play' }
      : { label: '暂停记录历史', icon: 'mdi-pause' }
  })

  const run = async (task: () => Promise<void>) => {
    if (!uid || busy.value) {
      return
    }
    busy.value = true
    try {
      await task()
    } catch (error) {
      logError(error)
    } finally {
      busy.value = false
    }
  }
  const refreshRecording = () =>
    run(async () => {
      paused.value = undefined
      const result = await bilibiliApi<unknown>(
        getJsonWithCredentials(historyRecordingUrl),
        '读取历史记录状态失败',
        false,
      )
      paused.value = result === true
    })

  const toggleRecording = () => {
    if (paused.value === undefined) {
      return refreshRecording()
    }
    return run(async () => {
      const csrf = getCsrf()
      if (!csrf) {
        throw new Error('登录已失效')
      }
      const nextPaused = !paused.value
      const params = new URLSearchParams({ csrf, switch: String(nextPaused) })
      await bilibiliApi(
        postTextWithCredentials(`${historyRecordingUrl}/set`, params.toString()).then(JSON.parse),
        '更新历史记录状态失败',
        false,
      )
      paused.value = nextPaused
    })
  }

  onMounted(refreshRecording)
  return { action, busy, refreshRecording, toggleRecording }
}
