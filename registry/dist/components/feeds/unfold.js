!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["feeds/unfold"]=t():e["feeds/unfold"]=t()}(globalThis,(()=>(()=>{"use strict";var e,t,o={799:e=>{e.exports=coreApis.componentApis.feeds.api}},n={};function r(e){var t=n[e];if(void 0!==t)return t.exports;var i=n[e]={exports:{}};return o[e](i,i.exports,r),i.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,r.t=function(o,n){if(1&n&&(o=this(o)),8&n)return o;if("object"==typeof o&&o){if(4&n&&o.__esModule)return o;if(16&n&&"function"==typeof o.then)return o}var i=Object.create(null);r.r(i);var c={};e=e||[null,t({}),t([]),t(t)];for(var f=2&n&&o;"object"==typeof f&&!~e.indexOf(f);f=t(f))Object.getOwnPropertyNames(f).forEach((e=>c[e]=()=>o[e]));return c.default=()=>o,r.d(i,c),i},r.d=(e,t)=>{for(var o in t)r.o(t,o)&&!r.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var i={};return(()=>{r.d(i,{component:()=>n});const e=coreApis.componentApis.define,t=coreApis.spinQuery,o=coreApis.utils.urls,n=(0,e.defineComponentMetadata)({name:"unfoldFeeds",displayName:"动态反折叠",tags:[componentsTags.feeds],description:{"zh-CN":"\n自动展开被折叠的动态.\n\n动态被折叠可能是因为:\n- 短时间内大量更新作品\n- 多人转发同一个作品\n- 被审核折叠\n"},urlInclude:o.feedsUrlsWithoutDetail,entry:async()=>{const{forEachFeedsCard:e}=await Promise.resolve().then(r.t.bind(r,799,23));e({added:async e=>{(await(0,t.select)((()=>dq(e.element,".fold-hoverable, .bili-dyn-item-fold"))))?.click()}})},commitHash:"2071c502cb2c27bb86cb0f79c62e6f1f029dd921",coreVersion:"2.9.6"})})(),i=i.component})()));