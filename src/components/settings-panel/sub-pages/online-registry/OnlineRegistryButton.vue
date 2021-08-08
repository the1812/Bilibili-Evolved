<template>
  <VButton
    @mouseover="initPopup()"
    @click="togglePopup()"
  >
    <slot />
  </VButton>
</template>
<script lang="ts">
import { mountVueComponent } from '@/core/utils'
import {
  VButton,
} from '@/ui'
import OnlineRegistry from './OnlineRegistry.vue'

let vm: Vue & {
  popupOpen: boolean
  searchKeyword: string
}
export default Vue.extend({
  components: {
    VButton,
  },
  methods: {
    initPopup() {
      if (!vm) {
        vm = mountVueComponent(OnlineRegistry)
        document.body.append(vm.$el)
      }
    },
    togglePopup() {
      if (!vm) {
        this.initPopup()
      }
      vm.popupOpen = !vm.popupOpen
    },
  },
})
</script>
