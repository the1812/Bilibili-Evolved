!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["style/hide/trending-search"]=t():e["style/hide/trending-search"]=t()}(globalThis,(()=>(()=>{var e,t,n={225:(e,t,n)=>{var r=n(218)((function(e){return e[1]}));r.push([e.id,".search-panel > .trending {\n  display: none !important;\n}",""]),e.exports=r},218:e=>{"use strict";
// eslint-disable-next-line func-names
e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var n=e(t);return t[2]?"@media ".concat(t[2]," {").concat(n,"}"):n})).join("")},
// eslint-disable-next-line func-names
t.i=function(e,n,r){"string"==typeof e&&(
// eslint-disable-next-line no-param-reassign
e=[[null,e,""]]);var o={};if(r)for(var i=0;i<this.length;i++){
// eslint-disable-next-line prefer-destructuring
var a=this[i][0];null!=a&&(o[a]=!0)}for(var s=0;s<e.length;s++){var c=[].concat(e[s]);r&&o[c[0]]||(n&&(c[2]?c[2]="".concat(n," and ").concat(c[2]):c[2]=n),t.push(c))}},t}},799:(e,t,n)=>{var r=n(225);r&&r.__esModule&&(r=r.default),e.exports="string"==typeof r?r:r.toString()},909:e=>{function t(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=909,e.exports=t},643:e=>{"use strict";e.exports="隐藏搜索栏和搜索页面中的 `bilibili 热搜`. 请注意这只是视觉上的隐藏, 如果不输入任何关键词就点 Enter 或搜索按钮, 仍然会跳转至推荐的热搜词."}},r={};function o(e){var t=r[e];if(void 0!==t)return t.exports;var i=r[e]={id:e,exports:{}};return n[e](i,i.exports,o),i.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,o.t=function(n,r){if(1&r&&(n=this(n)),8&r)return n;if("object"==typeof n&&n){if(4&r&&n.__esModule)return n;if(16&r&&"function"==typeof n.then)return n}var i=Object.create(null);o.r(i);var a={};e=e||[null,t({}),t([]),t(t)];for(var s=2&r&&n;"object"==typeof s&&!~e.indexOf(s);s=t(s))Object.getOwnPropertyNames(s).forEach((e=>a[e]=()=>n[e]));return a.default=()=>n,o.d(i,a),i},o.d=(e,t)=>{for(var n in t)o.o(t,n)&&!o.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},o.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),o.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var i={};return(()=>{"use strict";o.d(i,{component:()=>n});const e=coreApis.componentApis.define,t=coreApis.observer,n=(0,e.defineComponentMetadata)({name:"hideTrendingSearch",displayName:"隐藏热搜",tags:[componentsTags.style],instantStyles:[{name:"hideTrendingSearch",style:()=>Promise.resolve().then(o.t.bind(o,799,23))}],entry:async()=>{(0,t.allMutations)((e=>{e.forEach((e=>{e.target instanceof HTMLInputElement&&e.target.classList.contains("nav-search-input")&&"搜索"!==e.target.placeholder&&(e.target.placeholder="搜索")}))}))},commitHash:"164c3a1e62e636abebea56c9ee6850220003e9cb",coreVersion:"2.8.3",description:(()=>{const e=o(909);return{...Object.fromEntries(e.keys().map((t=>[t.match(/index\.(.+)\.md$/)[1],e(t)]))),"zh-CN":()=>Promise.resolve().then(o.t.bind(o,643,17)).then((e=>e.default))}})()})})(),i=i.component})()));