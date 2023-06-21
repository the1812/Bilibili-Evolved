<template>
  <SubscriptionsList type="bangumi" :filter="filter"></SubscriptionsList>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import SubscriptionsList from './SubscriptionsList.vue'

export default defineComponent({
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
