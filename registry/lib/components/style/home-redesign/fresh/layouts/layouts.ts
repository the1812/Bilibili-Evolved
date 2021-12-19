import { registerAndGetData } from '@/plugins/data'
import { blackboard } from './blackboard/blackboard'
import { trending } from './trending/trending'

const builtInLayouts = [
  blackboard,
  trending,
]
export const [layouts] = registerAndGetData('homeRedesign.fresh.layouts', [...builtInLayouts])
