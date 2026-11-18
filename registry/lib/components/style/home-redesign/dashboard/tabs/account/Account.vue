<template>
  <div class="dashboard-home-account">
    <VLoading v-if="loadingProfile" />
    <VEmpty v-else-if="profileFailed">账号信息加载失败，请刷新页面重试</VEmpty>
    <VEmpty v-else-if="!profile?.isLogin">登录后查看账号信息</VEmpty>
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
      <DashboardHomeOperations @refresh="refresh" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DpiImage, VButton, VEmpty, VIcon, VLoading } from '@/ui'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
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
  panelColumns,
  loadPanels,
} = useAccount()
const inbox = ref<InstanceType<typeof AccountInbox>[]>()

const refresh = () => {
  loadPanels()
  inbox.value?.[0]?.refreshInbox()
}
</script>
