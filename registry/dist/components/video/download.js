!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["video/download"]=t():e["video/download"]=t()}(globalThis,(()=>(()=>{var e,t,i={495:(e,t,i)=>{"use strict";i.d(t,{_i:()=>p,o1:()=>x,Ld:()=>w,JV:()=>b,SS:()=>y});var n=i(375),o=i(605);const s=coreApis.utils.sort;var a=i(391),r=i(457),d=i(991),l=i(205),c=i(496),u=i(986);const p={video:".mp4",audio:".m4a",flacAudio:".flac"};let h=function(e){return e.Avc="AVC/H.264",e.Hevc="HEVC/H.265",e.Av1="AV1",e}({});const f=e=>{const{options:t}=(0,u.getComponentSettings)("downloadVideo");return"video"===e?t.dashVideoExtension:"audio"===e?t.dashAudioExtension:"flacAudio"===e?t.dashFlacAudioExtension:p[e]??".m4s"},m=e=>({url:e.downloadUrl,backupUrls:e.backupUrls,length:e.duration,size:Math.trunc(e.bandWidth*e.duration/8),extension:f(e.type)}),v=e=>{const{videoDashes:t,audioDashes:i,videoCodec:n}=e,o=[];if(0!==t.length){const e=e=>e.videoCodec===n;if(t.some(e)){const i=t.filter(e).sort((0,s.ascendingSort)((e=>e.bandWidth)))[0];o.push(m(i))}else o.push(m(t.sort((0,s.ascendingSort)((e=>e.bandWidth)))[0]))}if(0!==i.length){const e=i.sort((0,s.descendingSort)((e=>e.bandWidth)))[0];o.push(m(e))}return o},g=async function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};const{codec:i=h.Avc,filters:s}=t,u={video:()=>!0,audio:()=>!0,...s},{aid:p,cid:f,quality:m}=e,g={avid:p,cid:f,qn:m?.value??"",otype:"json",fourk:1,fnver:0,fnval:4048},b=r.bangumiUrls.some((e=>(0,o.matchUrlPattern)(e))),y=b?(0,c.l)((0,o.formData)(g)):(0,c.s)((0,o.formData)(g)),w=await(0,n.bilibiliApi)((0,n.getJsonWithCredentials)(y),"获取视频链接失败");if(!w.dash)throw new Error("此视频没有 dash 格式, 请改用其他格式.");const x=a.allQualities.find((e=>e.value===w.quality)),{duration:_,video:k,audio:I,dolby:C,flac:A}=w.dash,V=e=>{switch(e){case 12:return h.Hevc;case 13:return h.Av1;default:return h.Avc}},S=k.filter((e=>e.id===x.value)).map((e=>({type:"video",videoCodec:V(e.codecid),quality:x,width:e.width,height:e.height,codecs:e.codecs,codecId:e.codecid,bandWidth:e.bandwidth,frameRate:e.frameRate,backupUrls:(e.backupUrl||e.backup_url||[]).map((e=>e.replace("http:","https:"))),downloadUrl:(e.baseUrl||e.base_url||"").replace("http:","https:"),duration:_}))).filter((e=>u.video(e))),D=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"audio";return{type:t,bandWidth:e.bandwidth,codecs:e.codecs,codecId:e.codecid??0,backupUrls:(e.backupUrl||e.backup_url||[]).map((e=>e.replace("http:","https:"))),downloadUrl:(e.baseUrl||e.base_url||"").replace("http:","https:"),duration:_}},E=(I||[]).map((e=>D(e))).filter((e=>u.audio(e)));C&&E.push(...C.audio?.map((e=>D(e)))??[]),A&&E.push(...A.audio?[D(A.audio,"flacAudio")]:[]);const O=v({audioDashes:E,videoDashes:S,videoCodec:i}),U=w.accept_quality.map((e=>a.allQualities.find((t=>t.value===e)))).filter((e=>void 0!==e)),T=new l.c({input:e,jsonData:w,fragments:O,qualities:U,currentQuality:x});return(0,d.c)(e,T),T},b={name:"video.dash.avc",displayName:"dash (AVC/H.264)",description:"音画分离的 mp4 格式, 编码为 H.264, 体积较大, 兼容性较好. 下载后可以合并为单个 mp4 文件. 如果视频源没有此编码, 则会自动选择其他同清晰度的编码格式.",downloadVideoInfo:async e=>g(e,{codec:h.Avc})},y={name:"video.dash.hevc",displayName:"dash (HEVC/H.265)",description:"音画分离的 mp4 格式, 编码为 H.265, 体积中等, 兼容性较差. 下载后可以合并为单个 mp4 文件. 如果视频源没有此编码, 则会自动选择其他同清晰度的编码格式.",downloadVideoInfo:async e=>g(e,{codec:h.Hevc})},w={name:"video.dash.av1",displayName:"dash (AV1)",description:"音画分离的 mp4 格式, 编码为 AV1, 体积较小, 兼容性中等. 下载后可以合并为单个 mp4 文件. 如果视频源没有此编码, 则会自动选择其他同清晰度的编码格式.",downloadVideoInfo:async e=>g(e,{codec:h.Av1})},x={name:"video.dash.audio",displayName:"dash (仅音频)",description:"仅下载视频中的音频轨道.",downloadVideoInfo:async e=>g(e,{filters:{video:()=>!1}})}},496:(e,t,i)=>{"use strict";i.d(t,{l:()=>o,s:()=>n});const n=e=>`https://api.bilibili.com/x/player/playurl?${e}`,o=e=>`https://api.bilibili.com/pgc/player/web/playurl?${e}`},991:(e,t,i)=>{"use strict";i.d(t,{c:()=>o});var n=i(391);const o=(e,t)=>{e.quality&&t.currentQuality.value!==e.quality.value&&(e.allowQualityDrop?console.warn(`'${e.title}' 不支持选择的清晰度${e.quality.displayName}, 已降级为${t.currentQuality.displayName}`):(e=>{if(n.vipRequiredQualities.find((t=>t.value===e)))throw new Error("您选择的清晰度需要大会员, 请更改清晰度后重试.");if(n.loginRequiredQualities.find((t=>t.value===e)))throw new Error("您选择的清晰度需要先登录.");throw new Error("获取下载链接失败, 请尝试更换清晰度或更换格式.")})(e.quality.value))}},205:(e,t,i)=>{"use strict";i.d(t,{u:()=>d,c:()=>r});const n=coreApis.download;var o=i(289),s=i(674);function a(e,t,i){return(t=function(e){var t=function(e,t){if("object"!=typeof e||null===e)return e;var i=e[Symbol.toPrimitive];if(void 0!==i){var n=i.call(e,t||"default");if("object"!=typeof n)return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==typeof t?t:String(t)}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}class r{constructor(e){a(this,"input",void 0),a(this,"fragments",void 0),a(this,"qualities",void 0),a(this,"currentQuality",void 0),a(this,"jsonData",void 0),Object.assign(this,e)}get totalSize(){return lodash.sumBy(this.fragments,(e=>e.size))}get totalLength(){return lodash.sumBy(this.fragments,(e=>e.length))}get titledFragments(){return this.fragments.map(((e,t)=>{const i=this.fragments.filter((t=>t.extension===e.extension)).length>1?` - ${(0,o.formatNumber)(t+1,this.fragments.length)}`:"";return{...e,title:`${this.input.title}${i}${e.extension}`}}))}}class d{constructor(e){this.infos=e,a(this,"inputs",[]),a(this,"extraAssets",[]),a(this,"extraOnlineAssets",[]),this.inputs=e.map((e=>e.input))}get isSingleVideo(){return this.inputs.length<2}async downloadExtraAssets(){console.log("[downloadExtraAssets]",this.extraAssets);const e=`${(0,s.getFriendlyTitle)(!1)}.zip`,{infos:t}=this,i=(await Promise.all([...this.extraAssets,...this.extraOnlineAssets].map((e=>{let{asset:i,instance:n}=e;return i.getAssets(t,n)})))).flat();await new n.DownloadPackage(i).emit(e)}}},571:(e,t,i)=>{var n=i(218)((function(e){return e[1]}));n.push([e.id,".download-video-panel {\n  background-color: #fff;\n  color: black;\n  border-radius: 8px;\n  border: 1px solid rgba(136, 136, 136, 0.1333333333);\n  box-sizing: border-box;\n  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);\n  font-size: 12px;\n  padding: 6px;\n  top: 100px;\n  left: 50%;\n  transform: translateX(-50%) scale(0.95);\n  transition: 0.2s ease-out;\n  z-index: 1000;\n  width: 320px;\n  height: calc(100vh - 200px);\n  display: flex;\n  flex-direction: column;\n}\nbody.dark .download-video-panel {\n  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.2);\n}\nbody.dark .download-video-panel {\n  background-color: #282828;\n  color: #eee;\n}\n.download-video-panel.open {\n  transform: translateX(-50%);\n}\n.download-video-panel .be-textbox,\n.download-video-panel .be-textarea {\n  flex-grow: 1;\n}\n.download-video-panel-header {\n  display: flex;\n  align-items: center;\n  border-bottom: 1px solid rgba(136, 136, 136, 0.1333333333);\n  padding: 6px 0;\n  margin: 0 6px;\n}\n.download-video-panel-header .title {\n  font-size: 16px;\n  font-weight: 600;\n  flex-grow: 1;\n  margin: 0 8px;\n}\n.download-video-panel-header .be-button {\n  padding: 4px;\n}\n.download-video-panel-content {\n  overflow: auto;\n  scrollbar-width: none !important;\n  overscroll-behavior: contain;\n  display: flex;\n  align-items: stretch;\n  flex-direction: column;\n  flex: 1 0 0;\n  padding: 12px 6px;\n  align-items: flex-start;\n}\n.download-video-panel-content::-webkit-scrollbar {\n  height: 0 !important;\n  width: 0 !important;\n}\n.download-video-panel-content > :not(:first-child) {\n  margin-top: 12px;\n}\n.download-video-panel .download-video-config-item {\n  display: flex;\n  align-items: center;\n}\n.download-video-panel .download-video-config-item .download-video-config-title {\n  margin-right: 8px;\n}\n.download-video-panel .download-video-config-item.error {\n  color: #e57373;\n}\n.download-video-panel .download-video-config-section {\n  align-self: stretch;\n}\n.download-video-panel .download-video-config-description {\n  color: rgba(136, 136, 136, 0.8666666667);\n  margin-top: 4px;\n}\n.download-video-panel .download-video-config-description a {\n  color: var(--theme-color-70);\n}\n.download-video-panel-footer {\n  display: flex;\n  align-items: center;\n  border-top: 1px solid rgba(136, 136, 136, 0.1333333333);\n  padding: 6px 0;\n  margin: 0 6px;\n  justify-content: center;\n}\n.download-video-panel .run-download {\n  font-size: 13px;\n  padding: 6px 12px;\n}",""]),e.exports=n},639:(e,t,i)=>{var n=i(218)((function(e){return e[1]}));n.push([e.id,".episodes-picker-header {\n  display: flex;\n  align-items: center;\n}\n.episodes-picker-checked-ratio {\n  flex-grow: 1;\n  margin-left: 4px;\n}\n.episodes-picker-actions {\n  display: flex;\n  align-items: center;\n}\n.episodes-picker-actions .be-button {\n  padding: 4px;\n}\n.episodes-picker-actions .be-button.invert-selection .be-icon {\n  font-size: 14px;\n}\n.episodes-picker-actions .be-button.select-all .be-icon, .episodes-picker-actions .be-button.deselect-all .be-icon {\n  transform: translateY(1px);\n}\n.episodes-picker-items {\n  max-height: 400px;\n  overflow: auto;\n}\n.episodes-picker-items:not(:empty) {\n  margin-top: 4px;\n  border: 1px solid rgba(136, 136, 136, 0.2666666667);\n  border-radius: 6px;\n}\n.episodes-picker-items .be-check-box {\n  padding: 2px 6px;\n}\n.episodes-picker-items .episode-duration {\n  margin-right: 4px;\n  text-align: right;\n  flex: 1 1 0;\n  opacity: 0.5;\n}\n.episodes-picker-empty {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 4px 0;\n}",""]),e.exports=n},947:(e,t,i)=>{var n=i(218)((function(e){return e[1]}));n.push([e.id,".single-video-info.download-video-config-section {\n  position: relative;\n  height: 125px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.single-video-info.download-video-config-section img {\n  height: 125px;\n  object-fit: contain;\n  border-radius: 8px;\n}\n.single-video-info.download-video-config-section img.shadow {\n  position: absolute;\n  filter: blur(8px) brightness(0.8);\n  transform: scaleY(0.95) translateY(4px);\n  z-index: -1;\n  opacity: 0.3;\n}",""]),e.exports=n},218:e=>{"use strict";
// eslint-disable-next-line func-names
e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var i=e(t);return t[2]?"@media ".concat(t[2]," {").concat(i,"}"):i})).join("")},
// eslint-disable-next-line func-names
t.i=function(e,i,n){"string"==typeof e&&(
// eslint-disable-next-line no-param-reassign
e=[[null,e,""]]);var o={};if(n)for(var s=0;s<this.length;s++){
// eslint-disable-next-line prefer-destructuring
var a=this[s][0];null!=a&&(o[a]=!0)}for(var r=0;r<e.length;r++){var d=[].concat(e[r]);n&&o[d[0]]||(i&&(d[2]?d[2]="".concat(i," and ").concat(d[2]):d[2]=i),t.push(d))}},t}},332:(e,t,i)=>{"use strict";var n,o=function(){return void 0===n&&(
// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
// @see https://github.com/webpack-contrib/style-loader/issues/177
n=Boolean(window&&document&&document.all&&!window.atob)),n},s=function(){var e={};return function(t){if(void 0===e[t]){var i=document.querySelector(t);if(window.HTMLIFrameElement&&i instanceof window.HTMLIFrameElement)try{i=i.contentDocument.head}catch(e){i=null}e[t]=i}return e[t]}}(),a=[];function r(e){for(var t=-1,i=0;i<a.length;i++)if(a[i].identifier===e){t=i;break}return t}function d(e,t){for(var i={},n=[],o=0;o<e.length;o++){var s=e[o],d=t.base?s[0]+t.base:s[0],l=i[d]||0,c="".concat(d," ").concat(l);i[d]=l+1;var u=r(c),p={css:s[1],media:s[2],sourceMap:s[3]};-1!==u?(a[u].references++,a[u].updater(p)):a.push({identifier:c,updater:v(p,t),references:1}),n.push(c)}return n}function l(e){var t=document.createElement("style"),n=e.attributes||{};if(void 0===n.nonce){var o=i.nc;o&&(n.nonce=o)}if(Object.keys(n).forEach((function(e){t.setAttribute(e,n[e])})),"function"==typeof e.insert)e.insert(t);else{var a=s(e.insert||"head");if(!a)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");a.appendChild(t)}return t}var c,u=(c=[],function(e,t){return c[e]=t,c.filter(Boolean).join("\n")});function p(e,t,i,n){var o=i?"":n.media?"@media ".concat(n.media," {").concat(n.css,"}"):n.css;if(e.styleSheet)e.styleSheet.cssText=u(t,o);else{var s=document.createTextNode(o),a=e.childNodes;a[t]&&e.removeChild(a[t]),a.length?e.insertBefore(s,a[t]):e.appendChild(s)}}function h(e,t,i){var n=i.css,o=i.media,s=i.sourceMap;if(o?e.setAttribute("media",o):e.removeAttribute("media"),s&&"undefined"!=typeof btoa&&(n+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(s))))," */")),e.styleSheet)e.styleSheet.cssText=n;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(n))}}var f=null,m=0;function v(e,t){var i,n,o;if(t.singleton){var s=m++;i=f||(f=l(t)),n=p.bind(null,i,s,!1),o=p.bind(null,i,s,!0)}else i=l(t),n=h.bind(null,i,t),o=function(){!function(e){if(null===e.parentNode)return!1;e.parentNode.removeChild(e)}(i)};return n(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap)return;n(e=t)}else o()}}e.exports=function(e,t){(t=t||{}).singleton||"boolean"==typeof t.singleton||(t.singleton=o());var i=d(e=e||[],t);return function(e){if(e=e||[],"[object Array]"===Object.prototype.toString.call(e)){for(var n=0;n<i.length;n++){var o=r(i[n]);a[o].references--}for(var s=d(e,t),l=0;l<i.length;l++){var c=r(i[l]);0===a[c].references&&(a[c].updater(),a.splice(c,1))}i=s}}}},572:(e,t,i)=>{"use strict";i.r(t),i.d(t,{default:()=>J});var n=function(){var e=this,t=e._self._c;e._self._setupProxy;return t("VPopup",{staticClass:"download-video-panel",attrs:{fixed:"","trigger-element":e.triggerElement},model:{value:e.open,callback:function(t){e.open=t},expression:"open"}},[t("div",{staticClass:"download-video-panel-header"},[t("VIcon",{attrs:{icon:"mdi-download"}}),e._v(" "),t("div",{staticClass:"title"},[e._v("下载视频")]),e._v(" "),t("VButton",{attrs:{type:"transparent",title:"关闭"},on:{click:function(t){e.open=!1}}},[t("VIcon",{attrs:{icon:"mdi-close",size:20}})],1)],1),e._v(" "),t("div",{staticClass:"download-video-panel-content"},[e.selectedInput?t("div",{staticClass:"download-video-config-item"},[t("div",{staticClass:"download-video-config-title"},[e._v("输入源:")]),e._v(" "),t("VDropdown",{attrs:{items:e.inputs},model:{value:e.selectedInput,callback:function(t){e.selectedInput=t},expression:"selectedInput"}})],1):e._e(),e._v(" "),0===e.inputs.length?t("div",{staticClass:"download-video-config-item error"},[e._v("\n      没有匹配的输入源, 请确保安装了适合此页面的插件.\n    ")]):e._e(),e._v(" "),e.selectedInput&&e.selectedInput.component?t(e.selectedInput.component,{ref:"inputOptions",tag:"component"}):e._e(),e._v(" "),e.selectedApi?t("div",{staticClass:"download-video-config-item"},[t("div",{staticClass:"download-video-config-title"},[e._v("格式:")]),e._v(" "),t("VDropdown",{attrs:{items:e.apis},model:{value:e.selectedApi,callback:function(t){e.selectedApi=t},expression:"selectedApi"}})],1):e._e(),e._v(" "),e.selectedApi&&e.selectedApi.description?t("div",{staticClass:"download-video-config-description",domProps:{innerHTML:e._s(e.selectedApi.description)}}):e._e(),e._v(" "),e.selectedQuality?t("div",{staticClass:"download-video-config-item"},[t("div",{staticClass:"download-video-config-title"},[e._v("清晰度:")]),e._v(" "),t("VDropdown",{attrs:{items:e.filteredQualities},on:{change:function(t){return e.saveSelectedQuality()}},model:{value:e.selectedQuality,callback:function(t){e.selectedQuality=t},expression:"selectedQuality"}})],1):e._e(),e._v(" "),!e.testData.multiple&&e.selectedQuality?[e.testData.videoInfo?t("div",{staticClass:"download-video-config-description"},[e._v("\n        预计大小: "+e._s(e.formatFileSize(e.testData.videoInfo.totalSize))+"\n      ")]):e._e(),e._v(" "),null===e.testData.videoInfo?t("div",{staticClass:"download-video-config-description"},[e._v("\n        正在计算大小\n      ")]):e._e()]:e._e(),e._v(" "),t("div",{staticClass:"download-video-config-item"},[t("div",{staticClass:"download-video-config-title"},[e._v("使用备用下载地址:")]),e._v(" "),t("SwitchBox",{model:{value:e.useBackupUrls,callback:function(t){e.useBackupUrls=t},expression:"useBackupUrls"}})],1),e._v(" "),e._l(e.assetsWithOptions,(function(e){return t(e.component,{key:e.name,ref:"assetsOptions",refInFor:!0,tag:"component",attrs:{name:e.name}})})),e._v(" "),e.selectedOutput?t("div",{staticClass:"download-video-config-item"},[t("div",{staticClass:"download-video-config-title"},[e._v("输出方式:")]),e._v(" "),t("VDropdown",{attrs:{items:e.outputs},model:{value:e.selectedOutput,callback:function(t){e.selectedOutput=t},expression:"selectedOutput"}})],1):e._e(),e._v(" "),e.selectedOutput&&e.selectedOutput.description?t("div",{staticClass:"download-video-config-description",domProps:{innerHTML:e._s(e.selectedOutput.description)}}):e._e(),e._v(" "),e.selectedOutput&&e.selectedOutput.component?t(e.selectedOutput.component,{ref:"outputOptions",tag:"component"}):e._e()],2),e._v(" "),t("div",{staticClass:"download-video-panel-footer"},[t("VButton",{staticClass:"run-download",attrs:{type:"primary",disabled:!e.canStartDownload},on:{click:function(t){return e.startDownload(e.$refs.outputOptions,e.selectedOutput)}}},[e._v("\n      开始\n    ")])],1)])};n._withStripped=!0;var o=i(986),s=i(605);const a=coreApis.utils.log;var r=i(289);const d=coreApis.ui,l=coreApis.pluginApis.data;var c=i(391);const u=coreApis.toast;var p=i(674),h=i(375),f=i(457),m=function(){var e=this,t=e._self._c;e._self._setupProxy;return t("div",{staticClass:"episodes-picker download-video-config-section"},[t("div",{staticClass:"episodes-picker-header"},[t("div",{staticClass:"episodes-picker-title"},[e._v("选集:")]),e._v(" "),t("div",{staticClass:"episodes-picker-checked-ratio"},[e._v("\n      "+e._s(e.checkedRatio)+"\n    ")]),e._v(" "),t("div",{staticClass:"episodes-picker-actions"},[t("VButton",{staticClass:"select-all",attrs:{title:"全选",type:"transparent"},on:{click:function(t){e.forEachItem((e=>e.isChecked=!0))}}},[t("VIcon",{attrs:{size:16,icon:"mdi-checkbox-multiple-marked-circle"}})],1),e._v(" "),t("VButton",{staticClass:"deselect-all",attrs:{title:"全不选",type:"transparent"},on:{click:function(t){e.forEachItem((e=>e.isChecked=!1))}}},[t("VIcon",{attrs:{size:16,icon:"mdi-checkbox-multiple-blank-circle-outline"}})],1),e._v(" "),t("VButton",{staticClass:"invert-selection",attrs:{title:"反选",type:"transparent"},on:{click:function(t){e.forEachItem((e=>e.isChecked=!e.isChecked))}}},[t("VIcon",{attrs:{size:16,icon:"mdi-circle-slice-4"}})],1)],1)]),e._v(" "),t("div",{staticClass:"episodes-picker-items"},[0===e.episodeItems.length?t("div",{staticClass:"episodes-picker-empty"},[t("VEmpty")],1):e._e(),e._v(" "),e._l(e.episodeItems,(function(i,n){return t("div",{key:i.key,staticClass:"episodes-picker-item"},[t("CheckBox",{attrs:{"icon-position":"left","data-aid":i.inputItem.aid,"data-cid":i.inputItem.cid,"data-bvid":i.inputItem.bvid},nativeOn:{click:function(t){return e.shiftSelect(t,i,n)}},model:{value:i.isChecked,callback:function(t){e.$set(i,"isChecked",t)},expression:"item.isChecked"}},[t("span",{staticClass:"episode-title"},[e._v("\n          "+e._s(i.title)+"\n        ")]),e._v(" "),i.durationText?t("span",{staticClass:"episode-duration"},[e._v("\n          "+e._s(i.durationText)+"\n        ")]):e._e()])],1)}))],2)])};m._withStripped=!0;const v=Vue.extend({components:{VButton:d.VButton,VIcon:d.VIcon,CheckBox:d.CheckBox,VEmpty:d.VEmpty},props:{api:{type:Function,required:!0}},data:()=>({episodeItems:[],maxCheckedItems:32,lastCheckedEpisodeIndex:-1}),computed:{checkedRatio(){return`(${this.episodeItems.filter((e=>e.isChecked)).length}/${this.episodeItems.length})`},inputItems(){return this.episodeItems.map((e=>e.inputItem))},checkedInputItems(){return this.episodeItems.filter((e=>e.isChecked)).map((e=>e.inputItem))}},created(){this.getEpisodeItems()},methods:{shiftSelect(e,t,i){e.shiftKey&&-1!==this.lastCheckedEpisodeIndex?e.shiftKey&&-1!==this.lastCheckedEpisodeIndex&&(this.episodeItems.slice(Math.min(this.lastCheckedEpisodeIndex,i)+1,Math.max(this.lastCheckedEpisodeIndex,i)).forEach((e=>{e.isChecked=!e.isChecked})),this.lastCheckedEpisodeIndex=i,e.preventDefault()):this.lastCheckedEpisodeIndex=i},forEachItem(e){this.episodeItems.forEach(e)},async getEpisodeItems(){this.episodeItems.length>0||(this.episodeItems=await this.api(this))}}});var g=i(332),b=i.n(g),y=i(639),w=i.n(y),x={insert:"head",singleton:!1};b()(w(),x);w().locals;var _=i(893);const k=(0,_.Z)(v,m,[],!1,null,null,null).exports,I=e=>Vue.extend({computed:{checkedInputItems(){return this.$refs.picker.checkedInputItems}},render:t=>t(k,{props:{api:e},ref:"picker"})}),C={name:"bangumi.batch",displayName:"当前番剧 (多P)",match:f.bangumiUrls,batch:!0,getInputs:async e=>e?.checkedInputItems??[],component:async()=>I((async e=>{const t=dq('script[type="application/ld+json"]');if(!t)return(0,a.logError)("获取番剧数据失败: 无法找到 Metadata"),[];const i=JSON.parse(t.innerHTML.trim()),n=lodash.get(i,"itemListElement.0.url",null);if(null===n)return(0,a.logError)("获取番剧数据失败: 无法找到 metaUrl"),[];const s=n.match(/play\/ss(\d+)/)?.[1];if(void 0===s)return(0,a.logError)("获取番剧数据失败: 无法解析 Season ID"),[];const d=await(0,h.getJson)(`https://api.bilibili.com/pgc/web/season/section?season_id=${s}`);if(0!==d.code)return(0,a.logError)(`获取番剧数据失败: 无法获取番剧集数列表, message=${d.message}`),[];const l=[...d.result.main_section.episodes,...d.result.section?.flatMap((e=>e.episodes))??[]];return l.map((c=l.length,(t,i)=>{const n=t.long_title?t.title:(i+1).toString(),s=t.long_title?t.long_title:t.title;return{key:t.cid,title:`${n} - ${s}`,isChecked:i<e.maxCheckedItems,inputItem:{aid:t.aid,cid:t.cid,title:(0,p.formatTitle)((0,o.getGeneralSettings)().batchFilenameFormat,!1,{ep:s,cid:t.cid,aid:t.aid,n:(0,r.formatNumber)(parseFloat(n),c)??n}),allowQualityDrop:!0}}}));var c}))},A={name:"video.batch",displayName:"当前视频 (多P)",match:f.videoUrls,batch:!0,getInputs:async e=>e?.checkedInputItems??[],component:async()=>I((async e=>{const{aid:t}=unsafeWindow,i=`https://api.bilibili.com/x/web-interface/view?aid=${t}`,n=await(0,h.getJsonWithCredentials)(i);if(0!==n.code)return(0,a.logError)(`获取视频选集列表失败, message = ${n.message}`),[];const{pages:s,owner:d,pubdate:l}=n.data;if(void 0===s)return(0,a.logError)("获取视频选集列表失败, 没有找到选集信息."),[];const c=(0,p.getTitleVariablesFromDate)(new Date(1e3*l));return s.map(((i,n)=>({key:i.cid,title:`P${i.page} ${i.part}`,isChecked:n<e.maxCheckedItems,durationText:(0,r.formatDuration)(i.duration),inputItem:{allowQualityDrop:!0,title:(0,p.formatTitle)((0,o.getGeneralSettings)().batchFilenameFormat,!1,{n:(0,r.formatNumber)(i.page,s.length),cid:i.cid,ep:i.part,user:d?.name,userID:d?.mid?.toString(),publishYear:c.year,publishMonth:c.month,publishDay:c.day,publishHour:c.hour,publishMinute:c.minute,publishSecond:c.second,publishMillisecond:c.millisecond}),cid:i.cid,aid:t}})))}))},V={name:"video.seasonBatch",displayName:"当前视频 (合集)",match:f.videoUrls,batch:!0,getInputs:async e=>e?.checkedInputItems??[],component:async()=>I((async e=>{const{aid:t,bvid:i}=unsafeWindow,n=`https://api.bilibili.com/x/web-interface/wbi/view/detail?bvid=${i}&aid=${t}`,s=await(0,h.getJsonWithCredentials)(n);if(0!==s.code)return(0,a.logError)(`获取视频合集列表失败, message = ${s.message}`),[];const d=lodash.get(s,"data.View.owner",{}),l=lodash.get(s,"data.View.ugc_season.sections",[]);if(0===l.length)return[];const c=lodash.sumBy(l,(e=>e.episodes.length));return l.flatMap(((t,i)=>{const{episodes:n=[]}=t;return n.map(((t,n)=>{const s=n+lodash.sumBy(l.slice(0,i),(e=>e.episodes.length)),a=t.cid,u=s+1,h=`P${u} ${t.title}`,f=(0,p.getTitleVariablesFromDate)(new Date(1e3*t.arc.pubdate));return{key:a,title:h,isChecked:s<e.maxCheckedItems,durationText:(0,r.formatDuration)(t.arc.duration),inputItem:{allowQualityDrop:!0,title:(0,p.formatTitle)((0,o.getGeneralSettings)().batchFilenameFormat,!1,{n:(0,r.formatNumber)(u,c),title:t.page.part,cid:t.cid,ep:t.title,user:d.name,userID:d.mid?.toString(),publishYear:f.year,publishMonth:f.month,publishDay:f.day,publishHour:f.hour,publishMinute:f.minute,publishSecond:f.second,publishMillisecond:f.millisecond}),cid:t.cid,aid:t.aid}}}))}))}))},S={name:"video",displayName:"当前视频",match:f.videoUrls,getInputs:async()=>[{aid:unsafeWindow.aid,cid:unsafeWindow.cid,title:(0,p.getFriendlyTitle)(!0)}],component:()=>Promise.resolve().then(i.bind(i,661)).then((e=>e.default))};var D=i(495),E=i(991),O=i(205),U=i(496);const T=(e,t)=>{const i=e=>t.length>e?t[e]:t[t.length-1];return{fragments:e.durl.map(((e,t)=>({length:e.length,size:e.size,url:e.url,backupUrls:e.backup_url,extension:i(t)}))),qualities:e.accept_quality.map((e=>c.allQualities.find((t=>t.value===e)))).filter((e=>void 0!==e)),currentQuality:c.allQualities.find((t=>t.value===e.quality))}},$={name:"video.flv",displayName:"flv",description:"使用 flv 格式下载, 兼容 H.264 编码. 支持的清晰度相比于 dash 会少很多.",downloadVideoInfo:e=>(async e=>{const{aid:t,cid:i,quality:n}=e,o={avid:t,cid:i,qn:n?.value??"",otype:"json"},a=f.bangumiUrls.some((e=>(0,s.matchUrlPattern)(e))),r=a?(0,U.l)((0,s.formData)(o)):(0,U.s)((0,s.formData)(o)),d=await(0,h.bilibiliApi)((0,h.getJsonWithCredentials)(r),"获取视频链接失败"),l=new O.c({input:e,jsonData:d,...T(d,[".flv"])});return(0,E.c)(e,l),l})(e)},j=coreApis.runtimeLibrary,P={name:"steamSaver",displayName:"StreamSaver",description:'使用 StreamSaver 输出到本地文件, 下载过程中请勿关闭页面. 注意: 需要浏览器允许来自 jimmywarting.github.io (StreamSaver 的网站) 的第三方 cookie, 详细原因见 <a href="https://github.com/jimmywarting/StreamSaver.js?#how-does-it-work" target="blank">How does it work</a>, 否则弹出的链接点击后会没有反应.',runAction:async e=>{const t=await j.StreamSaverLibrary,i=e.infos.flatMap((e=>e.titledFragments)),n=u.Toast.show(i.map(((e,t)=>`<a class="link" data-index="${t}">${e.title}</a>`)).join("\n"),"下载视频"),o=await n.element;dqa(o,"a[data-index]").forEach((e=>{e.addEventListener("click",(async()=>{const{index:n}=e.dataset,{title:o,url:s,size:a}=i[n],r=t.createWriteStream(o,{size:a}),d=await fetch(s);await d.body.pipeTo(r)}))}))}},[q]=(0,l.registerAndGetData)("downloadVideo.inputs",[S,A,V,C]),[N]=(0,l.registerAndGetData)("downloadVideo.apis",[$,D.JV,D.SS,D.Ld,D.o1]),[Q]=(0,l.registerAndGetData)("downloadVideo.assets",[]),[B]=(0,l.registerAndGetData)("downloadVideo.outputs",[P]),{basicConfig:M}=(0,o.getComponentSettings)("downloadVideo").options,F=e=>e.filter((e=>e.match?.some((e=>(0,s.matchUrlPattern)(e)))??!0)),H=Vue.extend({components:{VPopup:d.VPopup,VButton:d.VButton,VDropdown:d.VDropdown,VIcon:d.VIcon,SwitchBox:d.SwitchBox},props:{triggerElement:{required:!0}},data(){const e=M.output,t=M.useBackupUrls;return{open:!1,busy:!1,testData:{videoInfo:null,multiple:!1},assets:Q,qualities:[],selectedQuality:void 0,inputs:[],selectedInput:void 0,apis:[],selectedApi:void 0,outputs:B,selectedOutput:B.find((t=>t.name===e))||B[0],useBackupUrls:t||!1}},computed:{assetsWithOptions(){return this.assets.filter((e=>e.component))},filteredQualities(){return 0===this.qualities.length?c.allQualities:this.qualities},canStartDownload(){if(this.busy||!this.open)return!1;return!Object.entries(this).filter((e=>{let[t]=e;return t.startsWith("selected")})).some((e=>{let[,t]=e;return!t}))}},watch:{selectedInput(e){void 0!==e&&this.updateTestVideoInfo()},selectedApi(e){void 0!==e&&(this.updateTestVideoInfo(),M.api=e.name)},selectedOutput(e){void 0!==e&&(M.output=e.name)},useBackupUrls(e){void 0!==e&&(M.useBackupUrls=e)}},mounted(){coreApis.observer.videoChange((()=>{this.selectedInput=void 0,this.selectedApi=void 0;const e=F(q);this.inputs=e,this.selectedInput=e[0];const t=F(N);this.apis=t;const i=t.find((e=>e.name===M.api));this.selectedApi=i||t[0]}))},methods:{formatFileSize:r.formatFileSize,saveSelectedQuality(){const e=this.selectedQuality;void 0!==e&&(M.quality=e.value,this.updateTestVideoInfo())},async getVideoItems(){const e=this.selectedInput;return await e.getInputs(this.$refs.inputOptions)},async updateTestVideoInfo(){if(!this.selectedInput||!this.selectedApi)return;this.testData.videoInfo=null;const e=this.selectedInput,t=e.getTestInput?.()??{aid:unsafeWindow.aid,cid:unsafeWindow.cid,title:(0,p.getFriendlyTitle)(!0)};console.log("[updateTestVideoInfo]",t),this.testData.multiple=e.batch;const i=this.selectedApi;try{const e=await i.downloadVideoInfo(t);this.qualities=e.qualities;if((!this.selectedQuality||!e.qualities.some((e=>e.value===this.selectedQuality.value)))&&(this.selectedQuality=e.qualities[0],M.quality)){const[t]=e.qualities.filter((e=>e.value<=M.quality));t&&(this.selectedQuality=t)}t.quality=this.selectedQuality;const n=await i.downloadVideoInfo(t);this.testData.videoInfo=n}catch(e){console.error("[updateTestVideoInfo] failed",e),this.testData.videoInfo=void 0}},async startDownload(e,t){try{this.busy=!0;const i=this.selectedInput,n=this.selectedApi,o=await i.getInputs(this.$refs.inputOptions);if(0===o.length)return void u.Toast.info("未接收到视频, 如果输入源支持批量, 请至少选择一个视频.","下载视频",3e3);o.forEach((e=>{e.quality=this.selectedQuality}));const s=await Promise.all(o.map((e=>n.downloadVideoInfo(e))));if(0===s.length||0===lodash.sumBy(s,(e=>e.fragments.length)))return void u.Toast.info("未接收到可下载数据, 请检查输入源和格式是否适用于当前视频.","下载视频",3e3);this.useBackupUrls&&s.forEach((e=>{e.fragments.forEach((e=>{e.url=e.backupUrls&&0!==e.backupUrls.length?e.backupUrls.at(0):e.url}))}));const a=new O.u(s);Q.forEach((e=>{(e?.getUrls?a.extraOnlineAssets:a.extraAssets).push({asset:e,instance:this.$refs.assetsOptions.find((t=>t.$attrs.name===e.name))})})),await t.runAction(a,e),await a.downloadExtraAssets()}catch(e){(0,a.logError)(e)}finally{this.busy=!1}}}}),z=H;
/* spell-checker: disable */var W=i(571),L=i.n(W),R={insert:"head",singleton:!1};b()(L(),R);L().locals;const J=(0,_.Z)(z,n,[],!1,null,null,null).exports},90:(e,t,i)=>{"use strict";i.r(t),i.d(t,{default:()=>a});var n=function(){var e=this,t=e._self._c;e._self._setupProxy;return t("div",{staticClass:"multiple-widgets"},[t("DefaultWidget",{ref:"button",attrs:{name:"下载视频",icon:"mdi-download"},on:{mouseover:function(t){return e.createDownloadPanel()},click:function(t){return e.toggleDownloadPanel()}}})],1)};let o;n._withStripped=!0;const s=Vue.extend({components:{DefaultWidget:coreApis.ui.DefaultWidget},methods:{async createDownloadPanel(){if(!o){const e=document.createElement("div");document.body.appendChild(e);const t=await Promise.resolve().then(i.bind(i,572)).then((e=>e.default));o=new t({propsData:{triggerElement:this.$refs.button}}).$mount(e)}},async toggleDownloadPanel(){o&&(o.open=!o.open)}}});const a=(0,i(893).Z)(s,n,[],!1,null,null,null).exports},661:(e,t,i)=>{"use strict";i.r(t),i.d(t,{default:()=>p});var n=function(){var e=this,t=e._self._c;e._self._setupProxy;return t("div",{staticClass:"single-video-info download-video-config-section"},[e.imageUrl?t("img",{staticClass:"shadow",attrs:{src:e.imageUrl}}):e._e(),e._v(" "),e.imageUrl?t("img",{attrs:{src:e.imageUrl}}):e._e()])};n._withStripped=!0;const o=coreApis.componentApis.video.videoCover,s=coreApis.observer,a=Vue.extend({data:()=>({imageUrl:""}),created(){(0,s.videoChange)((async()=>{const{aid:e}=unsafeWindow;this.imageUrl=await(0,o.getVideoCoverUrlByAid)(e)}))}});var r=i(332),d=i.n(r),l=i(947),c=i.n(l),u={insert:"head",singleton:!1};d()(c(),u);c().locals;const p=(0,i(893).Z)(a,n,[],!1,null,null,null).exports},893:(e,t,i)=>{"use strict";function n(e,t,i,n,o,s,a,r){var d,l="function"==typeof e?e.options:e;if(t&&(l.render=t,l.staticRenderFns=i,l._compiled=!0),n&&(l.functional=!0),s&&(l._scopeId="data-v-"+s),a?(d=function(e){(e=e||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(e=__VUE_SSR_CONTEXT__),o&&o.call(this,e),e&&e._registeredComponents&&e._registeredComponents.add(a)},l._ssrRegister=d):o&&(d=r?function(){o.call(this,(l.functional?this.parent:this).$root.$options.shadowRoot)}:o),d)if(l.functional){l._injectStyles=d;var c=l.render;l.render=function(e,t){return d.call(t),c(e,t)}}else{var u=l.beforeCreate;l.beforeCreate=u?[].concat(u,d):[d]}return{exports:e,options:l}}i.d(t,{Z:()=>n})},8:e=>{function t(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=8,e.exports=t},198:e=>{"use strict";e.exports="在功能面板中添加下载视频支持. 请注意:\n- 不能下载超出账号权限的视频, 例如非大会员下载大会员清晰度视频, 或者大陆地区网络下载港澳台地区番剧, 都是不可以的.\n- 请勿短时间进行大量下载, 以免遭到 b 站 IP 封禁.\n\n在使用视频 (非番剧) 批量下载时, 文件的批量命名格式中可以使用以下额外变量:\n- `user`: UP 主用户名\n- `userID`: UP 主用户 ID\n- 视频发布时间:\n  - `publishYear`\n  - `publishMonth`\n  - `publishDay`\n  - `publishHour`\n  - `publishMinute`\n  - `publishSecond`\n  - `publishMillisecond`\n"},375:e=>{"use strict";e.exports=coreApis.ajax},391:e=>{"use strict";e.exports=coreApis.componentApis.video.videoQuality},986:e=>{"use strict";e.exports=coreApis.settings},289:e=>{"use strict";e.exports=coreApis.utils.formatters},674:e=>{"use strict";e.exports=coreApis.utils.title},457:e=>{"use strict";e.exports=coreApis.utils.urls},605:e=>{"use strict";e.exports=coreApis.utils}},n={};function o(e){var t=n[e];if(void 0!==t)return t.exports;var s=n[e]={id:e,exports:{}};return i[e](s,s.exports,o),s.exports}o.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return o.d(t,{a:t}),t},t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,o.t=function(i,n){if(1&n&&(i=this(i)),8&n)return i;if("object"==typeof i&&i){if(4&n&&i.__esModule)return i;if(16&n&&"function"==typeof i.then)return i}var s=Object.create(null);o.r(s);var a={};e=e||[null,t({}),t([]),t(t)];for(var r=2&n&&i;"object"==typeof r&&!~e.indexOf(r);r=t(r))Object.getOwnPropertyNames(r).forEach((e=>a[e]=()=>i[e]));return a.default=()=>i,o.d(s,a),s},o.d=(e,t)=>{for(var i in t)o.o(t,i)&&!o.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},o.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),o.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var s={};return(()=>{"use strict";o.d(s,{component:()=>a});const e=coreApis.componentApis.define,t=coreApis.spinQuery;var i=o(495);const n=(0,e.defineOptionsMetadata)({basicConfig:{defaultValue:{},displayName:"基础配置",hidden:!0},dashVideoExtension:{defaultValue:i._i.video,displayName:"DASH 视频扩展名"},dashAudioExtension:{defaultValue:i._i.audio,displayName:"DASH 普通音频扩展名"},dashFlacAudioExtension:{defaultValue:i._i.flacAudio,displayName:"DASH FLAC 音频扩展名"}}),a=(0,e.defineComponentMetadata)({name:"downloadVideo",displayName:"下载视频",entry:none,reload:none,unload:none,widget:{component:()=>Promise.resolve().then(o.bind(o,90)).then((e=>e.default)),condition:()=>(0,t.hasVideo)()},tags:[componentsTags.video],options:n,commitHash:"49dab167c6a752ded5d6aca0615efb98bcc98884",coreVersion:"2.9.1",description:(()=>{const e=o(8);return{...Object.fromEntries(e.keys().map((t=>[t.match(/index\.(.+)\.md$/)[1],e(t)]))),"zh-CN":()=>Promise.resolve().then(o.t.bind(o,198,17)).then((e=>e.default))}})()})})(),s=s.component})()));