!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["utils/watchlater-redirect"]=t():e["utils/watchlater-redirect"]=t()}(globalThis,(()=>(()=>{var e,t,r={346:e=>{function t(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=346,e.exports=t},433:e=>{"use strict";e.exports="将稍后再看的链接重定向为普通播放网址.\n- `重定向页面`: 对稍后再看列表页面里的链接重定向.\n- `重定向顶栏`: 对 `自定义顶栏` 里的稍后再看链接重定向.\n"},674:e=>{"use strict";e.exports=coreApis.componentApis.video.watchlater},104:e=>{"use strict";e.exports=coreApis.observer},728:e=>{"use strict";e.exports=coreApis.spinQuery},765:e=>{"use strict";e.exports=coreApis.utils.log}},o={};function i(e){var t=o[e];if(void 0!==t)return t.exports;var n=o[e]={exports:{}};return r[e](n,n.exports,i),n.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,i.t=function(r,o){if(1&o&&(r=this(r)),8&o)return r;if("object"==typeof r&&r){if(4&o&&r.__esModule)return r;if(16&o&&"function"==typeof r.then)return r}var n=Object.create(null);i.r(n);var a={};e=e||[null,t({}),t([]),t(t)];for(var c=2&o&&r;"object"==typeof c&&!~e.indexOf(c);c=t(c))Object.getOwnPropertyNames(c).forEach((e=>a[e]=()=>r[e]));return a.default=()=>r,i.d(n,a),n},i.d=(e,t)=>{for(var r in t)i.o(t,r)&&!i.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},i.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),i.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var n={};return(()=>{"use strict";i.d(n,{component:()=>r});const e=coreApis.componentApis.define,t=(e,t)=>{try{const{bvid:r,cid:o,pages:i}=t,n=i.find((e=>e.cid===o))?.page??1,a=n>1?`https://www.bilibili.com/video/${r}?p=${n}`:`https://www.bilibili.com/video/${r}`,c=e.querySelector(".av-pic, .bili-cover-card");c.target="_blank",c.href=a;const s=e.querySelector(".av-about .t, .bili-video-card__title a, .video-card__right .title");s.target="_blank",s.href=a}catch(r){console.error(`[watchlater redirect] error at ${t.bvid}`,e,r)}},r=(0,e.defineComponentMetadata)({name:"watchlaterRedirect",displayName:"稍后再看重定向",entry:async e=>{let{settings:r}=e;if(!r.options.page)return;const{select:o}=await Promise.resolve().then(i.t.bind(i,728,23)),{childListSubtree:n}=await Promise.resolve().then(i.t.bind(i,104,23)),{getWatchlaterList:a}=await Promise.resolve().then(i.t.bind(i,674,23)),{useScopedConsole:c}=await Promise.resolve().then(i.t.bind(i,765,23)),s=c("稍后再看重定向"),l=await a(!0),d=await o(".watch-later-list .list-box > span, .watchlater-list");if(!d)return;const p=lodash.debounce((()=>{const e=d.querySelectorAll(".av-item, .video-card");s.log("run redirect, length =",e.length),e.forEach((e=>{(e=>{if((e=>{const t=e.querySelector(".av-pic, .bili-cover-card");return/video\/BV/.test(t.href)})(e))return;const r=(e=>{const t=e.querySelector(".av-pic, .bili-cover-card"),r=t.href.match(/bvid=([^&]+)/)?.[1];return r})(e);if(void 0===r)return void s.warn("bvid not found for",e.outerHTML);const o=l.find((e=>e.bvid===r));void 0!==o?(s.log("redirect for",r),t(e,o)):s.warn("bvid no match for",r)})(e)}))}),200);p(),n(d,(async e=>{e.forEach((e=>{[...e.addedNodes].some((e=>e instanceof HTMLElement&&["bili-video-card__wrap","video-card","watchlater-list-container"].some((t=>e.classList.contains(t)))))&&p()}))}))},options:{page:{displayName:"重定向页面",defaultValue:!0},navbar:{displayName:"重定向顶栏",defaultValue:!0}},urlInclude:["https://www.bilibili.com/watchlater/#/list","https://www.bilibili.com/watchlater/list#/list"],tags:[componentsTags.utils,componentsTags.video],commitHash:"8f27049d249a634bdb0fa854e84fecf2e3c26aa3",coreVersion:"2.10.0",description:(()=>{const e=i(346);return{...Object.fromEntries(e.keys().map((t=>[t.match(/index\.(.+)\.md$/)[1],e(t)]))),"zh-CN":()=>Promise.resolve().then(i.t.bind(i,433,17)).then((e=>e.default))}})()})})(),n=n.component})()));