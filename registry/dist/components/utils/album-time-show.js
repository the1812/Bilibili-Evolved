!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports["utils/album-time-show"]=e():t["utils/album-time-show"]=e()}(globalThis,(()=>(()=>{var t,e,o={897:(t,e,o)=>{var n=o(955)((function(t){return t[1]}));n.push([t.id,'@charset "UTF-8";\n/* 保持相簿元素高度 */\n.album-card {\n  margin-bottom: 21px;\n}\n\n/* 上移原互动数据 */\n.album-card .album-card__info {\n  margin-top: -5px;\n}\n\n/* 相簿发布时间样式 */\n.album-pub-time {\n  color: #99a2aa;\n  position: absolute;\n  margin-top: -5px;\n}\nbody.dark .album-pub-time {\n  color: #aaa;\n}',""]),t.exports=n},955:t=>{"use strict";
// eslint-disable-next-line func-names
t.exports=function(t){var e=[];return e.toString=function(){return this.map((function(e){var o=t(e);return e[2]?"@media ".concat(e[2]," {").concat(o,"}"):o})).join("")},
// eslint-disable-next-line func-names
e.i=function(t,o,n){"string"==typeof t&&(
// eslint-disable-next-line no-param-reassign
t=[[null,t,""]]);var r={};if(n)for(var a=0;a<this.length;a++){
// eslint-disable-next-line prefer-destructuring
var i=this[a][0];null!=i&&(r[i]=!0)}for(var c=0;c<t.length;c++){var s=[].concat(t[c]);n&&r[s[0]]||(o&&(s[2]?s[2]="".concat(o," and ").concat(s[2]):s[2]=o),e.push(s))}},e}},679:(t,e,o)=>{var n=o(897);n&&n.__esModule&&(n=n.default),t.exports="string"==typeof n?n:n.toString()},479:t=>{"use strict";t.exports=coreApis.style}},n={};function r(t){var e=n[t];if(void 0!==e)return e.exports;var a=n[t]={id:t,exports:{}};return o[t](a,a.exports,r),a.exports}e=Object.getPrototypeOf?t=>Object.getPrototypeOf(t):t=>t.__proto__,r.t=function(o,n){if(1&n&&(o=this(o)),8&n)return o;if("object"==typeof o&&o){if(4&n&&o.__esModule)return o;if(16&n&&"function"==typeof o.then)return o}var a=Object.create(null);r.r(a);var i={};t=t||[null,e({}),e([]),e(e)];for(var c=2&n&&o;"object"==typeof c&&!~t.indexOf(c);c=e(c))Object.getOwnPropertyNames(c).forEach((t=>i[t]=()=>o[t]));return i.default=()=>o,r.d(a,i),a},r.d=(t,e)=>{for(var o in e)r.o(e,o)&&!r.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:e[o]})},r.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})};var a={};return(()=>{"use strict";r.d(a,{component:()=>c});const t=coreApis.componentApis.define,e=coreApis.observer,o=coreApis.spinQuery;let n,i;const c=(0,t.defineComponentMetadata)({name:"albumPubTimeShow",author:{name:"Light_Quanta",link:"https://github.com/LightQuanta"},displayName:"相簿发布时间显示",tags:[componentsTags.utils],urlInclude:[/^https:\/\/space\.bilibili\.com/],entry:async()=>{const t=await(0,o.select)(".s-space");(0,e.childList)(t,(async()=>{document.URL.match(/^https:\/\/space\.bilibili\.com\/\d+\/album/)&&(n=await(0,o.select)(".album-list__content"),(async t=>{const[o]=(0,e.attributesSubtree)(t,(()=>{n.querySelectorAll(".album-card").forEach((t=>{const e=t.querySelector(".album-pub-time"),o=t.__vue__.item.ctime;
// eslint-disable-next-line no-underscore-dangle
void 0!==o&&(null!==e?e.innerHTML=new Date(1e3*o).toLocaleString():t.insertAdjacentHTML("beforeend",`<div class="album-pub-time">${new Date(1e3*o).toLocaleString()}</div>`))}))}));i?.disconnect(),i=o;const{addImportantStyle:a}=await Promise.resolve().then(r.t.bind(r,479,23)),{default:c}=await Promise.resolve().then(r.t.bind(r,679,23));a(c,"album-pub-time-style")})(n))}))},description:{"zh-CN":"在相簿界面显示相簿的发布时间"},commitHash:"549fcdb16eeb45122ceaa48017a43a573598fc1a",coreVersion:"2.10.0"})})(),a=a.component})()));