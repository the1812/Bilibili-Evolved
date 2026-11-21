import { computed, onMounted, reactive, ref } from 'vue'
import { getUID } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'
import { dashboardUrls, getSpaceUrls } from '../../shared/urls'
import {
  type AccountProfile,
  type AccountRow,
  getAccountCounts,
  getAccountPrivileges,
  getAccountProfile,
} from './account-api'

export const useAccount = () => {
  const { error: logAccountError } = useScopedConsole('仪表盘首页账号')
  const uid = getUID()
  const profile = ref<AccountProfile>()
  const loadingProfile = ref(false)
  const profileFailed = ref(false)
  const spaceUrl = computed(() => getSpaceUrls(profile.value?.mid ?? uid).home)
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
    dashboardUrls.vipAccount,
  )
  const panels = computed(() => (annualVip.value ? [counts, privileges] : [counts]))
  const loadPanels = () => {
    panels.value.forEach(panel => panel.load())
  }

  const loadProfile = async () => {
    if (!uid || loadingProfile.value) {
      return
    }
    loadingProfile.value = true
    profileFailed.value = false
    try {
      profile.value = await getAccountProfile()
      if (profile.value?.isLogin) {
        loadPanels()
      }
    } catch (error) {
      logAccountError(error)
      profileFailed.value = true
    } finally {
      loadingProfile.value = false
    }
  }
  onMounted(loadProfile)

  return {
    profile,
    loadingProfile,
    profileFailed,
    spaceUrl,
    membership,
    levelLabel,
    accountDetails,
    counts,
    panels,
    loadProfile,
    loadPanels,
  }
}
