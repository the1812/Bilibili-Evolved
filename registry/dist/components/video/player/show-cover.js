!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["video/player/show-cover"]=t():e["video/player/show-cover"]=t()}(globalThis,(()=>(()=>{var e,t,o={882:(e,t,o)=>{var n=o(955)((function(e){return e[1]}));n.push([e.id,'.bpx-player-video-wrap::after,\n.bilibili-player-video::after {\n  position: absolute;\n  content: "";\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  display: none;\n  background: black var(--cover-url) center no-repeat;\n  background-size: contain;\n  pointer-events: none;\n  z-index: 10;\n}\n\n.bpx-player-container.bpx-state-paused .bpx-player-video-wrap::after {\n  display: block;\n}\n\n.bilibili-player-area.video-state-pause .bilibili-player-video::after {\n  display: block;\n}',""]),e.exports=n},955:e=>{"use strict";
// eslint-disable-next-line func-names
e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var o=e(t);return t[2]?"@media ".concat(t[2]," {").concat(o,"}"):o})).join("")},
// eslint-disable-next-line func-names
t.i=function(e,o,n){"string"==typeof e&&(
// eslint-disable-next-line no-param-reassign
e=[[null,e,""]]);var r={};if(n)for(var i=0;i<this.length;i++){
// eslint-disable-next-line prefer-destructuring
var a=this[i][0];null!=a&&(r[a]=!0)}for(var s=0;s<e.length;s++){var c=[].concat(e[s]);n&&r[c[0]]||(o&&(c[2]?c[2]="".concat(o," and ").concat(c[2]):c[2]=o),t.push(c))}},t}},360:(e,t,o)=>{var n=o(882);n&&n.__esModule&&(n=n.default),e.exports="string"==typeof n?n:n.toString()},682:e=>{"use strict";e.exports=coreApis.componentApis.video.videoInfo}},n={};function r(e){var t=n[e];if(void 0!==t)return t.exports;var i=n[e]={id:e,exports:{}};return o[e](i,i.exports,r),i.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,r.t=function(o,n){if(1&n&&(o=this(o)),8&n)return o;if("object"==typeof o&&o){if(4&n&&o.__esModule)return o;if(16&n&&"function"==typeof o.then)return o}var i=Object.create(null);r.r(i);var a={};e=e||[null,t({}),t([]),t(t)];for(var s=2&n&&o;"object"==typeof s&&!~e.indexOf(s);s=t(s))Object.getOwnPropertyNames(s).forEach((e=>a[e]=()=>o[e]));return a.default=()=>o,r.d(i,a),i},r.d=(e,t)=>{for(var o in t)r.o(t,o)&&!r.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var i={};return(()=>{"use strict";r.d(i,{component:()=>a});const e=coreApis.componentApis.define,t=coreApis.componentApis.video.playerAgent,o=coreApis.observer,n=coreApis.utils.urls,a=(0,e.defineComponentMetadata)({name:"showCoverBeforePlay",displayName:"播放前显示封面",urlInclude:n.playerUrls,entry:async()=>{let e;const n=()=>document.documentElement.style.removeProperty("--cover-url");(0,o.videoChange)((()=>{t.playerAgent.addEventListener(t.PlayerAgentEventTypes.Pause,(()=>{n()})),t.playerAgent.addEventListener(t.PlayerAgentEventTypes.Play,(()=>{n()}))}));(0,o.videoChange)((async t=>{let{aid:o}=t;if(!o)return void console.warn("[播放前显示封面] 未找到av号");if(o===e)return;e=o;const{VideoInfo:n}=await Promise.resolve().then(r.t.bind(r,682,23)),i=new n(o);await i.fetchInfo(),document.documentElement.style.setProperty("--cover-url",`url('${i.coverUrl}')`)}))},instantStyles:[{name:"showCoverBeforePlay",style:()=>Promise.resolve().then(r.t.bind(r,360,23))}],description:{"zh-CN":"在视频开始播放前, 在播放器中显示封面."},tags:[componentsTags.video],commitHash:"549fcdb16eeb45122ceaa48017a43a573598fc1a",coreVersion:"2.10.0"})})(),i=i.component})()));