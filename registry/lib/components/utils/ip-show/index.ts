/* eslint-disable no-underscore-dangle */
import { defineComponentMetadata } from '@/components/define'
import { CommentItem, CommentReplyItem } from '@/components/utils/comment-apis'

// 新版评论区IP属地获取
const getIpLocation = (element: HTMLElement) => {
  const props = (element as any).__vueParentComponent?.props
  const reply = props?.reply ?? props?.subReply
  return reply?.reply_control?.location ?? undefined
}

let version = 2
let bbComment: any

// 带IP属地显示的评论创建
const createListCon = function listCon(item, i, pos) {
  const blCon = this._parentBlacklistDom(item, i, pos)
  const con = [
    `<div class="con ${pos === i ? 'no-border' : ''}">`,
    `<div class="user">${this._createNickNameDom(item)}`,
    this._createLevelLink(item),
    this._identity(item.mid, item.assist, item.member.fans_detail),
    `${this._createNameplate(item.member.nameplate) + this._createUserSailing(item)}</div>`,
    this._createMsgContent(item),
    this._createPerfectReply(item),
    '<div class="info">',
    this._createPlatformDom(item.content.plat),
    '<span class="time-location">',
    '<span class="reply-time">'.concat(this._formateTime(item.ctime), '</span>'),
    item?.reply_control?.location
      ? `<span class="reply-location">${item?.reply_control?.location || ''}</span>`
      : '',
    '</span>',
    item.lottery_id
      ? ''
      : `<span class="like ${item.action === 1 ? 'liked' : ''}"><i></i><span>${
          item.like ? item.like : ''
        }</span></span>`,
    item.lottery_id ? '' : `<span class="hate ${item.action === 2 ? 'hated' : ''}"><i></i></span>`,
    item.lottery_id ? '' : this._createReplyBtn(item.rcount),
    item.lottery_id && item.mid !== bbComment.userStatus.mid
      ? ''
      : `<div class="operation more-operation"><div class="spot"></div><div class="opera-list"><ul>${
          this._canSetTop(item)
            ? `<li class="set-top">${item.isUpTop ? '取消置顶' : '设为置顶'}</li>`
            : ''
        }${this._canBlackList(item.mid) ? '<li class="blacklist">加入黑名单</li>' : ''}${
          this._canReport(item.mid) ? '<li class="report">举报</li>' : ''
        }${
          this._canDel(item.mid) && !item.isTop
            ? `<li class="del" data-mid="${item.mid}">删除</li>`
            : ''
        }</ul></div></div>`,
    this._createLotteryContent(item.content),
    this._createVoteContent(item.content),
    this._createTags(item),
    '</div>',
    '<div class="reply-box">',
    this._createSubReplyList(
      item.replies,
      item.rcount,
      false,
      item.rpid,
      item.folder && item.folder.has_folded,
      item.reply_control,
    ),
    '</div>',
    '<div class="paging-box">',
    '</div>',
    '</div>',
  ].join('')
  return item.state === bbComment.blacklistCode ? blCon : con
}

// 带IP属地显示的回复创建
const createSubReplyItem = function subReply(item, i) {
  const dom = [
    `<div class="reply-item reply-wrap" data-id="${item.rpid}" data-index="${i}">`,
    this._createSubReplyUserFace(item),
    '<div class="reply-con">',
    '<div class="user">',
    this._createNickNameDom(item),
    this._createLevelLink(item),
    this._identity(item.mid),
    this._createSubMsgContent(item),
    '</div>',
    '</div>',
    '<div class="info">',
    '<span class="time-location">',
    '<span class="reply-time">'.concat(this._formateTime(item.ctime), '</span>'),
    item?.reply_control?.location
      ? `<span class="reply-location">${item?.reply_control?.location || ''}</span>`
      : '',
    '</span>',
    `<span class="like ${item.action === 1 ? 'liked' : ''}"><i></i><span>${
      item.like ? item.like : ''
    }</span></span>`,
    `<span class="hate ${item.action === 2 ? 'hated' : ''}"><i></i></span>`,
    '<span class="reply btn-hover">回复</span>',
    `<div class="operation btn-hover btn-hide-re"><div class="spot"></div><div class="opera-list"><ul>${
      this._canBlackList(item.mid) ? '<li class="blacklist">加入黑名单</li>' : ''
    }${this._canReport(item.mid) ? '<li class="report">举报</li>' : ''}${
      this._canDel(item.mid) ? `<li class="del" data-mid="${item.mid}">删除</li>` : ''
    }</ul></div></div>`,
    '</div>',
    '</div>',
  ].join('')

  return dom
}

const observer = new MutationObserver(mutations => {
  mutations.forEach(() => {
    // 监听旧版评论区全局变量
    if (typeof unsafeWindow.bbComment !== 'undefined') {
      // 评论创建函数替换
      bbComment = unsafeWindow.bbComment
      bbComment.prototype._createListCon = createListCon
      bbComment.prototype._createSubReplyItem = createSubReplyItem
      version = 1
      observer.disconnect()
    }
  })
})

observer.observe(document.head, { childList: true })

const processItems = (items: CommentReplyItem[]) => {
  items.forEach(item => {
    const location = getIpLocation(item.element)
    if (location !== undefined) {
      const replyTime =
        item.element.querySelector('.reply-info>.reply-time') ??
        item.element.querySelector('.sub-reply-info>.sub-reply-time')
      if (replyTime.childElementCount === 0) {
        // 避免在评论更新的情况下重复添加
        const replyLocation = document.createElement('span')
        replyLocation.style.marginLeft = '5px'
        replyLocation.innerText = location
        replyTime.appendChild(replyLocation)
      }
    }
  })
}

const entry = async () => {
  const { forEachCommentItem } = await import('@/components/utils/comment-apis')
  const addIpLocation = (comment: CommentItem) => {
    if (version === 2) {
      processItems([comment, ...comment.replies])
      comment.addEventListener('repliesUpdate', replies => processItems(replies.detail))
    }
  }
  forEachCommentItem({
    added: addIpLocation,
  })
}

export const component = defineComponentMetadata({
  name: 'ipShow',
  author: {
    name: 'Light_Quanta',
    link: 'https://github.com/LightQuanta',
  },
  displayName: '评论区IP属地显示',
  tags: [componentsTags.utils],
  entry,
  description: {
    'zh-CN': '在评论区显示评论的IP属地信息',
  },
})
