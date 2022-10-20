import { defineComponentMetadata } from '@/components/define'
import { CommentArea } from '@/components/utils/comment-apis'
import { getJson } from '@/core/ajax'
import { fullyLoaded } from '@/core/life-cycle'
import { childList } from '@/core/observer'
import { select } from '@/core/spin-query'
import { videoUrls } from '@/core/utils/urls'

enum CommentSortOrder {
  Default = 1,
  ByTime,
  ByLikes,
}
const getComments = (oid: number | string, mode: CommentSortOrder, page = 1) => {
  if (mode === CommentSortOrder.ByTime) {
    return getJson(`https://api.bilibili.com/x/v2/reply/main?oid=${oid}&type=1&mode=${mode}`)
  }
  return getJson(
    `https://api.bilibili.com/x/v2/reply/main?oid=${oid}&type=1&mode=${mode}&next=${page}`,
  )
}
const getOid = async (commentContainer: HTMLElement) => {
  if (document.URL.match(/\/\/www\.bilibili\.com\/(video|bangumi)/)) {
    return select(() => unsafeWindow.aid)
  }
  console.error('commentContainer = ', commentContainer)
  throw new Error('No oid extract method for current context.')
}
const restore = async (commentContainer: HTMLElement) => {
  const oid = await getOid(commentContainer)
  if (!oid) {
    return
  }
  const mode =
    dq(commentContainer, '.hot-sort.on') !== null
      ? CommentSortOrder.ByLikes
      : CommentSortOrder.ByTime
  let page = 1
  const pagesElement = dq(commentContainer, '.paging-box .current')
  if (pagesElement !== null) {
    page = parseInt(pagesElement.textContent)
  }
  const json = await getComments(oid, mode, page)
  if (json.code !== 0) {
    console.error('Comment API failed: ', json.message)
    return
  }
  const getFloorInfo = (item: any) => {
    const result = [
      {
        id: item.rpid_str as string,
        floor: item.floor as number,
      },
    ]
    if (item.replies !== null) {
      result.push(
        ...item.replies.map((it: any) => ({
          id: it.rpid_str as string,
          floor: it.floor as number,
        })),
      )
    }
    return result
  }
  const replies = lodash.flatMap(lodash.get(json, 'data.replies', []), getFloorInfo)
  const top = lodash.get(json, 'data.top.upper')
  if (top) {
    replies.push(...getFloorInfo(top))
  }
  // console.log(replies)
  const commentItems = dqa(commentContainer, '.reply-wrap[data-id]')
  const commentInfos = commentItems.map(
    item => dq(item, '.reply-wrap > .con > .info, .reply-wrap > .info') as HTMLElement,
  )
  commentItems.forEach((item, index) => {
    const id = item.getAttribute('data-id') as string
    const reply = replies.find(r => r.id === id)
    if (reply !== undefined) {
      const info = commentInfos[index]
      if (info.getAttribute('data-restore-floor') === null) {
        info.insertAdjacentHTML(
          'afterbegin',
          /* html */ `<span class="floor">#${reply.floor}</span>`,
        )
        info.setAttribute('data-restore-floor', reply.floor.toString())
      }
    }
  })
}
const prepareRestore = (commentContainer: HTMLElement) => {
  const commentLoading = 'comment-loading'
  const isCommentLoading = Array.prototype.some.call(commentContainer.children, (it: HTMLElement) =>
    it.classList.contains(commentLoading),
  )
  if (isCommentLoading) {
    const [observer] = childList(commentContainer, records => {
      const isCommentLoaded = records.some(r =>
        Array.prototype.some.call(
          r.removedNodes,
          (node: Node) =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node as HTMLElement).classList.contains(commentLoading),
        ),
      )
      if (isCommentLoaded) {
        observer.disconnect()
        prepareRestore(commentContainer)
      }
    })
  } else if (commentContainer.getAttribute('data-restore-floor') === null) {
    commentContainer.setAttribute('data-restore-floor', 'true')
    const list = dq(commentContainer, '.comment-list') as HTMLElement
    childList(
      list,
      lodash.debounce(records => {
        console.log(records)
        restore(commentContainer)
      }, 100),
    )
  }
}
export const component = defineComponentMetadata({
  name: 'restoreFloors',
  displayName: '评论楼层显示',
  urlInclude: [
    ...videoUrls,
    // '//www.bilibili.com/bangumi',
    // '//t.bilibili.com/',
  ],
  description: {
    'zh-CN': '恢复按热度排序时评论楼层, 按时间排序只能恢复第一页, 仅对普通视频页有效.',
  },
  tags: [componentsTags.utils],
  entry: () => {
    fullyLoaded(async () => {
      const { forEachCommentArea } = await import('@/components/utils/comment-apis')
      const callback = (area: CommentArea) => prepareRestore(area.element)
      forEachCommentArea(callback)
    })
  },
})
