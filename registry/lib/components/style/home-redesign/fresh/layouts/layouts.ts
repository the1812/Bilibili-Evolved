import { registerAndGetData } from '@/plugins/data'
import { areas } from './areas/areas'
import { blackboard } from './blackboard/blackboard'
import { categories } from './categories/categories'
import { feeds } from './feeds/feeds'
import { trending } from './trending/trending'

const builtInLayouts = [blackboard, trending, feeds, areas, categories]
export const [layouts] = registerAndGetData('homeRedesign.fresh.layouts', [...builtInLayouts])
