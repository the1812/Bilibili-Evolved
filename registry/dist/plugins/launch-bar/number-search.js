!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["launch-bar/number-search"]=t():e["launch-bar/number-search"]=t()}(globalThis,(()=>(()=>{var e,t,i={572:e=>{function t(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=572,e.exports=t},247:e=>{"use strict";e.exports="在输入纯数字时, 提供以下选项:\n- 跳转至相应的视频 (视为 av 号)\n- 跳转至相应的专栏 (视为 cv 号)\n"}},n={};function r(e){var t=n[e];if(void 0!==t)return t.exports;var o=n[e]={exports:{}};return i[e](o,o.exports,r),o.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,r.t=function(i,n){if(1&n&&(i=this(i)),8&n)return i;if("object"==typeof i&&i){if(4&n&&i.__esModule)return i;if(16&n&&"function"==typeof i.then)return i}var o=Object.create(null);r.r(o);var a={};e=e||[null,t({}),t([]),t(t)];for(var c=2&n&&i;"object"==typeof c&&!~e.indexOf(c);c=t(c))Object.getOwnPropertyNames(c).forEach((e=>a[e]=()=>i[e]));return a.default=()=>i,r.d(o,a),o},r.d=(e,t)=>{for(var i in t)r.o(t,i)&&!r.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var o={};return(()=>{"use strict";r.d(o,{plugin:()=>i});const e=coreApis.ajax,t=e=>{const{name:t,displayName:i,description:n,indexer:r,link:o}=e;return{name:t||r,displayName:i,icon:"mdi-open-in-new",indexer:r,description:n,action:()=>{window.open(o,"_blank")},order:0}},i={name:"launchBar.actions.numberSearch",displayName:"搜索栏 - 数字联想",async setup(i){let{addData:n}=i;n("launchBar.actions",(i=>{i.push({name:"numberSearchProvider",getActions:async i=>{const{match:n,id:r,indexer:o}=((e,t)=>{const i=e.match(t);if(!i)return{};const n=i[1],r=i[2];return{match:i,type:n,id:r,indexer:`${n}${r}`}})(i,/^()(\d+)$/);if(!n)return[];const[a,c,s]=await Promise.all([await(0,e.getJsonWithCredentials)(`https://api.bilibili.com/x/web-interface/view?aid=${r}`),await(0,e.getJson)(`https://api.bilibili.com/x/article/viewinfo?id=${r}`),await(0,e.getJson)(`https://api.bilibili.com/x/web-interface/card?mid=${r}`)]),{title:d}=lodash.get(a,"data",{}),{title:l}=lodash.get(c,"data",{}),{name:p}=lodash.get(s,"data.card",{}),m=e=>e?`numberSearchAction.${e}`:e;return[t({name:m(d),displayName:d,description:"视频跳转",link:`https://www.bilibili.com/av${r}`,indexer:o}),t({name:m(r),displayName:r,description:"直播间跳转",link:`https://live.bilibili.com/${r}`,indexer:o}),t({name:m(l),displayName:l,description:"专栏跳转",link:`https://www.bilibili.com/read/cv${r}`,indexer:o}),t({name:m(p),displayName:p,description:"用户跳转",link:`https://space.bilibili.com/${r}`,indexer:o})]}})}))},commitHash:"48fb8d874b0943e1ba16c545506c2fe271cc76c9",coreVersion:"2.10.1",description:(()=>{const e=r(572);return{...Object.fromEntries(e.keys().map((t=>[t.match(/index\.(.+)\.md$/)[1],e(t)]))),"zh-CN":()=>Promise.resolve().then(r.t.bind(r,247,17)).then((e=>e.default))}})()}})(),o=o.plugin})()));