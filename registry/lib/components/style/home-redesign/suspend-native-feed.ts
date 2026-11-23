import { contentLoaded } from '@/core/life-cycle'

// 原版首页按 `body.scrollHeight > innerHeight + 700` 判断是否继续补拉推荐流, 首页被替换后高度不够会一直加载
const nativeLoadMoreOffset = 700

const raiseBodyScrollHeight = () =>
  Object.defineProperty(document.body, 'scrollHeight', {
    configurable: true,
    get: () =>
      Math.max(
        document.documentElement.scrollHeight,
        window.innerHeight + nativeLoadMoreOffset + 1,
      ),
  })

export const suspendNativeFeedLoading = () => {
  if (document.body === null) {
    contentLoaded(raiseBodyScrollHeight)
    return
  }
  raiseBodyScrollHeight()
}

export const resumeNativeFeedLoading = () => {
  Reflect.deleteProperty(document.body, 'scrollHeight')
}
