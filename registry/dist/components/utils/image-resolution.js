!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports["utils/image-resolution"]=e():t["utils/image-resolution"]=e()}(globalThis,(()=>(()=>{var t,e,o={223:(t,e,o)=>{var i=o(218)((function(t){return t[1]}));i.push([t.id,".favInfo-box .collection-cover img,\n.favInfo-box .favInfo-cover img {\n  width: 100% !important;\n  object-position: left !important;\n}\n\n.bb-comment .sailing .sailing-img,\n.comment-bilibili-fold .sailing .sailing-img {\n  width: 288px;\n}",""]),t.exports=i},218:t=>{"use strict";
// eslint-disable-next-line func-names
t.exports=function(t){var e=[];return e.toString=function(){return this.map((function(e){var o=t(e);return e[2]?"@media ".concat(e[2]," {").concat(o,"}"):o})).join("")},
// eslint-disable-next-line func-names
e.i=function(t,o,i){"string"==typeof t&&(
// eslint-disable-next-line no-param-reassign
t=[[null,t,""]]);var n={};if(i)for(var r=0;r<this.length;r++){
// eslint-disable-next-line prefer-destructuring
var a=this[r][0];null!=a&&(n[a]=!0)}for(var s=0;s<t.length;s++){var c=[].concat(t[s]);i&&n[c[0]]||(o&&(c[2]?c[2]="".concat(o," and ").concat(c[2]):c[2]=o),e.push(c))}},e}},14:(t,e,o)=>{var i=o(223);i&&i.__esModule&&(i=i.default),t.exports="string"==typeof i?i:i.toString()},391:t=>{"use strict";t.exports=coreApis.observer}},i={};function n(t){var e=i[t];if(void 0!==e)return e.exports;var r=i[t]={id:t,exports:{}};return o[t](r,r.exports,n),r.exports}e=Object.getPrototypeOf?t=>Object.getPrototypeOf(t):t=>t.__proto__,n.t=function(o,i){if(1&i&&(o=this(o)),8&i)return o;if("object"==typeof o&&o){if(4&i&&o.__esModule)return o;if(16&i&&"function"==typeof o.then)return o}var r=Object.create(null);n.r(r);var a={};t=t||[null,e({}),e([]),e(e)];for(var s=2&i&&o;"object"==typeof s&&!~t.indexOf(s);s=e(s))Object.getOwnPropertyNames(s).forEach((t=>a[t]=()=>o[t]));return a.default=()=>o,n.d(r,a),r},n.d=(t,e)=>{for(var o in e)n.o(e,o)&&!n.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:e[o]})},n.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),n.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})};var r={};return(()=>{"use strict";n.d(r,{component:()=>f});const t=coreApis.componentApis.define,e=coreApis.componentApis.styledComponent,o=/@(\d+)[Ww](_(\d+)[Hh])?/,i=["#certify-img1","#certify-img2"],a=[".bili-avatar-img"],s=[".logo-img"],c=[".article-detail .article-content img"],l=(t,e)=>{const o=document.createNodeIterator(t,NodeFilter.SHOW_ELEMENT);let i=o.nextNode();for(;i;)e(i),i=o.nextNode()},d=async(t,e)=>{const{attributes:r}=await Promise.resolve().then(n.t.bind(n,391,23)),c=(n,r)=>{const c=n(t);if(null===c)return;if(i.some((e=>t.matches(e))))return;if(c.includes(","))return;const l=c.match(o);if(!l)return;const[,d,,u]=l,p=parseInt(t.getAttribute("data-resolution-width")||"0");if(parseInt(d)>=p&&0!==p)return;null===t.getAttribute("width")&&null===t.getAttribute("height")&&void 0!==u&&(s.some((e=>t.matches(e)))?(t.setAttribute("height",u),t.setAttribute("width",d)):a.some((e=>t.matches(e)))?t.setAttribute("height",u):t.setAttribute("width",d));const f=(t,e)=>t===1/0||e===1/0?c.replace(o,"@"):void 0===e?c.replace(o,`@${t}w`):c.replace(o,`@${t}w_${e}h`);if(void 0!==u){const o=e.getWidth(parseInt(d),t),i=e.getHeight(parseInt(u),t);t.setAttribute("data-resolution-width",o.toString()),r(t,f(o,i))}else{const o=e.getWidth(parseInt(d),t);t.setAttribute("data-resolution-width",o.toString()),r(t,f(o))}};r(t,(()=>{c((t=>t.getAttribute("src")),((t,e)=>t.setAttribute("src",e))),c((t=>t.getAttribute("srcset")),((t,e)=>t.setAttribute("srcset",e))),c((t=>t.style.backgroundImage),((t,e)=>t.style.backgroundImage=e))}))},u=(0,e.styledComponentEntry)((()=>Promise.resolve().then(n.t.bind(n,14,23))),(async t=>{let{settings:e}=t;const{allMutations:o}=await Promise.resolve().then(n.t.bind(n,391,23)),i="auto"===e.options.scale?window.devicePixelRatio:parseFloat(e.options.scale),r={getWidth:(t,o)=>e.options.originalImageInArticles&&c.some((t=>o.matches(t)))?1/0:Math.round(i*t),getHeight:(t,o)=>e.options.originalImageInArticles&&c.some((t=>o.matches(t)))?1/0:Math.round(i*t)};l(document.body,(t=>d(t,r))),o((t=>{t.forEach((t=>t.addedNodes.forEach((t=>{t instanceof HTMLElement&&(d(t,r),"IMG"!==t.nodeName.toUpperCase()&&l(t,(t=>d(t,r))))}))))}))})),p=(0,t.defineOptionsMetadata)({scale:{displayName:"缩放级别",defaultValue:"auto",hidden:!0},originalImageInArticles:{displayName:"在专栏中请求原图",defaultValue:!1}}),f=(0,t.defineComponentMetadata)({name:"imageResolution",displayName:"高分辨率图片",tags:[componentsTags.utils],enabledByDefault:window.devicePixelRatio>1,entry:u,description:{"zh-CN":"根据屏幕 DPI 请求更高分辨率的图片, 例如 DPI 缩放 200% 则请求 2 倍的分辨率, 加载时间也会相应变长一些. (也会导致某些浏览器里出现图片闪动, 因为本质上是更换了图片源)"},options:p,commitHash:"9e5159f7d2ef32b3b4c04e6d569e099090574367",coreVersion:"2.9.3"})})(),r=r.component})()));