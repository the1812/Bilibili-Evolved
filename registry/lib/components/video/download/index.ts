import {
  OptionsOfMetadata,
  defineComponentMetadata,
  defineOptionsMetadata,
} from '@/components/define'
import { hasVideo } from '@/core/spin-query'
import { DashCodec, DefaultDashExtensions } from './apis/dash'

const options = defineOptionsMetadata({
  basicConfig: {
    defaultValue: {},
    displayName: '基础配置',
    hidden: true,
  },
  dashVideoExtension: {
    defaultValue: DefaultDashExtensions.video,
    displayName: 'DASH 视频扩展名',
  },
  dashAudioExtension: {
    defaultValue: DefaultDashExtensions.audio,
    displayName: 'DASH 普通音频扩展名',
  },
  dashFlacAudioExtension: {
    defaultValue: DefaultDashExtensions.flacAudio,
    displayName: 'DASH FLAC 音频扩展名',
  },
  dashCodecFallback: {
    defaultValue: DashCodec.Avc,
    dropdownEnum: DashCodec,
    displayName: 'DASH 回退编码',
  },
})
export type Options = OptionsOfMetadata<typeof options>
export const component = defineComponentMetadata({
  name: 'downloadVideo',
  displayName: '下载视频',
  entry: none,
  reload: none,
  unload: none,
  widget: {
    component: () => import('./Widget.vue').then(m => m.default),
    condition: () => hasVideo(),
  },
  tags: [componentsTags.video],
  options,
  // plugin,
})
