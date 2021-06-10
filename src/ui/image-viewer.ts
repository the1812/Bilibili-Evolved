import ViewerComponent from './ImageViewer.vue'

let vm: { open: boolean; image: string } & Vue
export const createContainer = async () => {
  vm = new ViewerComponent({
    propsData: {
      image: '',
      open: false,
    },
  }).$mount() as typeof vm
  document.body.insertAdjacentElement('beforeend', vm.$el)
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
