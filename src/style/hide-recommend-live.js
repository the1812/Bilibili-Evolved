addSettingsListener('hideRelatedVideos', async value => {
  const { fillWithComments } = await import('./fill-with-comments')
  fillWithComments(value)
}, true)
export default resources.toggleStyle(`
  #live_recommand_report, #live_recommend_report { display: none !important; }
  `, `hide-recommend-live-style`);