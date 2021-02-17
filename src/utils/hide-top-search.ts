const selectors = [
  '.nav-search-keyword',
  '.search-keyword'
]
selectors.forEach(selector => {
  SpinQuery.condition(
    () => dq(selector),
    it => it !== null && it.getAttribute('placeholder') !== null,
  ).then(it => it?.setAttribute('placeholder', '搜索'))
})
