import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'mallLinkRedirect',
  displayName: '会员购链接重定向',
  tags: [componentsTags.utils],
  entry: () => {
    const searchParams = new URLSearchParams(location.search)
    const id = searchParams.get('id')
    const itemsId = searchParams.get('itemsId')
    const canRedirect = Boolean(id || itemsId)
    if (!canRedirect) {
      return
    }
    if (id !== null) {
      location.assign(` https://show.bilibili.com/platform/detail.html?id=${id}`)
      return
    }
    if (itemsId !== null) {
      location.assign(`https://show.bilibili.com/platform/malldetail.html?itemsId=${itemsId}`)
    }
  },
  urlInclude: ['https://mall.bilibili.com'],
})
