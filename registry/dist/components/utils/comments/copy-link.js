!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["utils/comments/copy-link"]=t():e["utils/comments/copy-link"]=t()}(globalThis,(()=>(()=>{"use strict";var e,t,o={913:e=>{e.exports=coreApis.componentApis.utils.commentApis}},r={};function n(e){var t=r[e];if(void 0!==t)return t.exports;var i=r[e]={exports:{}};return o[e](i,i.exports,n),i.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,n.t=function(o,r){if(1&r&&(o=this(o)),8&r)return o;if("object"==typeof o&&o){if(4&r&&o.__esModule)return o;if(16&r&&"function"==typeof o.then)return o}var i=Object.create(null);n.r(i);var c={};e=e||[null,t({}),t([]),t(t)];for(var a=2&r&&o;"object"==typeof a&&!~e.indexOf(a);a=t(a))Object.getOwnPropertyNames(a).forEach((e=>c[e]=()=>o[e]));return c.default=()=>o,n.d(i,c),i},n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var i={};n.d(i,{component:()=>p});const c=coreApis.componentApis.define,a=coreApis.utils,s=coreApis.utils.urls,p=(0,c.defineComponentMetadata)({name:"copyCommentsLink",displayName:"复制评论链接",description:{"zh-CN":"开启后, 可在每条评论的菜单中选择复制链接."},entry:async()=>{const{forEachCommentItem:e,addMenuItem:t}=await Promise.resolve().then(n.t.bind(n,913,23));e({added:e=>{const o=e=>{e.forEach((e=>{t(e,{className:"copy-link",text:"复制链接",action:async()=>{const t=(e=>{if(document.URL.match(/\/\/t\.bilibili\.com\/(\d+)/))return"";if(s.feedsUrls.every((e=>!(0,a.matchUrlPattern)(e))))return"";let t=e;for(;null!==t&&t!==document.body;){if(t.hasAttribute("data-did"))return`https://t.bilibili.com/${t.getAttribute("data-did")}`;t=t.parentElement}return""})(e.element)||document.URL.replace(location.hash,"");await navigator.clipboard.writeText(`${t}#reply${e.id}`)}})}))};o([e,...e.replies]),e.addEventListener("repliesUpdate",(e=>o(e.detail)))}})},tags:[componentsTags.utils],commitHash:"cc0f1cc2b4f41de30c71f526545bedb8f6371291",coreVersion:"2.10.0"});return i=i.component})()));