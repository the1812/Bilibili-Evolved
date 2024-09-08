import { jsDelivr } from './jsdelivr'
import { CdnConfig } from './types'

const owner = 'the1812'
const host = 'raw.githubusercontent.com'
export const github: CdnConfig = {
  name: 'GitHub',
  owner,
  host,
  stableClient: `https://${host}/${owner}/Bilibili-Evolved/master/dist/bilibili-evolved.user.js`,
  previewClient: `https://${host}/${owner}/Bilibili-Evolved/preview/dist/bilibili-evolved.preview.user.js`,
  library: {
    lodash: {
      url: `https://${host}/lodash/lodash/4.17.21/dist/lodash.min.js`,
      sha256: 'a9705dfc47c0763380d851ab1801be6f76019f6b67e40e9b873f8b4a0603f7a9',
    },
    protobuf: {
      url: `https://${host}/protobufjs/protobuf.js/v6.10.1/dist/light/protobuf.min.js`,
      sha256: '8978daf871b02d683ecaee371861702a6f31d0a4c52925b7db2bb1655a8bc7d1',
    },
    jszip: {
      url: `https://${host}/Stuk/jszip/v3.7.1/dist/jszip.min.js`,
      sha256: 'c9e4a52bac18aee4f3f90d05fbca603f5b0f5bf1ce8c45e60bb4ed3a2cb2ed86',
    },
    sortable: {
      url: `https://${host}/SortableJS/Sortable/1.14.0/Sortable.min.js`,
      sha256: '0ea5a6fbfbf5434b606878533cb7a66bcf700f0f08afe908335d0978fb63ad94',
    },
    streamsaver: {
      url: `https://${host}/jimmywarting/StreamSaver.js/2.0.6/StreamSaver.js`,
      sha256: 'a110f78e0b092481dc372901c4d57ae50681d773bc9d55e62356f9a22f17e24b',
    },
    // https://github.com/the1812/Bilibili-Evolved/pull/4521#discussion_r1402084486
    ffmpeg: jsDelivr.library.ffmpeg,
  },
  smallLogo: `https://${host}/${owner}/Bilibili-Evolved/preview/images/logo-small.png`,
  logo: `https://${host}/${owner}/Bilibili-Evolved/preview/images/logo.png`,
  root: (branch, ownerOverride) =>
    `https://${host}/${ownerOverride || owner}/Bilibili-Evolved/${branch}/`,
}
