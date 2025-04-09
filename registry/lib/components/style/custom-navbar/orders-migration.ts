import { getComponentSettings } from '@/core/settings'
import type { CustomNavbarOptions } from '.'

export const migrateOrders = () => {
  const migrations = [
    ['gamesIframe', 'games'],
    ['livesIframe', 'lives'],
    ['mangaIframe', 'manga'],
  ]

  const { options } = getComponentSettings<CustomNavbarOptions>('customNavbar')
  migrations.forEach(([from, to]) => {
    const oldOrder = options.order[from]
    if (oldOrder !== undefined) {
      options.order[to] = oldOrder
      delete options.order[from]
    }
  })
}
