!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["utils/watchlater-redirect"]=t():e["utils/watchlater-redirect"]=t()}(globalThis,(()=>(()=>{"use strict";var e,t,o={952:e=>{e.exports=coreApis.componentApis.video.watchlater},391:e=>{e.exports=coreApis.observer},200:e=>{e.exports=coreApis.spinQuery}},r={};function i(e){var t=r[e];if(void 0!==t)return t.exports;var a=r[e]={exports:{}};return o[e](a,a.exports,i),a.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,i.t=function(o,r){if(1&r&&(o=this(o)),8&r)return o;if("object"==typeof o&&o){if(4&r&&o.__esModule)return o;if(16&r&&"function"==typeof o.then)return o}var a=Object.create(null);i.r(a);var n={};e=e||[null,t({}),t([]),t(t)];for(var s=2&r&&o;"object"==typeof s&&!~e.indexOf(s);s=t(s))Object.getOwnPropertyNames(s).forEach((e=>n[e]=()=>o[e]));return n.default=()=>o,i.d(a,n),a},i.d=(e,t)=>{for(var o in t)i.o(t,o)&&!i.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},i.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),i.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var a={};return(()=>{i.d(a,{component:()=>e});const e=(0,coreApis.componentApis.define.defineComponentMetadata)({name:"watchlaterRedirect",displayName:"稍后再看重定向",description:{"zh-CN":"将稍后再看的链接重定向为普通播放网址."},entry:async e=>{let{settings:t}=e;if(t.options.page){const{select:e}=await Promise.resolve().then(i.t.bind(i,200,23)),{childList:t}=await Promise.resolve().then(i.t.bind(i,391,23)),{getWatchlaterList:o}=await Promise.resolve().then(i.t.bind(i,952,23)),r=await o(!0),a=await e(".watch-later-list .list-box > span");if(!a)return;const n=(e,t)=>{try{const o=r[t],{bvid:i,cid:a,pages:n}=o,s=n.find((e=>e.cid===a))?.page??1,c=s>1?`https://www.bilibili.com/video/${i}?p=${s}`:`https://www.bilibili.com/video/${i}`,l=e.querySelector(".av-pic");l.target="_blank",l.href=c;const p=e.querySelector(".av-about .t");p.target="_blank",p.href=c}catch(o){console.error(`[watchlater redirect] error at index ${t}`,e,o)}},s=()=>{a.querySelectorAll(".av-item").forEach(n)};t(a,(e=>{e.forEach((e=>{e.removedNodes.forEach((e=>{if(e instanceof HTMLElement&&!e.classList.contains("itemlist-move")){const t=parseInt(dq(e,".key").textContent)-1;console.log("remove index",t),r.splice(t,1)}}))})),s()}))}},options:{page:{displayName:"重定向页面",defaultValue:!0},navbar:{displayName:"重定向顶栏",defaultValue:!0}},urlInclude:["https://www.bilibili.com/watchlater/#/list"],tags:[componentsTags.utils,componentsTags.video],commitHash:"c2ba4a36a6e1427551950821b934d8de9269b4d2",coreVersion:"2.7.0"})})(),a=a.component})()));