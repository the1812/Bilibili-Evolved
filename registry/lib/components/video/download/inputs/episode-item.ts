import type { Ref } from 'vue'
import { defineComponent, h, computed, ref } from 'vue'
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
    setup: (props, { expose }) => {
      const picker = ref(null) as Ref<InstanceType<typeof EpisodesPicker> | null>
      expose({ checkedInputItems: computed(() => picker.value.checkedInputItems) })
      return () => h(EpisodesPicker, { api: fetchEpisodeItems, ref: picker })
    },
  })
