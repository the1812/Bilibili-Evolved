!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["feeds/disable-details"]=t():e["feeds/disable-details"]=t()}(globalThis,(()=>(()=>{var e,t,n={915:(e,t,n)=>{var o=n(218)((function(e){return e[1]}));o.push([e.id,"[data-module=desc][data-orig],\n.card[data-did] .content {\n  cursor: text;\n}\n[data-module=desc][data-orig] .details,\n.card[data-did] .content .details {\n  color: #222;\n  font-size: 12px;\n  opacity: 0.6;\n  cursor: pointer;\n  display: block;\n  line-height: 22px;\n}\nbody.dark [data-module=desc][data-orig] .details,\nbody.dark .card[data-did] .content .details {\n  color: #eee;\n}\n\n.bili-rich-text-module.at {\n  cursor: pointer;\n}\n\n.dyn-card-opus__summary {\n  cursor: text;\n}",""]),e.exports=o},116:(e,t,n)=>{var o=n(218)((function(e){return e[1]}));o.push([e.id,".card[data-did] .content .details {\n  display: none;\n}",""]),e.exports=o},218:e=>{"use strict";
// eslint-disable-next-line func-names
e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var n=e(t);return t[2]?"@media ".concat(t[2]," {").concat(n,"}"):n})).join("")},
// eslint-disable-next-line func-names
t.i=function(e,n,o){"string"==typeof e&&(
// eslint-disable-next-line no-param-reassign
e=[[null,e,""]]);var r={};if(o)for(var i=0;i<this.length;i++){
// eslint-disable-next-line prefer-destructuring
var a=this[i][0];null!=a&&(r[a]=!0)}for(var s=0;s<e.length;s++){var d=[].concat(e[s]);o&&r[d[0]]||(n&&(d[2]?d[2]="".concat(n," and ").concat(d[2]):d[2]=n),t.push(d))}},t}},770:(e,t,n)=>{var o=n(915);o&&o.__esModule&&(o=o.default),e.exports="string"==typeof o?o:o.toString()},170:(e,t,n)=>{var o=n(116);o&&o.__esModule&&(o=o.default),e.exports="string"==typeof o?o:o.toString()},799:e=>{"use strict";e.exports=coreApis.componentApis.feeds.api},356:e=>{"use strict";e.exports=coreApis.style}},o={};function r(e){var t=o[e];if(void 0!==t)return t.exports;var i=o[e]={id:e,exports:{}};return n[e](i,i.exports,r),i.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,r.t=function(n,o){if(1&o&&(n=this(n)),8&o)return n;if("object"==typeof n&&n){if(4&o&&n.__esModule)return n;if(16&o&&"function"==typeof n.then)return n}var i=Object.create(null);r.r(i);var a={};e=e||[null,t({}),t([]),t(t)];for(var s=2&o&&n;"object"==typeof s&&!~e.indexOf(s);s=t(s))Object.getOwnPropertyNames(s).forEach((e=>a[e]=()=>n[e]));return a.default=()=>n,r.d(i,a),i},r.d=(e,t)=>{for(var n in t)r.o(t,n)&&!r.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var i={};return(()=>{"use strict";r.d(i,{component:()=>d});const e=coreApis.componentApis.define;var t=r(799);const n=coreApis.utils.urls;let o=!0;const a="disable-feeds-details-style",s=async()=>{const{addImportantStyle:e}=await Promise.resolve().then(r.t.bind(r,356,23)),{default:t}=await Promise.resolve().then(r.t.bind(r,770,23));e(t,a)},d=(0,e.defineComponentMetadata)({name:"disableFeedsDetails",displayName:"禁止跳转动态详情",tags:[componentsTags.feeds],urlInclude:n.feedsUrls,description:{"zh-CN":"禁止动态点击后跳转详情页, 方便选择其中的文字."},entry:async()=>{const{addImportantStyle:e}=await Promise.resolve().then(r.t.bind(r,356,23)),{forEachFeedsCard:n}=await Promise.resolve().then(r.t.bind(r,799,23)),{default:i}=await Promise.resolve().then(r.t.bind(r,170,23));e(i,"disable-feeds-details-init-style"),s();n({added:e=>{const{element:n}=e;n.addEventListener("click",(e=>{if(e.ctrlKey||!o)return;const t=dqa(n,'.content, .bili-dyn-content [data-module="desc"] .bili-rich-text, .dyn-card-opus__summary'),r=e.target;if(r.hasAttribute("click-title"))return;if(r.hasAttribute("data-pics"))return;if(["bili-rich-text__action","bili-rich-text-topic","bili-rich-text-module","bili-rich-text-link"].some((e=>r.classList.contains(e))))return;dqa(n,".im-popup").some((e=>e.contains(r)))||t.some((e=>e===r||e.contains(r)))&&e.stopImmediatePropagation()}),{capture:!0});const r=dq(n,".post-content, .bili-dyn-content");if(!r)return;if(![".video-container",".bangumi-container",".media-list",".article-container"].some((e=>dq(r,e)))&&!dq(r,".details")&&(r.classList.contains("repost")||e.type===t.feedsCardTypes.repost)){const e=dq(r,".content, .bili-dyn-content__orig__desc, .dyn-card-opus__summary");if(!e)return;const t=document.createElement("div");t.classList.add("details"),t.setAttribute("click-title","详情"),t.innerHTML='\n        详情<i class="mdi mdi-chevron-right" click-title></i>\n      ',e.insertAdjacentElement("beforeend",t)}}})},unload:()=>{document.getElementById(a)?.remove(),o=!1},reload:()=>{s(),o=!0},commitHash:"6018100079aee98be9efd86c6eaf152fff96fef4",coreVersion:"2.8.13"})})(),i=i.component})()));