import { defineComponentMetadata } from '@/components/define'
import { select } from '@/core/spin-query'
import { preventEvent } from '@/core/utils'
import { playerUrls } from '@/core/utils/urls'

let dispose: (() => void) | undefined
const entry = async () => {
  const layer = (await select('.bpx-player-video-perch')) as HTMLElement
  if (!layer) {
    return
  }
  dispose = preventEvent(layer, 'dblclick')
}
export const component = defineComponentMetadata({
  name: 'disableDoubleClickFullscreen',
  displayName: '禁用双击全屏',
  entry,
  reload: entry,
  unload: () => {
    dispose?.()
  },
  tags: [componentsTags.video],
  urlInclude: playerUrls,
})
