<template>
  <div class="dashboard-home-masonry-feed dashboard-home-followings">
    <VEmpty v-if="!uid">登录后查看关注列表</VEmpty>
    <template v-else>
      <ul v-if="followings.length" class="dashboard-home-masonry-grid" role="list">
        <MasonryItem v-for="following in followings" :key="following.mid" tag="li">
          <article class="dashboard-home-followings-card">
            <div class="dashboard-home-followings-header">
              <UpInfo
                :up-id="following.mid"
                :up-name="following.uname"
                :up-face-url="following.face"
              />
              <time v-if="following.followedOn" :datetime="following.followedOn">
                关注于 {{ following.followedOn }}
              </time>
            </div>
            <p
              v-if="following.sign"
              class="dashboard-home-followings-signature"
              v-text="following.sign"
            />
          </article>
        </MasonryItem>
      </ul>
      <div ref="loadTarget">
        <ListStatus
          :loading="loading"
          :failed="failed"
          :has-more="hasMore"
          :empty="!hasMore && !followings.length ? '暂无关注' : ''"
          @load="loadNext"
        />
      </div>
      <DashboardHomeOperations :refresh-disabled="loading" @refresh="refresh" />
    </template>
  </div>
</template>

<script setup lang="ts">
import UpInfo from '@/components/feeds/UpInfo.vue'
import { getUID } from '@/core/utils'
import { VEmpty } from '@/ui'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import ListStatus from '../../shared/ListStatus.vue'
import MasonryItem from '../../shared/MasonryItem.vue'
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
