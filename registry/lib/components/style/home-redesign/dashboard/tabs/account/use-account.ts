import { computed, onMounted, reactive, ref, watch } from 'vue'
import { getUserInfo } from '@/core/user-info'
import { getUID } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'
import { useDashboardOption } from '../../options'
import {
  type AccountProfile,
  type AccountRow,
  getAccountCounts,
  getAccountHistory,
  getAccountPrivileges,
  getAccountWatchlater,
} from './account-api'

export const useAccount = () => {
  const { error: logAccountError } = useScopedConsole('仪表盘首页账号')
  const uid = getUID()
  const profile = ref<AccountProfile>()
  const showWatchlater = useDashboardOption('enableWatchlater')
  const loadingProfile = ref(Boolean(uid))
  const profileFailed = ref(false)
  const spaceUrl = computed(() => `https://space.bilibili.com/${profile.value?.mid ?? uid}`)
  const annualVip = computed(() => profile.value?.vipStatus === 1 && profile.value.vipType === 2)
  const membership = computed(() => {
    if (profile.value?.vipStatus === 1) {
      return profile.value.vip_label?.text || (annualVip.value ? '年度大会员' : '大会员')
    }
    const level = profile.value?.level_info?.current_level
    if (typeof level !== 'number') {
      return undefined
    }
    return level === 0 ? '注册会员' : '正式会员'
  })
  const levelLabel = computed(() => {
    const level = profile.value?.level_info?.current_level
    if (!Number.isFinite(level)) {
      return undefined
    }
    const suffix = profile.value?.is_senior_member ? '+' : ''
    return `Lv${level}${suffix}`
  })
  const accountDetails = computed(() =>
    [
      { label: '硬币', value: profile.value?.money },
      { label: 'B币', value: profile.value?.wallet?.bcoin_balance },
      { label: 'EXP', value: profile.value?.level_info?.current_exp },
    ].filter(item => Number.isFinite(item.value)),
  )

  const createPanel = (
    title: string,
    empty: string,
    fetchRows: () => Promise<AccountRow[]>,
    url?: string,
  ) => {
    const panel = reactive({
      title,
      empty,
      url,
      rows: [] as AccountRow[],
      loading: false,
      failed: false,
      async load() {
        if (panel.loading) {
          return
        }
        panel.loading = true
        panel.failed = false
        try {
          panel.rows = await fetchRows()
        } catch (error) {
          logAccountError(error)
          panel.failed = true
        } finally {
          panel.loading = false
        }
      },
    })
    return panel
  }
  const counts = createPanel('账号数据', '暂无账号数据', () => getAccountCounts(profile.value.mid))
  const privileges = createPanel(
    '大会员权益',
    '暂无可显示的权益',
    getAccountPrivileges,
    'https://account.bilibili.com/account/big',
  )
  const history = createPanel(
    '最近观看',
    '暂无观看记录',
    getAccountHistory,
    'https://www.bilibili.com/history',
  )
  const watchlater = createPanel(
    '稍后再看',
    '稍后再看列表为空',
    getAccountWatchlater,
    'https://www.bilibili.com/watchlater/#/list',
  )
  const panelColumns = computed(() => [
    { name: 'account', panels: annualVip.value ? [counts, privileges] : [counts] },
    { name: 'messages', panels: [] },
    { name: 'activity', panels: showWatchlater.value ? [watchlater, history] : [history] },
  ])
  const loadPanels = () => {
    panelColumns.value.flatMap(column => column.panels).forEach(panel => panel.load())
  }
  watch(showWatchlater, enabled => {
    if (enabled && profile.value?.isLogin) {
      watchlater.load()
    }
  })

  onMounted(async () => {
    if (!uid) {
      return
    }
    try {
      profile.value = await getUserInfo()
      if (profile.value?.isLogin) {
        loadPanels()
      }
    } catch (error) {
      logAccountError(error)
      profileFailed.value = true
    } finally {
      loadingProfile.value = false
    }
  })

  return {
    profile,
    loadingProfile,
    profileFailed,
    spaceUrl,
    membership,
    levelLabel,
    accountDetails,
    counts,
    panelColumns,
    loadPanels,
  }
}
