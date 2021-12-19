import { registerAndGetData } from '@/plugins/data'
import { blackboard } from './blackboard/blackboard'
import { feeds } from './feeds/feeds'
import { trending } from './trending/trending'

const builtInLayouts = [
  blackboard,
  trending,
  feeds,
]
export const [layouts] = registerAndGetData('homeRedesign.fresh.layouts', [...builtInLayouts])
