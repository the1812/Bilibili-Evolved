<template>
  <div class="dashboard-home-account">
    <ListStatus
      v-if="loadingProfile || profileFailed"
      :loading="loadingProfile"
      :failed="profileFailed"
      error="账号信息加载失败"
      @load="loadProfile"
    />
    <VEmpty v-else-if="!profile?.isLogin">登录后查看账号信息</VEmpty>
    <template v-else>
      <section class="dashboard-home-account-card">
        <div class="dashboard-home-account-identity">
          <div class="dashboard-home-account-avatar">
            <DpiImage
              v-if="profile.face"
              class="dashboard-home-account-avatar-image"
              :src="profile.face"
              :size="64"
              alt=""
            />
            <VIcon v-else icon="mdi-account-circle-outline" :size="64" aria-hidden="true" />
            <DpiImage
              v-if="profile.pendant?.image"
              class="dashboard-home-account-avatar-pendant"
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
              :href="dashboardUrls.vipAccount"
              target="_blank"
              rel="noopener"
              >{{ membership }}</a
            >
            <strong v-if="levelLabel">{{ levelLabel }}</strong>
          </div>
        </div>
      </section>

      <div class="dashboard-home-account-panels">
        <div class="dashboard-home-account-column">
          <section
            v-for="panel in panels"
            :key="panel.title"
            class="dashboard-home-account-card"
            :aria-busy="panel.loading"
          >
            <header class="dashboard-home-account-panel-heading">
              <h2>{{ panel.title }}</h2>
              <a
                v-if="panel.url"
                :href="panel.url"
                :aria-label="'查看全部' + panel.title"
                target="_blank"
                rel="noopener"
              >
                查看全部
              </a>
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
            <ul
              v-if="!panel.loading && !panel.failed && panel.rows.length"
              class="dashboard-home-account-list"
              role="list"
            >
              <li v-for="(item, index) in panel.rows" :key="index">
                <component
                  :is="item.url ? 'a' : 'div'"
                  class="dashboard-home-account-row"
                  :href="item.url"
                  :target="item.url ? '_blank' : undefined"
                  :rel="item.url ? 'noopener' : undefined"
                >
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
            <ListStatus
              v-else
              :loading="panel.loading"
              :failed="panel.failed"
              :empty="panel === counts && accountDetails.length ? undefined : panel.empty"
              @load="panel.load"
            />
          </section>
        </div>
        <AccountInbox ref="inboxPanel" />
        <section class="dashboard-home-account-card">
          <h2>{{ personalSection.title }}</h2>
          <SitemapLinkList :links="personalSection.links" />
        </section>
      </div>
      <DashboardHomeOperations @refresh="refreshAccount" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getUID } from '@/core/utils'
import { DpiImage, VEmpty, VIcon } from '@/ui'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import ListStatus from '../../shared/ListStatus.vue'
import { dashboardUrls } from '../../shared/urls'
import SitemapLinkList from '../sitemap/SitemapLinkList.vue'
import { getPersonalSitemapSection } from '../sitemap/sitemap-links'
import AccountInbox from './AccountInbox.vue'
import { useAccount } from './use-account'

const {
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
} = useAccount()
const inboxPanel = ref<InstanceType<typeof AccountInbox>>()
const personalSection = getPersonalSitemapSection(getUID())

const refreshAccount = () => {
  loadPanels()
  inboxPanel.value?.refreshInbox()
}
</script>
