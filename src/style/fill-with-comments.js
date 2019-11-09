const styleID = 'fill-with-comments-style'
export const fillWithComments = (enable) => {
  if (enable) {
    if (dq('#' + styleID)) {
      return
    }
    resources.applyStyleFromText(`
    .v-wrap { position: relative !important; }
    .v-wrap .l-con { width: 100% !important; }
    .v-wrap .r-con {
      position: absolute !important;
      top: 0 !important;
      right: 0 !important;
    }
    .v-wrap .video-info { margin-right: 400px !important; }
    `, styleID)
  } else {
    dqa('#' + styleID).forEach(it => it.remove())
  }
}
export default {
  export: {
    fillWithComments,
  },
}