!function(l,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports["touch/player-control"]=e():l["touch/player-control"]=e()}(globalThis,(()=>(()=>{var l,e,r={730:(l,e,r)=>{var i=r(955)((function(l){return l[1]}));i.push([l.id,'@charset "UTF-8";\nbody.touch-player-control .bilibili-player * {\n  -webkit-tap-highlight-color: transparent !important;\n}\nbody.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-control-wrap {\n  padding: 0 !important;\n}\nbody.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-control-wrap .bilibili-player-video-btn {\n  height: 100% !important;\n  padding-left: 2px !important;\n  padding-right: 2px !important;\n}\nbody.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-control-wrap .bilibili-player-video-btn.bilibili-player-video-btn-start {\n  padding-left: 22px !important;\n}\nbody.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-control-wrap .bilibili-player-video-btn.bilibili-player-video-btn-fullscreen {\n  padding-right: 18px !important;\n}\nbody.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-control-wrap .bilibili-player-video-btn-pagelist {\n  width: 36px !important;\n}\nbody.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-control-wrap .bilibili-player-video-btn-pagelist .bilibili-player-video-btn-name {\n  display: none !important;\n}\nbody.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-control-wrap .bilibili-player-video-btn-pagelist::before {\n  content: "󰉹";\n  display: block;\n  width: 36px;\n  color: #eee;\n  font: normal normal normal 20px/1 "Material Design Icons";\n  text-rendering: auto;\n  line-height: inherit;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\nbody.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-control-wrap .bilibili-player-video-btn-speed {\n  width: 36px !important;\n}\nbody.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-control-wrap .bilibili-player-video-btn-speed-name {\n  display: none !important;\n}\nbody.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-control-wrap .bilibili-player-video-btn-speed::before {\n  content: "󰣿";\n  display: block;\n  width: 36px;\n  color: #eee;\n  font: normal normal normal 20px/1 "Material Design Icons";\n  text-rendering: auto;\n  line-height: inherit;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\nbody.touch-player-control .bilibili-player .bilibili-player-area #bilibili_pbp_pin {\n  right: 0 !important;\n}\nbody.player-mode-full.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-control-bottom-center, body.player-fullscreen-fix.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-control-bottom-center, body.player-mode-web.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-control-bottom-center, body.player-full-win.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-control-bottom-center {\n  padding: 0 12px !important;\n}\nbody.player-mode-full.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn, body.player-fullscreen-fix.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn, body.player-mode-web.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn, body.player-full-win.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn {\n  flex-shrink: 0 !important;\n  flex-basis: 48px !important;\n}\nbody.player-mode-full.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn-speed,\nbody.player-mode-full.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn-pagelist, body.player-fullscreen-fix.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn-speed,\nbody.player-fullscreen-fix.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn-pagelist, body.player-mode-web.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn-speed,\nbody.player-mode-web.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn-pagelist, body.player-full-win.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn-speed,\nbody.player-full-win.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn-pagelist {\n  width: 54px !important;\n}\nbody.player-mode-full.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn-speed::before,\nbody.player-mode-full.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn-pagelist::before, body.player-fullscreen-fix.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn-speed::before,\nbody.player-fullscreen-fix.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn-pagelist::before, body.player-mode-web.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn-speed::before,\nbody.player-mode-web.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn-pagelist::before, body.player-full-win.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn-speed::before,\nbody.player-full-win.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn-pagelist::before {\n  width: 50px;\n  font-size: 26px;\n}\nbody.player-mode-full.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn-start, body.player-fullscreen-fix.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn-start, body.player-mode-web.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn-start, body.player-full-win.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-btn-start {\n  padding-top: 0 !important;\n}\nbody.player-mode-full.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-danmaku-switch, body.player-fullscreen-fix.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-danmaku-switch, body.player-mode-web.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-danmaku-switch, body.player-full-win.touch-player-control .bilibili-player .bilibili-player-area .bilibili-player-video-danmaku-switch {\n  padding-left: 0 !important;\n}\n\nbody.touch-player-control .bpx-player-video-area .squirtle-controller {\n  height: 48px !important;\n}\nbody.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap {\n  height: 30px !important;\n  padding: 14px 6px 4px !important;\n}\nbody.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-play-wrap {\n  padding-left: 10px !important;\n}\nbody.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-pagelist-wrap {\n  width: 36px !important;\n}\nbody.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-pagelist-wrap .squirtle-select-result {\n  display: none !important;\n}\nbody.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-pagelist-wrap .squirtle-video-pagelist::before {\n  content: "󰉹";\n  display: block;\n  width: 36px;\n  color: #eee;\n  font: normal normal normal 20px/1 "Material Design Icons";\n  text-rendering: auto;\n  line-height: inherit;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\nbody.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-speed-wrap {\n  width: 36px !important;\n}\nbody.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-speed-wrap .squirtle-select-result {\n  display: none !important;\n}\nbody.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-speed-wrap .squirtle-video-speed::before {\n  content: "󰣿";\n  display: block;\n  width: 36px;\n  color: #eee;\n  font: normal normal normal 20px/1 "Material Design Icons";\n  text-rendering: auto;\n  line-height: inherit;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\nbody.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-high-energy.ease {\n  bottom: 2px !important;\n}\nbody.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-high-energy,\nbody.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-progress-common {\n  width: 100% !important;\n  margin: 0 !important;\n}\nbody.touch-player-control .bpx-player-video-area .squirtle-controller #bilibili_pbp_pin {\n  right: 0 !important;\n}\nbody.touch-player-control .bpx-player-video-area .bpx-player-control-top,\nbody.touch-player-control .bpx-player-video-area .bpx-player-control-bottom {\n  padding: 0 !important;\n}\nbody.touch-player-control .bpx-player-video-area .bpx-player-control-bottom-left > :first-child {\n  padding-left: 12px !important;\n}\nbody.touch-player-control .bpx-player-video-area .bpx-player-control-bottom-right > :last-child {\n  padding-right: 12px !important;\n}\nbody.touch-player-control .bpx-player-video-area .bpx-player-pbp {\n  padding: 0 !important;\n  left: 0 !important;\n  width: 100% !important;\n}\nbody.touch-player-control .bpx-player-video-area .bpx-player-ctrl-btn {\n  height: 100% !important;\n  padding-left: 2px !important;\n  padding-right: 2px !important;\n}\nbody.player-mode-full.touch-player-control .bpx-player-video-area .squirtle-controller, body.player-fullscreen-fix.touch-player-control .bpx-player-video-area .squirtle-controller, body.player-mode-web.touch-player-control .bpx-player-video-area .squirtle-controller, body.player-full-win.touch-player-control .bpx-player-video-area .squirtle-controller {\n  height: 72px !important;\n}\nbody.player-mode-full.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap, body.player-fullscreen-fix.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap, body.player-mode-web.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap, body.player-full-win.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap {\n  height: 50px !important;\n  padding: 16px 6px 0 !important;\n}\nbody.player-mode-full.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-sendbar-wrap, body.player-fullscreen-fix.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-sendbar-wrap, body.player-mode-web.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-sendbar-wrap, body.player-full-win.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-sendbar-wrap {\n  align-items: center !important;\n}\nbody.player-mode-full.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-pagelist-wrap,\nbody.player-mode-full.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-speed-wrap, body.player-fullscreen-fix.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-pagelist-wrap,\nbody.player-fullscreen-fix.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-speed-wrap, body.player-mode-web.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-pagelist-wrap,\nbody.player-mode-web.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-speed-wrap, body.player-full-win.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-pagelist-wrap,\nbody.player-full-win.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-speed-wrap {\n  width: 54px !important;\n}\nbody.player-mode-full.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-pagelist-wrap .squirtle-video-pagelist::before,\nbody.player-mode-full.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-pagelist-wrap .squirtle-video-speed::before,\nbody.player-mode-full.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-speed-wrap .squirtle-video-pagelist::before,\nbody.player-mode-full.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-speed-wrap .squirtle-video-speed::before, body.player-fullscreen-fix.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-pagelist-wrap .squirtle-video-pagelist::before,\nbody.player-fullscreen-fix.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-pagelist-wrap .squirtle-video-speed::before,\nbody.player-fullscreen-fix.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-speed-wrap .squirtle-video-pagelist::before,\nbody.player-fullscreen-fix.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-speed-wrap .squirtle-video-speed::before, body.player-mode-web.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-pagelist-wrap .squirtle-video-pagelist::before,\nbody.player-mode-web.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-pagelist-wrap .squirtle-video-speed::before,\nbody.player-mode-web.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-speed-wrap .squirtle-video-pagelist::before,\nbody.player-mode-web.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-speed-wrap .squirtle-video-speed::before, body.player-full-win.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-pagelist-wrap .squirtle-video-pagelist::before,\nbody.player-full-win.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-pagelist-wrap .squirtle-video-speed::before,\nbody.player-full-win.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-speed-wrap .squirtle-video-pagelist::before,\nbody.player-full-win.touch-player-control .bpx-player-video-area .squirtle-controller .squirtle-controller-wrap .squirtle-speed-wrap .squirtle-video-speed::before {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 50px;\n  font-size: 26px;\n}\n\n.bpx-player-control-bottom.bpx-player-control-bottom::before {\n  width: 100%;\n}',""]),l.exports=i},955:l=>{"use strict";
// eslint-disable-next-line func-names
l.exports=function(l){var e=[];return e.toString=function(){return this.map((function(e){var r=l(e);return e[2]?"@media ".concat(e[2]," {").concat(r,"}"):r})).join("")},
// eslint-disable-next-line func-names
e.i=function(l,r,i){"string"==typeof l&&(
// eslint-disable-next-line no-param-reassign
l=[[null,l,""]]);var o={};if(i)for(var t=0;t<this.length;t++){
// eslint-disable-next-line prefer-destructuring
var a=this[t][0];null!=a&&(o[a]=!0)}for(var p=0;p<l.length;p++){var n=[].concat(l[p]);i&&o[n[0]]||(r&&(n[2]?n[2]="".concat(r," and ").concat(n[2]):n[2]=r),e.push(n))}},e}},96:(l,e,r)=>{var i=r(730);i&&i.__esModule&&(i=i.default),l.exports="string"==typeof i?i:i.toString()}},i={};function o(l){var e=i[l];if(void 0!==e)return e.exports;var t=i[l]={id:l,exports:{}};return r[l](t,t.exports,o),t.exports}e=Object.getPrototypeOf?l=>Object.getPrototypeOf(l):l=>l.__proto__,o.t=function(r,i){if(1&i&&(r=this(r)),8&i)return r;if("object"==typeof r&&r){if(4&i&&r.__esModule)return r;if(16&i&&"function"==typeof r.then)return r}var t=Object.create(null);o.r(t);var a={};l=l||[null,e({}),e([]),e(e)];for(var p=2&i&&r;"object"==typeof p&&!~l.indexOf(p);p=e(p))Object.getOwnPropertyNames(p).forEach((l=>a[l]=()=>r[l]));return a.default=()=>r,o.d(t,a),t},o.d=(l,e)=>{for(var r in e)o.o(e,r)&&!o.o(l,r)&&Object.defineProperty(l,r,{enumerable:!0,get:e[r]})},o.o=(l,e)=>Object.prototype.hasOwnProperty.call(l,e),o.r=l=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(l,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(l,"__esModule",{value:!0})};var t={};return(()=>{"use strict";o.d(t,{component:()=>a});const l=coreApis.componentApis.define,e=coreApis.utils.urls,r="touch-player-control",i=async()=>{document.body.classList.add(r)},a=(0,l.defineComponentMetadata)({name:"touchPlayerControl",displayName:"控制栏触摸优化",description:{"zh-CN":"增大播放器控制栏里按钮的间距, 方便触屏使用."},tags:[componentsTags.touch,componentsTags.style],enabledByDefault:navigator.maxTouchPoints>0,urlInclude:e.playerUrls,instantStyles:[{name:r,style:()=>Promise.resolve().then(o.t.bind(o,96,23))}],entry:i,reload:i,unload:()=>{document.body.classList.remove(r)},commitHash:"bec07f07c88f7e6f2050ec4bfe797ce74dec45a7",coreVersion:"2.10.0"})})(),t=t.component})()));