/* eslint-disable no-underscore-dangle */
/* eslint-disable yoda */
import { defineComponentMetadata } from '@/components/define'
import { CommentItem, CommentReplyItem } from '@/components/utils/comment-apis'
import { select } from '@/core/spin-query'

// 新版评论区IP属地获取
const getIpLocation = (item: CommentReplyItem) => {
  const reply = item.frameworkSpecificProps
  return reply?.reply_control?.location ?? undefined
}

let version = 2
let bbComment: any

const marginLeft = 15

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
      ? `<span class="reply-location" style="margin-left:${marginLeft}px;">${
          item?.reply_control?.location || ''
        }</span>`
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
      ? `<span class="reply-location" style="margin-left:${marginLeft}px;">${
          item?.reply_control?.location || ''
        }</span>`
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

// 小黑屋专用带IP属地显示的评论创建
const blackroomCreateListCon = function listCon(e, n, t) {
  const r = this._parentBlacklistDom(e, n, t)
  const i = [
    `<div class="con ${t === n ? 'no-border' : ''}">`,
    `<div class="user">${this._identity(e.mid, e.assist, e.member.fans_detail)}`,
    `<a data-usercard-mid="${e.mid}" href="//space.bilibili.com/${
      e.mid
    }" target="_blank" class="name ${this._createVipClass(
      e.member.vip.vipType,
      e.member.vip.vipStatus,
      e.member.vip.themeType,
    )}">${this._unhtmlFix(
      e.member.uname,
    )}</a><a class="level-link" href="//www.bilibili.com/blackboard/help.html#%E4%BC%9A%E5%91%98%E7%AD%89%E7%BA%A7%E7%9B%B8%E5%85%B3" target="_blank"><i class="level l${
      e.member.level_info.current_level
    }"></i></a>${this._createNameplate(e.member.nameplate)}${this._createUserSailing(
      (e.member && e.member.user_sailing) || {},
    )}</div>`,
    this._createMsgContent(e),
    '<div class="info">',
    e.floor ? `<span class="floor">#${e.floor}</span>` : '',
    this._createPlatformDom(e.content.plat),
    `<span class="time">${this._formateTime(e.ctime)}</span>`,
    e?.reply_control?.location
      ? `<span style="margin-left:${marginLeft - 15}px;">${e?.reply_control?.location || ''}</span>`
      : '',
    e.lottery_id
      ? ''
      : `<span class="like ${1 === e.action ? 'liked' : ''}"><i></i><span>${
          e.like || ''
        }</span></span>`,
    e.lottery_id ? '' : `<span class="hate ${2 === e.action ? 'hated' : ''}"><i></i></span>`,
    e.lottery_id ? '' : this._createReplyBtn(e.rcount),
    e.lottery_id && e.mid !== this.userStatus.mid
      ? ''
      : `<div class="operation more-operation"><div class="spot"></div><div class="opera-list"><ul>${
          this._canSetTop(e)
            ? `<li class="set-top">${e.isUpTop ? '取消置顶' : '设为置顶'}</li>`
            : ''
        }${this._canBlackList(e.mid) ? '<li class="blacklist">加入黑名单</li>' : ''}${
          this._canReport(e.mid) ? '<li class="report">举报</li>' : ''
        }${
          this._canDel(e.mid) && !e.isTop ? `<li class="del" data-mid="${e.mid}">删除</li>` : ''
        }</ul></div></div>`,
    this._createLotteryContent(e.content),
    this._createVoteContent(e.content),
    this._createTags(e),
    '</div>',
    '<div class="reply-box">',
    this._createSubReplyList(e.replies, e.rcount, !1, e.rpid, e.folder && e.folder.has_folded),
    '</div>',
    '<div class="paging-box">',
    '</div>',
    '</div>',
  ].join('')
  return e.state === this.blacklistCode ? r : i
}

