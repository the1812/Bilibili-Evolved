import { CdnConfig } from './types'

const owner = 'the1812'
const host = 'cdn.jsdelivr.net'
export const jsDelivr: CdnConfig = {
  name: 'jsDelivr',
  owner,
  host,
  stableClient: `https://${host}/gh/${owner}/Bilibili-Evolved@master/dist/bilibili-evolved.user.js`,
  previewClient: `https://${host}/gh/${owner}/Bilibili-Evolved@preview/dist/bilibili-evolved.preview.user.js`,
  library: {
    lodash: `https://${host}/npm/lodash@4.17.21/lodash.min.js`,
    protobuf: `https://${host}/npm/protobufjs@6.10.1/dist/light/protobuf.min.js`,
    jszip: `https://${host}/npm/jszip@3.7.1/dist/jszip.min.js`,
    sortable: `https://${host}/npm/sortablejs@1.14.0/Sortable.min.js`,
    mdi: `https://${host}/gh/${owner}/Bilibili-Evolved@master/docs/static/mdi/mdi.css`,
    streamsaver: `https://${host}/npm/streamsaver@2.0.6/StreamSaver.min.js`,
    ffmpeg: {
      worker: `https://${host}/npm/@ffmpeg/ffmpeg@0.12.4/dist/umd/814.ffmpeg.js`,
      core: `https://${host}/npm/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js`,
      wasm: `https://${host}/npm/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.wasm`,
    },
  },
  smallLogo: `https://${host}/gh/${owner}/Bilibili-Evolved@preview/images/logo-small.png`,
  logo: `https://${host}/gh/${owner}/Bilibili-Evolved@preview/images/logo.png`,
  root: (branch, ownerOverride) =>
    `https://${host}/gh/${ownerOverride || owner}/Bilibili-Evolved@${branch}/`,
}
