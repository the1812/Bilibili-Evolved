export const omitCurrentYear = (date: string, today: string) =>
  date.slice(0, 4) === today.slice(0, 4) ? date.slice(5) : date
