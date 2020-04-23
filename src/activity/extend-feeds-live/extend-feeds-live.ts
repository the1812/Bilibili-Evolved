interface LiveInfo {
  cover: string
  face: string
  uname: string
  title: string
  roomid: number
  pic: string
  online: number
  link: string
}
(async () => {
  if (document.URL.replace(location.search, '') !== 'https://t.bilibili.com/') {
    return
  }
  const liveList = await SpinQuery.select('.live-up-list') as HTMLElement
  resources.applyStyle('extendFeedsLiveStyle')
  const fullListJson = await Ajax.getJsonWithCredentials(`https://api.live.bilibili.com/relation/v1/feed/feed_list?page=1&pagesize=24`)
  if (fullListJson.code !== 0) {
    logError(`加载直播列表失败: ${fullListJson.message}`)
    return
  }
  const fullList = _.get(fullListJson, 'data.list', []) as LiveInfo[]
  const liveListNames = dqa(liveList, '.up-name')
  const presentedNames = liveListNames.map((it: HTMLElement) => it.innerText.trim())
  const presented = fullList.filter(it => presentedNames.includes(it.uname))
  // const fakeLiveInfo = {
  //   cover: "https://i1.hdslb.com/bfs/face/4209b8ebcac96b1d38b6c05492877e8b21017724.jpg",
  //   face: "https://i1.hdslb.com/bfs/face/4209b8ebcac96b1d38b6c05492877e8b21017724.jpg",
  //   link: "https://live.bilibili.com/6983385",
  //   online: 359,
  //   pic: "https://i0.hdslb.com/bfs/live/new_room_cover/dbd7025817dcbcb7478e38a062f310509109dbba.jpg",
  //   roomid: 6983385,
  //   title: "pekope？",
  //   uname: "Snozaki筱崎",
  // }
  // const extend = [fakeLiveInfo, fakeLiveInfo, fakeLiveInfo, fakeLiveInfo, fakeLiveInfo, fakeLiveInfo, fakeLiveInfo, fakeLiveInfo, fakeLiveInfo, fakeLiveInfo,] as LiveInfo[]
  const extend = fullList.filter(it => !presentedNames.includes(it.uname))
  liveListNames.forEach((it, index) => {
    it.parentElement!.setAttribute('data-live-title',
      presented.find(p => p.uname === presentedNames[index])!.title
    )
  })
  const liveDetailItem = liveList.children[0] as HTMLElement
  extend.forEach(it => {
    const clone = liveDetailItem.cloneNode(true) as HTMLElement
    dqa(clone, 'a[href]').forEach(a => a.setAttribute('href', `https://live.bilibili.com/${it.roomid}`))
    const face = dq(clone, '.live-up-img') as HTMLElement
    face.style.backgroundImage = `url(${it.face})`
    const detail = dq(clone, '.live-detail') as HTMLElement
    detail.setAttribute('data-live-title', it.title)
    const name = dq(clone, '.up-name') as HTMLElement
    name.innerHTML = it.uname
    liveList.insertAdjacentElement('beforeend', clone)
  })
  console.log(presented, extend)
})()