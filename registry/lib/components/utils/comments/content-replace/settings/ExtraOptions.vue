<template>
  <div class="comment-content-replace-extra-options">
    <div class="comment-content-replace-rows">
      <template v-for="(row, index) of rows">
        <ContentReplaceRow
          :key="row.key"
          :row="row"
          @change="handleRowChange(row, $event)"
          @delete="handleRowDelete(row)"
        />
        <div
          v-if="index < rows.length - 1"
          :key="row.key"
          class="comment-content-replace-separator"
        ></div>
      </template>
    </div>
    <VButton class="comment-content-replace-add-row" @click="handleRowAdd">
      <VIcon :size="14" icon="mdi-plus" />
      添加配置
    </VButton>
  </div>
</template>
<script lang="ts">
import { getComponentSettings } from '@/core/settings'
import { deleteValue } from '@/core/utils'
import { VButton, VIcon } from '@/ui'
import { CommentContentReplaceOptions } from '../options'
import { CommentContentReplaceRow } from './row'
import ContentReplaceRow from './ContentReplaceRow.vue'

const { options } = getComponentSettings<CommentContentReplaceOptions>('commentContentReplace')
export default Vue.extend({
  components: {
    ContentReplaceRow,
    VButton,
    VIcon,
  },
  data() {
    const { replaceMap } = options

    const rows = Object.entries(replaceMap).map(
      ([from, to]) => new CommentContentReplaceRow(from, to),
    )
    return {
      rows,
    }
  },
  methods: {
    saveSettings() {
      const validRows = (this.rows as CommentContentReplaceRow[])
        .map(row => [row.from, row.to])
        .filter(([from]) => Boolean(from))
      options.replaceMap = Object.fromEntries(validRows)
    },
    handleRowChange(row: CommentContentReplaceRow, event: { from: string; to: string }) {
      row.from = event.from
      row.to = event.to
      this.saveSettings()
    },
    handleRowDelete(row: CommentContentReplaceRow) {
      deleteValue(this.rows, it => it === row)
      this.saveSettings()
    },
    handleRowAdd() {
      this.rows.push(new CommentContentReplaceRow())
    },
  },
})
</script>
<style lang="scss">
@import 'common';
.comment-content-replace {
  &-extra-options {
    @include v-stretch(8px);
  }
  &-rows {
    @include v-stretch(8px);
  }
  &-separator {
    align-self: center;
    width: 30%;
    height: 1px;
    background-color: #8884;
  }
  &-add-row {
    align-self: start;
  }
}
</style>
