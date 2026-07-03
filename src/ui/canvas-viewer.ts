import CanvasViewer from './CanvasViewer.vue'

let vm: {
  open: boolean
  setCanvas: (canvas: HTMLCanvasElement, filename?: string) => void
} & Vue
const createCanvasViewer = async () => {
  vm = new CanvasViewer().$mount() as typeof vm
  document.body.insertAdjacentElement('beforeend', vm.$el)
  return vm
}

/**
 * 注意：生成的下载图片为调用瞬间的画布内容，此后再修改画布内容将不会改变生成的图片
 * @param canvas Canvas元素
 * @param filename 将Canvas下载为图片时的文件名，若不指定则不显示下载按钮
 * @author LainIO24
 */
export const showCanvas = async (canvas: HTMLCanvasElement, filename?: string) => {
  if (!vm) {
    await createCanvasViewer()
  }
  return new Promise<typeof vm>((resolve, reject) => {
    setTimeout(() => {
      try {
        vm.setCanvas(canvas, filename)
        vm.open = true
        resolve(vm)
      } catch (err) {
        reject(err)
      }
    })
  })
}
