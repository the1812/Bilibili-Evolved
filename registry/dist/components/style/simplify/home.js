!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["style/simplify/home"]=t():e["style/simplify/home"]=t()}(globalThis,(()=>(()=>{var e,t,i={971:(e,t,i)=>{var n=i(218)((function(e){return e[1]}));n.push([e.id,"body.simplifyHome-switch-categories .z-top-container.has-menu {\n  height: auto !important;\n  min-height: unset !important;\n}\nbody.simplifyHome-switch-categories .bili-header-m > .bili-wrapper {\n  visibility: hidden !important;\n  height: 18px !important;\n}\nbody.simplifyHome-switch-categories .primary-menu-itnl {\n  visibility: hidden !important;\n  height: 24px !important;\n  padding: 0 !important;\n}\nbody.simplifyHome-switch-categories .bili-header__channel {\n  height: 12px !important;\n}\nbody.simplifyHome-switch-categories .bili-header__channel > * {\n  display: none !important;\n}\nbody.simplifyHome-switch-categories.header-v3 .bili-wrapper {\n  padding-top: 8px !important;\n  border-top: none !important;\n}\nbody.simplifyHome-switch-trends .first-screen #reportFirst1 {\n  display: none !important;\n}\nbody.simplifyHome-switch-trends .first-screen .space-between {\n  margin-bottom: 0 !important;\n}\nbody.simplifyHome-switch-trends .bili-layout .bili-grid:first-child,\nbody.simplifyHome-switch-trends .recommended-container,\nbody.simplifyHome-switch-trends .rcmd-box-wrap {\n  display: none !important;\n}\nbody.simplifyHome-switch-online .first-screen #reportFirst2 {\n  display: none !important;\n}\nbody.simplifyHome-switch-ext-box .first-screen #reportFirst3 {\n  display: none !important;\n}\nbody.simplifyHome-switch-special #bili_report_spe_rec {\n  display: none !important;\n}\nbody.simplifyHome-switch-contact .bili-footer .b-footer-wrap,\nbody.simplifyHome-switch-contact .international-footer {\n  display: none !important;\n}\nbody.simplifyHome-switch-elevator .storey-box .elevator {\n  display: none !important;\n}",""]),e.exports=n},218:e=>{"use strict";
// eslint-disable-next-line func-names
e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var i=e(t);return t[2]?"@media ".concat(t[2]," {").concat(i,"}"):i})).join("")},
// eslint-disable-next-line func-names
t.i=function(e,i,n){"string"==typeof e&&(
// eslint-disable-next-line no-param-reassign
e=[[null,e,""]]);var o={};if(n)for(var r=0;r<this.length;r++){
// eslint-disable-next-line prefer-destructuring
var a=this[r][0];null!=a&&(o[a]=!0)}for(var s=0;s<e.length;s++){var l=[].concat(e[s]);n&&o[l[0]]||(i&&(l[2]?l[2]="".concat(i," and ").concat(l[2]):l[2]=i),t.push(l))}},t}},732:(e,t,i)=>{var n=i(971);n&&n.__esModule&&(n=n.default),e.exports="string"==typeof n?n:n.toString()}},n={};function o(e){var t=n[e];if(void 0!==t)return t.exports;var r=n[e]={id:e,exports:{}};return i[e](r,r.exports,o),r.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,o.t=function(i,n){if(1&n&&(i=this(i)),8&n)return i;if("object"==typeof i&&i){if(4&n&&i.__esModule)return i;if(16&n&&"function"==typeof i.then)return i}var r=Object.create(null);o.r(r);var a={};e=e||[null,t({}),t([]),t(t)];for(var s=2&n&&i;"object"==typeof s&&!~e.indexOf(s);s=t(s))Object.getOwnPropertyNames(s).forEach((e=>a[e]=()=>i[e]));return a.default=()=>i,o.d(r,a),r},o.d=(e,t)=>{for(var i in t)o.o(t,i)&&!o.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},o.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),o.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var r={};return(()=>{"use strict";o.d(r,{component:()=>m});const e=coreApis.componentApis.switchOptions,t=coreApis.settings,i=coreApis.spinQuery,n=coreApis.style,a=coreApis.utils,s=coreApis.utils.log,l=coreApis.utils.urls,p=(0,e.defineSwitchMetadata)({name:"simplifyOptions",switches:{categories:{defaultValue:!1,displayName:"分区栏"},trends:{defaultValue:!1,displayName:"活动/热门视频"},online:{defaultValue:!1,displayName:"在线列表(旧)"},"ext-box":{defaultValue:!1,displayName:"电竞赛事(旧)"},special:{defaultValue:!1,displayName:"特别推荐(旧)"},contact:{defaultValue:!1,displayName:"联系方式"},elevator:{defaultValue:!1,displayName:"右侧分区导航(旧)"}}}),c=(0,s.useScopedConsole)("简化首页"),m=(0,e.wrapSwitchOptions)(p)({name:"simplifyHome",displayName:"简化首页",description:"隐藏原版首页不需要的元素 / 分区.",instantStyles:[{name:"simplifyHome",style:()=>Promise.resolve().then(o.t.bind(o,732,23))}],urlInclude:l.mainSiteUrls,tags:[componentsTags.style],entry:async e=>{let{metadata:o}=e;const r=(0,a.matchUrlPattern)("https://www.bilibili.com/");if(!r)return;c.log("isHome",r);const{options:s}=(0,t.getComponentSettings)(o.name),l="-1"===(0,a.getCookieValue)("i-wanna-go-back"),m=await(async()=>{if(!l){const e=await(0,i.sq)((()=>dqa(".proxy-box > div")),(e=>e.length>0||!r));return Object.fromEntries(e.map((e=>[e.id.replace(/^bili_/,""),{displayName:e.querySelector("header .name")?.textContent?.trim()??"未知分区",defaultValue:!1}])))}const e=["推广"],t=await(0,i.sq)((()=>dqa(".bili-grid .the-world")),(e=>e.length>3||!r));c.log(t);const n=t?.filter((t=>!e.includes(t.id))).map((e=>{const t=(e=>{let t=e;for(;t.parentElement;){if(t.classList.contains("bili-grid"))return t;t=t.parentElement}return null})(e),i=e.id;return t?(t.dataset.area=i,[i,{displayName:i,defaultValue:!1}]):null})).filter((e=>null!==e))??[];return Object.fromEntries(n)})(),d={};Object.entries(m).forEach((e=>{let[i,{displayName:n,defaultValue:r}]=e;const a={defaultValue:r,displayName:n},l=`switch-${i}`;void 0===s[l]&&(s[l]=r);const c=`switch-${i}`;(0,t.addComponentListener)(`${o.name}.${c}`,(e=>{document.body.classList.toggle(`${o.name}-${c}`,e)}),!0),p.switches[i]=a,d[i]=a})),s.simplifyOptions.switches=d;const y=Object.keys(m).map((e=>`\n        body.simplifyHome-switch-${e} .bili-layout .bili-grid[data-area="${e}"],\n        body.simplifyHome-switch-${e} .storey-box .proxy-box #bili_${e} {\n          display: none !important;\n        }\n      `.trim())).join("\n");(0,n.addStyle)(y,"simplify-home-generated")},commitHash:"164c3a1e62e636abebea56c9ee6850220003e9cb",coreVersion:"2.8.3"})})(),r=r.component})()));