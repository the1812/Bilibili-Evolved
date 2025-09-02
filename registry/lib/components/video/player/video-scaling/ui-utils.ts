import { TOAST_CLASS_NAME } from './constants'
import { ToastWithTimeout } from './types'

// 统一的错误处理函数
export function handleError(operation: string, error: unknown): void {
  console.error(`${operation}失败`, error)
}

// 显示缩放比例提示
export function showScaleToast(scale: number, duration: number): void {
  try {
    // 创建一个临时的toast元素显示缩放比例
    let toast = document.querySelector(`.${TOAST_CLASS_NAME}`) as ToastWithTimeout
    if (!toast) {
      toast = document.createElement('div')
      toast.className = TOAST_CLASS_NAME
    }

    // 找到视频元素
    const videoElement = dq('video') || dq('bwp-video')
    if (videoElement) {
      // 将toast元素添加为视频元素的子元素或同级元素
      if (toast.parentNode !== document.body) {
        document.body.appendChild(toast)
      }

      // 获取视频元素的位置信息
      const rect = videoElement.getBoundingClientRect()

      // 设置toast元素样式
      toast.style.cssText = `
        position: fixed;
        top: ${rect.top + rect.height / 2}px;
        left: ${rect.left + rect.width / 2}px;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        z-index: 9999;
        font-size: 16px;
        pointer-events: none;
      `

      // 显示为百分比，使用Math.round确保整数显示
      toast.textContent = `缩放: ${Math.round(scale * 100)}%`

      // 清除之前的超时定时器
      if (toast.timeoutId) {
        clearTimeout(toast.timeoutId)
      }
    }

    // 使用用户设置的toast显示时间
    const timeoutMs = duration * 1000 // 转换为毫秒
    toast.timeoutId = setTimeout(() => {
      toast.remove()
    }, timeoutMs) as unknown as number
  } catch (error) {
    handleError('显示缩放提示', error)
  }
}

// 清理所有toast元素
export function cleanupToasts(): void {
  document.querySelectorAll(`.${TOAST_CLASS_NAME}`).forEach(el => {
    // 清除可能存在的超时定时器
    const toast = el as ToastWithTimeout
    if (toast.timeoutId) {
      clearTimeout(toast.timeoutId)
    }
    el.remove()
  })
}
