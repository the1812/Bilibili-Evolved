!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["style/hide/user-card"]=t():e["style/hide/user-card"]=t()}(globalThis,(()=>(()=>{var e,t,o={991:(e,t,o)=>{var r=o(218)((function(e){return e[1]}));r.push([e.id,".user-card,\n.user-card-m-exp,\n.bili-user-profile {\n  display: none !important;\n}",""]),e.exports=r},218:e=>{"use strict";
// eslint-disable-next-line func-names
e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var o=e(t);return t[2]?"@media ".concat(t[2]," {").concat(o,"}"):o})).join("")},
// eslint-disable-next-line func-names
t.i=function(e,o,r){"string"==typeof e&&(
// eslint-disable-next-line no-param-reassign
e=[[null,e,""]]);var n={};if(r)for(var i=0;i<this.length;i++){
// eslint-disable-next-line prefer-destructuring
var a=this[i][0];null!=a&&(n[a]=!0)}for(var s=0;s<e.length;s++){var c=[].concat(e[s]);r&&n[c[0]]||(o&&(c[2]?c[2]="".concat(o," and ").concat(c[2]):c[2]=o),t.push(c))}},t}},733:(e,t,o)=>{var r=o(991);r&&r.__esModule&&(r=r.default),e.exports="string"==typeof r?r:r.toString()}},r={};function n(e){var t=r[e];if(void 0!==t)return t.exports;var i=r[e]={id:e,exports:{}};return o[e](i,i.exports,n),i.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,n.t=function(o,r){if(1&r&&(o=this(o)),8&r)return o;if("object"==typeof o&&o){if(4&r&&o.__esModule)return o;if(16&r&&"function"==typeof o.then)return o}var i=Object.create(null);n.r(i);var a={};e=e||[null,t({}),t([]),t(t)];for(var s=2&r&&o;"object"==typeof s&&!~e.indexOf(s);s=t(s))Object.getOwnPropertyNames(s).forEach((e=>a[e]=()=>o[e]));return a.default=()=>o,n.d(i,a),i},n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var i={};return(()=>{"use strict";n.d(i,{component:()=>o});const e=coreApis.componentApis.define,t=coreApis.componentApis.styledComponent,o=(0,e.defineComponentMetadata)({displayName:"隐藏用户信息卡片",description:{"zh-CN":"隐藏鼠标指向用户名或用户头像时弹出的浮动用户信息卡片"},author:{name:"WakelessSloth56",link:"https://github.com/WakelessSloth56"},tags:[componentsTags.style],...(0,t.toggleStyle)("hideUserCard",(()=>Promise.resolve().then(n.t.bind(n,733,23)))),commitHash:"54b44b92db0adc6966429dd1588ce813b2fd3d9d",coreVersion:"2.9.5"})})(),i=i.component})()));