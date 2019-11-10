export const toolTips = new Map<keyof BilibiliEvolvedSettings, string>([
  ["useDefaultPlayerMode", `Set the default player mode. Could be <span>Normal</span>, <span>Widescreen</span>, <span>Web fullscreen</span> or <span>Fullscreen</span>.`],
  ["defaultPlayerMode", `Select the default player mode.`],
  ["applyPlayerModeOnPlay", `Apply mode on video play instead of page load.`],
  ["useDefaultPlayerLayout", `Set the default player layout.
- Old: The legacy layout
- New: The default new layout
Warning: Some features won't work on old layout.`],
  ["defaultPlayerLayout", `Video player layout`],
  ["defaultBangumiLayout", `Bangumi player layout`],
  ["useDefaultVideoQuality", `Auto select the specified video quality. If the highest quality of video in lower than your choice, the highest quality will be used.`],
  ["defaultVideoQuality", "Select the default video quality."],
  ["autoLightOff", `Auto turn off the light when video starts playing, and turn on the light after complete.`],
  ["useDefaultDanmakuSettings", `Set the default settings about danmakus.`],
  ["enableDanmaku", `Disable this if you want to turn off danmakus by default.`],
  ["rememberDanmakuSettings", `Remember the "Prevent blocking subtitles" and "Smart danmaku mask" settings. If you change these settings on player, every video will apply these settings by default.`],
  ["expandDanmakuList", `Auto expand the danmaku list.`],
  ["autoPlay", `Auto start playing video on page load.`],
  ["autoContinue", `If playback history exists, auto continue from it.`],
  ["skipChargeList", `Skip charge acknowledgements on the end of some videos.`],
  ["framePlayback", `Append 2 buttons to the right of video time to seek video by frame. Support keyboard shortcut <kbd>Shift</kbd>+<kbd>←</kbd>/<kbd>→</kbd>. (Old layout can only use keyboard shortcut)`],
  ["playerFocus", `Auto scroll to the player when you enter the page.`],
  ["playerFocusOffset", `Set the scroll offset. (in px unit)`],
  ["customStyleColor", `Set the theme color for custom navbar, dark mode and more. Click the color circle to choose from 16 predefined colors, or input any valid hex color in textbox. (<span>#rrggbb</span> or <span>#rgb</span>)`],
  ["useDarkStyle", `Dark style looks much better at night, and will widely apply theme color.`],
  ["darkSchedule", `Schedule the dark mode time.`],
  ["compactLayout", `Use compact layout for homepage, reduce margin and remove rounded corner of video cards, use vector icons in categories.`],
  ["useCommentStyle", `- Remove "Follow" button on hot comments
- Remove the level badge of user
- Remove the platform info (like <span>From Android client</span>)
- Move post time to upper right.
- Use vector icons
Tip: You can still access the removed "Follow" and level badge by hovering on their avatars.`],
  ["simplifyLiveroom", `- Hide master icon
- Hide fan badge
- Hide event title
- Hide user level
- Hide captain icon
- Hide global notice
- Hide welcome message (xxx master entered room)
- Hide lottery draw notifications
- Disable room skin
Tip: Every item can be toggled individually in Add-ons.`],
  ["blurVideoControl", `Use background blur effect for video controls.`],
  ["customControlBackground", `Use a filled black rectangle as background of video controls instead of the original shadow effect.`],
  ["customControlBackgroundOpacity", `Set the opacity of rectangle`],
  ["harunaScale", `Make live room showgirl DPI-aware.`],
  ["removeLiveWatermark", `Remove the watermark of live stream`],
  ["removeVideoTopMask", `Remove the top mask of videos`],
  ["removeAds", `Remove all ads. including slideshow ads, mobile app ads and video ads.`],
  ["watchLaterRedirect", `Redirects all watchlater videos to the normal video page in order to use new layout.`],
  ["favoritesRedirect", `Redirects all videos in favorites from favorites playlist to the individual video page.`],
  ["hideTopSearch", `Use <span>"Search"</span> in place of search recommendations.`],
  ["fullTweetsTitle", `Always expand full title in the feeds peek in navbar.`],
  ["fullPageTitle", `Always expand full title of video episodes and (when there are many episodes) expand the entire list. (Not work for bangumi)`],
  ["biliplusRedirect", `Append "Jump to BiliPlus" button to Add-ons.`],
  ["imageResolution", `Request hi-resolution images by your screen DPI. But also cause longer loading time.`],
  ["oldTweets", `Replace feeds link by the old version, and you can switch between new and old versions in Add-ons.`],
  ["touchNavBar", `Allow to tap on a navbar item to view its popup info, instead of open the top-level link.`],
  ["comboLike", `Allow long press the like button to perform a combo like.`],
  ["touchVideoPlayer", `Increase margin of video control buttons for better touch experience. And enable touch gestures:
- Left/Right slide to seek
- Up/Down slide to adjust volume
- Cancel a gesture on upper left/right corner
- Slide on different position to use different sensibility.`],
  ["touchVideoPlayerAnimation", `Use experimental animations for touch gestures, but may cause frame drops.`],
  ["touchVideoPlayerDoubleTapControl", `Enable double-tap control: single tap to view/hide control bar, double tap to pause/resume.`],
  ["toast", `Show toasts on the lower left corner of page, including update notifications and error display.`],
  ["toastInternalError", `Show internal error messages, which may be helpful when reporting a bug.`],
  ["useCache", `Use cache to increase load speed of this userscript.`],
  ["outerWatchlater", `Move watchlater button from menu to outside.`],
  ["i18n", `[Experimental] Provides UI translation for some common words.`],
  ["i18nLanguage", `Set the target language.`],
  ["customNavbar", `Enable custom navbar to replace the legacy one. New navbars in live/photos/shop are not affected.`],
  ["customNavbarFill", `Use theme color to fill the navbar.`],
  ["allNavbarFill", `Fill theme color to all navbars, including live/photos/shop.`],
  ["customNavbarShadow", `Drop shadow for custom navbar.`],
  ["customNavbarCompact", `Use compact layout for custom navbar, provides smaller margins and use ... for long titles.`],
  ["customNavbarBlur", `If top banner exists, use background blur effect.`],
  ["playerShadow", `Use theme color shadow for player.`],
  ["narrowDanmaku", `Force preserve danmaku input in web fullscreen mode. May cause buttons on the right out of screen.`],
  ["hideOldEntry", `Hide "Back to old" buttons in new layout.`],
  ["hideBanner", `Hide top banner.`],
  ["allowJumpContinue", `Allow jump to episodes different from current.`],
  ["hideBangumiReviews", `Hide reviews on bangumi page.`],
  ["videoScreenshot", `Append screenshot button to the right of video time. Support keyboard shortcut <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>C</kbd>. (Old layout can only use keyboard shortcut)`],
  ["filenameFormat", `Customize the filename format used by <span>Download danmaku</span>, <span>Download video</span>, <span>Video screenshot</span>, <span>View cover</span>.
There are a few variables:
- <span>title</span>: Video title / Live room title
- <span>ep</span>: Episode title
- <span>aid</span>: AV ID
- <span>cid</span>: CID (The unique ID of video, as AV ID may contains multiple episodes)
- <span>lid</span>: Live room ID
- <span>y</span>/<span>M</span>/<span>d</span>: Year / Month / Day of month
- <span>h</span>/<span>m</span>/<span>s</span>/<span>ms</span>: Hour / Minute / Second / Millisecond

The default format is <span>[title][ - ep]</span>, representing video title and episode title. If episode title not exists, only video title is used.

Put your variables inside square brackets, other contents inside brackets (like "<span> - </span>" in "<span>[ - ep]</span>") will only appear when the variable exists. For instance, if the format is <span>[title] - [ep]</span>. Even there's no episode title, that "<span> - </span>" will still appear in filename (which is meaningless). So in default format, when episode title not exists, "<span> - </span>" will also disappear.

A more specific example: To use a "video title + AV ID + time" format, we can use <span>[title][ AVaid] [y]-[M]-[d] [h]-[m]-[s]</span>. And get filenames like "<span>xxxx AV23333 2019-05-29 19-59-44</span>".`],
  ['noLiveAutoplay', `Disable autoplay on live homepage.`],
  ['hideHomeLive', `Hide recommended live rooms on live homepage.`],
  ['sideBarOffset', `Set vertical offset of side bar (in percent). Valid range: -40% ~ 40%.`],
  ['hideCategory', `Hide category bar on main site, you can select category from Home in navbar.`],
  ['foldComment', `Append a <span>"Fold comments"</span> button on the bottom of page when viewing comments in feeds. Then you can quickly fold comments without scrolling up.`],
  ['showDeadVideoTitle', `Retrieve title and cover of dead videos in your space`],
  ['useBiliplusRedirect', `Jump to BiliPlus for dead videos.`],
  ['deadVideoTitleProvider', `Select dead video info provider: Watchlater is stable but takes some time, BiliPlus runs fast but it's not implemented yet.`],
  ['useDefaultVideoSpeed', `Set the default video playback rate.`],
  ['defaultVideoSpeed', `Select the default playback rate.`],
  ['seedsToCoins', `Append a <span>Seeds to coins</span> button, click to convert 700 silver seeds to 1 coin, up to one time per day.`],
  ['autoDraw', `Auto click draw button when there're drawing events in live room.`],
  ['keymap', `Enable more keyboard shortcuts for video player:
- <kbd>w</kbd> Web fullscreen
- <kbd>t</kbd> Wide screen / Theater mode
- <kbd>r</kbd> Toggle repeat
- <kbd>m</kbd> Toggle mute
- <kbd>d</kbd> Toggle danmakus
- <kbd>l</kbd> Like
- <kbd>c</kbd> Coin
- <kbd>s</kbd> Favorite
- <kbd>Shift + ↑/↓</kbd> / <kbd>Shift + ,/.</kbd> Playback speed adjust
- <kbd>Shift + /</kbd> Reset playback speed`],
  ['doubleClickFullscreen', `Allow double click the player to toggle fullscreen, please note that this feature will not work if <span>播放器触摸支持</span> - <span>启用双击控制</span> is also enabled.`],
  ['ajaxHook', `The Ajax Hook API may help other extensions or add-ons access ajax requests in bilibili.`],
  ['scriptLoadingMode', `Feature loading mode:
- Simultaneous: Load features as soon as possible
- Delay: Load features after the original page has loaded
- Simultaneous (Auto): Auto determine loading mode and prefer Simultaneous mode
- Delay (Auto): Auto determine loading mode and prefer Delay mode`],
  [`fullActivityContent`, `Always expand for full content of feeds.`],
  [`activityImageSaver`, `When viewing a save-restricted image in feeds, you can right-click to get a toast with that image for saving.`],
  [`selectableColumnText`, `Make texts in column selectable.`],
  [`watchlaterExpireWarnings`, `Videos in watchlater will expire and be deleted in 60 days. Enable this feature will show a warning if a video will expire in less than 14 days.`],
  [`miniPlayerTouchMove`, `Allow touch drag to move mini player.`],
  [`feedsFilter`, `Filter out unwanted feeds by type or keywords, and remove side cards in your feeds homepage.`],
  [`hideBangumiSponsors`, `Hide bangumi sponsors sections and buttons.`],
  [`hideRecommendLive`, `Hide recommended live broadcasts in video pages.`],
  [`hideRelatedVideos`, `Hide related videos in video and bangumi pages.`],
  [`simplifyHome`, `Replace the original homepage by one of these style:
- Simple: A clean design with additional feeds section.
- Minimal: Only video feeds and trending videos, no other sections.`],
]);
export default {
  export: { toolTips },
};