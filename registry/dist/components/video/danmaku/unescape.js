!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["video/danmaku/unescape"]=t():e["video/danmaku/unescape"]=t()}(globalThis,(()=>(()=>{var e,t,o={844:e=>{function t(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=844,e.exports=t},78:e=>{"use strict";e.exports="将弹幕中的 `\\n` 或 `/n` 替换为真实的换行, 注意这可能导致原先不重叠的弹幕发生重叠.\n"}},n={};function r(e){var t=n[e];if(void 0!==t)return t.exports;var a=n[e]={exports:{}};return o[e](a,a.exports,r),a.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,r.t=function(o,n){if(1&n&&(o=this(o)),8&n)return o;if("object"==typeof o&&o){if(4&n&&o.__esModule)return o;if(16&n&&"function"==typeof o.then)return o}var a=Object.create(null);r.r(a);var i={};e=e||[null,t({}),t([]),t(t)];for(var s=2&n&&o;"object"==typeof s&&!~e.indexOf(s);s=t(s))Object.getOwnPropertyNames(s).forEach((e=>i[e]=()=>o[e]));return i.default=()=>o,r.d(a,i),a},r.d=(e,t)=>{for(var o in t)r.o(t,o)&&!r.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var a={};return(()=>{"use strict";r.d(a,{component:()=>o});const e=coreApis.componentApis.define,t=coreApis.componentApis.video.videoDanmaku,o=(0,e.defineComponentMetadata)({name:"unescapeDanmaku",displayName:"弹幕转义",tags:[componentsTags.video],options:{backSlash:{defaultValue:!0,displayName:"对 \\n 转义"},forwardSlash:{defaultValue:!0,displayName:"对 /n 转义"}},entry:e=>{let{settings:o}=e;const n=o.options.backSlash&&o.options.forwardSlash?/\\n|\/n/g:o.options.backSlash?/\\n/g:/\/n/g,r=(e,t)=>{const o=[...e.children];o.length>0&&o.forEach((e=>r(e,t)));[...e.childNodes].filter((e=>e.nodeType===Node.TEXT_NODE)).forEach((e=>e.textContent=t))};(0,t.forEachVideoDanmaku)({added:e=>{if(n.test(e.text)){const t=e.text.replace(n,"\n");r(e.element,t)}}})},commitHash:"a74a5d29bd921d77b182a17bf54644e5f11e65ad",coreVersion:"2.9.6",description:(()=>{const e=r(844);return{...Object.fromEntries(e.keys().map((t=>[t.match(/index\.(.+)\.md$/)[1],e(t)]))),"zh-CN":()=>Promise.resolve().then(r.t.bind(r,78,17)).then((e=>e.default))}})()})})(),a=a.component})()));