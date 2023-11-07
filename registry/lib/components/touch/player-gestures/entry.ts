import { playerAgent } from '@/components/video/player-agent'
import type { ProgressSeekMode } from './gesture-preview'
import type GesturePreview from './GesturePreview.vue'

export const entry = async () => {
  const { videoChange } = await import('@/core/observer')
  videoChange(async () => {
    const video = await playerAgent.query.video.element()
    if (!video) {
      return
    }
    let gestureVM: InstanceType<typeof GesturePreview> | undefined
    if (!dq('.gesture-preview')) {
      const { mountVueComponent } = await import('@/core/utils')
      const [el, vm] = mountVueComponent(await import('./GesturePreview.vue'))
      gestureVM = vm
      playerAgent.query.video.subtitle.sync()?.insertAdjacentElement('beforebegin', el)
    }
    const { Swiper } = await import('./swiper')
    const swiper = new Swiper(playerAgent.query.video.container.sync())
    swiper.action.addEventListener('start', () => {
      gestureVM!.sync()
    })
    swiper.action.addEventListener('cancel', () => {
      gestureVM!.cancelPreview()
    })
    swiper.action.addEventListener('end', () => {
      gestureVM.endPreview()
    })
    ;['volume', 'brightness'].forEach(type => {
      swiper.action.addEventListener(type, (e: CustomEvent<number>) => {
        gestureVM.startPreview({
          [type]: e.detail,
        })
      })
    })
    swiper.action.addEventListener(
      'progress',
      (
        e: CustomEvent<{
          progress: number
          mode: ProgressSeekMode
        }>,
      ) => {
        const { progress, mode } = e.detail
        gestureVM.preview.seekMode = mode
        gestureVM.startPreview({
          progress,
        })
      },
    )
  })
}
