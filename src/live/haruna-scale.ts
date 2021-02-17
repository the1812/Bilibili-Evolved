const id = 'haruna-scale'
const style = `
  .haruna-ctnr,
  .avatar-btn
  {
    transform: scale(${1 / window.devicePixelRatio}) !important;
  }
`.trim()
export default resources.toggleStyle(style, id)
