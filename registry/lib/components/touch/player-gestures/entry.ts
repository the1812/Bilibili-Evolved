import { playerAgent } from '@/components/video/player-agent'
import { GesturePreviewParams, ProgressSeekMode } from './gesture-preview'

export const entry = async () => {
  const { videoChange } = await import('@/core/observer')
  videoChange(async () => {
    const video = await playerAgent.query.video.element()
    if (!video) {
      return
    }
    let gestureVM: Vue & {
      opened: boolean
      sync: () => void
      startPreview: (params: GesturePreviewParams) => void
      cancelPreview: () => void
      endPreview: () => void
      apply: (params: GesturePreviewParams) => Promise<void>
      preview: {
        seekMode: ProgressSeekMode
      }
    }
    if (!dq('.gesture-preview')) {
      const GesturePreview = await import('./GesturePreview.vue')
      const { mountVueComponent } = await import('@/core/utils')
      gestureVM = mountVueComponent(GesturePreview)
      playerAgent.query.video.subtitle.sync()?.insertAdjacentElement('beforebegin', gestureVM.$el)
    }
    const { Swiper } = await import('./swiper')
    const swiper = new Swiper(playerAgent.query.video.container.sync())
    swiper.action.addEventListener('start', () => {
      gestureVM.sync()
    })
    swiper.action.addEventListener('cancel', () => {
      gestureVM.cancelPreview()
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
