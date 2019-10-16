(async () => {
  if (document.URL.replace(location.search, '') !== 'https://t.bilibili.com/') {
    return
  }
  const leftPanel = await SpinQuery.select('.home-container .left-panel')
  if (leftPanel === null) {
    return
  }
  leftPanel.insertAdjacentHTML('beforeend', html`<feeds-filter-card></feeds-filter-card>`)
  new Vue({
    el: 'feeds-filter-card',
    components: {
      FeedsFilterCard: () => import('./feeds-filter-card.vue'),
    },
  })
})()