// 小黑屋专用带IP属地显示的回复创建
const blackroomCreateSubReplyItem = function subReply(e, n) {
  const t = [
    `<div class="reply-item reply-wrap" data-id="${e.rpid}" data-index="${n}">`,
    `<a href="//space.bilibili.com/${e.mid}" data-usercard-mid="${e.mid}" target="_blank" class="reply-face">`,
    `<img src="${this._trimHttpFix(
      this._webpFix(e.member.avatar, {
        w: 52,
        h: 52,
      }),
    )}" alt="">`,
    '</a>',
    '<div class="reply-con">',
    '<div class="user">',
    `<a href="//space.bilibili.com/${e.mid}" target="_blank" data-usercard-mid="${
      e.mid
    }" class="name ${this._createVipClass(
      e.member.vip.vipType,
      e.member.vip.vipStatus,
      e.member.vip.themeType,
    )}">${this._unhtmlFix(e.member.uname)}</a>`,
    `<a class="level-link" href="//www.bilibili.com/blackboard/help.html#%E4%BC%9A%E5%91%98%E7%AD%89%E7%BA%A7%E7%9B%B8%E5%85%B3" target="_blank"><i class="level l${e.member.level_info.current_level}"></i></a>`,
    this._createSubMsgContent(e),
    '</div>',
    '</div>',
    '<div class="info">',
    `<span class="time">${this._formateTime(e.ctime)}</span>`,
    e?.reply_control?.location
      ? `<span style="margin-left:${marginLeft - 15}px;">${e?.reply_control?.location || ''}</span>`
      : '',
    `<span class="like ${1 === e.action ? 'liked' : ''}"><i></i><span>${
      e.like || ''
    }</span></span>`,
    `<span class="hate ${2 === e.action ? 'hated' : ''}"><i></i></span>`,
    '<span class="reply btn-hover">回复</span>',
    `<div class="operation btn-hover btn-hide-re"><div class="spot"></div><div class="opera-list"><ul>${
      this._canBlackList(e.mid) ? '<li class="blacklist">加入黑名单</li>' : ''
    }${this._canReport(e.mid) ? '<li class="report">举报</li>' : ''}${
      this._canDel(e.mid) ? `<li class="del" data-mid="${e.mid}">删除</li>` : ''
    }</ul></div></div>`,
    '</div>',
    '</div>',
  ].join('')
  return t
}

const observer = new MutationObserver(mutations => {
  mutations.forEach(() => {
    // 监听旧版评论区全局变量
    if (typeof unsafeWindow.bbComment !== 'undefined') {
      // 评论创建函数替换
      bbComment = unsafeWindow.bbComment
      if (unsafeWindow.location.href.split('/')[3] === 'blackroom') {
        // 小黑屋特判
        // 三个谜之函数的polyfill（不知为何无法直接调用，会报错）
        bbComment.prototype._unhtmlFix = function unhtml(e, n) {
          return e
            ? // eslint-disable-next-line @typescript-eslint/no-shadow
              e.replace(n || /[&<">'](?:(amp|lt|quot|gt|#39|nbsp|#\\d+);)?/g, function (e, n) {
                return n ? e : { '<': '', '&': '', '"': '', '>': '', "'": '' }[e]
              })
            : ''
        }
        bbComment.prototype._trimHttpFix = function trimHttp(e) {
          return e ? e.replace(/^http:/, '') : ''
        }
        bbComment.prototype._webpFix = function webp(e, n) {
          if (!e) {
            return e
          }
          const t = e.match(/(.*\\.(jpg|jpeg|gif|png|bmp))(\\?.*)?/)
          let r = -1 !== e.indexOf('/bfs/')
          if (!t || 'gif' === t[2] || 'bmp' === t[2] || !r) {
            return e
          }
          r = n.w
          e = n.h
          e = r && e ? `@${r}w_${e}h` : '@'
          n = t[3] || ''
          return this.isWebp ? `${t[1] + e}.webp${n}` : `${t[1] + e}.${t[2]}${n}`
        }

        bbComment.prototype._createListCon = blackroomCreateListCon
        bbComment.prototype._createSubReplyItem = blackroomCreateSubReplyItem
      } else {
        // 其他情况旧版评论区替换
        bbComment.prototype._createListCon = createListCon
        bbComment.prototype._createSubReplyItem = createSubReplyItem
      }
      version = 1
      observer.disconnect()
    }
  })
})

observer.observe(document.head, { childList: true })

const processItems = (items: CommentReplyItem[]) => {
  items.forEach(async item => {
    const location = getIpLocation(item)
    if (location === undefined) {
      return
    }
    const replyTime = await (() => {
      if (item.shadowDomEntry) {
        return select(() => item.shadowDomEntry.querySelector('#pubdate'), {
          queryInterval: 100,
          maxRetry: 30,
        })
      }
      return (
        item.element.querySelector('.reply-info>.reply-time') ??
        item.element.querySelector('.sub-reply-info>.sub-reply-time')
      )
    })()
    if (replyTime === null) {
      return
    }
    const existingLocation = replyTime.querySelector('.ip-location') as HTMLElement | null
    if (existingLocation !== null) {
      existingLocation.innerText = location
      return
    }

    const replyLocation = document.createElement('span')
    replyLocation.className = 'ip-location'
    replyLocation.style.marginLeft = `${marginLeft}px`
    replyLocation.innerText = location
    replyTime.appendChild(replyLocation)
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
