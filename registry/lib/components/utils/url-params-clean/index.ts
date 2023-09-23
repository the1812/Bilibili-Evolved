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
    'plat_id',
    'goFrom',
    'jumpLinkType',
    'hasBack',
    'noTitleBar',
    'msource',
    'live_from',
    'plat_id',
    'extra_jump_from',
    'subarea_rank',
    'popular_rank',
    'launch_id',
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
    {
      match: /\/\/mall\.bilibili\.com\//,
      param: 'noReffer',
    },
  ]
  const [siteSpecifiedParams] = registerAndGetData(
    'urlParamsClean.siteSpecifiedParams',
    builtInSiteSpecifiedParams,
  )
  const builtInTailingSlash: { match: string | RegExp }[] = []
  const [tailingSlash] = registerAndGetData('urlParamsClean.tailingSlash', builtInTailingSlash)

  const getCleanUrl = (originalUrl: string) => {
    const url = new URL(originalUrl, location.origin)
    const urlParams = [...new URLSearchParams(url.search).entries()].map(
      ([key, value]) => `${key}=${value}`,
    )
    if (urlParams.some(param => noClean.some(it => param.includes(it)))) {
      return originalUrl
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
    tailingSlash.forEach(({ match }) => {
      const pathName = url.pathname
      if (matchPattern(pathName, match) && pathName.endsWith('/')) {
        url.pathname = pathName.slice(0, pathName.length - 1)
      }
    })
    const query = filteredParamsString ? `?${filteredParamsString}` : ''
    url.search = query
    return url.toString()
  }

  const createHistoryHook = (
    original: (data: unknown, unused: string, url: string, ...restArgs: unknown[]) => void,
  ) => {
    return function historyHook(
      data: unknown,
      unused: string,
      url: string,
      ...restArgs: unknown[]
    ) {
      const newUrl = getCleanUrl(url)
      if (newUrl !== url) {
        console.log('History API 拦截', url, newUrl)
        return original.call(this, data, unused, newUrl, ...restArgs)
      }
      return original.call(this, data, unused, url, ...restArgs)
    }
  }
  const originalPushState = unsafeWindow.history.pushState
  unsafeWindow.history.pushState = createHistoryHook(originalPushState)
  const originalReplaceState = unsafeWindow.history.replaceState
  unsafeWindow.history.replaceState = createHistoryHook(originalReplaceState)

  const clean = () => {
    const newUrl = getCleanUrl(document.URL)
    if (newUrl !== document.URL) {
      console.log('直接清理', document.URL, newUrl)
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
  tags: [componentsTags.utils],
  urlExclude: [/game\.bilibili\.com\/fgo/, /live\.bilibili\.com\/p\/html\/live-app-hotrank\//],
})
