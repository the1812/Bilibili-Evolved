!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["live/home-mute"]=t():e["live/home-mute"]=t()}(globalThis,(()=>(()=>{"use strict";var e,t,o={905:e=>{e.exports=coreApis.settings},728:e=>{e.exports=coreApis.spinQuery},847:e=>{e.exports=coreApis.utils}},r={};function n(e){var t=r[e];if(void 0!==t)return t.exports;var i=r[e]={exports:{}};return o[e](i,i.exports,n),i.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,n.t=function(o,r){if(1&r&&(o=this(o)),8&r)return o;if("object"==typeof o&&o){if(4&r&&o.__esModule)return o;if(16&r&&"function"==typeof o.then)return o}var i=Object.create(null);n.r(i);var a={};e=e||[null,t({}),t([]),t(t)];for(var s=2&r&&o;"object"==typeof s&&!~e.indexOf(s);s=t(s))Object.getOwnPropertyNames(s).forEach((e=>a[e]=()=>o[e]));return a.default=()=>o,n.d(i,a),i},n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var i={};n.d(i,{component:()=>c});const a=coreApis.componentApis.define;var s=n(905);const p=coreApis.style,l=/^https:\/\/live\.bilibili\.com\/(index\.html)?$/,c=(0,a.defineComponentMetadata)({name:"liveHomeMute",displayName:"直播首页静音",tags:[componentsTags.live],description:{"zh-CN":"禁止直播首页的推荐直播间自动开始播放."},entry:async e=>{let{metadata:t}=e;const o="hide-home-live";(0,s.addComponentListener)(`${t.name}.hide`,(e=>{e?(0,p.addStyle)(".player-area-ctnr,#player-header { display: none !important }",o):(0,p.removeStyle)(o)}),!0)},options:{hide:{displayName:"隐藏首页直播板块",defaultValue:!1}},urlInclude:[l],plugin:{displayName:"直播首页静音 - 提前执行",description:{"zh-CN":"提前执行代码以尽快静音."},async setup(){const{isComponentEnabled:e}=await Promise.resolve().then(n.t.bind(n,905,23));if(!e("liveHomeMute"))return;const{matchUrlPattern:t}=await Promise.resolve().then(n.t.bind(n,847,23));if(!t(l))return;const{select:o}=await Promise.resolve().then(n.t.bind(n,728,23));o("video").then((e=>{e.muted=!0}))}},commitHash:"37231b0555ca29fe46a344ca91da615c066a5e47",coreVersion:"2.10.1"});return i=i.component})()));