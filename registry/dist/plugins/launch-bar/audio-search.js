!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["launch-bar/audio-search"]=t():e["launch-bar/audio-search"]=t()}(globalThis,(()=>(()=>{var e,t,o={408:e=>{function t(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=408,e.exports=t},500:e=>{"use strict";e.exports="在输入音频的 au 号或播放列表的 am 号时, 提供对应的跳转选项.\n"}},r={};function n(e){var t=r[e];if(void 0!==t)return t.exports;var i=r[e]={exports:{}};return o[e](i,i.exports,n),i.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,n.t=function(o,r){if(1&r&&(o=this(o)),8&r)return o;if("object"==typeof o&&o){if(4&r&&o.__esModule)return o;if(16&r&&"function"==typeof o.then)return o}var i=Object.create(null);n.r(i);var a={};e=e||[null,t({}),t([]),t(t)];for(var c=2&r&&o;"object"==typeof c&&!~e.indexOf(c);c=t(c))Object.getOwnPropertyNames(c).forEach((e=>a[e]=()=>o[e]));return a.default=()=>o,n.d(i,a),i},n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var i={};return(()=>{"use strict";n.d(i,{plugin:()=>o});const e=coreApis.ajax,t=e=>{const{name:t,displayName:o,description:r,indexer:n,link:i}=e;return{name:t||n,displayName:o,icon:"mdi-open-in-new",indexer:n,description:r,action:()=>{window.open(i,"_blank")},order:0}},o={name:"launchBar.actions.audioSearch",displayName:"搜索栏 - 音频跳转",async setup(o){let{addData:r}=o;r("launchBar.actions",(o=>{o.push({name:"audioSearchProvider",getActions:async o=>{const{match:r,type:n,id:i,indexer:a}=((e,t)=>{const o=e.match(t);if(!o)return{};const r=o[1],n=o[2];return{match:o,type:r,id:n,indexer:`${r}${n}`}})(o,/^(a[um])(\d+)$/);if(!r)return[];const c=await(0,e.getJson)("am"===n?`https://www.bilibili.com/audio/music-service-c/web/menu/info?sid=${i}`:`https://www.bilibili.com/audio/music-service-c/web/song/info?sid=${i}`),{title:s}=lodash.get(c,"data",{});return[t({name:s,description:"am"===n?"播放列表跳转":"音频跳转",link:`https://www.bilibili.com/audio/${a}`,indexer:a})]}})}))},commitHash:"47832830d0525f24b377b77ad4e28b9e306c6c3a",coreVersion:"2.8.7",description:(()=>{const e=n(408);return{...Object.fromEntries(e.keys().map((t=>[t.match(/index\.(.+)\.md$/)[1],e(t)]))),"zh-CN":()=>Promise.resolve().then(n.t.bind(n,500,17)).then((e=>e.default))}})()}})(),i=i.plugin})()));