!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["style/hide/bangumi/sponsors"]=t():e["style/hide/bangumi/sponsors"]=t()}(globalThis,(()=>(()=>{var e,t,o={163:(e,t,o)=>{var n=o(955)((function(e){return e[1]}));n.push([e.id,"#sponsor_module, #paybar_module {\n  display: none !important;\n}",""]),e.exports=n},955:e=>{"use strict";
// eslint-disable-next-line func-names
e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var o=e(t);return t[2]?"@media ".concat(t[2]," {").concat(o,"}"):o})).join("")},
// eslint-disable-next-line func-names
t.i=function(e,o,n){"string"==typeof e&&(
// eslint-disable-next-line no-param-reassign
e=[[null,e,""]]);var r={};if(n)for(var i=0;i<this.length;i++){
// eslint-disable-next-line prefer-destructuring
var s=this[i][0];null!=s&&(r[s]=!0)}for(var a=0;a<e.length;a++){var p=[].concat(e[a]);n&&r[p[0]]||(o&&(p[2]?p[2]="".concat(o," and ").concat(p[2]):p[2]=o),t.push(p))}},t}},253:(e,t,o)=>{var n=o(163);n&&n.__esModule&&(n=n.default),e.exports="string"==typeof n?n:n.toString()}},n={};function r(e){var t=n[e];if(void 0!==t)return t.exports;var i=n[e]={id:e,exports:{}};return o[e](i,i.exports,r),i.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,r.t=function(o,n){if(1&n&&(o=this(o)),8&n)return o;if("object"==typeof o&&o){if(4&n&&o.__esModule)return o;if(16&n&&"function"==typeof o.then)return o}var i=Object.create(null);r.r(i);var s={};e=e||[null,t({}),t([]),t(t)];for(var a=2&n&&o;"object"==typeof a&&!~e.indexOf(a);a=t(a))Object.getOwnPropertyNames(a).forEach((e=>s[e]=()=>o[e]));return s.default=()=>o,r.d(i,s),i},r.d=(e,t)=>{for(var o in t)r.o(t,o)&&!r.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var i={};return(()=>{"use strict";r.d(i,{component:()=>n});const e=coreApis.componentApis.define,t=coreApis.componentApis.styledComponent,o=coreApis.utils.urls,n=(0,e.defineComponentMetadata)({displayName:"隐藏番剧承包",tags:[componentsTags.style],...(0,t.toggleStyle)("hideBangumiSponsors",(()=>Promise.resolve().then(r.t.bind(r,253,23)))),urlInclude:o.bangumiUrls,description:{"zh-CN":"隐藏番剧页面下方的承包榜, 以及右边的承包按钮."},commitHash:"549fcdb16eeb45122ceaa48017a43a573598fc1a",coreVersion:"2.10.0"})})(),i=i.component})()));