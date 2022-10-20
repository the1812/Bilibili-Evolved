export const logStats = <T extends { name: string }>(series: string, map: Map<T, number>) => {
  const entries = [...map.entries()]
  const total = entries.reduce((sum, it) => sum + it[1], 0)
  console.groupCollapsed(
    `${series} time:`,
    `${Math.round(total * 100) / 100}ms`,
    `for ${entries.length} items`,
  )
  entries.forEach(([p, time]) => {
    console.log(
      `%c${p.name} %c${Math.round(time * 100) / 100}ms ${
        Math.round((time / total) * 10000) / 100
      }% %c`,
      'color: #00A0D8',
      'color: #888',
      'color: unset',
    )
  })
  console.groupEnd()
}
