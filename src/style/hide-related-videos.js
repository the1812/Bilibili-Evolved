addSettingsListener('hideRecommendLive', async value => {
  const { fillWithComments } = await import('./fill-with-comments')
  fillWithComments(value)
}, true)
export default resources.toggleStyle(`
  #recom_module, #reco_list { display: none !important; }
  `, `hide-related-videos-style`);