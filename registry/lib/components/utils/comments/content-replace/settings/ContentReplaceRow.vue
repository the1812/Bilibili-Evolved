<template>
  <div class="comment-content-replace-row">
    <div class="comment-content-replace-row-from">
      <TextBox
        placeholder="查找"
        :text="row.from"
        change-on-blur
        @change="emitChange({ from: $event, to: row.to })"
      />
      <VButton type="transparent" icon title="删除此项" @click="emitDelete">
        <VIcon :size="14" icon="mdi-trash-can-outline" />
      </VButton>
    </div>
    <div class="comment-content-replace-row-to">
      <VIcon :size="14" class="comment-content-replace-row-to-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            d="M20 16L14.5 21.5L13.08 20.09L16.17 17H10.5C6.91 17 4 14.09 4 10.5V4H6V10.5C6 13 8 15 10.5 15H16.17L13.09 11.91L14.5 10.5L20 16Z"
            fill="currentColor"
          />
        </svg>
      </VIcon>
      <TextBox
        placeholder="替换为"
        :text="row.to"
        change-on-blur
        @change="emitChange({ from: row.from, to: $event })"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { VButton, TextBox, VIcon } from '@/ui'
import { CommentContentReplaceRow } from './row'

export default Vue.extend({
  components: {
    VButton,
    VIcon,
    TextBox,
  },
  props: {
    row: {
      required: true,
      type: CommentContentReplaceRow,
    },
  },
  methods: {
    emitChange(event: { from: string; to: string }) {
      this.$emit('change', event)
    },
    emitDelete() {
      this.$emit('delete')
    },
  },
})
</script>
<style lang="scss">
@import 'common';
.comment-content-replace-row {
  @include v-stretch(4px);
  &-from,
  &-to {
    @include h-center(4px);
  }
  &-to-icon {
    padding: 4px;
  }
}
</style>
