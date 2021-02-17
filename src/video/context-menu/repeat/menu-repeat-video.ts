(async () => {
  if (!(await videoCondition())) {
    return
  }
  const { addMenuItem } = await import('../player-context-menu')
  const div = document.createElement('div')
  div.addEventListener('click', () => console.log('click!'))
  div.innerHTML = 'test'
  addMenuItem(div)
})()
