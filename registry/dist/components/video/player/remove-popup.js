!function(e,o){"object"==typeof exports&&"object"==typeof module?module.exports=o():"function"==typeof define&&define.amd?define([],o):"object"==typeof exports?exports["video/player/remove-popup"]=o():e["video/player/remove-popup"]=o()}(globalThis,(()=>(()=>{var e,o,p={246:(e,o,p)=>{var r=p(218)((function(e){return e[1]}));r.push([e.id,"body.remove-player-popup .bili-danmaku-x-cmd-shrink,\nbody.remove-player-popup .bili-cmd-shrink {\n  display: none !important;\n}\nbody.remove-player-popup-combo-likes .bili-danmaku-x-guide,\nbody.remove-player-popup-combo-likes .bili-guide,\nbody.remove-player-popup-combo-likes .bilibili-player-video-popup-three,\nbody.remove-player-popup-combo-likes .bilibili-player-video-popup-three-animate,\nbody.remove-player-popup-combo-likes .bilibili-player-video-popup-follow,\nbody.remove-player-popup-combo-likes .bilibili-player-video-popup-there-cyc,\nbody.remove-player-popup-combo-likes .bpx-player-popup-three,\nbody.remove-player-popup-combo-likes .bpx-player-popup-animate,\nbody.remove-player-popup-combo-likes .bpx-player-popup-follow,\nbody.remove-player-popup-combo-likes .bpx-player-popup-cyc {\n  display: none !important;\n}\nbody.remove-player-popup-related-videos .bili-danmaku-x-link,\nbody.remove-player-popup-related-videos .bili-link,\nbody.remove-player-popup-related-videos .bilibili-player-video-link,\nbody.remove-player-popup-related-videos .bilibili-player-link,\nbody.remove-player-popup-related-videos .bpx-player-link {\n  display: none !important;\n}\nbody.remove-player-popup-votes .bili-danmaku-x-vote,\nbody.remove-player-popup-votes .bili-vote,\nbody.remove-player-popup-votes .bilibili-player-video-popup-vote,\nbody.remove-player-popup-votes .bpx-player-popup-dm-close,\nbody.remove-player-popup-votes .bpx-player-popup-dm-shrink,\nbody.remove-player-popup-votes .bpx-player-popup-vote {\n  display: none !important;\n}\nbody.remove-player-popup-rates .bili-danmaku-x-score,\nbody.remove-player-popup-rates .bili-score,\nbody.remove-player-popup-rates .bilibili-player-score,\nbody.remove-player-popup-rates .bpx-player-popup-dm-close,\nbody.remove-player-popup-rates .bpx-player-score-summary-wrap,\nbody.remove-player-popup-rates .bpx-player-score,\nbody.remove-player-popup-rates .bili-qoeFeedback {\n  display: none !important;\n}\nbody.remove-player-popup-reservations .bili-danmaku-x-reserve,\nbody.remove-player-popup-reservations .bili-reserve,\nbody.remove-player-popup-reservations .bpx-player-reserve {\n  display: none !important;\n}\nbody.remove-player-popup-promotions .bili-danmaku-x-cmtime,\nbody.remove-player-popup-promotions .bili-cmtime,\nbody.remove-player-popup-promotions .bpx-player-cmtime,\nbody.remove-player-popup-promotions .bpx-player-skipcard {\n  display: none !important;\n}",""]),e.exports=r},218:e=>{"use strict";
// eslint-disable-next-line func-names
e.exports=function(e){var o=[];return o.toString=function(){return this.map((function(o){var p=e(o);return o[2]?"@media ".concat(o[2]," {").concat(p,"}"):p})).join("")},
// eslint-disable-next-line func-names
o.i=function(e,p,r){"string"==typeof e&&(
// eslint-disable-next-line no-param-reassign
e=[[null,e,""]]);var t={};if(r)for(var n=0;n<this.length;n++){
// eslint-disable-next-line prefer-destructuring
var a=this[n][0];null!=a&&(t[a]=!0)}for(var i=0;i<e.length;i++){var l=[].concat(e[i]);r&&t[l[0]]||(p&&(l[2]?l[2]="".concat(p," and ").concat(l[2]):l[2]=p),o.push(l))}},o}},428:(e,o,p)=>{var r=p(246);r&&r.__esModule&&(r=r.default),e.exports="string"==typeof r?r:r.toString()},912:e=>{function o(e){var o=new Error("Cannot find module '"+e+"'");throw o.code="MODULE_NOT_FOUND",o}o.keys=()=>[],o.resolve=o,o.id=912,e.exports=o},541:e=>{"use strict";e.exports="删除视频播放器中出现的各种弹窗, 类别可在选项中分别选择. 如果之前点了收起弹窗, 则收起后的小弹窗则会直接删除. (不受类别选择影响)\n"}},r={};function t(e){var o=r[e];if(void 0!==o)return o.exports;var n=r[e]={id:e,exports:{}};return p[e](n,n.exports,t),n.exports}o=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,t.t=function(p,r){if(1&r&&(p=this(p)),8&r)return p;if("object"==typeof p&&p){if(4&r&&p.__esModule)return p;if(16&r&&"function"==typeof p.then)return p}var n=Object.create(null);t.r(n);var a={};e=e||[null,o({}),o([]),o(o)];for(var i=2&r&&p;"object"==typeof i&&!~e.indexOf(i);i=o(i))Object.getOwnPropertyNames(i).forEach((e=>a[e]=()=>p[e]));return a.default=()=>p,t.d(n,a),n},t.d=(e,o)=>{for(var p in o)t.o(o,p)&&!t.o(e,p)&&Object.defineProperty(e,p,{enumerable:!0,get:o[p]})},t.o=(e,o)=>Object.prototype.hasOwnProperty.call(e,o),t.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var n={};return(()=>{"use strict";t.d(n,{component:()=>a});const e=coreApis.componentApis.define,o=coreApis.settings,p=coreApis.utils.urls,r="removePlayerPopup",a=(0,e.defineComponentMetadata)({name:r,entry:e=>{let{settings:p,metadata:r}=e;const{options:t}=p,{kebabCase:n}=lodash;(0,o.addComponentListener)(r.name,(e=>{document.body.classList.toggle(n(r.name),e)}),!0),Object.keys(t).forEach((e=>{(0,o.addComponentListener)(`${r.name}.${e}`,(o=>{document.body.classList.toggle(`${n(r.name)}-${n(e)}`,o)}),!0)}))},instantStyles:[{name:r,style:()=>Promise.resolve().then(t.t.bind(t,428,23))}],displayName:"删除视频弹窗",tags:[componentsTags.video,componentsTags.style],urlInclude:p.playerUrls,options:{votes:{defaultValue:!1,displayName:"投票"},relatedVideos:{defaultValue:!0,displayName:"关联视频"},comboLikes:{defaultValue:!0,displayName:"关注/三连"},rates:{defaultValue:!0,displayName:"评分"},reservations:{defaultValue:!0,displayName:"预告"},promotions:{defaultValue:!0,displayName:"心动"}},commitHash:"11fe0ba9559de5a5bf57f4a68c7f53a83b2bf02b",coreVersion:"2.9.5",description:(()=>{const e=t(912);return{...Object.fromEntries(e.keys().map((o=>[o.match(/index\.(.+)\.md$/)[1],e(o)]))),"zh-CN":()=>Promise.resolve().then(t.t.bind(t,541,17)).then((e=>e.default))}})()})})(),n=n.component})()));