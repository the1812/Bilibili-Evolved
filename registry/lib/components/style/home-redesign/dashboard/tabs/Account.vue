<template>
  <div class="dashboard-home-account">
    <VLoading v-if="loadingProfile" />
    <VEmpty v-else-if="profileFailed">账号信息加载失败，请刷新页面重试</VEmpty>
    <VEmpty v-else-if="!profile?.isLogin">登录 B 站后查看账号信息</VEmpty>
    <template v-else>
      <section class="dashboard-home-account-card">
        <div class="dashboard-home-account-identity">
          <div class="dashboard-home-account-avatar">
            <DpiImage v-if="profile.face" class="face" :src="profile.face" :size="64" alt="" />
            <VIcon v-else icon="mdi-account-circle-outline" :size="64" aria-hidden="true" />
            <DpiImage
              v-if="profile.pendant?.image"
              class="pendant"
              :src="profile.pendant.image"
              :size="96"
              alt=""
            />
          </div>
          <div>
            <h2>
              <a :href="spaceUrl" target="_blank" rel="noopener">{{ profile.uname }}</a>
            </h2>
            <div class="dashboard-home-account-muted">UID {{ profile.mid }}</div>
          </div>
          <div v-if="membership || levelLabel" class="dashboard-home-account-status">
            <a
              v-if="membership"
              class="dashboard-home-account-membership"
              href="https://account.bilibili.com/account/big"
              target="_blank"
              rel="noopener"
              >{{ membership }}</a
            >
            <strong v-if="levelLabel">{{ levelLabel }}</strong>
          </div>
        </div>
      </section>

      <div class="dashboard-home-account-panels">
        <div
          v-for="column in panelColumns"
          :key="column.name"
          class="dashboard-home-account-column"
        >
          <AccountInbox v-if="column.name === 'messages'" ref="inbox" />
          <section
            v-for="panel in column.panels"
            :key="panel.title"
            class="dashboard-home-account-card"
            :aria-busy="panel.loading"
          >
            <header class="dashboard-home-account-panel-heading">
              <h2>{{ panel.title }}</h2>
              <a v-if="panel.url" :href="panel.url" target="_blank" rel="noopener">查看全部</a>
            </header>
            <dl
              v-if="panel === counts && accountDetails.length"
              class="dashboard-home-account-details"
            >
              <div v-for="item in accountDetails" :key="item.label">
                <dt>{{ item.label }}</dt>
                <dd>{{ item.value }}</dd>
              </div>
            </dl>
            <VLoading v-if="panel.loading" />
            <VButton v-else-if="panel.failed" @click="panel.load">加载失败，点击重试</VButton>
            <ul v-else-if="panel.rows.length" class="dashboard-home-account-list" role="list">
              <li v-for="(item, index) in panel.rows" :key="index">
                <component
                  :is="item.url ? 'a' : 'div'"
                  class="dashboard-home-account-row"
                  :href="item.url"
                  :target="item.url ? '_blank' : undefined"
                  :rel="item.url ? 'noopener' : undefined"
                >
                  <DpiImage
                    v-if="item.image"
                    class="dashboard-home-account-thumbnail"
                    :src="item.image"
                    :size="{ width: 80, height: 45 }"
                    alt=""
                  />
                  <div class="dashboard-home-account-row-text">
                    <span>{{ item.label }}</span>
                    <small v-if="item.detail" class="dashboard-home-account-muted">{{
                      item.detail
                    }}</small>
                  </div>
                  <strong v-if="item.value !== undefined">{{ item.value }}</strong>
                </component>
              </li>
            </ul>
            <VEmpty v-else-if="panel !== counts || !accountDetails.length">{{
              panel.empty
            }}</VEmpty>
          </section>
        </div>
      </div>
      <DashboardHomeOperations @refresh="loadPanels" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { getUserInfo } from '@/core/user-info'
import { getUID } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'
import { DpiImage, VButton, VEmpty, VIcon, VLoading } from '@/ui'
import DashboardHomeOperations from '../DashboardHomeOperations.vue'
import { useDashboardWatchlater } from '../options'
import AccountInbox from './AccountInbox.vue'
import {
  type AccountProfile,
  type AccountRow,
  getAccountCounts,
  getAccountHistory,
  getAccountPrivileges,
  getAccountWatchlater,
} from './account'

const { error: logAccountError } = useScopedConsole('仪表盘首页账号')
const uid = getUID()
const profile = ref<AccountProfile>()
const showWatchlater = useDashboardWatchlater()
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
const inbox = ref<InstanceType<typeof AccountInbox>[]>()
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
  inbox.value?.[0]?.refresh()
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
</script>
