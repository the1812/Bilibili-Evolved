import { mountVueComponent } from '@/core/utils'
import ViewerComponent from './ImageViewer.vue'

let vm: InstanceType<typeof ViewerComponent> | undefined
export const createContainer = async () => {
  const [el, vm0] = mountVueComponent(ViewerComponent)
  vm = vm0
  document.body.insertAdjacentElement('beforeend', el)
  return vm
}
export const showImage = async (imageUrl: string) => {
  if (!vm) {
    await createContainer()
  }
  // 等浏览器端完成一次任务处理, 防止容器创建瞬间 open = true 导致没有过渡动画
  setTimeout(() => {
    vm.image = imageUrl
    vm.open = true
  })
  return vm
}
