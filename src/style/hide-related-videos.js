addSettingsListener('hideRecommendLive', async value => {
  const { fillWithComments } = await import('./fill-with-comments')
  fillWithComments(value)
}, true)
export default resources.toggleStyle(`
  #recom_module,#reco_list,.bilibili-player-ending-panel-box-videos {
    display: none !important;
  }
  .bilibili-player-ending-panel-box-functions .bilibili-player-upinfo-spans {
    position: static !important;
  }
  .bilibili-player-ending-panel-box {
    display: flex !important;
    justify-content: center !important;
    flex-direction: column !important;
  }
  `, `hide-related-videos-style`);