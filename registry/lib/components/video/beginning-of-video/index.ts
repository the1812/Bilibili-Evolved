import { defineComponentMetadata } from '@/components/define'

const videoPagePath = /\/\/www\.bilibili\.com\/(video|bangumi\/play|cheese\/play)\/?/i

const removeStartTime = (rawUrl: string): string => {
  if (!rawUrl.includes('t=')) {
    return rawUrl
  }
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('//')) {
    try {
      const fullUrl = rawUrl.startsWith('//') ? `https:${rawUrl}` : rawUrl
      const urlObj = new URL(fullUrl)
      if (urlObj.searchParams.has('t')) {
        urlObj.searchParams.delete('t')
        const cleaned = urlObj.href
        return rawUrl.startsWith('//') ? cleaned.replace(/^https:/, '') : cleaned
      }
    } catch {
      /* empty */
    }
  }
  return rawUrl
}

export const component = defineComponentMetadata({
  name: 'beginningOfVideo',
  displayName: '新视频永远从头开始',
  author: {
    name: 'Earchaut',
    link: 'https://github.com/Earchaut',
  },
  entry: () => {
    document.addEventListener(
      'click',
      (e: MouseEvent) => {
        const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a')
        if (!link) {
          return
        }
        const { href } = link
        if (!href || !videoPagePath.test(href)) {
          return
        }
        const cleaned = removeStartTime(href)
        if (cleaned !== href) {
          link.href = cleaned
        }
      },
      true,
    )
  },
  tags: [componentsTags.video, componentsTags.utils],
})
