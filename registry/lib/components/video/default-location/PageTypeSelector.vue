<template>
  <div class="video-default-location-page-type-selector">
    <VDropdown v-model="curItem" :items="items" @change="onChange">
      <template #arrow>
        <div class="video-default-location-page-type-selector-icon">
          <VIcon :size="15" icon="mdi-chevron-down" />
        </div>
      </template>
    </VDropdown>
  </div>
</template>

<script lang="ts">
import { VDropdown, VIcon } from '@/ui'
import { pageTypeInfos } from '.'

const itemsMap = lodash.mapValues(pageTypeInfos, (v, k) => ({
  name: k,
  displayName: v.displayName,
}))

interface Item {
  name: string
  displayName: string
}

export default Vue.extend({
  components: { VDropdown, VIcon },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      items: Object.values(itemsMap),
      curItem: itemsMap[this.value],
    }
  },
  watch: {
    value(value: string) {
      if (this.curItem.name !== value) {
        this.curItem = itemsMap[value]
      }
    },
  },
  methods: {
    onChange(item: string | Item) {
      this.$emit('change', item.name)
    },
  },
})
</script>

<style lang="scss">
@import 'bar';

.video-default-location-page-type-selector-icon {
  @include icon-container;
}
</style>
