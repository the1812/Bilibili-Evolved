import { defineComponentMetadata } from '@/components/define'
import { CommentReplyItem, forEachCommentItem } from '@/components/utils/comment-apis'
import { select } from '@/core/spin-query'

const name = 'uidShow'
const displayName = '评论区 UID 显示'
const uidClass = 'be-comment-uid'
const userNameSelector = '.user-name, .sub-user-name, .user .name'

const addUid = async (item: CommentReplyItem) => {
  if (!item.element || !item.userId) {
    return
  }
  const userName = await select(() =>
    item.shadowDomEntry
      ? item.shadowDomEntry
          .querySelectorAsEntry('bili-comment-user-info')
          ?.shadowRoot.querySelector('#user-name')
      : item.element.querySelector(userNameSelector),
  )
  if (!userName || userName.parentElement.querySelector(`.${uidClass}`)) {
    return
  }
  const uid = document.createElement('span')
  uid.className = uidClass
  uid.textContent = `UID: ${item.userId}`
  userName.after(uid)
}

export const component = defineComponentMetadata({
  name,
  displayName,
  tags: [componentsTags.utils],
  author: {
    name: 'WhiteTeal55',
    link: 'https://github.com/WhiteTeal55',
  },
  instantStyles: [
    { name, style: () => import('./uid-show.scss') },
    { name: `${name}Shadow`, style: () => import('./uid-show.scss'), shadowDom: true },
  ],
  entry: () => {
    forEachCommentItem({
      added: item => {
        addUid(item)
        item.replies.forEach(addUid)
        item.addEventListener('repliesUpdate', ({ detail }) => detail.forEach(addUid))
      },
    })
  },
})
