!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["video/player/invert-scroll-volume"]=t():e["video/player/invert-scroll-volume"]=t()}(globalThis,(()=>(()=>{var e,t,o={993:e=>{function t(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=993,e.exports=t},895:e=>{function t(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=895,e.exports=t},746:e=>{"use strict";e.exports="在网页全屏 / 全屏模式下, 禁止鼠标滚轮控制播放器的音量.  请注意不能和 `反转滚轮调音量` 一同使用.\n"},540:e=>{"use strict";e.exports="反转在网页全屏 / 全屏模式下使用滚轮调节音量的方向, 使其更符合使用触控板时的操作方向. 请注意不能和 `禁止滚轮调音量` 一同使用.\n\n- 手指向上推时, 增加音量\n- 手指向下推时, 减少音量\n- 可以自定义 `灵敏度`, 同样的滚动幅度下, 灵敏度越高变化的音量越多"}},n={};function r(e){var t=n[e];if(void 0!==t)return t.exports;var l=n[e]={exports:{}};return o[e](l,l.exports,r),l.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,r.t=function(o,n){if(1&n&&(o=this(o)),8&n)return o;if("object"==typeof o&&o){if(4&n&&o.__esModule)return o;if(16&n&&"function"==typeof o.then)return o}var l=Object.create(null);r.r(l);var s={};e=e||[null,t({}),t([]),t(t)];for(var a=2&n&&o;"object"==typeof a&&!~e.indexOf(a);a=t(a))Object.getOwnPropertyNames(a).forEach((e=>s[e]=()=>o[e]));return s.default=()=>o,r.d(l,s),l},r.d=(e,t)=>{for(var o in t)r.o(t,o)&&!r.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var l={};return(()=>{"use strict";r.d(l,{component:()=>u});const e=coreApis.componentApis.define,t=coreApis.utils,o=coreApis.utils.urls;let n;const s=()=>{const e=()=>["player-mode-full","player-mode-web","player-fullscreen-fix","player-full-win"].some((e=>document.body.classList.contains(e))),o=(0,t.preventEvent)(unsafeWindow,"DOMMouseScroll",e),n=(0,t.preventEvent)(unsafeWindow,"wheel",e);return()=>{o(),n()}},a=((0,e.defineComponentMetadata)({name:"disableScrollVolume",displayName:"禁止滚轮调音量",tags:[componentsTags.video],entry:()=>{n?.(),n=s()},reload:()=>{n?.(),n=s()},unload:()=>{n?.()},urlInclude:o.allVideoUrls,commitHash:"549fcdb16eeb45122ceaa48017a43a573598fc1a",coreVersion:"2.10.0",description:(()=>{const e=r(993);return{...Object.fromEntries(e.keys().map((t=>[t.match(/index\.(.+)\.md$/)[1],e(t)]))),"zh-CN":()=>Promise.resolve().then(r.t.bind(r,746,17)).then((e=>e.default))}})()}),coreApis.componentApis.video.playerAgent),i=coreApis.settings;let c;const d=(0,e.defineOptionsMetadata)({deltaFactor:{defaultValue:15,slider:{min:1,max:30,step:1},displayName:"灵敏度"}}),p=()=>{c?.();const e=(0,i.getComponentSettings)("invertScrollVolume"),t=t=>{["player-mode-webfullscreen","player-fullscreen-fix","player-full-win"].some((e=>document.body.classList.contains(e)))&&a.playerAgent.changeVolume(t.deltaY/((30-e.options.deltaFactor+1)/2))};unsafeWindow.addEventListener("wheel",t);const o=s();return()=>{unsafeWindow.removeEventListener("wheel",t),o()}},u=(0,e.defineComponentMetadata)({name:"invertScrollVolume",displayName:"反转滚轮调音量",tags:[componentsTags.video],options:d,entry:()=>{c?.(),c=p()},reload:()=>{c?.(),c=p()},unload:()=>c?.(),urlInclude:o.allVideoUrls,commitHash:"549fcdb16eeb45122ceaa48017a43a573598fc1a",coreVersion:"2.10.0",description:(()=>{const e=r(895);return{...Object.fromEntries(e.keys().map((t=>[t.match(/index\.(.+)\.md$/)[1],e(t)]))),"zh-CN":()=>Promise.resolve().then(r.t.bind(r,540,17)).then((e=>e.default))}})()})})(),l=l.component})()));