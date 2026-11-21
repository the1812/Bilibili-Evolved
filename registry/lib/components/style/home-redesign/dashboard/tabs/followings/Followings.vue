<template>
  <div class="dashboard-home-card-view">
    <VEmpty v-if="!uid">登录后查看关注列表</VEmpty>
    <template v-else>
      <CardCollection>
        <ul v-if="followings.length" class="dashboard-home-card-grid" role="list">
          <CardGridItem v-for="following in followings" :key="following.mid">
            <article class="dashboard-home-followings-card">
              <header class="dashboard-home-followings-header">
                <UpInfo
                  :up-id="following.mid"
                  :up-name="following.uname"
                  :up-face-url="following.face"
                />
                <time v-if="following.followedOn" :datetime="following.followedOn">
                  关注于 {{ following.followedOn }}
                </time>
              </header>
              <div v-if="following.sign" class="dashboard-home-followings-signature-area">
                <p
                  class="dashboard-home-followings-signature"
                  :title="following.sign"
                  v-text="following.sign"
                />
              </div>
            </article>
          </CardGridItem>
        </ul>
        <ListStatus
          ref="loadTarget"
          class="dashboard-home-card-list-end"
          :loading="loading"
          :failed="failed"
          :has-more="hasMore"
          :empty="!hasMore && !followings.length ? '暂无关注' : ''"
          @load="loadNext"
        />
      </CardCollection>
      <DashboardHomeOperations :refresh-disabled="loading" @refresh="refresh" />
    </template>
  </div>
</template>

<script setup lang="ts">
import UpInfo from '@/components/feeds/UpInfo.vue'
import { getUID } from '@/core/utils'
import { VEmpty } from '@/ui'
import CardCollection from '../../shared/CardCollection.vue'
import CardGridItem from '../../shared/CardGridItem.vue'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import ListStatus from '../../shared/ListStatus.vue'
import { usePagedList } from '../../shared/use-paged-list'
import { getFollowingsPage, type Following } from './followings-api'

const uid = getUID()
const {
  entries: followings,
  loading,
  failed,
  hasMore,
  loadTarget,
  loadNext,
  refresh,
} = usePagedList<Following, number>({
  source: () => uid || undefined,
  fetchPage: (page = 1) => getFollowingsPage(uid, page),
  getKey: following => following.mid,
  logName: '仪表盘首页关注',
})
</script>
