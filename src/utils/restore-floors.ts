enum CommentSortOrder {
  Default = 1,
  ByTime,
  ByLikes,
}
const getComments = (oid: number | string, mode: CommentSortOrder, page = 1) => {
  if (mode === CommentSortOrder.ByTime) {
    return Ajax.getJson(`https://api.bilibili.com/x/v2/reply/main?oid=${oid}&type=1&mode=${mode}`)
  }
  return Ajax.getJson(`https://api.bilibili.com/x/v2/reply/main?oid=${oid}&type=1&mode=${mode}&next=${page}`)
}
const getOid = async (commentContainer: HTMLElement) => {
  if (document.URL.match(/\/\/www\.bilibili\.com\/(video|bangumi)/)) {
    return await SpinQuery.select(() => unsafeWindow.aid)
  }
  console.error('No oid extract method for current context.', commentContainer)
}
const restore = async (commentContainer: HTMLElement) => {
  const oid = await getOid(commentContainer)
  if (oid === undefined) {
    return
  }
  const mode = dq(commentContainer, '.hot-sort.on') !== null ? CommentSortOrder.ByLikes : CommentSortOrder.ByTime
  let page = 1
  const pagesElement = dq(commentContainer, '.paging-box .current')
  if (pagesElement !== null) {
    page = parseInt(pagesElement.textContent!)
  }
  const json = await getComments(oid, mode, page)
  if (json.code !== 0) {
    console.error('Comment API failed: ', json.message)
    return
  }
  const replies: { id: string; floor: number }[] = _.flatMap(_.get(json, 'data.replies', []), item => {
    const result = [{
      id: item.rpid_str,
      floor: item.floor,
    }]
    if (item.replies !== null) {
      result.push(...item.replies.map((it: any) => {
        return {
          id: it.rpid_str,
          floor: it.floor,
        }
      }))
    }
    return result
  })
  console.log(replies)
  const commentItems = dqa(commentContainer, '.reply-wrap[data-id]')
  const commentInfos = commentItems.map(item => dq(item, '.reply-wrap > .con > .info, .reply-wrap > .info') as HTMLElement)
  commentItems.forEach((item, index) => {
    const id = item.getAttribute('data-id') as string
    const reply = replies.find(r => r.id === id)
    if (reply !== undefined) {
      const info = commentInfos[index]
      if (info.getAttribute('data-restore-floor') === null) {
        info.insertAdjacentHTML('afterbegin', /*html*/`<span class="floor">#${reply.floor}</span>`)
        info.setAttribute('data-restore-floor', reply.floor.toString())
      }
    }
  })
}
const prepareRestore = (commentContainer: HTMLElement) => {
  const commentLoading = 'comment-loading'
  if (Array.prototype.some.call(commentContainer.children, (it: HTMLElement) => it.classList.contains(commentLoading))) {
    const observer = Observer.childList(commentContainer, records => {
      if (records.some(r => {
        Array.prototype.some.call(r.removedNodes, (node: Node) => {
          return node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).classList.contains(commentLoading)
        })
      })) {
        observer.stop()
        prepareRestore(commentContainer)
      }
    })
  } else {
    if (commentContainer.getAttribute('data-restore-floor') === null) {
      commentContainer.setAttribute('data-restore-floor', 'true')
      const list = dq(commentContainer, '.comment-list') as HTMLElement
      Observer.childList(list, _.debounce(records => {
        console.log(records)
        restore(commentContainer)
      }, 100))
    }
  }
}
fullyLoaded(() => {
  if (document.URL.match(/\/\/www\.bilibili\.com\/(video|bangumi)/)) {
    const callback = _.debounce(() => dqa('.bb-comment').forEach(it => prepareRestore(it as HTMLElement)), 200)
    Observer.childListSubtree(document.body, callback)
  }
})