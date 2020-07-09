if (document.URL.replace(window.location.search, '') === 'https://www.bilibili.com/') {
  addSettingsListener('removeGameMatchModule', value => {
    document.body.classList.toggle('remove-game-match-module', value)
  }, true)
  SpinQuery.any(
    () => dqa('.gg-pic'),
    it => {
      it.forEach(element => {
        const a = element.parentElement
        a.style.display = 'none'
        const index = [...a.parentElement.childNodes].indexOf(a) + 1
        const li = a.parentElement.parentElement.querySelector(`.pic li:nth-child(${index})`)
        if (li) {
          li.style.display = 'flex'
          const lia = li.querySelector('a:not(.more-text)')
          lia.insertAdjacentHTML('afterend', /*html*/`
            <div class="blocked-ads">${settings.showBlockedAdsTip ? '🚫已屏蔽广告' : ''}</div>
          `)
          lia.style.visibility = 'hidden'
          li.querySelector('a.more-text').style.display = 'none'
          li.querySelector('img').style.display = 'none'
        }
      })
    }
  )
  SpinQuery.select('.focus-carousel.home-slide').then(slide => {
    if (!slide) {
      return
    }
    [...slide.querySelectorAll('.gg-icon,.bypb-icon')]
      .map(it => it.parentElement.parentElement)
      .forEach(it => {
        it.style.display = 'none'
        it.insertAdjacentHTML('afterend', /*html*/`
          <div class="blocked-ads new">${settings.showBlockedAdsTip ? '🚫已屏蔽广告' : ''}</div>
        `)
        // const index = [...it.parentElement.children].indexOf(it)
        // it.remove()
        // const trigger = slide.querySelector('.trigger')
        // trigger.children[index].remove()
      })
  })
}
addSettingsListener('preserveEventBanner', value => {
  document.body.classList.toggle('preserve-event-banner', value)
}, true)
