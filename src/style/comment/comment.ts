addSettingsListener('useCommentStyle', (value: boolean) => {
  document.body.classList.toggle('simplify-comment', value)
}, true)
export default resources.toggleStyle('useCommentStyleStyle')
