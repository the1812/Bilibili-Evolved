<template>
  <div ref="element" class="multiple-widgets">
    <VPopup
      ref="medalPopup"
      v-model="medalOpen"
      class="badge-popup widgets-popup medal"
      :trigger-element="$refs.medalButton"
    >
      <ul>
        <li
          v-for="medal of medalList"
          :key="medal.id"
          :data-id="medal.id"
          :class="{ active: medal.isActive, gray: grayEffect && !medal.isLighted }"
          :title="medal.upName"
          @click="toggleBadge(medal, medalList)"
        >
          <div class="fans-medal-item" :class="['level-' + medal.level]">
            <span class="label">{{ medal.name }}</span>
            <span class="level">{{ medal.level }}</span>
          </div>
        </li>
      </ul>
    </VPopup>
    <DefaultWidget ref="medalButton" icon="mdi-medal" @click="medalOpen = !medalOpen">
      <span>更换勋章</span>
    </DefaultWidget>

    <VPopup
      ref="titlePopup"
      v-model="titleOpen"
      class="badge-popup widgets-popup title"
      :trigger-element="$refs.titleButton"
    >
      <ul>
        <li
          v-for="title of titleList"
          :key="title.id"
          :data-id="title.id"
          :class="{ active: title.isActive }"
          @click="toggleBadge(title, titleList)"
        >
          <img :src="title.imageUrl" class="title-image" />
        </li>
      </ul>
    </VPopup>
    <DefaultWidget ref="titleButton" icon="mdi-script-outline" @click="titleOpen = !titleOpen">
      <span>更换头衔</span>
    </DefaultWidget>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { addComponentListener, getComponentSettings } from '@/core/settings'
import { descendingSort } from '@/core/utils/sort'
import { DefaultWidget, VPopup } from '@/ui'
import { Medal, Title, Badge, getMedalList, getTitleList } from './badge'
import { BadgeHelperOptions } from './options'

const { options } = getComponentSettings<BadgeHelperOptions>('badgeHelper')
const element = ref<HTMLElement>()
const medalList = ref<Medal[]>([])
const titleList = ref<Title[]>([])
const medalOpen = ref(false)
const titleOpen = ref(false)
const grayEffect = ref(true)

const updateColumnsCount = () => {
  const maxColumnCount = 15
  const columnLength = 18
  const medalColumns = Math.min(Math.ceil(medalList.value.length / columnLength), maxColumnCount)
  element.value.style.setProperty('--medal-columns', medalColumns.toString())
  const titleColumns = Math.min(Math.ceil(titleList.value.length / columnLength), maxColumnCount)
  element.value.style.setProperty('--title-columns', titleColumns.toString())
}
const loadMedalList = async () => {
  medalList.value = (await getMedalList())
    .sort(descendingSort(it => it.level))
    .slice(0, options.maxBadgeCount)
}
const loadTitleList = async () => {
  titleList.value = (await getTitleList()).slice(0, options.maxBadgeCount)
}
const toggleBadge = async (badge: Badge, list: Badge[]) => {
  console.log(badge)
  if (badge.isActive) {
    badge.isActive = false
    await badge.deactivate()
  } else {
    const activeBadge = list.find(b => b.isActive)
    if (activeBadge) {
      activeBadge.isActive = false
    }
    badge.isActive = true
    await badge.activate()
    if (badge instanceof Medal) {
      options.defaultMedalID = badge.id
    }
  }
  if (badge instanceof Medal) {
    await loadMedalList()
  } else if (badge instanceof Title) {
    await loadTitleList()
  }
}
onMounted(async () => {
  addComponentListener(
    'badgeHelper.grayEffect',
    (enable: boolean) => {
      grayEffect.value = enable
    },
    true,
  )
  const init = async () => {
    const medal = loadMedalList()
    await Title.getImageMap()
    const title = loadTitleList()
    return Promise.all([medal, title])
  }
  await init()
  updateColumnsCount()
})
</script>

<style lang="scss">
@import 'common';
.badge-popup {
  top: 50%;
  left: calc(100% + 8px);
  transform: scale(0.9) translateY(-50%);
  transform-origin: left;
  padding: 4px;
  max-height: calc(100vh - 150px);
  @include card();
  @include no-scrollbar();
  @include round-corner(4px);
  &.open {
    transform: scale(1) translateY(-50%);
  }
  body.settings-panel-dock-right & {
    right: calc(100% + 8px);
    left: unset;
    transform-origin: right;
  }
  &,
  & * {
    transition: 0.2s ease-out;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    li {
      @include round-corner(4px);
      cursor: pointer;
      padding: 6px 8px;
      display: flex;
      justify-content: center;
      &:hover {
        background-color: #8882;
      }
      &.active {
        box-shadow: 0 0 0px 1px var(--theme-color), 0 0 0px 3px var(--theme-color-20);
      }
      &.gray:not(:hover) {
        filter: grayscale(1);
      }
      .title-image {
        display: inline-block;
        vertical-align: middle;
        height: 20px;
      }
      $rankColors: (
        0: #48b6a5,
        1: #5896de,
        2: #a068f1,
        3: #ff86b2,
        4: #f6be18,
      );
      .fans-medal-item {
        // display: inline-block;
        display: flex !important;
        height: 14px;
        line-height: 14px;
        color: #fff;
        border: 1px solid map-get($rankColors, 4);
        background-color: map-get($rankColors, 4);
        border-left: 0;
        white-space: nowrap;
        border-radius: 2px;
        flex-shrink: 0;
        font-size: 12px;
        .label {
          width: 40px;
          text-align: center;
          padding: 0 2px;
          color: #fff;
          border-radius: 1px 0 0 1px;
          background-color: map-get($rankColors, 4);
        }
        .level {
          width: 16px;
          background-color: #fff;
          text-align: center;
          color: map-get($rankColors, 4);
          border-radius: 0 1px 1px 0;
        }
        .label,
        .level {
          cursor: pointer;
          position: relative;
          display: block;
          float: left;
        }
      }
      @for $rank from 0 to 5 {
        @for $level from 1 to 5 {
          $color: map-get($rankColors, $rank);
          .level-#{$rank * 4 + $level} {
            border-color: $color;
            background-color: $color;
            .label {
              background-color: $color;
            }
            .level {
              color: $color;
            }
          }
        }
      }
    }
  }
  &.medal ul {
    grid-template-columns: repeat(var(--medal-columns, 2), 1fr);
  }
  &.title ul {
    grid-template-columns: repeat(var(--title-columns, 2), 1fr);
  }
}
</style>
