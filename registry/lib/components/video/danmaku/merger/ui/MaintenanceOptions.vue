<template>
  <div v-if="visible" class="merger-maintenance-options">
    <VButton
      v-for="action in actions"
      :key="action.name"
      class="merger-maintenance-btn"
      :disabled="busy === action.name"
      @click="runAction(action)"
    >
      <VIcon :icon="action.icon" :size="16" />
      {{ action.displayName }}
    </VButton>
  </div>
</template>

<script lang="ts">
import { VButton, VIcon } from '@/ui'
import {
  isMergerMaintenanceEnabled,
  mergerRunClearStorage,
  mergerRunDiag,
  mergerRunResync,
} from '../maintenance'
import { mergerToast } from './notify'

interface MaintenanceActionItem {
  name: string
  displayName: string
  icon: string
  run: () => Promise<void>
}

export default Vue.extend({
  name: 'MergerMaintenanceOptions',
  components: {
    VButton,
    VIcon,
  },
  props: {
    componentData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      busy: '' as string,
      actions: [
        {
          name: 'diag',
          displayName: '弹幕列表诊断',
          icon: 'mdi-stethoscope',
          run: mergerRunDiag,
        },
        {
          name: 'resync',
          displayName: '重新同步列表',
          icon: 'mdi-sync',
          run: mergerRunResync,
        },
        {
          name: 'clear',
          displayName: '清除合并记忆',
          icon: 'mdi-delete-sweep-outline',
          run: mergerRunClearStorage,
        },
      ] as MaintenanceActionItem[],
    }
  },
  computed: {
    visible(): boolean {
      try {
        return isMergerMaintenanceEnabled()
      } catch {
        return true
      }
    },
  },
  methods: {
    async runAction(action: MaintenanceActionItem) {
      if (this.busy) {
        return
      }
      try {
        this.busy = action.name
        await action.run()
      } catch (err) {
        mergerToast(String(err), 'error', action.displayName)
      } finally {
        this.busy = ''
      }
    },
  },
})
</script>

<style lang="scss" scoped>
.merger-maintenance-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.merger-maintenance-btn {
  justify-content: flex-start;

  :deep(.be-icon) {
    margin-right: 8px;
  }
}
</style>
