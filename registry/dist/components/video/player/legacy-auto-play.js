!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["video/player/legacy-auto-play"]=t():e["video/player/legacy-auto-play"]=t()}(globalThis,(()=>(()=>{"use strict";var e={d:(t,i)=>{for(var o in i)e.o(i,o)&&!e.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:i[o]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)},t={};e.d(t,{component:()=>m});const i=coreApis.componentApis.define,o=coreApis.componentApis.feeds.api,s=coreApis.componentApis.video.playerAgent,n=coreApis.observer,a=coreApis.spinQuery,l=coreApis.utils,c=coreApis.utils.log,r=coreApis.utils.urls;function d(e,t,i){return(t=function(e){var t=function(e,t){if("object"!=typeof e||!e)return e;var i=e[Symbol.toPrimitive];if(void 0!==i){var o=i.call(e,t||"default");if("object"!=typeof o)return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}class p{isChecked(e){return Boolean(e.querySelector(".switch-button.on")||e.matches(":checked"))||e.classList.contains("on")}async onRightPanelLoaded(e){await(0,l.playerReady)();const t=await Promise.any([(0,a.select)(".right-container-inner"),(0,a.select)(".playlist-container--right"),(0,a.select)(".video-pod")]);if(t)e(t);else{(0,c.useScopedConsole)("传统连播模式").warn("未找到 rightPanelContainer 或 playListContainer")}}async onVideoChange(e){(0,n.videoChange)((async()=>{const t=await s.playerAgent.query.video.element();t?.addEventListener("play",(()=>e(t)),{once:!0})}))}}class u extends p{constructor(){super(...arguments),d(this,"autoPlayControls",{enable:[":is(.base-video-sections, .base-video-sections-v1) .next-button",":is(.multi-page, .multi-page-v1) .next-button",".player-auxiliary-autoplay-switch input",".video-pod .auto-play .switch-btn"],disable:[":is(.recommend-list, .recommend-list-v1) .next-button",".recommend-list-v1 .switch-btn"]}),d(this,"disableConditions",[()=>Boolean(dq(":is(.multi-page, .multi-page-v1) .list-box li.on:last-child, .video-pod__list .simple-base-item.active:last-child")),()=>Boolean(dq(".video-sections-item:last-child .video-episode-card:last-child .video-episode-card__info-playing")),()=>Boolean(dq(".video-sections-item:last-child .video-episode-card:last-child .video-episode-card__info-title-playing"))])}async checkPlayMode(){const e=await(0,a.select)([...this.autoPlayControls.disable,...this.autoPlayControls.enable].join(","));if(!e)return;const t=this.autoPlayControls.enable.some((t=>e.matches(t)))&&this.disableConditions.every((e=>!e())),i=this.isChecked(e);console.log("checkPlayMode",{shouldChecked:t,checked:i}),t!==i&&e.click()}async checkPlayListPlayMode(e){
// spell-checker: disable
const t=dq(e,".list-count, .video-pod__header .amt").innerHTML.replace(/[（）]/g,"").split("/").map((e=>parseInt(e))),i=dq(".action-list .action-list-item-wrap:last-child .action-list-item .actionlist-item-inner, .video-pod__list .pod-item:last-child"),s=i.classList.contains("singlep-list-item-inner")||null!==i.querySelector(".single-p")?i.classList.contains("siglep-active")||null!==i.querySelector(".simple-base-item.active"):i.children[1].lastElementChild.classList.contains("multip-list-item-active"),n=!(t[0]>=t[1]&&s);console.log("checkPlayListPlayMode",{isLastVideo:s,sequentialNumbers:t,shouldContinue:n});const a=document.getElementById("app");(0,o.getVueData)(a).setContinuousPlay(n)}async setupAutoPlay(){this.onRightPanelLoaded((e=>{const t=()=>e.querySelector(".video-pod__list.section")?this.checkPlayListPlayMode(e):this.checkPlayMode();(0,n.childListSubtree)(e,(()=>t())),this.onVideoChange((()=>t()))}))}}class y extends p{async setupAutoPlay(){const e=await(0,a.select)('.bpx-player-ctrl-setting-handoff input[type="radio"][value="0"]');if(null!==e)e.click();else{(0,c.useScopedConsole)("传统连播模式").warn("未找到 autoPlayRadio")}}}const m=(0,i.defineComponentMetadata)({name:"legacyAutoPlay",displayName:"传统连播模式",description:"模拟传统的多 P 连播策略: 仅连播视频的分 P, 最后 1P 放完禁止连播其他推荐视频.",tags:[componentsTags.video],urlInclude:[...r.videoUrls,...r.bangumiUrls],entry:async()=>{const e=r.bangumiUrls.some((e=>(0,l.matchUrlPattern)(e)))?new y:new u;await e.setupAutoPlay()},commitHash:"342c6a590fc64108640cdf46b42d5bded5c25e04",coreVersion:"2.10.0"});return t=t.component})()));