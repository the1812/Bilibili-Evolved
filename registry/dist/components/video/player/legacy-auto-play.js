!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["video/player/legacy-auto-play"]=t():e["video/player/legacy-auto-play"]=t()}(globalThis,(()=>(()=>{"use strict";var e={d:(t,i)=>{for(var o in i)e.o(i,o)&&!e.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:i[o]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)},t={};e.d(t,{component:()=>r});const i=coreApis.componentApis.define,o=coreApis.componentApis.feeds.api,s=coreApis.componentApis.video.playerAgent,n=coreApis.observer,a=coreApis.spinQuery,l=coreApis.utils,c=coreApis.utils.log,d=coreApis.utils.urls,r=(0,i.defineComponentMetadata)({name:"legacyAutoPlay",displayName:"传统连播模式",description:"模拟传统的多 P 连播策略: 仅连播视频的分 P, 最后 1P 放完禁止连播其他推荐视频.",tags:[componentsTags.video],urlInclude:d.videoUrls,entry:async()=>{const e=(0,c.useScopedConsole)("传统连播模式"),t={enable:[":is(.base-video-sections, .base-video-sections-v1) .next-button",":is(.multi-page, .multi-page-v1) .next-button",".player-auxiliary-autoplay-switch input",".video-pod .auto-play .switch-btn"],disable:[":is(.recommend-list, .recommend-list-v1) .next-button",".recommend-list-v1 .switch-btn"]},i=[()=>Boolean(dq(":is(.multi-page, .multi-page-v1) .list-box li.on:last-child, .video-pod__list .simple-base-item.active:last-child")),()=>Boolean(dq(".video-sections-item:last-child .video-episode-card:last-child .video-episode-card__info-playing")),()=>Boolean(dq(".video-sections-item:last-child .video-episode-card:last-child .video-episode-card__info-title-playing"))];await(0,l.playerReady)();const d=await Promise.any([(0,a.select)(".right-container-inner"),(0,a.select)(".playlist-container--right"),(0,a.select)(".video-pod")]);if(!d)return void e.warn("未找到 rightPanelContainer 或 playListContainer");const r=async()=>{const o=await(0,a.select)([...t.disable,...t.enable].join(","));if(!o)return;const s=t.enable.some((e=>o.matches(e)))&&i.every((e=>!e())),n=(l=o,Boolean(l.querySelector(".switch-button.on")||l.matches(":checked"))||l.classList.contains("on"));var l;e.log("checkPlayMode",{shouldChecked:s,checked:n}),s!==n&&o.click()},p=async()=>d.querySelector(".video-pod__list.section")?(async()=>{const t=dq(d,".list-count, .video-pod__header .amt").innerHTML.replace(/[（）]/g,"").split("/").map((e=>parseInt(e))),i=dq(".action-list .action-list-item-wrap:last-child .action-list-item .actionlist-item-inner, .video-pod__list .pod-item:last-child"),s=i.classList.contains("singlep-list-item-inner")||null!==i.querySelector(".single-p")?i.classList.contains("siglep-active")||null!==i.querySelector(".simple-base-item.active"):i.children[1].lastElementChild.classList.contains("multip-list-item-active"),n=!(t[0]>=t[1]&&s);e.log("checkPlayListPlayMode",{isLastVideo:s,sequentialNumbers:t,shouldContinue:n});const a=document.getElementById("app");(0,o.getVueData)(a).setContinuousPlay(n)})():r();(0,n.videoChange)((async()=>{(await s.playerAgent.query.video.element())?.addEventListener("play",(()=>p()),{once:!0})})),(0,n.childListSubtree)(d,(()=>p()))},commitHash:"576fd06d4f8093c807a88d269cda545d614574fe",coreVersion:"2.9.5"});return t=t.component})()));