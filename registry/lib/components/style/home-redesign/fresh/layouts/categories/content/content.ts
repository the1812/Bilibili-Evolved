import { defineAsyncComponent } from 'vue'

const bangumiNames = ['番剧', '国创']
export const getContent = (tabName: string) => {
  console.log('getContent', tabName)
  if (bangumiNames.includes(tabName)) {
    return defineAsyncComponent(() => import('./Bangumi.vue'))
  }
  return defineAsyncComponent(() => import('./Default.vue'))
}
