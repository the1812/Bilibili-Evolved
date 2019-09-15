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
SpinQuery.select('.gg-carousel.home-slide').then(slide => {
  [...slide.querySelectorAll('.gg-icon')]
    .map(it => it.parentElement.parentElement.parentElement)
    .forEach(it => it.style.display = 'none')
})
