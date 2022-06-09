const owner = 'the1812'
const host = 'raw.githubusercontent.com'
const github = {
  owner,
  host,
  stableClient: `https://${host}/${owner}/Bilibili-Evolved/master/dist/bilibili-evolved.user.js`,
  previewClient: `https://${host}/${owner}/Bilibili-Evolved/preview/dist/bilibili-evolved.preview.user.js`,
  library: {
    lodash: `https://${host}/lodash/lodash/4.17.21/dist/lodash.min.js`,
    protobuf: `https://${host}/protobufjs/protobuf.js/6.10.1/dist/light/protobuf.min.js`,
    jszip: `https://${host}/Stuk/jszip/3.7.1/dist/jszip.min.js`,
    sortable: `https://${host}/SortableJS/Sortable/1.14.0/Sortable.min.js`,
    mdi: `https://${host}/Templarian/MaterialDesign-Webfont/5.3.45/css/materialdesignicons.min.css`,
  },
  smallLogo: `https://${host}/${owner}/Bilibili-Evolved/preview/images/logo-small.png`,
  logo: `https://${host}/${owner}/Bilibili-Evolved/preview/images/logo.png`,
  root: (branch, ownerOverride) => `https://${host}/${ownerOverride || owner}/Bilibili-Evolved/${branch}/`,
}
module.exports = {
  github,
}
