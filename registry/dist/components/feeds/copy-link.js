!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["feeds/copy-link"]=t():e["feeds/copy-link"]=t()}(self,(function(){return function(){"use strict";var e,t,o={23:function(e){e.exports=coreApis.componentApis.feeds.api}},n={};function r(e){var t=n[e];if(void 0!==t)return t.exports;var i=n[e]={exports:{}};return o[e](i,i.exports,r),i.exports}t=Object.getPrototypeOf?function(e){return Object.getPrototypeOf(e)}:function(e){return e.__proto__},r.t=function(o,n){if(1&n&&(o=this(o)),8&n)return o;if("object"==typeof o&&o){if(4&n&&o.__esModule)return o;if(16&n&&"function"==typeof o.then)return o}var i=Object.create(null);r.r(i);var c={};e=e||[null,t({}),t([]),t(t)];for(var f=2&n&&o;"object"==typeof f&&!~e.indexOf(f);f=t(f))Object.getOwnPropertyNames(f).forEach((function(e){c[e]=function(){return o[e]}}));return c.default=function(){return o},r.d(i,c),i},r.d=function(e,t){for(var o in t)r.o(t,o)&&!r.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var i={};return function(){r.d(i,{component:function(){return e}});const e={name:"copyFeedsLink",displayName:"复制动态链接",description:{"zh-CN":"开启后, 可在每条动态的菜单中选择复制链接."},entry:async()=>{const{forEachFeedsCard:e,addMenuItem:t}=await Promise.resolve().then(r.t.bind(r,23,23));e({added:e=>{t(e,{className:"copy-link",text:"复制链接",action:async()=>{await navigator.clipboard.writeText(`https://t.bilibili.com/${e.id}`)}})}})},urlInclude:coreApis.utils.urls.feedsUrls,tags:[componentsTags.feeds,componentsTags.utils],commitHash:"d9958bbc3f0e18b480453e95a5d1a194a12cfb9e"}}(),i=i.component}()}));