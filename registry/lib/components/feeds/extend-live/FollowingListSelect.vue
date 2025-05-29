<template>
  <VDropdown
    :items="followingList"
    :key-mapper="item => item.id"
    class="be-live-following-list-select"
    :value="selectedItem"
    @change="handleFollowingListChange"
  >
    <template #item="{ item }">
      <span class="be-live-following-list-item"> {{ item.displayName }} </span>
    </template>
  </VDropdown>
</template>
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { VDropdown } from '@/ui'
import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'
import { FollowingListID, FollowingListItem, RawFollowingListItem } from './types'
import { UnselectedListID } from './options'

const props = defineProps<{
  value: FollowingListID
}>()
const emit = defineEmits<{
  (e: 'change', value: FollowingListID): void
}>()

const followingListID = computed<FollowingListID>(() => props.value)
const handleFollowingListChange = (value: FollowingListItem) => {
  emit('change', value.id)
}

const unselectedListItem = reactive<FollowingListItem>({
  id: UnselectedListID,
  displayName: '<未选择>',
  count: 0,
})

const followingList = ref<FollowingListItem[]>([])
const selectedItem = computed(() => {
  return followingList.value.find(item => item.id === followingListID.value) ?? unselectedListItem
})
const loadFollowingList = async () => {
  const list = await bilibiliApi<RawFollowingListItem[]>(
    getJsonWithCredentials('https://api.bilibili.com/x/relation/tags'),
  )
  followingList.value = [
    unselectedListItem,
    ...list.map(item => ({
      id: item.tagid,
      displayName: item.name,
      count: item.count,
    })),
  ]
  if (
    props.value !== UnselectedListID &&
    !followingList.value.some(item => item.id === props.value)
  ) {
    followingList.value.unshift({
      id: props.value,
      displayName: '<已删除的分组>',
      count: 0,
    })
  }
}

loadFollowingList()
</script>
