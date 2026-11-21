<template>
  <div class="dashboard-home-card-view">
    <VEmpty v-if="!uid">登录后查看关注列表</VEmpty>
    <template v-else>
      <CardCollection :dated="cardList.dated">
        <div v-if="cardList.groups.length" class="dashboard-home-card-date-groups">
          <CardDateGroup
            v-for="group in cardList.groups"
            :key="group.date"
            :date="group.date"
            :label="group.label"
          >
            <CardGridItem v-for="following in group.cards" :key="following.mid">
              <article class="dashboard-home-followings-card">
                <header class="dashboard-home-followings-header">
                  <UpInfo
                    :up-id="following.mid"
                    :up-name="following.uname"
                    :up-face-url="following.face"
                  />
                  <time
                    v-if="following.followedOn && !cardList.dated"
                    :datetime="formatDate(following.followedOn)"
                  >
                    关注于 {{ formatDate(following.followedOn) }}
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
          </CardDateGroup>
        </div>
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
import { computed } from 'vue'
import UpInfo from '@/components/feeds/UpInfo.vue'
import { getUID } from '@/core/utils'
import { formatDate } from '@/core/utils/formatters'
import { VEmpty } from '@/ui'
import { useDashboardOption } from '../../options'
import CardCollection from '../../shared/cards/CardCollection.vue'
import CardDateGroup from '../../shared/cards/CardDateGroup.vue'
import CardGridItem from '../../shared/cards/CardGridItem.vue'
import { getCardList } from '../../shared/cards/card-list'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import ListStatus from '../../shared/ListStatus.vue'
import { usePagedList } from '../../shared/use-paged-list'
import { getFollowingsPage, type Following } from './followings-api'

const uid = getUID()
const groupByDate = useDashboardOption('followingsGroupByDate')
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
const cardList = computed(() =>
  getCardList(followings.value, {
    groupByDate: groupByDate.value,
    getDate: following => following.followedOn,
  }),
)
</script>
