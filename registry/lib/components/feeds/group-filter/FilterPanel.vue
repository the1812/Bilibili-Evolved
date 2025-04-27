<template>
  <div class="group-filter-panel">
    <div class="group-filter-header">
      <h1>分组</h1>
      <switch-box v-model="allChecked" />
    </div>
    <div v-for="(group, index) in groups" :key="index" class="group-item">
      <CheckBox v-model="group.checked">
        {{ group.name }}
      </CheckBox>
    </div>
  </div>
</template>

<script lang="ts">
import { CheckBox, SwitchBox } from '@/ui'
import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'
import { FeedsCard, forEachFeedsCard } from '@/components/feeds/api'

interface Group {
  name: string
  checked: boolean
  id: number
}

let cardsManager: typeof import('@/components/feeds/api').feedsCardsManager

export default Vue.extend({
  components: {
    SwitchBox,
    CheckBox,
  },
  data() {
    return {
      groups: [],
      followingMap: new Map<string, number[]>(), // username -> tagid[]
      selectedGroupIds: [],
      allChecked: true,
    } as {
      groups: Group[]
      followingMap: Map<string, number[]>
      selectedGroupIds: number[]
      allChecked: boolean
    }
  },
  watch: {
    groups: {
      handler(newGroups: Group[]) {
        this.selectedGroupIds = newGroups.filter(group => group.checked).map(group => group.id)
        cardsManager.cards.forEach(card => {
          this.updateCard(lodash.clone(card))
        })
      },
      deep: true,
      immediate: true,
    },
    allChecked: {
      handler(newChecked: boolean) {
        for (const group of this.groups) {
          group.checked = newChecked
        }
      },
    },
  },
  async mounted() {
    cardsManager = await forEachFeedsCard({
      added: card => {
        this.updateCard(lodash.clone(card))
      },
    })
    // fetch groups
    this.groups = await bilibiliApi<Array<any>>(
      getJsonWithCredentials('https://api.bilibili.com/x/relation/tags'),
      '分组信息获取失败',
    ).then(res =>
      res.map(value => ({
        name: value.name,
        checked: true,
        id: value.tagid,
      })),
    )

    // fetch uid
    const uid = await getJsonWithCredentials('https://api.live.bilibili.com/User/getUserInfo').then(
      res => res.data.uid,
    )
    // fetch following
    const firstReq = await bilibiliApi(
      getJsonWithCredentials(
        `https://api.bilibili.com/x/relation/followings?vmid=${uid}&pn=1&ps=50`,
      ),
    )
    const totalPages = Math.ceil(firstReq.total / 50)
    let allPages: Array<any> = []
    if (totalPages === 1) {
      allPages = [firstReq.list]
    }

    const pagePromises = []
    for (let page = 2; page <= totalPages; page++) {
      pagePromises.push(
        bilibiliApi(
          getJsonWithCredentials(
            `https://api.bilibili.com/x/relation/followings?vmid=${uid}&pn=${page}&ps=50`,
          ),
        ).then(res => res.list),
      )
    }

    const otherPagesData = await Promise.all(pagePromises)
    allPages = [firstReq.list, ...otherPagesData].flat()
    allPages.forEach(user => {
      this.followingMap.set(user.uname, user.tag)
    })
  },
  methods: {
    updateCard(card: FeedsCard) {
      // 从username获得tag
      const userTagIds: number[] = this.followingMap.get(card.username)
      if (!userTagIds.some(item => this.selectedGroupIds.includes(item))) {
        card.element.classList.add('pattern-block')
      } else {
        card.element.classList.remove('pattern-block')
      }
    },
  },
})
</script>

<style scoped lang="scss">
@import './blocker';

.group-filter-panel {
  background-color: white;
  font-size: 12px;
  width: 100%;
  border-radius: 4px;
  box-sizing: border-box;
  flex-direction: column;
  padding: 12px 16px;

  .group-filter-header {
    cursor: pointer;
    padding-bottom: 14px;
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;

    h1 {
      font-weight: normal;
      font-size: 16px;
      margin: 0;
    }
  }

  .group-item {
    display: flex;
    flex-direction: row;
    font-size: 14px;
  }

  body.dark & {
    color: #eee;
    background-color: #444;
  }
}
</style>
