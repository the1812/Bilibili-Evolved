<template>
  <div class="group-filter-panel" :class="{ collapse }">
    <div class="group-filter-header" @click="collapse = !collapse">
      <h1>动态分组过滤</h1>
      <VIcon icon="mdi-chevron-up" />
    </div>
    <div class="group-item group-select-all">
      <CheckBox v-model="allChecked"> 全选 </CheckBox>
    </div>
    <div v-for="(group, index) in groups" :key="index" class="group-item">
      <CheckBox v-model="group.checked">
        {{ group.name }}
      </CheckBox>
    </div>
  </div>
</template>

<script lang="ts">
import { CheckBox, VIcon } from '@/ui'
import { bilibiliApi, getJsonWithCredentials, getPages } from '@/core/ajax'
import { FeedsCard, forEachFeedsCard } from '@/components/feeds/api'
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'
import { mutationObserve } from '@/core/observer'
import { select } from '@/core/spin-query'
import { getUID } from '@/core/utils'
import { FeedsGroupFilterOptions } from './options'

interface Group {
  name: string
  checked: boolean
  id: number
}

const defaultGroupId = 0

let cardsManager: typeof import('@/components/feeds/api').feedsCardsManager | undefined
const { options } = getComponentSettings<FeedsGroupFilterOptions>('feedsGroupFilter')

