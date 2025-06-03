<template>
  <VPopup
    v-model="isOpen"
    class="like-black-list"
    fixed
    :lazy="false"
    :trigger-element="triggerElement"
  >
    <div class="black-list-header">
      <VIcon class="title-icon" icon="mdi-sort" :size="24"></VIcon>
      <div class="title">添加黑名单</div>
      <div class="close" @click="isOpen = false">
        <VIcon icon="close" :size="18"></VIcon>
      </div>
    </div>
    <div class="black-list-content">
      <div class="black-list-section">
        <div class="black-list-section-title">添加到黑名单</div>
        <div class="black-list-section-input">
          <TextBox :text="name" @change="changeName" />
          <VButton @click="add">添加</VButton>
        </div>
      </div>
      <div class="black-list-section">
        <div class="black-list-section-title">黑名单列表</div>
        <div class="black-list-section-description">点击×图标可以删除名单.</div>
        <VLoading v-if="!isLoaded" />
        <div
          v-show="isLoaded"
          ref="black-listSortList"
          class="black-list-section-content black-list-sort-list"
        >
          <div v-for="item of list" :key="item" class="black-list-sort-item" :data-name="item">
            <div class="item-name">
              {{ item }}
            </div>
            <div class="toggle-visible">
              <VIcon :size="18" icon="close" @click="toggleVisible(item)"></VIcon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </VPopup>
</template>
<script lang="ts" setup>
import { ref, defineProps, defineEmits } from 'vue'
import { VPopup, TextBox, VIcon, VButton } from '@/ui'

const props = defineProps<{
  triggerElement?: HTMLElement | null
  list?: string[]
  titleName?: string
}>()

const emit = defineEmits(['update:list'])

const isOpen = ref(false)
const isLoaded = ref(false)
const name = ref('')

const list = ref<string[]>(props.list ? [...props.list] : [])

const changeName = (val: string) => {
  name.value = val
}

const add = () => {
  if (name.value.length && !list.value.includes(name.value)) {
    list.value.push(name.value)
    emit('update:list', [...list.value])
  }
  name.value = ''
}

function toggleVisible(item: string) {
  const idx = list.value.indexOf(item)
  if (idx !== -1) {
    list.value.splice(idx, 1)
    emit('update:list', [...list.value])
  }
}

isLoaded.value = true
defineExpose({
  isOpen,
})
</script>

<style lang="scss">
@import 'common';
.like-black-list {
  @include popup();
  width: 400px;
  font-size: 14px;
  padding: 12px 12px 12px 18px;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%) scale(0.95);
  transition: 0.2s ease-out;
  z-index: 100002;
  &.open {
    transform: translateX(-50%) translateY(-50%) scale(1);
  }
  .black-list-header {
    @include h-center();
    justify-content: space-between;
    .title {
      margin-left: 6px;
      font-size: 18px;
      @include semi-bold();
    }
    .grow {
      flex: 1;
    }
    .close {
      padding: 6px;
      cursor: pointer;
      transition: 0.2s ease-out;
      &:hover {
        color: var(--theme-color);
      }
    }
  }
  .black-list-content {
    .black-list-section {
      margin-top: 12px;
      > :not(:last-child) {
        margin-bottom: 6px;
      }
      &-title {
        font-size: 14px;
      }
      &-input {
        display: flex;
        div {
          margin: 0 10px;
        }
      }
      &-description {
        font-size: 12px;
        opacity: 0.6;
        line-height: 1.5;
      }
      &-content {
        @include h-center();
        flex-wrap: wrap;
        .be-slider {
          margin: 0 4px;
          flex: 1;
        }
        .padding-value {
          margin-left: 12px;
          width: 50px;
          text-align: end;
        }
        .black-list-sort-item {
          @include card();
          @include h-center();
          transition: none;
          white-space: nowrap;
          padding: 6px;
          padding-left: 8px;
          margin: 0 4px 4px 0;
          cursor: move;
          &:hover {
            border-color: var(--theme-color);
          }
          &.black-list-hidden {
            opacity: 0.5;
          }
          &.sortable-ghost {
            opacity: 0;
          }
          &.sortable-chosen {
            box-shadow: 0 4px 16px 0 rgb(0 0 0 / 16%);
            transform: scale(1.05);
          }
          &.sortable-drag {
            opacity: 1;
          }
          &.sortable-drag.black-list-hidden {
            opacity: 0.5;
          }
          .toggle-visible {
            margin-left: 6px;
            cursor: pointer;
          }
        }
      }
    }
  }
}
</style>
