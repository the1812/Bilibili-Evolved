!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["video/bvid-convert"]=t():e["video/bvid-convert"]=t()}(globalThis,(()=>(()=>{var e={245:(e,t,n)=>{var i=n(218)((function(e){return e[1]}));i.push([e.id,".bvid-convert {\n  order: -1;\n  flex-direction: column;\n  border-radius: 4px;\n  padding: 6px 8px;\n  -webkit-user-select: text;\n          user-select: text;\n  box-sizing: border-box;\n  box-shadow: 0 0 0 1px rgba(136, 136, 136, 0.2666666667);\n  background-color: #fff;\n}\nbody.dark .bvid-convert {\n  background-color: #333;\n}\n.bvid-convert-item {\n  font-size: 14px;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.bvid-convert-item-copy {\n  transition: transform 0.3s ease-out;\n  cursor: pointer;\n}\n.bvid-convert-item-copy:active {\n  transform: scale(0.9);\n}",""]),e.exports=i},218:e=>{"use strict";
// eslint-disable-next-line func-names
e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var n=e(t);return t[2]?"@media ".concat(t[2]," {").concat(n,"}"):n})).join("")},
// eslint-disable-next-line func-names
t.i=function(e,n,i){"string"==typeof e&&(
// eslint-disable-next-line no-param-reassign
e=[[null,e,""]]);var o={};if(i)for(var r=0;r<this.length;r++){
// eslint-disable-next-line prefer-destructuring
var s=this[r][0];null!=s&&(o[s]=!0)}for(var a=0;a<e.length;a++){var c=[].concat(e[a]);i&&o[c[0]]||(n&&(c[2]?c[2]="".concat(n," and ").concat(c[2]):c[2]=n),t.push(c))}},t}},332:(e,t,n)=>{"use strict";var i,o=function(){return void 0===i&&(
// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
// @see https://github.com/webpack-contrib/style-loader/issues/177
i=Boolean(window&&document&&document.all&&!window.atob)),i},r=function(){var e={};return function(t){if(void 0===e[t]){var n=document.querySelector(t);if(window.HTMLIFrameElement&&n instanceof window.HTMLIFrameElement)try{n=n.contentDocument.head}catch(e){n=null}e[t]=n}return e[t]}}(),s=[];function a(e){for(var t=-1,n=0;n<s.length;n++)if(s[n].identifier===e){t=n;break}return t}function c(e,t){for(var n={},i=[],o=0;o<e.length;o++){var r=e[o],c=t.base?r[0]+t.base:r[0],d=n[c]||0,l="".concat(c," ").concat(d);n[c]=d+1;var u=a(l),p={css:r[1],media:r[2],sourceMap:r[3]};-1!==u?(s[u].references++,s[u].updater(p)):s.push({identifier:l,updater:b(p,t),references:1}),i.push(l)}return i}function d(e){var t=document.createElement("style"),i=e.attributes||{};if(void 0===i.nonce){var o=n.nc;o&&(i.nonce=o)}if(Object.keys(i).forEach((function(e){t.setAttribute(e,i[e])})),"function"==typeof e.insert)e.insert(t);else{var s=r(e.insert||"head");if(!s)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");s.appendChild(t)}return t}var l,u=(l=[],function(e,t){return l[e]=t,l.filter(Boolean).join("\n")});function p(e,t,n,i){var o=n?"":i.media?"@media ".concat(i.media," {").concat(i.css,"}"):i.css;if(e.styleSheet)e.styleSheet.cssText=u(t,o);else{var r=document.createTextNode(o),s=e.childNodes;s[t]&&e.removeChild(s[t]),s.length?e.insertBefore(r,s[t]):e.appendChild(r)}}function v(e,t,n){var i=n.css,o=n.media,r=n.sourceMap;if(o?e.setAttribute("media",o):e.removeAttribute("media"),r&&"undefined"!=typeof btoa&&(i+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(r))))," */")),e.styleSheet)e.styleSheet.cssText=i;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(i))}}var f=null,m=0;function b(e,t){var n,i,o;if(t.singleton){var r=m++;n=f||(f=d(t)),i=p.bind(null,n,r,!1),o=p.bind(null,n,r,!0)}else n=d(t),i=v.bind(null,n,t),o=function(){!function(e){if(null===e.parentNode)return!1;e.parentNode.removeChild(e)}(n)};return i(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap)return;i(e=t)}else o()}}e.exports=function(e,t){(t=t||{}).singleton||"boolean"==typeof t.singleton||(t.singleton=o());var n=c(e=e||[],t);return function(e){if(e=e||[],"[object Array]"===Object.prototype.toString.call(e)){for(var i=0;i<n.length;i++){var o=a(n[i]);s[o].references--}for(var r=c(e,t),d=0;d<n.length;d++){var l=a(n[d]);0===s[l].references&&(s[l].updater(),s.splice(l,1))}n=r}}}},940:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>w});var i=function(){var e=this,t=e._self._c;e._self._setupProxy;return t("div",{staticClass:"bvid-convert"},[e.aid?t("div",{staticClass:"bvid-convert-item"},[e._v("\n    "+e._s(e.aid)+"\n    "),t("div",{staticClass:"bvid-convert-item-copy",attrs:{title:"复制链接"},on:{click:function(t){return e.copyLink("aid")}}},[t("VIcon",{attrs:{size:16,icon:e.aidCopied?"mdi-check":"mdi-link"}})],1)]):e._e(),e._v(" "),e.bvid?t("div",{staticClass:"bvid-convert-item"},[e._v("\n    "+e._s(e.bvid)+"\n    "),t("div",{staticClass:"bvid-convert-item-copy",attrs:{title:"复制链接"},on:{click:function(t){return e.copyLink("bvid")}}},[t("VIcon",{attrs:{size:16,icon:e.bvidCopied?"mdi-check":"mdi-link"}})],1)]):e._e()])};i._withStripped=!0;const o=coreApis.observer,r=coreApis.settings;var s=n(200);const a=coreApis.utils,c=coreApis.utils.title;var d=n(457);const l=coreApis.ui,{options:u}=(0,r.getComponentSettings)("bvidConvert");var p=function(e){return e.Aid="aid",e.Bvid="bvid",e}(p||{});const v=[p.Aid,p.Bvid],f=[e=>{let{id:t,query:n}=e;return v.some((e=>n.includes(`${e}=`)))?`https://www.bilibili.com/video/${t}`:null},e=>{let{id:t}=e;return d.bangumiUrls.some((e=>(0,a.matchUrlPattern)(e)))?`https://www.bilibili.com/video/${t}`:null},e=>{let{id:t,query:n}=e;const i=new URLSearchParams(n),o=new URLSearchParams;for(const e of["p","t"]){const t=i.get(e);t&&o.set(e,t)}return`https://www.bilibili.com/video/${t}${o.size>0?`?${o.toString()}`:""}`}],m=Vue.extend({components:{VIcon:l.VIcon},data:()=>({aid:"",aidCopied:!1,bvid:"",bvidCopied:!1}),async mounted(){(0,o.videoChange)((async()=>{this.aid=`av${unsafeWindow.aid}`,this.bvid=unsafeWindow.bvid;const e=await(0,s.select)(".av-link,.bv-link,.bvid-link");e&&(this.bvid=e.innerHTML.trim())}))},methods:{async copyLink(e){if(this[`${e}Copied`])return;const t={query:location.search,url:location.origin+location.pathname,id:this[e]},n=f.map((e=>e(t))).filter((e=>null!==e))[0];u.copyWithTitle?await navigator.clipboard.writeText(`${(0,c.getFriendlyTitle)()} ${n}`):await navigator.clipboard.writeText(n),this[`${e}Copied`]=!0,setTimeout((()=>this[`${e}Copied`]=!1),1e3)}}});var b=n(332),h=n.n(b),y=n(245),g=n.n(y),x={insert:"head",singleton:!1};h()(g(),x);g().locals;var C=function(e,t,n,i,o,r,s,a){var c,d="function"==typeof e?e.options:e;if(t&&(d.render=t,d.staticRenderFns=n,d._compiled=!0),i&&(d.functional=!0),r&&(d._scopeId="data-v-"+r),s?(c=function(e){(e=e||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(e=__VUE_SSR_CONTEXT__),o&&o.call(this,e),e&&e._registeredComponents&&e._registeredComponents.add(s)},d._ssrRegister=c):o&&(c=a?function(){o.call(this,(d.functional?this.parent:this).$root.$options.shadowRoot)}:o),c)if(d.functional){d._injectStyles=c;var l=d.render;d.render=function(e,t){return c.call(t),l(e,t)}}else{var u=d.beforeCreate;d.beforeCreate=u?[].concat(u,c):[c]}return{exports:e,options:d}}(m,i,[],!1,null,null,null);const w=C.exports},200:e=>{"use strict";e.exports=coreApis.spinQuery},457:e=>{"use strict";e.exports=coreApis.utils.urls}},t={};function n(i){var o=t[i];if(void 0!==o)return o.exports;var r=t[i]={id:i,exports:{}};return e[i](r,r.exports,n),r.exports}n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var i in t)n.o(t,i)&&!n.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var i={};return(()=>{"use strict";n.d(i,{component:()=>s});const e=coreApis.componentApis.define;var t=n(200),o=n(457);const r=(0,e.defineOptionsMetadata)({copyWithTitle:{defaultValue:!1,displayName:"复制链接时带上标题"}}),s=(0,e.defineComponentMetadata)({name:"bvidConvert",displayName:"BV 号转换",options:r,entry:none,description:{"zh-CN":"在功能面板中显示视频的 AV 号和 BV 号."},tags:[componentsTags.video,componentsTags.utils],widget:{component:()=>Promise.resolve().then(n.bind(n,940)).then((e=>e.default)),condition:t.hasVideo},urlInclude:o.videoAndBangumiUrls,commitHash:"99743eecf82280666cde8b64af6a660babc70153",coreVersion:"2.9.2"})})(),i=i.component})()));