import { builders } from './build'

export default async () => [
  ...(await builders.component({ buildAll: true })),
  ...(await builders.plugin({ buildAll: true })),
]
