!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["style/hide/user-pendent"]=t():e["style/hide/user-pendent"]=t()}(globalThis,(()=>(()=>{var e,t,n={783:(e,t,n)=>{var r=n(218)((function(e){return e[1]}));r.push([e.id,':host(bili-avatar) {\n  container-type: size;\n  container-name: avatar;\n}\n:host(bili-avatar) .layer:not(:first-child),\n:host(bili-avatar) .layer[\\:not-has\\(picture\\%20\\[src*\\%3D\\%22\\%2Fface\\%2F\\%22\\]\\)] {\n  display: none;\n}\n:host(bili-avatar) .layer:not(:first-child),\n:host(bili-avatar) .layer:not(:has(picture [src*="/face/"]), :has([style*="/face/"])) {\n  display: none;\n}\n:host(bili-avatar) .layer:is([\\:has\\(picture\\%20\\[src*\\%3D\\%22\\%2Fface\\%2F\\%22\\]\\)],[\\%20\\:has\\(\\[style*\\%3D\\%22\\%2Fface\\%2F\\%22\\]\\)]) {\n  min-width: 100cqw;\n  min-height: 100cqh;\n  max-width: 100cqw;\n  max-height: 100cqh;\n}\n:host(bili-avatar) .layer:is(:has(picture [src*="/face/"]), :has([style*="/face/"])) {\n  min-width: 100cqw;\n  min-height: 100cqh;\n  max-width: 100cqw;\n  max-height: 100cqh;\n}',""]),e.exports=r},414:(e,t,n)=>{var r=n(218)((function(e){return e[1]}));r.push([e.id,".b-avatar {\n  container-type: size;\n  container-name: avatar;\n}\n.b-avatar__layers:not(:first-child), .b-avatar__layer:not(:first-child) {\n  display: none !important;\n}\n.b-avatar__layer:first-child {\n  min-width: 100cqw;\n  min-height: 100cqh;\n}\n\n.up-avatar {\n  container-type: size;\n  container-name: avatar;\n}\n.up-avatar .bili-avatar {\n  min-width: 100cqw;\n  min-height: 100cqh;\n  transform: none !important;\n}\n\n.bili-avatar-icon, .bili-avatar-pendent-dom {\n  display: none !important;\n}",""]),e.exports=r},218:e=>{"use strict";
// eslint-disable-next-line func-names
e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var n=e(t);return t[2]?"@media ".concat(t[2]," {").concat(n,"}"):n})).join("")},
// eslint-disable-next-line func-names
t.i=function(e,n,r){"string"==typeof e&&(
// eslint-disable-next-line no-param-reassign
e=[[null,e,""]]);var a={};if(r)for(var o=0;o<this.length;o++){
// eslint-disable-next-line prefer-destructuring
var i=this[o][0];null!=i&&(a[i]=!0)}for(var s=0;s<e.length;s++){var c=[].concat(e[s]);r&&a[c[0]]||(n&&(c[2]?c[2]="".concat(n," and ").concat(c[2]):c[2]=n),t.push(c))}},t}},801:(e,t,n)=>{var r=n(783);r&&r.__esModule&&(r=r.default),e.exports="string"==typeof r?r:r.toString()},615:(e,t,n)=>{var r=n(414);r&&r.__esModule&&(r=r.default),e.exports="string"==typeof r?r:r.toString()},283:e=>{function t(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=283,e.exports=t},834:e=>{"use strict";e.exports="隐藏页面中用户的头像框 (包括角标), 目前支持动态和视频页面.\n"}},r={};function a(e){var t=r[e];if(void 0!==t)return t.exports;var o=r[e]={id:e,exports:{}};return n[e](o,o.exports,a),o.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,a.t=function(n,r){if(1&r&&(n=this(n)),8&r)return n;if("object"==typeof n&&n){if(4&r&&n.__esModule)return n;if(16&r&&"function"==typeof n.then)return n}var o=Object.create(null);a.r(o);var i={};e=e||[null,t({}),t([]),t(t)];for(var s=2&r&&n;"object"==typeof s&&!~e.indexOf(s);s=t(s))Object.getOwnPropertyNames(s).forEach((e=>i[e]=()=>n[e]));return i.default=()=>n,a.d(o,i),o},a.d=(e,t)=>{for(var n in t)a.o(t,n)&&!a.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),a.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var o={};return(()=>{"use strict";a.d(o,{component:()=>e});const e=(0,coreApis.componentApis.define.defineComponentMetadata)({name:"hideUserPendent",displayName:"隐藏头像框",entry:none,tags:[componentsTags.style],instantStyles:[{name:"hide-user-pendent",style:()=>Promise.resolve().then(a.t.bind(a,615,23))},{name:"hide-user-pendent",style:()=>Promise.resolve().then(a.t.bind(a,801,23)),shadowDom:!0}],commitHash:"6c23b78778de0a2a44cb839e0dcb3741c6719f44",coreVersion:"2.9.6",description:(()=>{const e=a(283);return{...Object.fromEntries(e.keys().map((t=>[t.match(/index\.(.+)\.md$/)[1],e(t)]))),"zh-CN":()=>Promise.resolve().then(a.t.bind(a,834,17)).then((e=>e.default))}})()})})(),o=o.component})()));