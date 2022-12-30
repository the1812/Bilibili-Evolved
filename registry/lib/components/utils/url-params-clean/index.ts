import { registerAndGetData } from '@/plugins/data'
import { defineComponentMetadata } from '@/components/define'
import { isIframe, isNotHtml, matchPattern } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'

const displayName = '网址参数清理'
const console = useScopedConsole(displayName)
const entry = async () => {
  if (isNotHtml() || isIframe()) {
    return
  }
  const builtInNoClean = ['videocard_series']
  const [noClean] = registerAndGetData('urlParamsClean.noClean', builtInNoClean)
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
    'share_session_id',
    'share_from',
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
    'referfrom',
    'visit_id',
    'bsource',
    'spm',
    'hotRank',
    '-Arouter',
    'vd_source',
    'is_story_h5',
    'buvid',
  ]
  const [blockParams] = registerAndGetData('urlParamsClean.params', builtInBlockParams)
  const builtInSiteSpecifiedParams = [
    {
      match: /\/\/www\.bilibili\.com\/audio\/(au[\d]+|mycollection)/,
      param: 'type',
    },
    {
      match: /\/\/live\.bilibili\.com\//,
      param: 'session_id',
    },
    {
      match: /\/\/www\.bilibili\.com\/bangumi\//,
      param: 'theme',
    },
    {
      match: /\/\/www\.bilibili\.com\/video\//,
      param: 'mid',
    },
    {
      match: /\/\/www\.bilibili\.com\/video\//,
      param: 'up_id',
    },
  ]
  const [siteSpecifiedParams] = registerAndGetData(
    'urlParamsClean.siteSpecifiedParams',
    builtInSiteSpecifiedParams,
  )
  const builtInTailingSlash: { match: string | RegExp }[] = []
  const [tailingSlash] = registerAndGetData('urlParamsClean.tailingSlash', builtInTailingSlash)

  const clean = () => {
    const urlParams = window.location.search.substring(1).split('&')
    if (urlParams.some(param => noClean.some(it => param.includes(it)))) {
      return
    }
    const filteredParams = urlParams.filter(p => {
      if (blockParams.some(b => p.startsWith(`${b}=`))) {
        return false
      }
      if (
        siteSpecifiedParams.some(
          ({ match, param }) => document.URL.match(match) && p.startsWith(`${param}=`),
        )
      ) {
        return false
      }
      return true
    })
    const filteredParamsString = filteredParams.join('&')
    let url = document.URL.replace(window.location.search, '')
    tailingSlash.forEach(({ match }) => {
      if (matchPattern(url, match) && url.endsWith('/')) {
        url = url.slice(0, url.length - 1)
      }
    })
    const query = filteredParamsString ? `?${filteredParamsString}` : ''
    const newUrl = url + query
    if (newUrl !== document.URL) {
      console.log(document.URL, newUrl)
      window.history.replaceState(history.state, '', newUrl)
    }
  }
  const { fullyLoaded } = await import('@/core/life-cycle')
  const { urlChange } = await import('@/core/observer')
  fullyLoaded(() => {
    urlChange(() => clean())
  })
}
export const component = defineComponentMetadata({
  name: 'urlParamsClean',
  displayName,
  entry,
  description: {
    'zh-CN':
      '自动删除网址中的多余跟踪参数. 请注意这会导致浏览器历史记录出现重复的标题 (分别是转换前后的网址), 并可能导致后退要多退几次.',
  },
  tags: [componentsTags.utils],
  urlExclude: [/game\.bilibili\.com\/fgo/, /live\.bilibili\.com\/p\/html\/live-app-hotrank\//],
})
