import { DownloadVideoInputItem } from '../types'
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
  Vue.extend({
    computed: {
      checkedInputItems() {
        return this.$refs.picker.checkedInputItems
      },
    },
    render(createElement) {
      return createElement(EpisodesPicker, {
        props: { api: fetchEpisodeItems },
        ref: 'picker',
      })
    },
  })
