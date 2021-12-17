import { registerAndGetData } from '@/plugins/data'
import { blackboard } from './blackboard/blackboard'

const builtInLayouts = [
  blackboard,
]
export const [layouts] = registerAndGetData('homeRedesign.fresh.layouts', [...builtInLayouts])
