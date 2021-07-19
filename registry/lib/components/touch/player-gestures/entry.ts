import { GesturePreviewParams, ProgressSeekMode } from './gesture-preview'

export const entry = async () => {
  const { videoChange } = await import('@/core/observer')
  const { sq } = await import('@/core/spin-query')
  videoChange(async () => {
    const video = await sq(
      () => dq('video') as HTMLVideoElement,
      it => Boolean(it?.duration ?? 0),
    )
    if (!video) {
      return
    }
    let gestureVM: Vue & {
      opened: boolean
      sync: () => void
      startPreview: (params: GesturePreviewParams) => void,
      cancelPreview: () => void,
      endPreview: () => void,
      apply: (params: GesturePreviewParams) => Promise<void>,
      preview: {
        seekMode: ProgressSeekMode
      }
    }
    if (!dq('.gesture-preview')) {
      const GesturePreview = await import('./GesturePreview.vue')
      const { mountVueComponent } = await import('@/core/utils')
      gestureVM = mountVueComponent(GesturePreview)
      dq('.bilibili-player-video-subtitle')?.insertAdjacentElement(
        'beforebegin',
        gestureVM.$el,
      )
    }
    const { Swiper } = await import('./swiper')
    const swiper = new Swiper(dq('.bilibili-player-video') as HTMLElement)
    swiper.action.addEventListener('start', () => {
      gestureVM.sync()
    })
    swiper.action.addEventListener('cancel', () => {
      gestureVM.cancelPreview()
    })
    swiper.action.addEventListener('end', () => {
      gestureVM.endPreview()
    });
    [
      'volume',
      'brightness',
    ].forEach(type => {
      swiper.action.addEventListener(type, (e: CustomEvent<number>) => {
        gestureVM.startPreview({
          [type]: e.detail,
        })
      })
    })
    swiper.action.addEventListener('progress', (e: CustomEvent<{
      progress: number
      mode: ProgressSeekMode
    }>) => {
      const { progress, mode } = e.detail
      gestureVM.preview.seekMode = mode
      console.log('startPreview', progress)
      gestureVM.startPreview({
        progress,
      })
    })
  })
}
