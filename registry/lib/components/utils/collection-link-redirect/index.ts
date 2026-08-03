import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'collectionLinkRedirect',
  displayName: '合集链接重定向',
  tags: [componentsTags.utils],
  entry: () => {
    const searchParams = new URLSearchParams(location.search)
    const sid = searchParams.get('sid')
    if (!sid) {
      return
    }
    const uid = location.pathname.match(/^\/(\d+)\//)?.[1]
    const newUrl = `https://space.bilibili.com/${uid}/lists/${sid}`
    location.replace(newUrl)
  },
  urlInclude: [
    /^https:\/\/space\.bilibili\.com\/[\d]+\/channel\/collectiondetail/,
    /^https:\/\/space\.bilibili\.com\/[\d]+\/lists$/,
  ],
})
