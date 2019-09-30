(async () => {
  if (!document.URL.includes('//www.bilibili.com/video/av')) {
    return
  }
  await SpinQuery.condition(() => document.querySelector('.video-toolbar .ops .collect'), it => {
    return it !== null && (it as HTMLElement).innerText !== '--'
  })
  const csrf = getCsrf()
  const favoriteButton = document.querySelector('.video-toolbar .ops .collect')
  if (!favoriteButton) {
    return
  }
  favoriteButton.insertAdjacentHTML('afterend', /*html*/`
    <span title='稍后再看' class='watchlater'>
      <i class='mdi mdi-timetable'></i>
      稍后再看
      <div class='tip'></div>
    </span>
  `)
  const watchlaterButton = document.querySelector('.ops .watchlater')
  const tip = document.querySelector('.ops .watchlater .tip')
  if (!watchlaterButton || !tip) {
    return
  }
  const loadWatchlaterInfo = async () => {
    const aid = await SpinQuery.select(() => unsafeWindow.aid)
    if (!aid) {
      return
    }
    const json = await Ajax.getJsonWithCredentials('https://api.bilibili.com/x/v2/history/toview/web')
    if (json.code !== 0) {
      json.data = { list: [] }
    }
    const watchlaterList = json.data.list.map((it: any) => it.aid) as Array<number>
    if (watchlaterList.includes(parseInt(aid))) {
      watchlaterButton.classList.add('on')
    }
    else {
      watchlaterButton.classList.remove('on')
    }
  }
  Observer.videoChange(async () => {
    await loadWatchlaterInfo()
  })

  let tipShowing = 0
  const toggleWatchlater = async ({ url, tipText }: { url: string, tipText: string }) => {
    const responseText = await Ajax.postTextWithCredentials(url, `aid=${unsafeWindow.aid}&csrf=${csrf}`)
    const response = JSON.parse(responseText) as {
      code: number
      message: string
    }
    if (response.code !== 0) {
      logError(`稍后再看操作失败: ${response.message}`)
      return false
    }
    else {
      tip.innerHTML = tipText
      tip.classList.add('show')
      if (tipShowing !== 0) {
        clearTimeout(tipShowing)
      }
      tipShowing = setTimeout(() => tip.classList.remove('show'), 2000)
      return true
    }
  }
  watchlaterButton.addEventListener('click', async () => {
    watchlaterButton.classList.toggle('on')
    let success: boolean
    if (watchlaterButton.classList.contains('on')) {
      success = await toggleWatchlater({
        url: 'https://api.bilibili.com/x/v2/history/toview/add',
        tipText: '已添加至稍后再看',
      })
    }
    else {
      success = await toggleWatchlater({
        url: 'https://api.bilibili.com/x/v2/history/toview/del',
        tipText: '已从稍后再看移除',
      })
    }
    if (success === false) {
      watchlaterButton.classList.toggle('on')
    }
  })
})()
