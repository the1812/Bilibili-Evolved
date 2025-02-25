!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["feeds/del-feeds"]=t():e["feeds/del-feeds"]=t()}(globalThis,(()=>(()=>{var e,t,o={625:(e,t,o)=>{"use strict";o.r(t),o.d(t,{default:()=>f});var i=function(){var e=this,t=e._self._c;e._self._setupProxy;return t("div",{staticClass:"multiple-widgets"},e._l(e.items,(function(o){return t("DefaultWidget",{key:o.name,attrs:{disabled:o.disabled,"data-name":o.name,name:o.displayName,icon:o.icon},on:{click:function(t){return e.runItemAction(o,t)}}})})),1)};i._withStripped=!0;const n=coreApis.ui,r=coreApis.ajax,s=coreApis.toast;var a=o(605);const d=coreApis.pluginApis.data,c=[{name:"del-all-feeds",displayName:"删除所有动态",icon:"mdi-delete",action:async()=>{const{forEachFeedsCard:e}=await Promise.resolve().then(o.t.bind(o,799,23));s.Toast.info("如果想删除所有动态, 可以一直下拉页面到没有动态为止","删除动态",3e3),await e({added:async e=>{const t={dyn_id_str:e.id,dyn_type:e.type.id,rid_str:e.id},o=JSON.parse(await(0,r.postJsonWithCredentials)(`https://api.bilibili.com/x/dynamic/feed/operate/remove?platform=web&csrf=${(0,a.getCsrf)()}`,t));0===o.code?console.info("删除动态成功: ",e.id):console.info("删除动态失败: ",e.id,o)}}),s.Toast.success("打开控制台查看删除动态结果","删除动态",3e3)}},{name:"del-feeds",displayName:"删除转发抽奖动态",icon:"mdi-delete",action:async()=>{const{forEachFeedsCard:e}=await Promise.resolve().then(o.t.bind(o,799,23));s.Toast.info("如果想删除所有动态, 可以一直下拉页面到没有动态为止","删除动态",3e3),await e({added:async e=>{const{isRepostType:t}=await Promise.resolve().then(o.t.bind(o,799,23));if(t(e)){const t=(0,a.getUID)(),o=await(0,r.getJsonWithCredentials)(`https://api.vc.bilibili.com/lottery_svr/v2/lottery_svr/lottery_notice?dynamic_id=${e.repostId}`);if(o.data.lottery_time&&o.data.lottery_time>Date.now()/1e3)return;if(0===o.code){for(let i=0;i<o.data.lottery_result.first_prize_result.length;i++)if(o.data.lottery_result.first_prize_result[i].uid===Number(t))return void s.Toast.info(`居然中奖了, 不能接受😭😭😭, 动态ID: ${e.id}`,"删除动态",1e4);const i={dyn_id_str:e.id,dyn_type:e.type.id,rid_str:e.id},n=JSON.parse(await(0,r.postJsonWithCredentials)(`https://api.bilibili.com/x/dynamic/feed/operate/remove?platform=web&csrf=${(0,a.getCsrf)()}`,i));0===n.code?console.info("删除动态成功: ",e.id):console.info("删除动态失败: ",e.id,n)}}}}),s.Toast.success("打开控制台查看删除动态结果","删除动态",3e3)}}],[l]=(0,d.registerAndGetData)("deleteFeeds.items",c);var p=function(e,t,o,i,n,r,s,a){var d,c="function"==typeof e?e.options:e;if(t&&(c.render=t,c.staticRenderFns=o,c._compiled=!0),i&&(c.functional=!0),r&&(c._scopeId="data-v-"+r),s?(d=function(e){(e=e||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(e=__VUE_SSR_CONTEXT__),n&&n.call(this,e),e&&e._registeredComponents&&e._registeredComponents.add(s)},c._ssrRegister=d):n&&(d=a?function(){n.call(this,(c.functional?this.parent:this).$root.$options.shadowRoot)}:n),d)if(c.functional){c._injectStyles=d;var l=c.render;c.render=function(e,t){return d.call(t),l(e,t)}}else{var p=c.beforeCreate;c.beforeCreate=p?[].concat(p,d):[d]}return{exports:e,options:c}}(Vue.extend({components:{DefaultWidget:n.DefaultWidget},data:()=>({items:l}),methods:{async runItemAction(e,t){try{this.$set(e,"disabled",!0);const o=this.$el.querySelector(`[data-name='${e.name}']`);await e.action(o,t)}finally{e.disabled=!1}}}}),i,[],!1,null,null,null);const f=p.exports},393:e=>{function t(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=393,e.exports=t},885:e=>{"use strict";e.exports="删除动态, 可选转发抽奖, 和全部删除.\n"},799:e=>{"use strict";e.exports=coreApis.componentApis.feeds.api},605:e=>{"use strict";e.exports=coreApis.utils}},i={};function n(e){var t=i[e];if(void 0!==t)return t.exports;var r=i[e]={exports:{}};return o[e](r,r.exports,n),r.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,n.t=function(o,i){if(1&i&&(o=this(o)),8&i)return o;if("object"==typeof o&&o){if(4&i&&o.__esModule)return o;if(16&i&&"function"==typeof o.then)return o}var r=Object.create(null);n.r(r);var s={};e=e||[null,t({}),t([]),t(t)];for(var a=2&i&&o;"object"==typeof a&&!~e.indexOf(a);a=t(a))Object.getOwnPropertyNames(a).forEach((e=>s[e]=()=>o[e]));return s.default=()=>o,n.d(r,s),r},n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var r={};return(()=>{"use strict";n.d(r,{component:()=>o});const e=coreApis.componentApis.define;var t=n(605);const o=(0,e.defineComponentMetadata)({name:"deleteFeeds",displayName:"删除动态",tags:[componentsTags.feeds],description:{"zh-CN":"删除动态, 可选转发抽奖(不会删除自己中奖的动态), 和全部删除."},entry:none,urlInclude:[`https://space.bilibili.com/${(0,t.getUID)()}/dynamic`],widget:{component:()=>Promise.resolve().then(n.bind(n,625)).then((e=>e.default))},commitHash:"2071c502cb2c27bb86cb0f79c62e6f1f029dd921",coreVersion:"2.9.6",description:(()=>{const e=n(393);return{...Object.fromEntries(e.keys().map((t=>[t.match(/index\.(.+)\.md$/)[1],e(t)]))),"zh-CN":()=>Promise.resolve().then(n.t.bind(n,885,17)).then((e=>e.default))}})()})})(),r=r.component})()));