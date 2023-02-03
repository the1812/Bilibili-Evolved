<template>
  <SubscriptionsList type="bangumi"></SubscriptionsList>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import SubscriptionsList from './SubscriptionsList.vue'

export default defineComponent({
  components: {
    SubscriptionsList,
  },
})
</script>
