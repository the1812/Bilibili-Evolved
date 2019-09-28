(async () => {
  if (!['//www.bilibili.com/watchlater/#/list'].some(it => document.URL.includes(it))) {
    return
  }
  const { getWatchlaterList } = await import('../video/watchlater-api')
  const listBox = await SpinQuery.select('.watch-later-list .list-box')
  if (listBox === null) {
    return
  }
  resources.applyStyleFromText(`
    .expire-warning {
      padding: 3px 25px;
      color: #F78C6C;
      display: inline-flex;
      align-items: center;
    }
    .expire-warning .mdi {
      line-height: 1;
      margin-right: 8px;
      font-size: 16px;
    }
  `, 'watchlater-expire-warning-style')
  // 少于此天数时提示
  const WarningDays = 14
  const DayInMilliseconds = 24 * 3600 * 1000
  const getRemainingDays = (expireTime: number) => {
    return (expireTime - Number(new Date())) / DayInMilliseconds
  }
  Observer.childListSubtree(listBox, async () => {
    const states = [...listBox.querySelectorAll('.av-item .state')]
    const list = await getWatchlaterList(true)
    states.forEach((element, index) => {
      // 60天后过期
      const expireTime = list[index].add_at * 1000 + 60 * DayInMilliseconds
      const days = getRemainingDays(expireTime)
      console.log(list[index].aid, days)
      if (days < WarningDays) {
        if (element.querySelector('.expire-warning') === null) {
          const displayDays = -Math.floor(-days) // 有小数直接上升一位整数
          element.insertAdjacentHTML('afterbegin', /*html*/`
            <span class="expire-warning" title="到期时间: ${new Date(expireTime).toLocaleString()}"><i class="mdi mdi-alert-circle-outline"></i>还剩${displayDays}天过期</span>`)
        }
      } else {
        element.querySelectorAll('.expire-warning').forEach(it => it.remove())
      }
    })
  })
})()