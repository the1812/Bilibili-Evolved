<template>
  <div class="dashboard-home-masonry-feed dashboard-home-followings" :aria-busy="loading">
    <VEmpty v-if="!uid">登录 B 站后查看关注列表</VEmpty>
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
      <div ref="loadMore" class="dashboard-home-masonry-status">
        <VLoading v-if="loading" />
        <VButton v-else-if="failed" @click="loadNextPage">加载失败，点击重试</VButton>
        <VEmpty v-else-if="!hasMore && !followings.length">暂无关注</VEmpty>
      </div>
      <DashboardHomeOperations v-if="followings.length" @refresh="refresh" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UpInfo from '@/components/feeds/UpInfo.vue'
import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'
import { getUID } from '@/core/utils'
import { formatDate } from '@/core/utils/formatters'
import { useScopedConsole } from '@/core/utils/log'
import { VButton, VEmpty, VLoading } from '@/ui'
import DashboardHomeOperations from '../shared/DashboardHomeOperations.vue'
import MasonryItem from '../shared/MasonryItem.vue'
import { useAutoLoad } from '../shared/use-auto-load'

interface RawFollowing {
  mid: number
  uname: string
  face?: string
  sign?: string
  mtime?: number
}

type Following = Omit<RawFollowing, 'mtime'> & { followedOn?: string }

interface FollowingPage {
  list?: RawFollowing[]
  total: number
}

const { error: logFollowingError } = useScopedConsole('仪表盘首页关注')
const uid = getUID()
const pageSize = 50
let nextPage = 1
const followings = ref<Following[]>([])
const loading = ref(false)
const failed = ref(false)
const hasMore = ref(true)

const loadNextPage = async () => {
  if (!uid || loading.value || !hasMore.value) {
    return
  }
  loading.value = true
  failed.value = false
  try {
    const params = new URLSearchParams({ vmid: uid, pn: String(nextPage), ps: String(pageSize) })
    const { list, total } = await bilibiliApi<FollowingPage>(
      getJsonWithCredentials(`https://api.bilibili.com/x/relation/followings?${params}`),
      '获取关注列表失败',
      false,
    )
    const page = (list ?? []).map(({ mtime, sign, ...following }) => ({
      ...following,
      sign: sign?.trim(),
      followedOn: mtime > 0 ? formatDate(new Date(mtime * 1000)) : undefined,
    }))
    followings.value = lodash.uniqBy([...followings.value, ...page], following => following.mid)
    hasMore.value = page.length > 0 && nextPage * pageSize < total
    nextPage += 1
  } catch (error) {
    logFollowingError(error)
    failed.value = true
  } finally {
    loading.value = false
  }
}

const loadMore = useAutoLoad(() => hasMore.value && !failed.value && !loading.value, loadNextPage)

const refresh = () => {
  if (loading.value) {
    return
  }
  followings.value = []
  nextPage = 1
  hasMore.value = true
  loadNextPage()
}
</script>
