import { registerAndGetData } from '@/plugins/data'

const defaultRegistryBranches = ['master', 'preview']
export const [registryBranches] = registerAndGetData('settingsPanel.registryBranches', [
  ...defaultRegistryBranches,
])
