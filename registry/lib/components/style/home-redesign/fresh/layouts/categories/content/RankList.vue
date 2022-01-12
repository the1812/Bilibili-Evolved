<template>
  <div class="fresh-home-rank-list">
    rank list
  </div>
</template>
<script lang="ts">
export default Vue.extend({
  props: {
    api: {
      type: String,
      required: true,
    },
  },
})
</script>
<style lang="scss">
.fresh-home-rank-list {
  width: 400px;
  padding: 12px;
  margin: -12px;
}
</style>
