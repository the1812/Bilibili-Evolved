!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["utils/watchlater-redirect"]=t():e["utils/watchlater-redirect"]=t()}(self,(function(){return function(){"use strict";var e,t,o={952:function(e){e.exports=coreApis.componentApis.video.watchlater},391:function(e){e.exports=coreApis.observer},200:function(e){e.exports=coreApis.spinQuery}},r={};function n(e){var t=r[e];if(void 0!==t)return t.exports;var i=r[e]={exports:{}};return o[e](i,i.exports,n),i.exports}t=Object.getPrototypeOf?function(e){return Object.getPrototypeOf(e)}:function(e){return e.__proto__},n.t=function(o,r){if(1&r&&(o=this(o)),8&r)return o;if("object"==typeof o&&o){if(4&r&&o.__esModule)return o;if(16&r&&"function"==typeof o.then)return o}var i=Object.create(null);n.r(i);var c={};e=e||[null,t({}),t([]),t(t)];for(var a=2&r&&o;"object"==typeof a&&!~e.indexOf(a);a=t(a))Object.getOwnPropertyNames(a).forEach((function(e){c[e]=function(){return o[e]}}));return c.default=function(){return o},n.d(i,c),i},n.d=function(e,t){for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var i={};return function(){n.d(i,{component:function(){return e}});const e={name:"watchlaterRedirect",displayName:"稍后再看重定向",description:{"zh-CN":"将稍后再看的链接重定向为普通播放网址."},entry:async e=>{let{settings:t}=e;if(t.options.page){const{select:e}=await Promise.resolve().then(n.t.bind(n,200,23)),{childList:t}=await Promise.resolve().then(n.t.bind(n,391,23)),{getWatchlaterList:o}=await Promise.resolve().then(n.t.bind(n,952,23)),r=await o(!0),i=await e(".watch-later-list .list-box > span");if(!i)return;const c=(e,t)=>{try{var o;const n=r[t],{bvid:i,cid:c,pages:a}=n,s=(null===(o=a.find((e=>e.cid===c)))||void 0===o?void 0:o.page)??1,l=s>1?`https://www.bilibili.com/video/${i}?p=${s}`:`https://www.bilibili.com/video/${i}`,u=e.querySelector(".av-pic");u.target="_blank",u.href=l;const f=e.querySelector(".av-about .t");f.target="_blank",f.href=l}catch(o){console.error(`[watchlater redirect] error at index ${t}`,e,o)}},a=()=>{i.querySelectorAll(".av-item").forEach(c)};t(i,(e=>{e.forEach((e=>{e.removedNodes.forEach((e=>{if(e instanceof HTMLElement&&!e.classList.contains("itemlist-move")){const t=parseInt(dq(e,".key").textContent)-1;console.log("remove index",t),r.splice(t,1)}}))})),a()}))}},options:{page:{displayName:"重定向页面",defaultValue:!0},navbar:{displayName:"重定向顶栏",defaultValue:!0}},urlInclude:["https://www.bilibili.com/watchlater/#/list"],tags:[componentsTags.utils,componentsTags.video],commitHash:"86408879b4d80949fa3a84b8032363b7cfb9b57e",coreVersion:"2.3.0"}}(),i=i.component}()}));