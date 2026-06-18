import { mountVueComponent } from '@/core/utils'
import { Toast } from '@/core/toast'
import type { MergerToastLevel } from './contracts'

export type { MergerToastLevel } from './contracts'

const DEFAULT_TOAST_TITLE = '弹幕合并'
const DEFAULT_TOAST_DURATION = 4000

type ConfirmModalVm = Vue & {
  showConfirm: (title: string, body: string) => Promise<boolean>
}

let confirmVm: ConfirmModalVm | null = null

const getConfirmModal = async (): Promise<ConfirmModalVm> => {
  if (confirmVm) {
    return confirmVm
  }
  const ConfirmModal = (await import('./ConfirmModal.vue')).default
  confirmVm = mountVueComponent(ConfirmModal) as ConfirmModalVm
  document.body.appendChild(confirmVm.$el)
  return confirmVm
}

/** 统一 Toast 入口，替代 runtime 内自绘 toast */
export const mergerToast = (
  message: string,
  level: MergerToastLevel = 'info',
  title: string = DEFAULT_TOAST_TITLE,
  duration: number = DEFAULT_TOAST_DURATION,
): void => {
  switch (level) {
    case 'success':
      Toast.success(message, title, duration)
      break
    case 'error':
      Toast.error(message, title, duration)
      break
    case 'warn':
      Toast.show(message, title, duration)
      break
    case 'info':
    default:
      Toast.info(message, title, duration)
      break
  }
}

let progressToast: Toast | null = null

/** 复用单条 Toast 展示进度，避免批量合并时堆叠 */
export const mergerProgressToast = (message: string, title: string = DEFAULT_TOAST_TITLE): void => {
  if (progressToast) {
    progressToast.close()
    progressToast = null
  }
  progressToast = Toast.info(message, title, undefined)
}

/** 结束进度 Toast；完成后可再调用 mergerToast 展示最终结果 */
export const mergerProgressToastDone = (): void => {
  if (!progressToast) {
    return
  }
  progressToast.close()
  progressToast = null
}

/** 确认对话框，使用与搜索/管理弹窗一致的 ModalShell */
export const mergerConfirm = async (title: string, content: string): Promise<boolean> => {
  const vm = await getConfirmModal()
  return vm.showConfirm(title, content)
}

/** 组件卸载时销毁确认弹窗宿主 */
export const destroyMergerConfirm = (): void => {
  if (!confirmVm) {
    return
  }
  confirmVm.$destroy()
  confirmVm.$el.remove()
  confirmVm = null
}
