!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["feeds/image-auto-back-to-top"]=t():e["feeds/image-auto-back-to-top"]=t()}(globalThis,(()=>(()=>{var e,t,o={583:e=>{function t(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=583,e.exports=t},953:e=>{"use strict";e.exports="在动态里查看图片详情时 (非全屏), 切换图片自动回到图片顶部; 退出查看图片模式时, 自动将动态移入视图内.\n"}},r={};function n(e){var t=r[e];if(void 0!==t)return t.exports;var i=r[e]={exports:{}};return o[e](i,i.exports,n),i.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,n.t=function(o,r){if(1&r&&(o=this(o)),8&r)return o;if("object"==typeof o&&o){if(4&r&&o.__esModule)return o;if(16&r&&"function"==typeof o.then)return o}var i=Object.create(null);n.r(i);var a={};e=e||[null,t({}),t([]),t(t)];for(var s=2&r&&o;"object"==typeof s&&!~e.indexOf(s);s=t(s))Object.getOwnPropertyNames(s).forEach((e=>a[e]=()=>o[e]));return a.default=()=>o,n.d(i,a),i},n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var i={};return(()=>{"use strict";n.d(i,{component:()=>s});const e=coreApis.componentApis.define,t=coreApis.componentApis.feeds.api,o=coreApis.observer,r=coreApis.utils.log,a=coreApis.utils.urls,s=(0,e.defineComponentMetadata)({name:"imageAutoBackToTop",displayName:"动态看图自动回顶",tags:[componentsTags.feeds],urlInclude:a.feedsUrlsWithoutDetail,entry:()=>{const e=(0,r.useScopedConsole)("imageAutoBackToTop");(0,t.forEachFeedsCard)({added:t=>{const r=e=>{e?.scrollIntoView(),window.scrollBy({top:-75})},n=dqa(t.element,".bili-album");(0,o.mutationObserve)(n,{childList:!0,attributes:!0,subtree:!0},(o=>{o.forEach((o=>{const n=()=>o.target instanceof HTMLElement&&o.target.classList.contains("bili-album__watch")&&"style"===o.attributeName?"none"!==o.target.style.display:null,i=e=>[...e].some((e=>e instanceof HTMLElement&&e.classList.contains("bili-album__watch")));(i(o.removedNodes)||!1===n())&&(r(t.element),e.log("imagePreviewExited"));if(i(o.addedNodes)||!0===n()){const o=dq(t.element,".bili-album__watch__control");r(o),e.log("imagePreviewEntered")}}))})),(0,o.attributesSubtree)(t.element,(o=>{o.forEach((o=>{if(!(o.target instanceof HTMLImageElement&&o.target.matches(".bili-album__watch__content img")&&"src"===o.attributeName))return;const n=dq(t.element,".bili-album__watch__control");r(n),e.log("imagePreviewSwitched")}))}))}})},commitHash:"99743eecf82280666cde8b64af6a660babc70153",coreVersion:"2.9.2",description:(()=>{const e=n(583);return{...Object.fromEntries(e.keys().map((t=>[t.match(/index\.(.+)\.md$/)[1],e(t)]))),"zh-CN":()=>Promise.resolve().then(n.t.bind(n,953,17)).then((e=>e.default))}})()})})(),i=i.component})()));