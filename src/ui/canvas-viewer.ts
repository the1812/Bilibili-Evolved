import { getData } from '@/plugins/data'
import CanvasViewerVue from './CanvasViewer.vue'

interface CanvasViewer {
  setCanvas: (canvas: HTMLCanvasElement, update?: boolean) => Promise<boolean>
  setDownloadable: (filename?: string) => Promise<void>
  setLoadingMessage: (messags: string | Error) => void
}

let vm: {
  open: boolean
  canvas: HTMLCanvasElement
} & CanvasViewer &
  Vue
const createCanvasViewer = async () => {
  vm = new CanvasViewerVue().$mount() as typeof vm
  document.body.insertAdjacentElement('beforeend', vm.$el)
  return vm
}

export const openCanvasViewer = async (loadingMessage?: string) => {
  if (!vm) {
    await createCanvasViewer()
  }
  return new Promise<CanvasViewer>((resolve, reject) => {
    requestAnimationFrame(() => {
      try {
        vm.open = true
        vm.canvas = null
        vm.setLoadingMessage(loadingMessage ?? getData('vLoading')[0].content)
        vm.$nextTick(() => {
          requestAnimationFrame(() => {
            resolve(vm)
          })
        })
      } catch (err) {
        reject(err)
      }
    })
  })
}

/**
 * 注意：生成的下载图片为调用瞬间的画布内容，此后再修改画布内容将不会改变生成的图片
 * @param canvas Canvas元素
 * @param filename 将Canvas下载为图片时的文件名，若不指定则不显示下载按钮
 * @author LainIO24
 */
export const showCanvas = async (canvas: HTMLCanvasElement, filename?: string) => {
  const viewer = await openCanvasViewer()
  if (await viewer.setCanvas(canvas, true)) {
    await viewer.setDownloadable(filename)
  }
}
