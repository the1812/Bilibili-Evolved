!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["style/hide/home-carousel"]=t():e["style/hide/home-carousel"]=t()}(globalThis,(()=>(()=>{var e,t,o={383:(e,t,o)=>{var r=o(955)((function(e){return e[1]}));r.push([e.id,".recommended-swipe.grid-anchor {\n  display: none !important;\n}",""]),e.exports=r},955:e=>{"use strict";
// eslint-disable-next-line func-names
e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var o=e(t);return t[2]?"@media ".concat(t[2]," {").concat(o,"}"):o})).join("")},
// eslint-disable-next-line func-names
t.i=function(e,o,r){"string"==typeof e&&(
// eslint-disable-next-line no-param-reassign
e=[[null,e,""]]);var n={};if(r)for(var i=0;i<this.length;i++){
// eslint-disable-next-line prefer-destructuring
var a=this[i][0];null!=a&&(n[a]=!0)}for(var s=0;s<e.length;s++){var c=[].concat(e[s]);r&&n[c[0]]||(o&&(c[2]?c[2]="".concat(o," and ").concat(c[2]):c[2]=o),t.push(c))}},t}},261:(e,t,o)=>{var r=o(383);r&&r.__esModule&&(r=r.default),e.exports="string"==typeof r?r:r.toString()},353:e=>{function t(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=353,e.exports=t},950:e=>{"use strict";e.exports="隐藏首页的轮播图区域.\n"}},r={};function n(e){var t=r[e];if(void 0!==t)return t.exports;var i=r[e]={id:e,exports:{}};return o[e](i,i.exports,n),i.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,n.t=function(o,r){if(1&r&&(o=this(o)),8&r)return o;if("object"==typeof o&&o){if(4&r&&o.__esModule)return o;if(16&r&&"function"==typeof o.then)return o}var i=Object.create(null);n.r(i);var a={};e=e||[null,t({}),t([]),t(t)];for(var s=2&r&&o;"object"==typeof s&&!~e.indexOf(s);s=t(s))Object.getOwnPropertyNames(s).forEach((e=>a[e]=()=>o[e]));return a.default=()=>o,n.d(i,a),i},n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var i={};return(()=>{"use strict";n.d(i,{component:()=>e});const e=(0,coreApis.componentApis.define.defineComponentMetadata)({name:"hideHomeCarousel",displayName:"隐藏首页轮播图",entry:none,tags:[componentsTags.style],urlInclude:[/^https:\/\/www\.bilibili\.com\/$/,/^https:\/\/www\.bilibili\.com\/index\.html$/],instantStyles:[{name:"hide-home-carousel",style:()=>Promise.resolve().then(n.t.bind(n,261,23))}],commitHash:"8f27049d249a634bdb0fa854e84fecf2e3c26aa3",coreVersion:"2.10.0",description:(()=>{const e=n(353);return{...Object.fromEntries(e.keys().map((t=>[t.match(/index\.(.+)\.md$/)[1],e(t)]))),"zh-CN":()=>Promise.resolve().then(n.t.bind(n,950,17)).then((e=>e.default))}})()})})(),i=i.component})()));