const bangumiNames = [
  '番剧',
  '国创',
]
export const getContent = (tabName: string) => {
  if (bangumiNames.includes(tabName)) {
    return () => import('./Bangumi.vue').then(m => m.default)
  }
  return () => import('./Default.vue').then(m => m.default)
}
