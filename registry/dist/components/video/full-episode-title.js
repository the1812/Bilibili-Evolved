!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["video/full-episode-title"]=t():e["video/full-episode-title"]=t()}(globalThis,(()=>(()=>{var e,t,i={288:(e,t,i)=>{var o=i(218)((function(e){return e[1]}));o.push([e.id,'body.full-episode-title:not(.disable-full-episode-list) .base-video-sections-v1 .video-episode-card {\n  height: auto !important;\n}\nbody.full-episode-title:not(.disable-full-episode-list) .base-video-sections-v1 .video-episode-card .cur-play-icon {\n  margin-right: 6px;\n}\nbody.full-episode-title:not(.disable-full-episode-list) .base-video-sections-v1 .video-episode-card__info {\n  height: auto !important;\n}\nbody.full-episode-title:not(.disable-full-episode-list) .base-video-sections-v1 .video-episode-card__info-title {\n  padding: 4px 0 !important;\n  width: auto !important;\n  max-height: unset !important;\n  height: auto !important;\n  white-space: normal !important;\n  line-height: 1.5 !important;\n}\nbody.full-episode-title:not(.disable-full-episode-list) .base-video-sections-v1 .video-section-list[style]:not([style*="height: 0px"]) {\n  height: auto !important;\n}\nbody.full-episode-title:not(.disable-full-episode-list) .multi-page-v1 .cur-list li,\nbody.full-episode-title:not(.disable-full-episode-list) .multi-page .cur-list li {\n  height: auto !important;\n}\nbody.full-episode-title:not(.disable-full-episode-list) .multi-page-v1 .cur-list li a,\nbody.full-episode-title:not(.disable-full-episode-list) .multi-page .cur-list li a {\n  overflow: visible !important;\n  white-space: normal !important;\n}\nbody.full-episode-title:not(.disable-full-episode-list) .multi-page-v1 .cur-list li .part,\nbody.full-episode-title:not(.disable-full-episode-list) .multi-page .cur-list li .part {\n  padding: 4px 0 !important;\n  line-height: 1.75 !important;\n}\nbody.full-episode-title:not(.disable-full-episode-list) .multi-page-v1 .cur-list li .duration,\nbody.full-episode-title:not(.disable-full-episode-list) .multi-page .cur-list li .duration {\n  align-self: center !important;\n}\nbody.full-episode-title:not(.disable-full-episode-list) .video-pod__list.multip .simple-base-item {\n  counter-increment: page;\n}\nbody.full-episode-title:not(.disable-full-episode-list) .video-pod__list.multip .simple-base-item .title .title-txt::before {\n  content: "P" counter(page);\n  margin-right: 6px;\n}\nbody.full-episode-title:not(.disable-full-episode-list) .video-pod__list .simple-base-item .title {\n  height: auto !important;\n  padding: 2px 0 !important;\n}\nbody.full-episode-title:not(.disable-full-episode-list) .video-pod__list .simple-base-item .title .title-txt {\n  padding: 4px 0 !important;\n  width: auto !important;\n  max-height: unset !important;\n  height: auto !important;\n  white-space: normal !important;\n  line-height: 1.5 !important;\n  display: block !important;\n}\nbody.full-episode-list:not(.disable-full-episode-list) .video-sections-content-list {\n  max-height: unset !important;\n  height: auto !important;\n}\nbody.full-episode-list:not(.disable-full-episode-list) .video-sections-content-list .video-section-list[style]:not([style*="height: 0px"]) {\n  height: auto !important;\n}\nbody.full-episode-list:not(.disable-full-episode-list) .multi-page-v1 .head-left h3,\nbody.full-episode-list:not(.disable-full-episode-list) .multi-page .head-left h3 {\n  cursor: pointer;\n}\nbody.full-episode-list:not(.disable-full-episode-list) .multi-page-v1 .cur-list,\nbody.full-episode-list:not(.disable-full-episode-list) .multi-page .cur-list {\n  max-height: unset !important;\n}\nbody.full-episode-list:not(.disable-full-episode-list) .multi-page-v1 .cur-list ul,\nbody.full-episode-list:not(.disable-full-episode-list) .multi-page .cur-list ul {\n  max-height: unset !important;\n}\nbody.full-episode-list:not(.disable-full-episode-list) .video-pod__body {\n  max-height: unset !important;\n}',""]),e.exports=o},218:e=>{"use strict";
// eslint-disable-next-line func-names
e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var i=e(t);return t[2]?"@media ".concat(t[2]," {").concat(i,"}"):i})).join("")},
// eslint-disable-next-line func-names
t.i=function(e,i,o){"string"==typeof e&&(
// eslint-disable-next-line no-param-reassign
e=[[null,e,""]]);var l={};if(o)for(var n=0;n<this.length;n++){
// eslint-disable-next-line prefer-destructuring
var s=this[n][0];null!=s&&(l[s]=!0)}for(var d=0;d<e.length;d++){var a=[].concat(e[d]);o&&l[a[0]]||(i&&(a[2]?a[2]="".concat(i," and ").concat(a[2]):a[2]=i),t.push(a))}},t}},909:(e,t,i)=>{var o=i(288);o&&o.__esModule&&(o=o.default),e.exports="string"==typeof o?o:o.toString()},365:e=>{function t(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=365,e.exports=t},393:e=>{"use strict";e.exports="提供一些视频选集区域的优化, 对番剧无效.\n- `展开选集标题`: 总是完全展开视频选集列表项的标题, 若为传统分 P 列表, 还会恢复显示分 P 数的前缀.\n- `展开选集列表`: 总是完全展开视频选集列表\n\n打开 `展开选集列表` 时, 在选集区域的标题上按住 <kbd>Alt</kbd> 键点击可以临时切换此组件的效果.\n"}},o={};function l(e){var t=o[e];if(void 0!==t)return t.exports;var n=o[e]={id:e,exports:{}};return i[e](n,n.exports,l),n.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,l.t=function(i,o){if(1&o&&(i=this(i)),8&o)return i;if("object"==typeof i&&i){if(4&o&&i.__esModule)return i;if(16&o&&"function"==typeof i.then)return i}var n=Object.create(null);l.r(n);var s={};e=e||[null,t({}),t([]),t(t)];for(var d=2&o&&i;"object"==typeof d&&!~e.indexOf(d);d=t(d))Object.getOwnPropertyNames(d).forEach((e=>s[e]=()=>i[e]));return s.default=()=>i,l.d(n,s),n},l.d=(e,t)=>{for(var i in t)l.o(t,i)&&!l.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},l.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),l.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var n={};return(()=>{"use strict";l.d(n,{component:()=>d});const e=coreApis.componentApis.define,t=coreApis.utils.urls,i=coreApis.settings,o=coreApis.spinQuery,s="fullEpisodeTitle",d=(0,e.defineComponentMetadata)({name:s,instantStyles:[{name:s,style:()=>Promise.resolve().then(l.t.bind(l,909,23))}],options:{fullEpisodeTitle:{defaultValue:!0,displayName:"展开选集标题"},fullEpisodeList:{defaultValue:!0,displayName:"展开选集列表"}},entry:e=>{let{metadata:{options:t}}=e;Object.keys(t).forEach((e=>{(0,i.addComponentListener)(`fullEpisodeTitle.${e}`,(t=>{document.body.classList.toggle(lodash.kebabCase(e),t)}),!0)})),t.fullEpisodeList&&Promise.race([(0,o.select)(".multi-page-v1 .head-left h3"),(0,o.select)(".video-sections-v1 .first-line-title"),(0,o.select)(".base-video-sections-v1 .first-line-title"),(0,o.select)(".video-pod .video-pod__header .title")]).then((e=>{e&&e.addEventListener("click",(e=>{e.altKey&&0===e.button&&(document.body.classList.toggle("disable-full-episode-list"),e.preventDefault(),e.stopImmediatePropagation())}),{capture:!0})}))},displayName:"选集区域优化",tags:[componentsTags.video],urlInclude:t.videoUrls,commitHash:"8e22e658455d3058fa678bf4d6fa7a49cc3384fc",coreVersion:"2.9.6",description:(()=>{const e=l(365);return{...Object.fromEntries(e.keys().map((t=>[t.match(/index\.(.+)\.md$/)[1],e(t)]))),"zh-CN":()=>Promise.resolve().then(l.t.bind(l,393,17)).then((e=>e.default))}})()})})(),n=n.component})()));