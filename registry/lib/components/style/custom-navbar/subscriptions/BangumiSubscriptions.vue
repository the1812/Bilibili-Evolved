<template>
  <SubscriptionsList type="bangumi" :filter="filter"></SubscriptionsList>
</template>
<script lang="ts">
import SubscriptionsList from './SubscriptionsList.vue'

export default Vue.extend({
  components: {
    SubscriptionsList,
  },
  props: {
    filter: {
      type: [Object, null],
      default: null,
    },
  },
})
</script>
