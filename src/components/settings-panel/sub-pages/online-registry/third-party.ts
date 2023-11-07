import { reactive } from 'vue'
import { registerAndGetData } from '@/plugins/data'

const defaultRegistryBranches = ['master', 'preview']
export const [registryBranches] = registerAndGetData(
  'settingsPanel.registryBranches',
  reactive([...defaultRegistryBranches]),
)
