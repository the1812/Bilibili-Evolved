!function(e,o){"object"==typeof exports&&"object"==typeof module?module.exports=o():"function"==typeof define&&define.amd?define([],o):"object"==typeof exports?exports["video/player/disable-scroll-volume"]=o():e["video/player/disable-scroll-volume"]=o()}(globalThis,(()=>(()=>{var e,o,t={132:e=>{function o(e){var o=new Error("Cannot find module '"+e+"'");throw o.code="MODULE_NOT_FOUND",o}o.keys=()=>[],o.resolve=o,o.id=132,e.exports=o},466:e=>{"use strict";e.exports="在网页全屏 / 全屏模式下, 禁止鼠标滚轮控制播放器的音量."}},r={};function n(e){var o=r[e];if(void 0!==o)return o.exports;var i=r[e]={exports:{}};return t[e](i,i.exports,n),i.exports}o=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,n.t=function(t,r){if(1&r&&(t=this(t)),8&r)return t;if("object"==typeof t&&t){if(4&r&&t.__esModule)return t;if(16&r&&"function"==typeof t.then)return t}var i=Object.create(null);n.r(i);var l={};e=e||[null,o({}),o([]),o(o)];for(var s=2&r&&t;"object"==typeof s&&!~e.indexOf(s);s=o(s))Object.getOwnPropertyNames(s).forEach((e=>l[e]=()=>t[e]));return l.default=()=>t,n.d(i,l),i},n.d=(e,o)=>{for(var t in o)n.o(o,t)&&!n.o(e,t)&&Object.defineProperty(e,t,{enumerable:!0,get:o[t]})},n.o=(e,o)=>Object.prototype.hasOwnProperty.call(e,o),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var i={};return(()=>{"use strict";n.d(i,{component:()=>l});const e=coreApis.componentApis.define,o=coreApis.utils;let t;const r=()=>{t?.(),t=(0,o.preventEvent)(unsafeWindow,"mousewheel",(()=>["player-mode-webfullscreen","player-fullscreen-fix","player-full-win"].some((e=>document.body.classList.contains(e)))))},l=(0,e.defineComponentMetadata)({name:"disableScrollVolume",displayName:"禁止滚轮调音量",tags:[componentsTags.video],entry:r,reload:r,unload:()=>{t?.()},commitHash:"5b351cb7c988aafeffadc1a2b89dce2823f0a018",coreVersion:"2.6.1",description:(()=>{const e=n(132);return{...Object.fromEntries(e.keys().map((o=>[o.match(/index\.(.+)\.md$/)[1],e(o)]))),"zh-CN":()=>Promise.resolve().then(n.t.bind(n,466,17)).then((e=>e.default))}})()})})(),i=i.component})()));