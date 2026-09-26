import { defineComponentMetadata } from '@/components/define'
import { getUID, mountVueComponent } from '@/core/utils'
import { liveUrls } from '@/core/utils/urls'
import DanmakuSendbar from './DanmakuSendbar.vue'

const getSendbar = lodash.once(() => mountVueComponent<{ enabled: boolean }>(DanmakuSendbar))
const setEnabled = (enabled: boolean) => {
  if (getUID()) {
    getSendbar().enabled = enabled
  }
}
export const component = defineComponentMetadata({
  name: 'liveDanmakuSendbar',
  displayName: '直播弹幕发送栏',
  tags: [componentsTags.live],
  entry: () => setEnabled(true),
  reload: () => setEnabled(true),
  unload: () => setEnabled(false),
  urlInclude: liveUrls,
})
