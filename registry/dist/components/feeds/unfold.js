!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["feeds/unfold"]=t():e["feeds/unfold"]=t()}(globalThis,(()=>(()=>{"use strict";var e,t,o={649:e=>{e.exports=coreApis.componentApis.feeds.api}},n={};function r(e){var t=n[e];if(void 0!==t)return t.exports;var i=n[e]={exports:{}};return o[e](i,i.exports,r),i.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,r.t=function(o,n){if(1&n&&(o=this(o)),8&n)return o;if("object"==typeof o&&o){if(4&n&&o.__esModule)return o;if(16&n&&"function"==typeof o.then)return o}var i=Object.create(null);r.r(i);var d={};e=e||[null,t({}),t([]),t(t)];for(var s=2&n&&o;"object"==typeof s&&!~e.indexOf(s);s=t(s))Object.getOwnPropertyNames(s).forEach((e=>d[e]=()=>o[e]));return d.default=()=>o,r.d(i,d),i},r.d=(e,t)=>{for(var o in t)r.o(t,o)&&!r.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var i={};r.d(i,{component:()=>f});const d=coreApis.componentApis.define,s=coreApis.spinQuery,c=coreApis.utils.urls,f=(0,d.defineComponentMetadata)({name:"unfoldFeeds",displayName:"动态反折叠",tags:[componentsTags.feeds],description:{"zh-CN":"\n自动展开被折叠的动态.\n\n动态被折叠可能是因为:\n- 短时间内大量更新作品\n- 多人转发同一个作品\n- 被审核折叠\n"},urlInclude:c.feedsUrlsWithoutDetail,entry:async()=>{const{forEachFeedsCard:e}=await Promise.resolve().then(r.t.bind(r,649,23));e({added:async e=>{const t=await(0,s.select)((()=>dq(e.element,".fold-hoverable, .bili-dyn-item-fold")));t?.click()}})},commitHash:"342c6a590fc64108640cdf46b42d5bded5c25e04",coreVersion:"2.10.0"});return i=i.component})()));