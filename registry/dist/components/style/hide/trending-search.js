!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["style/hide/trending-search"]=t():e["style/hide/trending-search"]=t()}(globalThis,(()=>(()=>{var e,t,n={935:(e,t,n)=>{var r=n(955)((function(e){return e[1]}));r.push([e.id,'@charset "UTF-8";\n.search-panel > .trending {\n  display: none !important;\n}\n.search-panel:not(:has(.history)) {\n  padding: 0 !important;\n  border: none !important;\n}\n\n#nav-searchform.is-focus {\n  /* 搜索框 focusing 且有关键字列表 or 历史记录列表时不显示低边框*/\n}\n#nav-searchform.is-focus:not(:has(+ .search-panel > .suggestions), :has(+ .search-panel > .history)) {\n  border-radius: 8px !important;\n}',""]),e.exports=r},955:e=>{"use strict";
// eslint-disable-next-line func-names
e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var n=e(t);return t[2]?"@media ".concat(t[2]," {").concat(n,"}"):n})).join("")},
// eslint-disable-next-line func-names
t.i=function(e,n,r){"string"==typeof e&&(
// eslint-disable-next-line no-param-reassign
e=[[null,e,""]]);var o={};if(r)for(var a=0;a<this.length;a++){
// eslint-disable-next-line prefer-destructuring
var i=this[a][0];null!=i&&(o[i]=!0)}for(var s=0;s<e.length;s++){var c=[].concat(e[s]);r&&o[c[0]]||(n&&(c[2]?c[2]="".concat(n," and ").concat(c[2]):c[2]=n),t.push(c))}},t}},145:(e,t,n)=>{var r=n(935);r&&r.__esModule&&(r=r.default),e.exports="string"==typeof r?r:r.toString()},129:e=>{function t(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=129,e.exports=t},278:e=>{"use strict";e.exports="隐藏搜索栏和搜索页面中的 `bilibili 热搜`. 请注意这只是视觉上的隐藏, 如果不输入任何关键词就点 Enter 或搜索按钮, 仍然会跳转至推荐的热搜词."}},r={};function o(e){var t=r[e];if(void 0!==t)return t.exports;var a=r[e]={id:e,exports:{}};return n[e](a,a.exports,o),a.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,o.t=function(n,r){if(1&r&&(n=this(n)),8&r)return n;if("object"==typeof n&&n){if(4&r&&n.__esModule)return n;if(16&r&&"function"==typeof n.then)return n}var a=Object.create(null);o.r(a);var i={};e=e||[null,t({}),t([]),t(t)];for(var s=2&r&&n;"object"==typeof s&&!~e.indexOf(s);s=t(s))Object.getOwnPropertyNames(s).forEach((e=>i[e]=()=>n[e]));return i.default=()=>n,o.d(a,i),a},o.d=(e,t)=>{for(var n in t)o.o(t,n)&&!o.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},o.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),o.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var a={};return(()=>{"use strict";o.d(a,{component:()=>s});const e=coreApis.componentApis.define,t=coreApis.observer,n=coreApis.spinQuery,r="搜索",i=e=>{e.placeholder=r,e.title=r},s=(0,e.defineComponentMetadata)({name:"hideTrendingSearch",displayName:"隐藏热搜",tags:[componentsTags.style],instantStyles:[{name:"hideTrendingSearch",style:()=>Promise.resolve().then(o.t.bind(o,145,23))}],entry:async()=>{const e=await(0,n.select)("input.nav-search-input",{queryInterval:500});e?i(e):(0,t.allMutations)((e=>{e.forEach((e=>{e.target instanceof HTMLInputElement&&e.target.classList.contains("nav-search-input")&&e.target.placeholder!==r&&i(e.target)}))}))},commitHash:"48fb8d874b0943e1ba16c545506c2fe271cc76c9",coreVersion:"2.10.1",description:(()=>{const e=o(129);return{...Object.fromEntries(e.keys().map((t=>[t.match(/index\.(.+)\.md$/)[1],e(t)]))),"zh-CN":()=>Promise.resolve().then(o.t.bind(o,278,17)).then((e=>e.default))}})()})})(),a=a.component})()));