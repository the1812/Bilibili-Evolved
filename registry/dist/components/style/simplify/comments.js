!function(n,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["style/simplify/comments"]=t():n["style/simplify/comments"]=t()}(globalThis,(()=>(()=>{var n,t,e={601:(n,t,e)=>{var o=e(355)((function(n){return n[1]}));o.push([n.id,".bili-comment .reply-item .user-level,\n.bili-comment .reply-item .sub-user-level {\n  display: none !important;\n}\n.bili-comment .reply-item .sub-user-info {\n  display: flex !important;\n}\n.bili-comment .reply-item .reply-decorate {\n  display: none !important;\n}\n.bili-comment .reply-item .sub-user-info,\n.bili-comment .reply-item .sub-user-name {\n  line-height: 1.5 !important;\n}\n.bili-comment .reply-item .sub-user-info {\n  margin-bottom: 4px !important;\n  max-height: 19.5px !important;\n}\n.bili-comment .reply-item .reply-content-container {\n  display: block !important;\n  flex-basis: 100% !important;\n}\n.bili-comment .reply-item .root-reply:not(.reply-content-container) {\n  padding: 0 !important;\n  display: flex !important;\n  align-items: center !important;\n  flex-wrap: wrap !important;\n}\n.bili-comment .reply-item .note-content {\n  flex-basis: 100% !important;\n  margin-bottom: 4px !important;\n}\n.bili-comment .reply-item .image-exhibition {\n  flex-basis: 100% !important;\n  margin-bottom: 8px !important;\n}\n.bili-comment .reply-item .root-reply,\n.bili-comment .reply-item .reply-info,\n.bili-comment .reply-item .sub-reply-info {\n  position: static !important;\n}\n.bili-comment .reply-item .reply-info,\n.bili-comment .reply-item .sub-reply-info {\n  display: inline-flex !important;\n}\n.bili-comment .reply-item .reply-time,\n.bili-comment .reply-item .sub-reply-time {\n  position: absolute !important;\n  top: 0 !important;\n  right: 0 !important;\n  margin-right: 0 !important;\n  line-height: 1.5 !important;\n}\n.bili-comment .reply-item .sub-reply-time {\n  top: 8px !important;\n}\n.bili-comment .reply-item .reply-operation-warp,\n.bili-comment .reply-item .sub-reply-operation-warp {\n  right: -5px !important;\n}\n.bili-comment .reply-item .reply-tag-list {\n  display: inline-flex !important;\n  margin: 2px 0 0 18px !important;\n}\n.bili-comment .reply-item .reply-tag-list .reply-tag-item {\n  padding: 4px 6px !important;\n}\n.bili-comment .reply-box-send .send-text {\n  font-size: 14px !important;\n}\n.bili-comment .reply-box-textarea {\n  line-height: normal !important;\n}",""]),n.exports=o},354:(n,t,e)=>{var o=e(355)((function(n){return n[1]}));o.push([n.id,'@charset "UTF-8";\n.bb-comment .comment-send-lite {\n  position: sticky !important;\n  bottom: 0 !important;\n  background: linear-gradient(to top, #fff, rgba(255, 255, 255, 0)) !important;\n  pointer-events: none;\n  width: calc(100% + 12px) !important;\n  margin: 0 0 0 -12px !important;\n  padding-left: 97px !important;\n}\nbody.dark .bb-comment .comment-send-lite {\n  background: linear-gradient(to top, #222, rgba(255, 255, 255, 0)) !important;\n}\n.bb-comment .comment-send-lite .comment-emoji-lite {\n  background-color: #fff;\n}\n.bb-comment .comment-send-lite .comment-submit {\n  height: 64px !important;\n  padding: 4px 15px !important;\n  position: relative !important;\n  right: 0 !important;\n  margin-left: 10px !important;\n}\n.bb-comment .comment-send-lite .textarea-container .baffle {\n  line-height: 65px !important;\n}\n.bb-comment .comment-send-lite .textarea-container .baffle,\n.bb-comment .comment-send-lite .textarea-container .ipt-txt {\n  height: 65px !important;\n  width: calc(100% - 80px) !important;\n}\n.bb-comment .comment-send-lite > * {\n  pointer-events: initial;\n}\n.bb-comment .loading-state {\n  font-size: 14px !important;\n  height: 1.4em !important;\n  line-height: 1.4 !important;\n  margin: 12px 0 !important;\n}\n.bb-comment .loading-state + .bottom-page {\n  margin: 0 !important;\n}\n.bb-comment .nameplate,\n.bb-comment .comment-header .tabs-order li.on::after,\n.bb-comment .true-love,\n.bb-comment .medal,\n.bb-comment .medal-level,\n.bb-comment .reply-notice,\n.bb-comment .sailing,\n.bb-comment .perfect-reply {\n  display: none !important;\n}\n.bb-comment .comment-send-lite .comment-emoji,\n.bb-comment .comment-send .comment-emoji {\n  box-shadow: none !important;\n}\n.bb-comment .comment-send-lite .comment-emoji span,\n.bb-comment .comment-send .comment-emoji span {\n  opacity: 0.4;\n  color: black;\n}\n.bb-comment .comment-send-lite .comment-emoji .face,\n.bb-comment .comment-send .comment-emoji .face {\n  transition: all 0.2s ease-out;\n  height: 16px !important;\n  width: 16px !important;\n  background-position: center !important;\n  opacity: 0.4;\n  display: inline-flex !important;\n  background: none !important;\n  color: #000;\n}\nbody.dark .bb-comment .comment-send-lite .comment-emoji .face,\nbody.dark .bb-comment .comment-send .comment-emoji .face {\n  color: #eee;\n}\n.bb-comment .comment-send-lite .comment-emoji .face::before,\n.bb-comment .comment-send .comment-emoji .face::before {\n  content: "\\f01f5";\n  display: inline-block;\n  font: normal normal normal 24px/1 "Material Design Icons";\n  font-size: 16px;\n  line-height: 1;\n  width: 16px;\n  height: 16px;\n}\n.bb-comment .comment-send-lite .comment-emoji .text,\n.bb-comment .comment-send .comment-emoji .text {\n  transition: all 0.2s ease-out;\n}\nbody.dark .bb-comment .comment-send-lite .comment-emoji .text,\nbody.dark .bb-comment .comment-send .comment-emoji .text {\n  filter: brightness(0) invert(1) !important;\n}\n.bb-comment .comment-send-lite .comment-emoji.open span,\n.bb-comment .comment-send-lite .comment-emoji.open .face, .bb-comment .comment-send-lite .comment-emoji:hover span,\n.bb-comment .comment-send-lite .comment-emoji:hover .face,\n.bb-comment .comment-send .comment-emoji.open span,\n.bb-comment .comment-send .comment-emoji.open .face,\n.bb-comment .comment-send .comment-emoji:hover span,\n.bb-comment .comment-send .comment-emoji:hover .face {\n  opacity: 1;\n}\n.bb-comment .comment-list .list-item {\n  position: relative;\n}\n.bb-comment .comment-list .list-item .info {\n  margin-top: 0 !important;\n  display: flex;\n  align-items: center;\n}\n.bb-comment .comment-list .list-item .info .floor {\n  opacity: 0.7;\n  order: 1;\n}\n.bb-comment .comment-list .list-item .info .reply {\n  order: 2;\n}\n.bb-comment .comment-list .list-item .info .reply-tags {\n  order: 3;\n  display: flex !important;\n  margin: 0 !important;\n}\n.bb-comment .comment-list .list-item .info .reply-tags span {\n  margin: 0 4px 0 0 !important;\n  font-size: 12px !important;\n  line-height: normal !important;\n  display: flex !important;\n  height: auto !important;\n  padding: 2px 6px !important;\n}\n.bb-comment .comment-list .list-item .info .operation {\n  order: 4;\n  flex-grow: 1;\n  display: flex !important;\n  justify-content: flex-end;\n  margin: 0 !important;\n  padding: 3px !important;\n}\n.bb-comment .comment-list .list-item .info > * {\n  display: flex;\n  align-items: center;\n  gap: 0;\n}\n.bb-comment .comment-list .list-item .info .like i,\n.bb-comment .comment-list .list-item .info .hate i {\n  transition: all 0.2s ease-out;\n  height: 16px !important;\n  width: 16px !important;\n  background-position: center !important;\n  opacity: 0.4;\n  display: inline-flex !important;\n}\n.bb-comment .comment-list .list-item .info .like span,\n.bb-comment .comment-list .list-item .info .hate span {\n  opacity: 0.4;\n  transition: all 0.2s ease-out;\n  color: black;\n}\nbody.dark .bb-comment .comment-list .list-item .info .like span,\nbody.dark .bb-comment .comment-list .list-item .info .hate span {\n  color: #eee !important;\n}\n.bb-comment .comment-list .list-item .info .like.liked > *, .bb-comment .comment-list .list-item .info .like.hated > *, .bb-comment .comment-list .list-item .info .like:hover > *,\n.bb-comment .comment-list .list-item .info .hate.liked > *,\n.bb-comment .comment-list .list-item .info .hate.hated > *,\n.bb-comment .comment-list .list-item .info .hate:hover > * {\n  opacity: 1;\n}\n.bb-comment .comment-list .list-item .info .like i {\n  background: none !important;\n  color: #000;\n}\nbody.dark .bb-comment .comment-list .list-item .info .like i {\n  color: #eee;\n}\n.bb-comment .comment-list .list-item .info .like i::before {\n  content: "\\f0514";\n  display: inline-block;\n  font: normal normal normal 24px/1 "Material Design Icons";\n  font-size: 16px;\n  line-height: 1;\n  width: 16px;\n  height: 16px;\n}\n.bb-comment .comment-list .list-item .info .like.liked i, .bb-comment .comment-list .list-item .info .like.liked:hover i {\n  background: none !important;\n  color: #000;\n}\nbody.dark .bb-comment .comment-list .list-item .info .like.liked i, body.dark .bb-comment .comment-list .list-item .info .like.liked:hover i {\n  color: #eee;\n}\n.bb-comment .comment-list .list-item .info .like.liked i::before, .bb-comment .comment-list .list-item .info .like.liked:hover i::before {\n  content: "\\f0513";\n  display: inline-block;\n  font: normal normal normal 24px/1 "Material Design Icons";\n  font-size: 16px;\n  line-height: 1;\n  width: 16px;\n  height: 16px;\n}\n.bb-comment .comment-list .list-item .info .like.liked i, .bb-comment .comment-list .list-item .info .like.liked i + span, body.dark .bb-comment .comment-list .list-item .info .like.liked i, .bb-comment .comment-list .list-item .info .like.liked:hover i, .bb-comment .comment-list .list-item .info .like.liked:hover i + span, body.dark .bb-comment .comment-list .list-item .info .like.liked:hover i {\n  color: var(--theme-color) !important;\n}\n.bb-comment .comment-list .list-item .info .hate i {\n  background: none !important;\n  color: #000;\n}\nbody.dark .bb-comment .comment-list .list-item .info .hate i {\n  color: #eee;\n}\n.bb-comment .comment-list .list-item .info .hate i::before {\n  content: "\\f0512";\n  display: inline-block;\n  font: normal normal normal 24px/1 "Material Design Icons";\n  font-size: 16px;\n  line-height: 1;\n  width: 16px;\n  height: 16px;\n}\n.bb-comment .comment-list .list-item .info .hate.hated i, .bb-comment .comment-list .list-item .info .hate.hated:hover i {\n  background: none !important;\n  color: #000;\n}\nbody.dark .bb-comment .comment-list .list-item .info .hate.hated i, body.dark .bb-comment .comment-list .list-item .info .hate.hated:hover i {\n  color: #eee;\n}\n.bb-comment .comment-list .list-item .info .hate.hated i::before, .bb-comment .comment-list .list-item .info .hate.hated:hover i::before {\n  content: "\\f0511";\n  display: inline-block;\n  font: normal normal normal 24px/1 "Material Design Icons";\n  font-size: 16px;\n  line-height: 1;\n  width: 16px;\n  height: 16px;\n}\n.bb-comment .comment-list .list-item .info .hate.hated i, .bb-comment .comment-list .list-item .info .hate.hated i + span, body.dark .bb-comment .comment-list .list-item .info .hate.hated i, .bb-comment .comment-list .list-item .info .hate.hated:hover i, .bb-comment .comment-list .list-item .info .hate.hated:hover i + span, body.dark .bb-comment .comment-list .list-item .info .hate.hated:hover i {\n  color: var(--theme-color) !important;\n}\n.bb-comment .comment-list .list-item .info .operation:hover {\n  background: transparent !important;\n}\n.bb-comment .comment-list .list-item .info .operation .spot {\n  transition: all 0.2s ease-out;\n  height: 16px !important;\n  width: 16px !important;\n  background-position: center !important;\n  opacity: 0.4;\n  display: inline-flex !important;\n  background: none !important;\n  color: #000;\n}\nbody.dark .bb-comment .comment-list .list-item .info .operation .spot {\n  color: #eee;\n}\n.bb-comment .comment-list .list-item .info .operation .spot::before {\n  content: "\\f01d9";\n  display: inline-block;\n  font: normal normal normal 24px/1 "Material Design Icons";\n  font-size: 16px;\n  line-height: 1;\n  width: 16px;\n  height: 16px;\n}\nbody.dark .bb-comment .comment-list .list-item .info .operation .spot {\n  filter: brightness(0) invert(1) !important;\n}\n.bb-comment .comment-list .list-item .info .operation .spot:hover {\n  opacity: 1;\n}\n.bb-comment .comment-list .list-item .text {\n  white-space: pre-wrap;\n}\n.bb-comment .comment-list .list-item .user {\n  margin-right: 120px;\n}\n.bb-comment .comment-list .list-item .user .level {\n  visibility: hidden;\n  width: 0;\n  margin: 0;\n}\n.bb-comment .comment-list .list-item .user .text-con {\n  white-space: pre-wrap;\n  display: block;\n  margin: 0 !important;\n}\n.bb-comment .comment-list .list-item .user-face .hot-follow,\n.bb-comment .comment-list .list-item .con .vote-container {\n  display: none !important;\n}\n.bb-comment .comment-list .list-item > .con .level-link {\n  display: none !important;\n}\n.bb-comment .comment-list .list-item > .con > .reply-box {\n  transform: translateX(0%);\n}\n.bb-comment .comment-list .list-item > .con > .info {\n  margin-top: 4px;\n}\n.bb-comment .comment-list .list-item > .con > .info > .time-location,\n.bb-comment .comment-list .list-item > .con > .info > .time {\n  position: absolute;\n  right: 8px;\n  top: 24px;\n  margin: 0 !important;\n  opacity: 0.5;\n  line-height: normal;\n  color: black;\n}\nbody.dark .bb-comment .comment-list .list-item > .con > .info > .time-location,\nbody.dark .bb-comment .comment-list .list-item > .con > .info > .time,\nbody.dark .bb-comment .comment-list .list-item > .con > .info > .floor {\n  filter: brightness(0) invert(1) !important;\n}\n.bb-comment .comment-list .list-item > .con > .info > .plad {\n  display: none !important;\n}\n.bb-comment .comment-list .reply-con {\n  position: relative;\n}\n.bb-comment .comment-list .reply-con > .info > .time-location,\n.bb-comment .comment-list .reply-con > .info > .time {\n  position: absolute;\n  right: 8px;\n  top: 0px;\n  margin: 0;\n  opacity: 0.5;\n  line-height: normal;\n  color: black;\n}\nbody.dark .bb-comment .comment-list .reply-con > .info > .time-location,\nbody.dark .bb-comment .comment-list .reply-con > .info > .time {\n  filter: brightness(0) invert(1) !important;\n}\n.bb-comment .reply-item {\n  position: relative;\n}\nbody.dark .bb-comment .reply-item > .info > .time {\n  filter: brightness(0) invert(1) !important;\n}\n.bb-comment .reply-notice .notice-item {\n  background-color: rgba(0, 0, 0, 0.0666666667) !important;\n  border: none !important;\n  display: flex !important;\n  align-items: center;\n  padding: 10px 14px !important;\n}\nbody.dark .bb-comment .reply-notice .notice-item {\n  background-color: #333 !important;\n}\n.bb-comment .reply-notice .notice-item .icon-notice {\n  order: 0;\n  position: static !important;\n  margin-right: 12px;\n  background: url(\'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="18" height="18" viewBox="0 0 24 24"><path fill="black" d="M20,11H4V8H20M20,15H13V13H20M20,19H13V17H20M11,19H4V13H11M20.33,4.67L18.67,3L17,4.67L15.33,3L13.67,4.67L12,3L10.33,4.67L8.67,3L7,4.67L5.33,3L3.67,4.67L2,3V19A2,2 0 0,0 4,21H20A2,2 0 0,0 22,19V3L20.33,4.67Z" /></svg>\') !important;\n}\n.bb-comment .reply-notice .notice-item a {\n  order: 1;\n  flex-grow: 1;\n  color: black !important;\n}\nbody.dark .bb-comment .reply-notice .notice-item a {\n  color: #eee !important;\n}\n.bb-comment .reply-notice .notice-item .icon-close-notice {\n  order: 2;\n  position: static !important;\n  background: url(\'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="18" height="18" viewBox="0 0 24 24"><path fill="black" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>\') !important;\n}\n.bb-comment .reply-notice .notice-item .icon-close-notice,\n.bb-comment .reply-notice .notice-item .icon-notice {\n  height: 18px;\n  width: 18px;\n  background-position: center !important;\n  opacity: 0.4;\n}\n.bb-comment .comment-send:not(.no-login) {\n  position: relative !important;\n}\n.bb-comment .comment-send-lite:not(.no-login),\n.bb-comment .comment-send:not(.no-login) {\n  padding-top: 15px !important;\n}\n.bb-comment .comment-send-lite:not(.no-login) .dynamic-repost,\n.bb-comment .comment-send:not(.no-login) .dynamic-repost {\n  margin-left: 81px !important;\n  margin-top: 4px;\n}\n.bb-comment .comment-send-lite:not(.no-login) .comment-emoji,\n.bb-comment .comment-send:not(.no-login) .comment-emoji {\n  position: absolute !important;\n  right: 0;\n  top: 51px;\n  width: 68px !important;\n  background: #fff;\n  box-sizing: content-box !important;\n}\n.bb-comment .comment-send-lite:not(.no-login) .comment-submit,\n.bb-comment .comment-send:not(.no-login) .comment-submit {\n  height: 34px !important;\n  font-size: 0;\n}\n.bb-comment .comment-send-lite:not(.no-login) .comment-submit body.dark,\n.bb-comment .comment-send:not(.no-login) .comment-submit body.dark {\n  color: var(--theme-color) !important;\n}\n.bb-comment .comment-send-lite:not(.no-login) .comment-submit::after,\n.bb-comment .comment-send:not(.no-login) .comment-submit::after {\n  content: "发表";\n  color: #fff;\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  font-size: 14px;\n}\nbody.dark .bb-comment .comment-send-lite:not(.no-login) .comment-submit::after,\nbody.dark .bb-comment .comment-send:not(.no-login) .comment-submit::after {\n  color: var(--foreground-color);\n}\n\nbody.dark .panel-area .bb-comment .comment-send-lite {\n  background: linear-gradient(to top, #444 30%, transparent) !important;\n}\n\n.dynamic-list-item-wrap .info .plat {\n  display: none !important;\n}\n.dynamic-list-item-wrap .reply-box .time-location,\n.dynamic-list-item-wrap .reply-box .time {\n  position: absolute;\n  right: 8px;\n  top: 0px;\n  margin: 0;\n  opacity: 0.5;\n  line-height: normal;\n  color: black;\n  top: 10px;\n}\n.dynamic-list-item-wrap .reply-item > .info {\n  display: flex;\n  align-items: center;\n}\n.dynamic-list-item-wrap .reply-item > .info .floor {\n  opacity: 0.7;\n  order: 1;\n}\n.dynamic-list-item-wrap .reply-item > .info .reply {\n  order: 2;\n}\n.dynamic-list-item-wrap .reply-item > .info .reply-tags {\n  order: 3;\n  display: flex !important;\n  margin: 0 !important;\n}\n.dynamic-list-item-wrap .reply-item > .info .reply-tags span {\n  margin: 0 4px 0 0 !important;\n  font-size: 12px !important;\n  line-height: normal !important;\n  display: flex !important;\n  height: auto !important;\n  padding: 2px 6px !important;\n}\n.dynamic-list-item-wrap .reply-item > .info .operation {\n  order: 4;\n  flex-grow: 1;\n  display: flex !important;\n  justify-content: flex-end;\n  margin: 0 !important;\n  padding: 3px !important;\n}\n\n.reply-item > .info > .time-location,\n.reply-item > .info > .time {\n  position: absolute;\n  right: 8px;\n  top: 24px;\n  margin: 0 !important;\n  opacity: 0.5;\n  line-height: normal;\n  color: black;\n  top: 12px;\n}\nbody.dark .reply-item > .info > .time-location,\nbody.dark .reply-item > .info > .time {\n  filter: brightness(0) invert(1) !important;\n}\n\n.reply-box .item-user > a {\n  margin-right: 8px;\n}\n.reply-box .item-user .text {\n  display: block;\n}\n\n.comment-area .dynamic-level {\n  display: none !important;\n}\n\n.dynamic-like i,\n.dynamic-hate i {\n  transition: all 0.2s ease-out;\n}\n\n.dynamic-like i {\n  background: none !important;\n  color: #000;\n}\nbody.dark .dynamic-like i {\n  color: #eee;\n}\n.dynamic-like i::before {\n  content: "\\f0514";\n  display: inline-block;\n  font: normal normal normal 24px/1 "Material Design Icons";\n  font-size: 16px;\n  line-height: 1;\n  width: 16px;\n  height: 16px;\n}\n.dynamic-like:hover i {\n  background: none !important;\n  color: #000;\n}\nbody.dark .dynamic-like:hover i {\n  color: #eee;\n}\n.dynamic-like:hover i::before {\n  content: "\\f0513";\n  display: inline-block;\n  font: normal normal normal 24px/1 "Material Design Icons";\n  font-size: 16px;\n  line-height: 1;\n  width: 16px;\n  height: 16px;\n}\n.dynamic-like:hover i, .dynamic-like:hover i + span, body.dark .dynamic-like:hover i {\n  color: var(--theme-color) !important;\n}\n\n.dynamic-liked:hover i,\n.dynamic-liked i {\n  background: none !important;\n  color: #000;\n}\nbody.dark .dynamic-liked:hover i,\nbody.dark .dynamic-liked i {\n  color: #eee;\n}\n.dynamic-liked:hover i::before,\n.dynamic-liked i::before {\n  content: "\\f0513";\n  display: inline-block;\n  font: normal normal normal 24px/1 "Material Design Icons";\n  font-size: 16px;\n  line-height: 1;\n  width: 16px;\n  height: 16px;\n}\n.dynamic-liked:hover i, .dynamic-liked:hover i + span, body.dark .dynamic-liked:hover i,\n.dynamic-liked i,\n.dynamic-liked i + span,\nbody.dark .dynamic-liked i {\n  color: var(--theme-color) !important;\n}\n\n.dynamic-hate i {\n  background: none !important;\n  color: #000;\n}\nbody.dark .dynamic-hate i {\n  color: #eee;\n}\n.dynamic-hate i::before {\n  content: "\\f0512";\n  display: inline-block;\n  font: normal normal normal 24px/1 "Material Design Icons";\n  font-size: 16px;\n  line-height: 1;\n  width: 16px;\n  height: 16px;\n}\n.dynamic-hate:hover i {\n  background: none !important;\n  color: #000;\n}\nbody.dark .dynamic-hate:hover i {\n  color: #eee;\n}\n.dynamic-hate:hover i::before {\n  content: "\\f0511";\n  display: inline-block;\n  font: normal normal normal 24px/1 "Material Design Icons";\n  font-size: 16px;\n  line-height: 1;\n  width: 16px;\n  height: 16px;\n}\n.dynamic-hate:hover i, .dynamic-hate:hover i + span, body.dark .dynamic-hate:hover i {\n  color: var(--theme-color) !important;\n}\n\n.dynamic-hated:hover i,\n.dynamic-hated i {\n  background: none !important;\n  color: #000;\n}\nbody.dark .dynamic-hated:hover i,\nbody.dark .dynamic-hated i {\n  color: #eee;\n}\n.dynamic-hated:hover i::before,\n.dynamic-hated i::before {\n  content: "\\f0511";\n  display: inline-block;\n  font: normal normal normal 24px/1 "Material Design Icons";\n  font-size: 16px;\n  line-height: 1;\n  width: 16px;\n  height: 16px;\n}\n.dynamic-hated:hover i, .dynamic-hated:hover i + span, body.dark .dynamic-hated:hover i,\n.dynamic-hated i,\n.dynamic-hated i + span,\nbody.dark .dynamic-hated i {\n  color: var(--theme-color) !important;\n}\n\n.dynamic-spot {\n  background: none !important;\n  color: #000;\n}\nbody.dark .dynamic-spot {\n  color: #eee;\n}\n.dynamic-spot::before {\n  content: "\\f01d9";\n  display: inline-block;\n  font: normal normal normal 24px/1 "Material Design Icons";\n  font-size: 16px;\n  line-height: 1;\n  width: 16px;\n  height: 16px;\n}\nbody.dark .dynamic-spot {\n  filter: brightness(0) invert(1) !important;\n}\n\n.textarea-container .comm-tool .comm-emoji .icon-face {\n  background: none !important;\n  color: #000;\n}\nbody.dark .textarea-container .comm-tool .comm-emoji .icon-face {\n  color: #eee;\n}\n.textarea-container .comm-tool .comm-emoji .icon-face::before {\n  content: "\\f01f5";\n  display: inline-block;\n  font: normal normal normal 24px/1 "Material Design Icons";\n  font-size: 16px;\n  line-height: 1;\n  width: 16px;\n  height: 16px;\n}\nbody.dark .textarea-container .comm-tool .comm-emoji .icon-face {\n  filter: brightness(0) invert(1) !important;\n}\n\n.dynamic-spot,\n.textarea-container .comm-tool .comm-emoji .icon-face {\n  height: 16px !important;\n  width: 16px !important;\n  background-position: center !important;\n  opacity: 0.4;\n  display: inline-flex !important;\n}\n\n.comment-list .opera-list {\n  right: 20px !important;\n  top: -72px !important;\n}\n\n.v-wrap #comment {\n  z-index: 21 !important;\n}\n\n.l-con .tag-channel-pane {\n  z-index: 22 !important;\n}',""]),n.exports=o},355:n=>{"use strict";
// eslint-disable-next-line func-names
n.exports=function(n){var t=[];return t.toString=function(){return this.map((function(t){var e=n(t);return t[2]?"@media ".concat(t[2]," {").concat(e,"}"):e})).join("")},
// eslint-disable-next-line func-names
t.i=function(n,e,o){"string"==typeof n&&(
// eslint-disable-next-line no-param-reassign
n=[[null,n,""]]);var i={};if(o)for(var m=0;m<this.length;m++){
// eslint-disable-next-line prefer-destructuring
var r=this[m][0];null!=r&&(i[r]=!0)}for(var a=0;a<n.length;a++){var l=[].concat(n[a]);o&&i[l[0]]||(e&&(l[2]?l[2]="".concat(e," and ").concat(l[2]):l[2]=e),t.push(l))}},t}},940:(n,t,e)=>{var o=e(601);o&&o.__esModule&&(o=o.default),n.exports="string"==typeof o?o:o.toString()},32:(n,t,e)=>{var o=e(354);o&&o.__esModule&&(o=o.default),n.exports="string"==typeof o?o:o.toString()},807:n=>{function t(n){var t=new Error("Cannot find module '"+n+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=807,n.exports=t},849:n=>{"use strict";n.exports="- 删除热评头像下方的关注按钮\n- 删除用户的等级标识\n- 删除发送源信息(\\`来自安卓客户端\\` 这种)\n- 删除用户名右边的勋章\n- 删除评论区顶部的横幅\n- 发送时间移动到右上角\n- 位图图标全部换用矢量图标, 高分屏不会模糊\n- 投票仅显示链接, 隐藏下面的大框.\n\n> 注: 关注和等级可以通过鼠标停留在头像上, 在弹出的资料卡小窗中查看.\n"},986:n=>{"use strict";n.exports=coreApis.settings}},o={};function i(n){var t=o[n];if(void 0!==t)return t.exports;var m=o[n]={id:n,exports:{}};return e[n](m,m.exports,i),m.exports}t=Object.getPrototypeOf?n=>Object.getPrototypeOf(n):n=>n.__proto__,i.t=function(e,o){if(1&o&&(e=this(e)),8&o)return e;if("object"==typeof e&&e){if(4&o&&e.__esModule)return e;if(16&o&&"function"==typeof e.then)return e}var m=Object.create(null);i.r(m);var r={};n=n||[null,t({}),t([]),t(t)];for(var a=2&o&&e;"object"==typeof a&&!~n.indexOf(a);a=t(a))Object.getOwnPropertyNames(a).forEach((n=>r[n]=()=>e[n]));return r.default=()=>e,i.d(m,r),m},i.d=(n,t)=>{for(var e in t)i.o(t,e)&&!i.o(n,e)&&Object.defineProperty(n,e,{enumerable:!0,get:t[e]})},i.o=(n,t)=>Object.prototype.hasOwnProperty.call(n,t),i.r=n=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(n,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(n,"__esModule",{value:!0})};var m={};return(()=>{"use strict";i.d(m,{component:()=>t});const n="simplifyComments",t=(0,coreApis.componentApis.define.defineComponentMetadata)({name:n,entry:async n=>{let{metadata:t}=n;const{addComponentListener:e}=await Promise.resolve().then(i.t.bind(i,986,23));e(t.name,(n=>{document.body.classList.toggle("simplify-comment",n)}),!0)},instantStyles:[{name:n,style:()=>Promise.resolve().then(i.t.bind(i,32,23))},{name:n,style:()=>Promise.resolve().then(i.t.bind(i,940,23))}],displayName:"简化评论区",tags:[componentsTags.style],commitHash:"5b351cb7c988aafeffadc1a2b89dce2823f0a018",coreVersion:"2.6.1",description:(()=>{const n=i(807);return{...Object.fromEntries(n.keys().map((t=>[t.match(/index\.(.+)\.md$/)[1],n(t)]))),"zh-CN":()=>Promise.resolve().then(i.t.bind(i,849,17)).then((n=>n.default))}})()})})(),m=m.component})()));