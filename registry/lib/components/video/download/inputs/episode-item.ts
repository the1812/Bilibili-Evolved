import { defineComponent } from 'vue'
import type { DownloadVideoInputItem } from '../types'
import EpisodesPicker from './EpisodesPicker.vue'

export interface EpisodeItem {
  key: string
  title: string
  isChecked: boolean
  inputItem: DownloadVideoInputItem
  durationText?: string
}
export const createEpisodesPicker = (
  fetchEpisodeItems: (instance: any) => Promise<EpisodeItem[]>,
) =>
  defineComponent({
    computed: {
      checkedInputItems(): DownloadVideoInputItem[] {
        return (this.$refs.picker as any).checkedInputItems
      },
    },
    render(createElement) {
      return createElement(EpisodesPicker, {
        props: { api: fetchEpisodeItems },
        ref: 'picker',
      })
    },
  })
