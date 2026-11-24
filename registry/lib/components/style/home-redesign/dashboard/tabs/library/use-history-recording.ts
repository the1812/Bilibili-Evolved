import { computed, onMounted, ref } from 'vue'
import { logError } from '@/core/utils/log'
import { getHistoryRecordingPaused, setHistoryRecordingPaused } from './history-api'

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
      paused.value = await getHistoryRecordingPaused()
    })

  const toggleRecording = () => {
    if (paused.value === undefined) {
      return refreshRecording()
    }
    return run(async () => {
      const nextPaused = !paused.value
      await setHistoryRecordingPaused(nextPaused)
      paused.value = nextPaused
    })
  }

  onMounted(refreshRecording)
  return { action, busy, refreshRecording, toggleRecording }
}
