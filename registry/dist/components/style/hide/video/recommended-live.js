!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["style/hide/video/recommended-live"]=t():e["style/hide/video/recommended-live"]=t()}(globalThis,(()=>(()=>{var e,t,o={881:(e,t,o)=>{var n=o(955)((function(e){return e[1]}));n.push([e.id,"#live_recommand_report,\n#live_recommend_report,\n.video-container-v1 .pop-live-small-mode {\n  display: none !important;\n}",""]),e.exports=n},955:e=>{"use strict";
// eslint-disable-next-line func-names
e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var o=e(t);return t[2]?"@media ".concat(t[2]," {").concat(o,"}"):o})).join("")},
// eslint-disable-next-line func-names
t.i=function(e,o,n){"string"==typeof e&&(
// eslint-disable-next-line no-param-reassign
e=[[null,e,""]]);var r={};if(n)for(var i=0;i<this.length;i++){
// eslint-disable-next-line prefer-destructuring
var c=this[i][0];null!=c&&(r[c]=!0)}for(var d=0;d<e.length;d++){var a=[].concat(e[d]);n&&r[a[0]]||(o&&(a[2]?a[2]="".concat(o," and ").concat(a[2]):a[2]=o),t.push(a))}},t}},39:(e,t,o)=>{var n=o(881);n&&n.__esModule&&(n=n.default),e.exports="string"==typeof n?n:n.toString()}},n={};function r(e){var t=n[e];if(void 0!==t)return t.exports;var i=n[e]={id:e,exports:{}};return o[e](i,i.exports,r),i.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,r.t=function(o,n){if(1&n&&(o=this(o)),8&n)return o;if("object"==typeof o&&o){if(4&n&&o.__esModule)return o;if(16&n&&"function"==typeof o.then)return o}var i=Object.create(null);r.r(i);var c={};e=e||[null,t({}),t([]),t(t)];for(var d=2&n&&o;"object"==typeof d&&!~e.indexOf(d);d=t(d))Object.getOwnPropertyNames(d).forEach((e=>c[e]=()=>o[e]));return c.default=()=>o,r.d(i,c),i},r.d=(e,t)=>{for(var o in t)r.o(t,o)&&!r.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var i={};return(()=>{"use strict";r.d(i,{component:()=>o});const e=coreApis.componentApis.define,t=coreApis.utils.urls,o=(0,e.defineComponentMetadata)({name:"hideRecommendedLive",entry:none,instantStyles:[{name:"hideRecommendedLive",style:()=>Promise.resolve().then(r.t.bind(r,39,23))}],displayName:"隐藏直播推荐",tags:[componentsTags.style,componentsTags.video],description:{"zh-CN":"隐藏视频页面右侧下方的直播推荐."},urlInclude:t.videoUrls,commitHash:"342c6a590fc64108640cdf46b42d5bded5c25e04",coreVersion:"2.10.0"})})(),i=i.component})()));