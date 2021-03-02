export default resources.toggleStyle(`
  #recom_module,#reco_list,.bilibili-player-ending-panel-box-videos,
  .bilibili-player-video-link {
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
`, `hide-related-videos-style`)
