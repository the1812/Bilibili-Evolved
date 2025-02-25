!function(e,n){"object"==typeof exports&&"object"==typeof module?module.exports=n():"function"==typeof define&&define.amd?define([],n):"object"==typeof exports?exports["style/home-redesign/minimal"]=n():e["style/home-redesign/minimal"]=n()}(globalThis,(()=>(()=>{var e,n,t={301:(e,n,t)=>{"use strict";t.d(n,{Z:()=>i});var o=t(905);const i=(0,o.getComponentSettings)("minimalHome").options},946:(e,n,t)=>{"use strict";t.d(n,{L:()=>o});let o=function(e){return e.Feeds="动态",e.Trending="热门 / 推荐",e}({})},776:(e,n,t)=>{var o=t(955)((function(e){return e[1]}));o.push([e.id,"html {\n  scroll-behavior: smooth;\n  min-height: 100vh;\n}\nbody {\n  display: flex;\n  align-items: stretch;\n  flex-direction: column;\n  min-height: 100vh;\n}\n#i_cecream {\n  width: 100%;\n}\n.home-redesign-base {\n  --home-base-color: #fff;\n  --home-background-color: #fff;\n  --home-color: #000;\n  --home-max-width: var(--home-max-width-override, 1440px);\n  --home-content-height: 250px;\n  --home-card-radius: 12px;\n  --home-card-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);\n  --home-card-border: 1px solid #8882;\n  background-color: var(--home-base-color);\n  color: var(--home-color);\n  font-size: 12px;\n  flex-grow: 1;\n  line-height: normal;\n  display: flex;\n  align-items: center;\n  flex-direction: column;\n}\nbody.dark .home-redesign-base {\n  --home-base-color: #181818;\n  --home-background-color: #282828;\n  --home-color: #eee;\n  --home-card-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.2);\n}\nbody.home-redesign-off .home-redesign-base {\n  display: none;\n}",""]),e.exports=o},591:(e,n,t)=>{var o=t(955)((function(e){return e[1]}));o.push([e.id,".minimal-home {\n  --minimal-home-auto-card-column: 1;\n  --card-width: 600px;\n  --card-height: 122px;\n  --minimal-home-grid-gap: 12px;\n  --minimal-home-grid-padding: 8px;\n  --minimal-home-card-column: var(\n    --minimal-home-column-count-override,\n    var(--minimal-home-auto-card-column)\n  );\n  padding: 24px 32px 0 32px;\n  flex-grow: 1;\n  display: flex;\n  flex-direction: column;\n}\n@media screen and (min-width: 1440px) {\n.minimal-home {\n    --minimal-home-auto-card-column: 2;\n}\n}\n@media screen and (min-width: 2160px) {\n.minimal-home {\n    --minimal-home-auto-card-column: 3;\n}\n}\n.minimal-home-tabs {\n  flex-grow: 1;\n  min-width: calc( var(--card-width) * var(--minimal-home-card-column) + var(--minimal-home-grid-gap) * (var(--minimal-home-card-column) - 1) + 2 * var(--minimal-home-grid-padding) );\n}\n.minimal-home-tabs .minimal-home-tab-cards {\n  display: grid;\n  grid-template-columns: repeat(var(--minimal-home-card-column), var(--card-width));\n  gap: var(--minimal-home-grid-gap);\n  padding: 0 var(--minimal-home-grid-padding);\n  margin-bottom: 16px;\n}\n.minimal-home-tabs .minimal-home-tab-cards .video-card * {\n  transition: 0.2s ease-out;\n}",""]),e.exports=o},134:(e,n,t)=>{var o=t(955)((function(e){return e[1]}));o.push([e.id,".minimal-home-operations {\n  display: flex;\n  align-items: center;\n  flex-direction: column;\n  gap: 12px;\n  position: fixed;\n  bottom: 48px;\n  right: 48px;\n}\n.minimal-home-operations .be-button {\n  padding: 8px !important;\n  opacity: 0.5;\n}\n.minimal-home-operations .be-button:hover {\n  opacity: 1;\n}\n.minimal-home-operations-refresh .mdi {\n  transition-duration: 0.5s;\n}\n.minimal-home-operations-refresh .mdi:hover {\n  transform: rotate(1turn);\n}\n.minimal-home-operations-top .mdi:hover {\n  animation: bounce-y--2 0.4s ease-out;\n}\n@keyframes bounce-y--2 {\n0%, 100% {\n    transform: translateY(0);\n}\n50% {\n    transform: translateY(-2px);\n}\n}",""]),e.exports=o},214:(e,n,t)=>{var o=t(955)((function(e){return e[1]}));o.push([e.id,".bili-header-m .head-banner .head-content .head-logo,\n.international-home > :not(.international-header),\n.international-header .b-wrap,\n.international-footer,\n.palette-button-wrap {\n  position: fixed;\n  visibility: hidden;\n  top: 200vh;\n  left: 0;\n  height: 0 !important;\n  padding: 0 !important;\n  margin: 0 !important;\n  overflow: hidden !important;\n}\n\n#app > .bili-wrapper,\n#app > .elevator-module,\n#app > .bili-header-m.stardust-common > .bili-wrapper {\n  position: fixed;\n  visibility: hidden;\n  top: 200vh;\n  left: 0;\n  height: 0 !important;\n  padding: 0 !important;\n  margin: 0 !important;\n  overflow: hidden !important;\n}\n\n#i_cecream > main,\n#i_cecream .palette-button-outer,\n#i_cecream .bili-header__channel,\n#i_cecream > .bili-feed4 > :not(.bili-header),\n#i_cecream .bili-footer {\n  position: fixed;\n  visibility: hidden;\n  top: 200vh;\n  left: 0;\n  height: 0 !important;\n  padding: 0 !important;\n  margin: 0 !important;\n  overflow: hidden !important;\n}",""]),e.exports=o},955:e=>{"use strict";
// eslint-disable-next-line func-names
e.exports=function(e){var n=[];return n.toString=function(){return this.map((function(n){var t=e(n);return n[2]?"@media ".concat(n[2]," {").concat(t,"}"):t})).join("")},
// eslint-disable-next-line func-names
n.i=function(e,t,o){"string"==typeof e&&(
// eslint-disable-next-line no-param-reassign
e=[[null,e,""]]);var i={};if(o)for(var r=0;r<this.length;r++){
// eslint-disable-next-line prefer-destructuring
var a=this[r][0];null!=a&&(i[a]=!0)}for(var s=0;s<e.length;s++){var d=[].concat(e[s]);o&&i[d[0]]||(t&&(d[2]?d[2]="".concat(t," and ").concat(d[2]):d[2]=t),n.push(d))}},n}},991:(e,n,t)=>{"use strict";var o,i=function(){return void 0===o&&(
// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
// @see https://github.com/webpack-contrib/style-loader/issues/177
o=Boolean(window&&document&&document.all&&!window.atob)),o},r=function(){var e={};return function(n){if(void 0===e[n]){var t=document.querySelector(n);if(window.HTMLIFrameElement&&t instanceof window.HTMLIFrameElement)try{t=t.contentDocument.head}catch(e){t=null}e[n]=t}return e[n]}}(),a=[];function s(e){for(var n=-1,t=0;t<a.length;t++)if(a[t].identifier===e){n=t;break}return n}function d(e,n){for(var t={},o=[],i=0;i<e.length;i++){var r=e[i],d=n.base?r[0]+n.base:r[0],l=t[d]||0,c="".concat(d," ").concat(l);t[d]=l+1;var m=s(c),u={css:r[1],media:r[2],sourceMap:r[3]};-1!==m?(a[m].references++,a[m].updater(u)):a.push({identifier:c,updater:g(u,n),references:1}),o.push(c)}return o}function l(e){var n=document.createElement("style"),o=e.attributes||{};if(void 0===o.nonce){var i=t.nc;i&&(o.nonce=i)}if(Object.keys(o).forEach((function(e){n.setAttribute(e,o[e])})),"function"==typeof e.insert)e.insert(n);else{var a=r(e.insert||"head");if(!a)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");a.appendChild(n)}return n}var c,m=(c=[],function(e,n){return c[e]=n,c.filter(Boolean).join("\n")});function u(e,n,t,o){var i=t?"":o.media?"@media ".concat(o.media," {").concat(o.css,"}"):o.css;if(e.styleSheet)e.styleSheet.cssText=m(n,i);else{var r=document.createTextNode(i),a=e.childNodes;a[n]&&e.removeChild(a[n]),a.length?e.insertBefore(r,a[n]):e.appendChild(r)}}function p(e,n,t){var o=t.css,i=t.media,r=t.sourceMap;if(i?e.setAttribute("media",i):e.removeAttribute("media"),r&&"undefined"!=typeof btoa&&(o+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(r))))," */")),e.styleSheet)e.styleSheet.cssText=o;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(o))}}var h=null,f=0;function g(e,n){var t,o,i;if(n.singleton){var r=f++;t=h||(h=l(n)),o=u.bind(null,t,r,!1),i=u.bind(null,t,r,!0)}else t=l(n),o=p.bind(null,t,n),i=function(){!function(e){if(null===e.parentNode)return!1;e.parentNode.removeChild(e)}(t)};return o(e),function(n){if(n){if(n.css===e.css&&n.media===e.media&&n.sourceMap===e.sourceMap)return;o(e=n)}else i()}}e.exports=function(e,n){(n=n||{}).singleton||"boolean"==typeof n.singleton||(n.singleton=i());var t=d(e=e||[],n);return function(e){if(e=e||[],"[object Array]"===Object.prototype.toString.call(e)){for(var o=0;o<t.length;o++){var i=s(t[o]);a[i].references--}for(var r=d(e,n),l=0;l<t.length;l++){var c=s(t[l]);0===a[c].references&&(a[c].updater(),a.splice(c,1))}t=r}}}},16:(e,n,t)=>{var o=t(214);o&&o.__esModule&&(o=o.default),e.exports="string"==typeof o?o:o.toString()},923:(e,n,t)=>{"use strict";t.r(n),t.d(n,{default:()=>w});var o=function(){var e=this,n=e._self._c;e._self._setupProxy;return n("HomeRedesignBase",[n("div",{staticClass:"minimal-home"},[n("TabControl",{staticClass:"minimal-home-tabs",attrs:{"default-tab":e.defaultTab,tabs:e.tabs}})],1)])};o._withStripped=!0;var i=t(905),r=t(164),a=function(){var e=this,n=e._self._c;e._self._setupProxy;return n("div",{staticClass:"home-redesign-base"},[e._t("default")],2)};a._withStripped=!0;const s=(0,globalThis.Vue.defineComponent)({__name:"HomeRedesignBase",setup(e){const n=new URLSearchParams(location.search);if(n.has("bvid")){const e=new URLSearchParams([...n.entries()].filter((e=>{let[n]=e;return"bvid"!==n})));location.replace(`/video/${n.get("bvid")}${e.size>0?`?${e.toString()}`:""}`)}return{__sfc:!0,params:n}}});var d=t(991),l=t.n(d),c=t(776),m=t.n(c),u={insert:"head",singleton:!1};l()(m(),u);m().locals;var p=t(678);const h=(0,p.A)(s,a,[],!1,null,null,null).exports;var f=t(301),g=t(946);const v=[{name:g.L.Feeds,displayName:"动态",component:()=>Promise.resolve().then(t.bind(t,568)).then((e=>e.default)),activeLink:"https://t.bilibili.com/?tab=video"},{name:g.L.Trending,displayName:f.Z.personalized?"推荐":"热门",component:()=>Promise.resolve().then(t.bind(t,228)).then((e=>e.default)),activeLink:"https://www.bilibili.com/v/popular/all"}],b=Vue.extend({components:{HomeRedesignBase:h,TabControl:r.TabControl},data:()=>({tabs:v,defaultTab:f.Z.defaultTab}),mounted(){const e="--minimal-home-column-count-override";(0,i.addComponentListener)("minimalHome.columnCount",(n=>{n>0?this.$el.style.setProperty(e,n.toString()):this.$el.style.removeProperty(e)}),!0)}});var y=t(591),x=t.n(y),_={insert:"head",singleton:!1};l()(x(),_);x().locals;const w=(0,p.A)(b,o,[],!1,null,null,null).exports},407:(e,n,t)=>{"use strict";t.d(n,{A:()=>m});var o=function(){var e=this,n=e._self._c;e._self._setupProxy;return n("div",{staticClass:"minimal-home-operations"},[n("VButton",{staticClass:"minimal-home-operations-refresh",attrs:{round:"",icon:"",title:"刷新"},on:{click:function(n){e.backToTop(),e.$emit("refresh")}}},[n("VIcon",{attrs:{icon:"mdi-refresh",size:e.size}})],1),e._v(" "),n("VButton",{staticClass:"minimal-home-operations-top",attrs:{round:"",icon:"",title:"返回顶部"},on:{click:e.backToTop}},[n("VIcon",{attrs:{icon:"mdi-arrow-up",size:e.size}})],1)],1)};o._withStripped=!0;var i=t(164);const r=Vue.extend({components:{VButton:i.VButton,VIcon:i.VIcon},data:()=>({size:28}),methods:{backToTop(){window.scrollTo(0,0)}}});var a=t(991),s=t.n(a),d=t(134),l=t.n(d),c={insert:"head",singleton:!1};s()(l(),c);l().locals;const m=(0,t(678).A)(r,o,[],!1,null,null,null).exports},568:(e,n,t)=>{"use strict";t.r(n),t.d(n,{default:()=>u});var o=function(){var e=this,n=e._self._c;e._self._setupProxy;return n("div",{staticClass:"minimal-home-tab",class:{loading:e.loading,loaded:e.loaded,error:e.error}},[n("div",{staticClass:"minimal-home-tab-cards"},e._l(e.cards,(function(e){return n("VideoCard",{key:e.id,attrs:{data:e}})})),1),e._v(" "),e.loading||0!==e.cards.length?e._e():n("VEmpty"),e._v(" "),e.error?e._e():n("ScrollTrigger",{ref:"scrollTrigger",attrs:{"detect-viewport":""},on:{trigger:e.loadCards}}),e._v(" "),e.cards.length>0?n("MinimalHomeOperations",{on:{refresh:e.refresh}}):e._e()],1)};o._withStripped=!0;var i=t(649),r=t(582),a=t.n(r),s=t(765),d=t(7),l=t(164),c=t(407);const m=Vue.extend({components:{ScrollTrigger:l.ScrollTrigger,VEmpty:l.VEmpty,VideoCard:a(),MinimalHomeOperations:c.A},data:()=>({loading:!0,cards:[],error:!1}),computed:{loaded(){return!this.loading&&!this.error},lastID(){if(!this.cards.length)return null;return[...this.cards].sort((0,d.ascendingStringSort)((e=>e.id)))[0].id}},methods:{async loadCards(){try{this.error=!1,this.loading=!0,this.$refs.scrollTrigger.setLoadState("loading"),this.cards=lodash.uniqBy([...this.cards,...await(0,i.getVideoFeeds)("video",this.lastID)],(e=>e.id))}catch(e){(0,s.logError)(e),this.error=!0,this.$refs.scrollTrigger.setLoadState("error")}finally{this.loading=!1,this.loaded&&this.$refs.scrollTrigger.setLoadState("loaded")}},async refresh(){this.cards=[],this.$refs.scrollTrigger.resetIsFirstLoad()}}});const u=(0,t(678).A)(m,o,[],!1,null,null,null).exports},228:(e,n,t)=>{"use strict";t.r(n),t.d(n,{default:()=>g});var o=function(){var e=this,n=e._self._c;e._self._setupProxy;return n("div",{staticClass:"minimal-home-tab",class:{loading:e.loading,loaded:e.loaded,error:e.error}},[n("div",{staticClass:"minimal-home-tab-cards"},e._l(e.cards,(function(e){return n("VideoCard",{key:e.id,attrs:{data:e}})})),1),e._v(" "),e.loading||0!==e.cards.length?e._e():n("VEmpty"),e._v(" "),e.loading&&0===e.cards.length?n("VLoading"):e._e(),e._v(" "),e.cards.length>0?n("MinimalHomeOperations",{on:{refresh:e.loadCards}}):e._e()],1)};o._withStripped=!0;var i=t(582),r=t.n(i),a=t(765),s=t(7),d=t(164),l=t(649);const c=coreApis.ajax;var m=t(847);const u=coreApis.utils.formatters;var p=t(407),h=t(301);const f=Vue.extend({components:{VLoading:d.VLoading,VEmpty:d.VEmpty,VideoCard:r(),MinimalHomeOperations:p.A},data:()=>({loading:!0,cards:[],error:!1}),computed:{loaded(){return!this.loading&&!this.error},lastID(){if(!this.cards.length)return null;return[...this.cards].sort((0,s.ascendingStringSort)((e=>e.id)))[0].id}},async mounted(){this.loadCards()},methods:{async loadCards(){try{this.cards=[],this.error=!1,this.loading=!0,this.cards=await(async e=>{const n=Boolean((0,m.getUID)())&&e,t=n?c.getJsonWithCredentials:c.getJson,{code:o,message:i,data:r}=await t("https://api.bilibili.com/x/web-interface/index/top/feed/rcmd");if(0!==o)throw new Error(`获取${n?"推荐":"热门"}视频失败: ${i}`);const a=r.item.map((e=>({id:e.id,aid:e.id,bvid:e.bvid,coverUrl:e.pic.replace("http:","https:"),title:e.title,description:"",dynamic:"",duration:e.duration,durationText:(0,u.formatDuration)(e.duration),timestamp:1e3*e.pubdate,time:new Date(1e3*e.pubdate),upName:e.owner.name,upID:e.owner.mid,upFaceUrl:e.owner.face.replace("http:","https:"),like:(0,u.formatCount)(e.stat.like),playCount:(0,u.formatCount)(e.stat.view),danmakuCount:(0,u.formatCount)(e.stat.danmaku)})));return(0,l.applyContentFilter)(a)})(h.Z.personalized)}catch(e){(0,a.logError)(e),this.error=!0}finally{this.loading=!1}}}});const g=(0,t(678).A)(f,o,[],!1,null,null,null).exports},678:(e,n,t)=>{"use strict";function o(e,n,t,o,i,r,a,s){var d,l="function"==typeof e?e.options:e;if(n&&(l.render=n,l.staticRenderFns=t,l._compiled=!0),o&&(l.functional=!0),r&&(l._scopeId="data-v-"+r),a?(d=function(e){(e=e||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(e=__VUE_SSR_CONTEXT__),i&&i.call(this,e),e&&e._registeredComponents&&e._registeredComponents.add(a)},l._ssrRegister=d):i&&(d=s?function(){i.call(this,(l.functional?this.parent:this).$root.$options.shadowRoot)}:i),d)if(l.functional){l._injectStyles=d;var c=l.render;l.render=function(e,n){return d.call(n),c(e,n)}}else{var m=l.beforeCreate;l.beforeCreate=m?[].concat(m,d):[d]}return{exports:e,options:l}}t.d(n,{A:()=>o})},613:e=>{function n(e){var n=new Error("Cannot find module '"+e+"'");throw n.code="MODULE_NOT_FOUND",n}n.keys=()=>[],n.resolve=n,n.id=613,e.exports=n},714:e=>{"use strict";e.exports="使用重新设计的极简首页替换原本的首页.\n\n请注意:\n- 此功能与 `清爽首页` 互斥, 请勿同时使用.\n- 此功能会禁用首页的[悬浮视频](https://github.com/the1812/Bilibili-Evolved/discussions/4404), 变为直接跳转到视频页面.\n\n选项说明:\n- 个性化推荐: 启用时展示推荐视频, 禁用时展示热门视频\n- 自定义列数: 为 `0` 时根据视图宽度推断, 大于 `0` 的值将作为固定的列数"},582:e=>{"use strict";e.exports=coreApis.componentApis.feeds.VideoCard},649:e=>{"use strict";e.exports=coreApis.componentApis.feeds.api},905:e=>{"use strict";e.exports=coreApis.settings},164:e=>{"use strict";e.exports=coreApis.ui},765:e=>{"use strict";e.exports=coreApis.utils.log},7:e=>{"use strict";e.exports=coreApis.utils.sort},847:e=>{"use strict";e.exports=coreApis.utils}},o={};function i(e){var n=o[e];if(void 0!==n)return n.exports;var r=o[e]={id:e,exports:{}};return t[e](r,r.exports,i),r.exports}i.n=e=>{var n=e&&e.__esModule?()=>e.default:()=>e;return i.d(n,{a:n}),n},n=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,i.t=function(t,o){if(1&o&&(t=this(t)),8&o)return t;if("object"==typeof t&&t){if(4&o&&t.__esModule)return t;if(16&o&&"function"==typeof t.then)return t}var r=Object.create(null);i.r(r);var a={};e=e||[null,n({}),n([]),n(n)];for(var s=2&o&&t;"object"==typeof s&&!~e.indexOf(s);s=n(s))Object.getOwnPropertyNames(s).forEach((e=>a[e]=()=>t[e]));return a.default=()=>t,i.d(r,a),r},i.d=(e,n)=>{for(var t in n)i.o(n,t)&&!i.o(e,t)&&Object.defineProperty(e,t,{enumerable:!0,get:n[t]})},i.o=(e,n)=>Object.prototype.hasOwnProperty.call(e,n),i.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.nc=void 0;var r={};return(()=>{"use strict";i.d(r,{component:()=>d});const e=coreApis.componentApis.define,n=coreApis.lifeCycle;var t=i(905),o=i(847);var a=i(946);const s=(0,e.defineOptionsMetadata)({personalized:{displayName:"个性化推荐",defaultValue:!1},columnCount:{displayName:"自定义列数",defaultValue:0,validator:(0,o.getNumberValidator)(0,10)},defaultTab:{displayName:"默认标签页",defaultValue:a.L.Feeds,dropdownEnum:a.L}}),d=(0,e.defineComponentMetadata)({name:"minimalHome",displayName:"极简首页",urlInclude:[/^https:\/\/www\.bilibili\.com\/$/,/^https:\/\/www\.bilibili\.com\/index\.html$/],tags:[componentsTags.style],entry:()=>{(0,t.addComponentListener)("minimalHome.columnCount",(e=>{document.documentElement.style.setProperty("--home-column-count-override",e.toString())}),!0),(0,n.contentLoaded)((async()=>{const e=await Promise.resolve().then(i.bind(i,923)),n=(0,o.mountVueComponent)(e);document.body.appendChild(n.$el)}))},options:s,unload:()=>document.body.classList.add("home-redesign-off"),reload:()=>document.body.classList.remove("home-redesign-off"),instantStyles:[{name:"minimal-home-hide-original",style:()=>Promise.resolve().then(i.t.bind(i,16,23))}],commitHash:"549fcdb16eeb45122ceaa48017a43a573598fc1a",coreVersion:"2.10.0",description:(()=>{const e=i(613);return{...Object.fromEntries(e.keys().map((n=>[n.match(/index\.(.+)\.md$/)[1],e(n)]))),"zh-CN":()=>Promise.resolve().then(i.t.bind(i,714,17)).then((e=>e.default))}})()})})(),r=r.component})()));