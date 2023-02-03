<template>
  <SubscriptionsList type="cinema"></SubscriptionsList>
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