export default Vue.extend({
  components: {
    CheckBox,
    VIcon,
  },
  data() {
    return {
      groups: [],
      followingMap: new Map<string, number[]>(), // username -> tagid[]
      selectedGroupIds: [],
      collapse: true,
      isRestoringGroups: true,
      followingLoaded: false,
      upListRoot: null,
      upListObserver: null,
      upListFrame: 0,
      disposed: false,
    } as {
      groups: Group[]
      followingMap: Map<string, number[]>
      selectedGroupIds: number[]
      collapse: boolean
      isRestoringGroups: boolean
      followingLoaded: boolean
      upListRoot: HTMLElement | null
      upListObserver: MutationObserver | null
      upListFrame: number
      disposed: boolean
    }
  },
  computed: {
    allChecked: {
      get(): boolean {
        return this.groups.every(group => group.checked)
      },
      set(newChecked: boolean) {
        for (const group of this.groups) {
          group.checked = newChecked
        }
      },
    },
    validGroupIds(): Set<number> {
      return new Set(this.groups.map(group => group.id))
    },
  },
  watch: {
    groups: {
      handler(newGroups: Group[]) {
        this.selectedGroupIds = newGroups.filter(group => group.checked).map(group => group.id)
        this.updateCards()
        this.updateUpList()
        if (!this.isRestoringGroups) {
          options.disabledGroupIds = newGroups
            .filter(group => !group.checked)
            .map(group => group.id)
        }
      },
      deep: true,
      immediate: true,
    },
  },
  async mounted() {
    addComponentListener('feedsGroupFilter.filterUpList', this.configureUpList)
    cardsManager = await forEachFeedsCard({
      added: card => {
        this.updateCard(lodash.clone(card))
      },
    })
    // fetch groups
    const disabledGroupIds = options.disabledGroupIds ?? []
    this.isRestoringGroups = true
    this.groups = await bilibiliApi<Array<any>>(
      getJsonWithCredentials('https://api.bilibili.com/x/relation/tags'),
      '分组信息获取失败',
    ).then(res =>
      res.map(value => ({
        name: value.name,
        checked: !disabledGroupIds.includes(value.tagid),
        id: value.tagid,
      })),
    )
    this.isRestoringGroups = false

    const uid = getUID()
    // fetch following
    const allPages = await getPages({
      api: page =>
        getJsonWithCredentials(
          `https://api.bilibili.com/x/relation/followings?vmid=${uid}&pn=${page}&ps=50`,
        ),
      getList: json => json.data.list,
      getTotal: json => json.data.total,
    })
    allPages.forEach(user => {
      this.followingMap.set(user.uname, user.tag)
    })
    this.followingLoaded = true
    this.updateCards()
    this.configureUpList()
  },
  beforeDestroy() {
    this.disposed = true
    removeComponentListener('feedsGroupFilter.filterUpList', this.configureUpList)
    this.configureUpList()
  },
  methods: {
    async configureUpList() {
      this.upListObserver?.disconnect()
      this.upListObserver = null
      cancelAnimationFrame(this.upListFrame)
      this.upListFrame = 0
      this.updateUpList()
      if (
        this.disposed ||
        !options.filterUpList ||
        !this.followingLoaded ||
        cardsManager?.managerType !== 'v2'
      ) {
        return
      }
      const main = await select<HTMLElement>('.bili-dyn-home--member main')
      if (!main || this.disposed || !options.filterUpList || this.upListObserver) {
        return
      }
      this.upListRoot = main
      this.upListObserver = mutationObserve(
        [main],
        { childList: true, subtree: true, characterData: true },
        () => {
          if (this.upListFrame) {
            return
          }
          this.upListFrame = requestAnimationFrame(() => {
            this.upListFrame = 0
            this.updateUpList()
          })
        },
      )[0]
    },
    updateUpList() {
      const upList = this.upListRoot?.querySelector('.bili-dyn-up-list')
      if (!upList) {
        return
      }
      const enabled = options.filterUpList && this.followingLoaded && !this.disposed
      let activeHidden = false
      upList.querySelectorAll<HTMLElement>('.bili-dyn-up-list__item').forEach(item => {
        const isAll = item.querySelector('.bili-dyn-up-list__item__face.all') !== null
        const username = item.querySelector('.bili-dyn-up-list__item__name')?.textContent.trim()
        const hidden = enabled && !isAll && !this.isUserInSelectedGroups(username)
        activeHidden ||= hidden && item.classList.contains('active')
        item.classList.toggle('group-filter-hide-up', hidden)
      })
      // 当前 UP 被排除时回到聚合动态，避免停留在已隐藏的单人入口。
      if (activeHidden) {
        upList
          .querySelector('.bili-dyn-up-list__item__face.all')
          ?.closest<HTMLElement>('.bili-dyn-up-list__item')
          ?.click()
      }
    },
    isUserInSelectedGroups(username: string) {
      // 关注接口中已删除分组的 tag 不会重置, 过滤后全部无效时归入默认分组
      const validTagIds = (this.followingMap.get(username) ?? []).filter(id =>
        this.validGroupIds.has(id),
      )
      const userTagIds = validTagIds.length > 0 ? validTagIds : [defaultGroupId]
      return userTagIds.some(item => this.selectedGroupIds.includes(item))
    },
    updateCards() {
      if (!cardsManager) {
        return
      }
      cardsManager.cards.forEach(card => {
        this.updateCard(lodash.clone(card))
      })
    },
    updateCard(card: FeedsCard) {
      if (!this.selectedGroupIds) {
        return
      }
      if (!this.isUserInSelectedGroups(card.username)) {
        card.element.classList.add('group-filter-hide-feed')
      } else {
        card.element.classList.remove('group-filter-hide-feed')
      }
    },
  },
})
</script>

<style lang="scss">
.group-filter-hide-feed,
.bili-dyn-up-list .group-filter-hide-up {
  display: none !important;
}

.group-filter-panel {
  background-color: white;
  font-size: 12px;
  width: 100%;
  border-radius: 4px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 12px 16px;

  .group-filter-header {
    cursor: pointer;
    padding-bottom: 8px;
    position: sticky;
    top: 0;
    background-color: inherit;
    display: flex;
    align-items: center;
    justify-content: space-between;

    h1 {
      font-weight: normal;
      font-size: 14px;
      margin: 0;
    }
  }

  &.collapse {
    .group-filter-header {
      padding-bottom: 0;

      .be-icon {
        transform: rotate(180deg);
      }
    }

    > :not(.group-filter-header) {
      display: none;
    }
  }

  .group-item {
    display: flex;
    flex-direction: row;
    font-size: 14px;
  }

  .group-select-all {
    padding: 6px 0;
  }

  body.dark & {
    color: var(--be-color-text-title, #eee);
    background-color: var(--be-color-panel-bg, #444);
  }
}
</style>
