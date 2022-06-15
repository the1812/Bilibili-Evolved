import { builders } from './build'

export default async () => {
  return [
    ...(await builders.component({ buildAll: true })),
    ...(await builders.plugin({ buildAll: true })),
  ]
}
