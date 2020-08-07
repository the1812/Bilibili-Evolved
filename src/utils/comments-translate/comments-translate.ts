export const commentsTranslate = async () => {
  const { forEachCommentItem } = await import('../comment-apis')
  forEachCommentItem({
    added: (item) => {
      const { element } = item
      console.log(element)
    },
  })
}
commentsTranslate()

export default {
  export: {
    commentsTranslate,
  },
}
