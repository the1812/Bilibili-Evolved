!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["video/player/preserve-danmaku-input"]=t():e["video/player/preserve-danmaku-input"]=t()}(globalThis,(()=>(()=>{var e,t,r={543:(e,t,r)=>{var o=r(218)((function(e){return e[1]}));o.push([e.id,"@media screen and (max-width: 1200px) {\n  body.player-mode-full .bpx-player-video-inputbar, body.player-fullscreen-fix .bpx-player-video-inputbar, body.player-mode-web .bpx-player-video-inputbar, body.player-full-win .bpx-player-video-inputbar,\nbody.player-mode-full .bilibili-player-video-inputbar,\nbody.player-fullscreen-fix .bilibili-player-video-inputbar,\nbody.player-mode-web .bilibili-player-video-inputbar,\nbody.player-full-win .bilibili-player-video-inputbar {\n    display: flex !important;\n  }\n}",""]),e.exports=o},218:e=>{"use strict";
// eslint-disable-next-line func-names
e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var r=e(t);return t[2]?"@media ".concat(t[2]," {").concat(r,"}"):r})).join("")},
// eslint-disable-next-line func-names
t.i=function(e,r,o){"string"==typeof e&&(
// eslint-disable-next-line no-param-reassign
e=[[null,e,""]]);var n={};if(o)for(var i=0;i<this.length;i++){
// eslint-disable-next-line prefer-destructuring
var a=this[i][0];null!=a&&(n[a]=!0)}for(var p=0;p<e.length;p++){var l=[].concat(e[p]);o&&n[l[0]]||(r&&(l[2]?l[2]="".concat(r," and ").concat(l[2]):l[2]=r),t.push(l))}},t}},752:(e,t,r)=>{var o=r(543);o&&o.__esModule&&(o=o.default),e.exports="string"==typeof o?o:o.toString()}},o={};function n(e){var t=o[e];if(void 0!==t)return t.exports;var i=o[e]={id:e,exports:{}};return r[e](i,i.exports,n),i.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,n.t=function(r,o){if(1&o&&(r=this(r)),8&o)return r;if("object"==typeof r&&r){if(4&o&&r.__esModule)return r;if(16&o&&"function"==typeof r.then)return r}var i=Object.create(null);n.r(i);var a={};e=e||[null,t({}),t([]),t(t)];for(var p=2&o&&r;"object"==typeof p&&!~e.indexOf(p);p=t(p))Object.getOwnPropertyNames(p).forEach((e=>a[e]=()=>r[e]));return a.default=()=>r,n.d(i,a),i},n.d=(e,t)=>{for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var i={};return(()=>{"use strict";n.d(i,{component:()=>o});const e=coreApis.componentApis.define,t=coreApis.utils.urls,r="preserveDanmakuInput",o=(0,e.defineComponentMetadata)({name:r,displayName:"强制保留弹幕发送栏",entry:none,instantStyles:[{name:r,style:()=>Promise.resolve().then(n.t.bind(n,752,23))}],tags:[componentsTags.style,componentsTags.video],description:{"zh-CN":"在视频播放器网页全屏时, 即使宽度过小也强制保留弹幕发送栏, 注意这可能导致右侧的功能按钮挤出边界."},urlInclude:t.playerUrls,commitHash:"11fe0ba9559de5a5bf57f4a68c7f53a83b2bf02b",coreVersion:"2.9.5"})})(),i=i.component})()));