import { CdnConfig } from './types'

const owner = 'the1812'
let host: string = 'fastly.jsdelivr.net';
const timeout = 50000; // 单位ms

const controller = new AbortController();
const signal = controller.signal;
const timer = setTimeout(() => controller.abort(), timeout);

fetch(`https://${host}/favicon.ico`, { 
  signal,
  cache: 'no-store'
})
  .then(response => {
    clearTimeout(timer);
    if (response.ok) {
      // console.log('fastly.jsdelivr.net is accessible');
      host = 'fastly.jsdelivr.net';
    } else {
      console.log('fastly.jsdelivr.net returned an error:', response.status);
      host = 'testingcf.jsdelivr.net';
    }
  })
  .catch(error => {
    console.log('fastly.jsdelivr.net timed out or returned an error:', error.message);
    host = 'testingcf.jsdelivr.net';
  });

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
    mdi: `https://${host}/gh/Templarian/MaterialDesign-Webfont@5.3.45/css/materialdesignicons.min.css`,
    streamsaver: `https://${host}/npm/streamsaver@2.0.6/StreamSaver.min.js`,
  },
  smallLogo: `https://${host}/gh/${owner}/Bilibili-Evolved@preview/images/logo-small.png`,
  logo: `https://${host}/gh/${owner}/Bilibili-Evolved@preview/images/logo.png`,
  root: (branch, ownerOverride) =>
    `https://${host}/gh/${ownerOverride || owner}/Bilibili-Evolved@${branch}/`,
}
