!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["feeds/filter/hide-charge-feeds"]=t():e["feeds/filter/hide-charge-feeds"]=t()}(globalThis,(()=>(()=>{var e,t,o={522:e=>{function t(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=522,e.exports=t},701:e=>{"use strict";e.exports="移除动态里的充电专属动态, 装有 `动态过滤器` 时生效.\n"},799:e=>{"use strict";e.exports=coreApis.componentApis.feeds.api},605:e=>{"use strict";e.exports=coreApis.utils}},r={};function n(e){var t=r[e];if(void 0!==t)return t.exports;var s=r[e]={exports:{}};return o[e](s,s.exports,n),s.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,n.t=function(o,r){if(1&r&&(o=this(o)),8&r)return o;if("object"==typeof o&&o){if(4&r&&o.__esModule)return o;if(16&r&&"function"==typeof o.then)return o}var s=Object.create(null);n.r(s);var i={};e=e||[null,t({}),t([]),t(t)];for(var d=2&r&&o;"object"==typeof d&&!~e.indexOf(d);d=t(d))Object.getOwnPropertyNames(d).forEach((e=>i[e]=()=>o[e]));return i.default=()=>o,n.d(s,i),s},n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var s={};return(()=>{"use strict";n.d(s,{plugin:()=>e});const e={name:"feedsFilter.pluginBlocks.chargeFeeds",displayName:"动态过滤器 - 移除充电专属动态",async setup(){const{getVue2Data:e}=await Promise.resolve().then(n.t.bind(n,605,23)),{forEachFeedsCard:t}=await Promise.resolve().then(n.t.bind(n,799,23));t({added:t=>{const o=e(t.element);3===lodash.get(o,"data.modules.module_dynamic.major.blocked.blocked_type",null)&&t.element.classList.add("plugin-block")}})},commitHash:"576fd06d4f8093c807a88d269cda545d614574fe",coreVersion:"2.9.5",description:(()=>{const e=n(522);return{...Object.fromEntries(e.keys().map((t=>[t.match(/index\.(.+)\.md$/)[1],e(t)]))),"zh-CN":()=>Promise.resolve().then(n.t.bind(n,701,17)).then((e=>e.default))}})()}})(),s=s.plugin})()));