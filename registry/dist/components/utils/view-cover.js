!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["utils/view-cover"]=t():e["utils/view-cover"]=t()}(globalThis,(()=>(()=>{var e={479:(e,t,n)=>{var o=n(955)((function(e){return e[1]}));o.push([e.id,".download-cover-config.download-video-config-section .be-dropdown {\n  text-transform: uppercase;\n}",""]),e.exports=o},955:e=>{"use strict";
// eslint-disable-next-line func-names
e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var n=e(t);return t[2]?"@media ".concat(t[2]," {").concat(n,"}"):n})).join("")},
// eslint-disable-next-line func-names
t.i=function(e,n,o){"string"==typeof e&&(
// eslint-disable-next-line no-param-reassign
e=[[null,e,""]]);var i={};if(o)for(var r=0;r<this.length;r++){
// eslint-disable-next-line prefer-destructuring
var a=this[r][0];null!=a&&(i[a]=!0)}for(var s=0;s<e.length;s++){var c=[].concat(e[s]);o&&i[c[0]]||(n&&(c[2]?c[2]="".concat(n," and ").concat(c[2]):c[2]=n),t.push(c))}},t}},991:(e,t,n)=>{"use strict";var o,i=function(){return void 0===o&&(
// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
// @see https://github.com/webpack-contrib/style-loader/issues/177
o=Boolean(window&&document&&document.all&&!window.atob)),o},r=function(){var e={};return function(t){if(void 0===e[t]){var n=document.querySelector(t);if(window.HTMLIFrameElement&&n instanceof window.HTMLIFrameElement)try{n=n.contentDocument.head}catch(e){n=null}e[t]=n}return e[t]}}(),a=[];function s(e){for(var t=-1,n=0;n<a.length;n++)if(a[n].identifier===e){t=n;break}return t}function c(e,t){for(var n={},o=[],i=0;i<e.length;i++){var r=e[i],c=t.base?r[0]+t.base:r[0],d=n[c]||0,l="".concat(c," ").concat(d);n[c]=d+1;var u=s(l),p={css:r[1],media:r[2],sourceMap:r[3]};-1!==u?(a[u].references++,a[u].updater(p)):a.push({identifier:l,updater:h(p,t),references:1}),o.push(l)}return o}function d(e){var t=document.createElement("style"),o=e.attributes||{};if(void 0===o.nonce){var i=n.nc;i&&(o.nonce=i)}if(Object.keys(o).forEach((function(e){t.setAttribute(e,o[e])})),"function"==typeof e.insert)e.insert(t);else{var a=r(e.insert||"head");if(!a)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");a.appendChild(t)}return t}var l,u=(l=[],function(e,t){return l[e]=t,l.filter(Boolean).join("\n")});function p(e,t,n,o){var i=n?"":o.media?"@media ".concat(o.media," {").concat(o.css,"}"):o.css;if(e.styleSheet)e.styleSheet.cssText=u(t,i);else{var r=document.createTextNode(i),a=e.childNodes;a[t]&&e.removeChild(a[t]),a.length?e.insertBefore(r,a[t]):e.appendChild(r)}}function f(e,t,n){var o=n.css,i=n.media,r=n.sourceMap;if(i?e.setAttribute("media",i):e.removeAttribute("media"),r&&"undefined"!=typeof btoa&&(o+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(r))))," */")),e.styleSheet)e.styleSheet.cssText=o;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(o))}}var v=null,m=0;function h(e,t){var n,o,i;if(t.singleton){var r=m++;n=v||(v=d(t)),o=p.bind(null,n,r,!1),i=p.bind(null,n,r,!0)}else n=d(t),o=f.bind(null,n,t),i=function(){!function(e){if(null===e.parentNode)return!1;e.parentNode.removeChild(e)}(n)};return o(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap)return;o(e=t)}else i()}}e.exports=function(e,t){(t=t||{}).singleton||"boolean"==typeof t.singleton||(t.singleton=i());var n=c(e=e||[],t);return function(e){if(e=e||[],"[object Array]"===Object.prototype.toString.call(e)){for(var o=0;o<n.length;o++){var i=s(n[o]);a[i].references--}for(var r=c(e,t),d=0;d<n.length;d++){var l=s(n[d]);0===a[l].references&&(a[l].updater(),a.splice(l,1))}n=r}}}},712:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>f});var o=function(){var e=this,t=e._self._c;e._self._setupProxy;return t("div",{staticClass:"download-cover-config download-video-config-section"},[t("div",{staticClass:"download-video-config-item"},[t("div",{staticClass:"download-video-config-title"},[e._v("封面:")]),e._v(" "),t("VDropdown",{attrs:{items:e.items},scopedSlots:e._u([{key:"item",fn:function({item:t}){return[e._v("\n        "+e._s(t)+"\n      ")]}}]),model:{value:e.type,callback:function(t){e.type=t},expression:"type"}})],1)])};o._withStripped=!0;const i=coreApis.settings;var r=n(164);const{options:a}=(0,i.getComponentSettings)("downloadVideo"),s=Vue.extend({components:{VDropdown:r.VDropdown},data:()=>({type:a.CoverType??"无",items:["无","jpg"]}),computed:{enabled(){return"无"!==this.type}},watch:{type(e){a.CoverType=e}}});var c=n(991),d=n.n(c),l=n(479),u=n.n(l),p={insert:"head",singleton:!1};d()(u(),p);u().locals;const f=(0,n(678).A)(s,o,[],!1,null,null,null).exports},29:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>l});var o=function(){var e=this,t=e._self._c;e._self._setupProxy;return t("DefaultWidget",{staticClass:"view-cover",attrs:{disabled:!e.imageUrl,name:"查看封面",icon:"mdi-image-outline"},on:{click:function(t){return e.viewCover()}}})};o._withStripped=!0;var i=n(341);const r=coreApis.ajax,a=coreApis.observer,s=coreApis.spinQuery;var c=n(164);const d=Vue.extend({components:{DefaultWidget:c.DefaultWidget},data:()=>({imageUrl:""}),async mounted(){if(document.URL.includes("live.bilibili.com")){const e=".header-info-ctnr .room-cover, .header-info-ctnr .avatar",t=await(0,s.select)(e);if(!t)return;const n=t.getAttribute("href").match(/space\.bilibili\.com\/([\d]+)/);if(n&&n[1]){const e=`https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid=${n[1]}`,t=await(0,r.getJson)(e);this.imageUrl=t.data.cover.replace("http:","https:")}}else(0,a.videoChange)((async()=>{const{aid:e}=unsafeWindow;this.imageUrl=await(0,i.getVideoCoverUrlByAid)(e)}))},methods:{async viewCover(){(0,c.showImage)(this.imageUrl)}}});const l=(0,n(678).A)(d,o,[],!1,null,null,null).exports},678:(e,t,n)=>{"use strict";function o(e,t,n,o,i,r,a,s){var c,d="function"==typeof e?e.options:e;if(t&&(d.render=t,d.staticRenderFns=n,d._compiled=!0),o&&(d.functional=!0),r&&(d._scopeId="data-v-"+r),a?(c=function(e){(e=e||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(e=__VUE_SSR_CONTEXT__),i&&i.call(this,e),e&&e._registeredComponents&&e._registeredComponents.add(a)},d._ssrRegister=c):i&&(c=s?function(){i.call(this,(d.functional?this.parent:this).$root.$options.shadowRoot)}:i),c)if(d.functional){d._injectStyles=c;var l=d.render;d.render=function(e,t){return c.call(t),l(e,t)}}else{var u=d.beforeCreate;d.beforeCreate=u?[].concat(u,c):[c]}return{exports:e,options:d}}n.d(t,{A:()=>o})},341:e=>{"use strict";e.exports=coreApis.componentApis.video.videoCover},164:e=>{"use strict";e.exports=coreApis.ui}},t={};function n(o){var i=t[o];if(void 0!==i)return i.exports;var r=t[o]={id:o,exports:{}};return e[o](r,r.exports,n),r.exports}n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.nc=void 0;var o={};return(()=>{"use strict";n.d(o,{component:()=>a});const e=coreApis.componentApis.define;var t=n(341);const i=coreApis.utils.urls,r=coreApis.toast,a=(0,e.defineComponentMetadata)({name:"viewCover",displayName:"查看封面",tags:[componentsTags.utils,componentsTags.video],entry:none,reload:none,unload:none,plugin:{displayName:"下载视频 - 下载封面支持",setup:e=>{let{addData:o}=e;o("downloadVideo.assets",(async e=>{e.push({name:"downloadCover",displayName:"下载封面",getAssets:async(e,n)=>{const{type:o,enabled:i}=n;if(!i)return[];const a=r.Toast.info("获取封面中...","下载封面");let s=0;const c=await Promise.allSettled(e.map((async n=>{const i=await(0,t.getBlobByAid)(n.input.aid);return s++,a.message=`获取封面中... (${s}/${e.length})`,{name:`${n.input.title}.${o}`,data:i}}))),d=c.filter((e=>"fulfilled"===e.status)),l=c.filter((e=>"rejected"===e.status));return a.message=`获取完成. 成功 ${d.length} 个, 失败 ${l.length} 个.`,d.map((e=>e.value))},getUrls:async(e,n)=>{const{type:o,enabled:i}=n;return i?Promise.all(e.map((async e=>({name:`${e.input.title}.${o}`,url:await(0,t.getVideoCoverUrlByAid)(e.input.aid)})))):[]},component:()=>Promise.resolve().then(n.bind(n,712)).then((e=>e.default))})}))}},widget:{component:()=>Promise.resolve().then(n.bind(n,29)).then((e=>e.default))},description:{"zh-CN":"在视频页面中, 可从功能面板中查看封面."},urlInclude:[...i.videoAndBangumiUrls],commitHash:"cc0f1cc2b4f41de30c71f526545bedb8f6371291",coreVersion:"2.10.0"})})(),o=o.component})()));