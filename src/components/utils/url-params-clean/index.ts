import { registerAndGetData } from '@/plugins/data'
import { ComponentMetadata, componentsTags } from '@/components/component'

export const UrlParamsClean = 'url-params-clean'
const entry = async () => {
  const builtInBlockParams = [
    'spm_id_from',
    'from_source',
    'from_spmid',
    'from',
    'seid',
    'share_source',
    'share_medium',
    'share_plat',
    'share_tag',
    'bbid',
    'ts',
    'timestamp',
    'unique_k',
    'rt',
    'tdsourcetag',
    'accept_quality',
    'broadcast_type',
    'current_qn',
    'current_quality',
    'playurl_h264',
    'playurl_h265',
    'quality_description',
    'network',
    'network_status',
    'platform_network_status',
    'p2p_type',
  ]
  const blockParams: string[] = registerAndGetData(UrlParamsClean, builtInBlockParams)[0]
  const clean = () => {
    const urlParams = window.location.search.substring(1).split('&')
    const filteredParams = urlParams.filter(p => {
      if (blockParams.some(b => p.startsWith(`${b}=`))) {
        return false
      }
      return true
    })
    // if (urlParams.length !== filteredParams.length) {
    const filteredParamsString = filteredParams.join('&')
    const url = document.URL.replace(window.location.search, '')
    const query = filteredParamsString ? (`?${filteredParamsString}`) : ''
    const newUrl = url + query
    if (newUrl !== document.URL) {
      console.log('[URL params clean]', document.URL, newUrl)
      window.history.replaceState({}, document.title, newUrl)
    }
    // }
  }
  const { fullyLoaded } = await import('@/core/life-cycle')
  const { videoChange } = await import('@/core/observer')
  fullyLoaded(() => {
    if (document.contentType === 'text/html') {
      clean()
      videoChange(() => clean())
    }
  })
}
export const component: ComponentMetadata = {
  name: 'urlParamsClean',
  displayName: '网址参数清理',
  entry,
  description: {
    'zh-CN': '自动删除网址中的多余跟踪参数.',
  },
  tags: [
    componentsTags.utils,
  ],
  enabledByDefault: true,
}
