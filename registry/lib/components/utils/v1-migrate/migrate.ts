import { DocSourceItem } from 'registry/lib/docs'
import { componentsMap } from '@/components/component'
import { installComponent } from '@/components/user-component'
import { monkey } from '@/core/ajax'
import { cdnRoots } from '@/core/cdn-types'
import { Executable } from '@/core/common-types'
import { meta } from '@/core/meta'
import { getComponentSettings, getGeneralSettings, settings } from '@/core/settings'
import { Toast } from '@/core/toast'
import { logError } from '@/core/utils/log'
import { getHook } from '@/plugins/hook'
import { installPlugin, pluginsMap } from '@/plugins/plugin'
import { UserStyle } from '@/plugins/style'

export const runMigrate = async (v1Settings: any) => {
  const toast = Toast.info('下载功能列表中', '导入 v1 设置')
  try {
    console.log('下载功能列表中')
    const featuresDataUrl = `${cdnRoots[getGeneralSettings().cdnRoot](
      meta.compilationInfo.branch,
    )}doc/features/features.json`
    const featuresDataText = await monkey({
      url: featuresDataUrl,
    })
    console.log(featuresDataText)
    const features: DocSourceItem[] = JSON.parse(featuresDataText)
    console.log('下载功能列表完成')

    const featureMap =
      (oldKey: string, newKey: string, type: 'component' | 'plugin') => async () => {
        const oldValue = v1Settings[oldKey]
        if (!oldValue) {
          console.log(`跳过了未开启的选项 ${oldKey}`)
          return
        }
        const map = {
          component: componentsMap,
          plugin: pluginsMap,
        }
        const installerMap = {
          component: installComponent,
          plugin: installPlugin,
        }
        if (!(newKey in map[type])) {
          const featureItem = features.find(it => it.type === type && it.name === newKey)
          const path = featureItem?.fullAbsolutePath
          if (!path || !featureItem) {
            console.log(`没有找到名为 ${newKey} 的功能`)
            return
          }
          const url = `${cdnRoots[getGeneralSettings().cdnRoot](
            meta.compilationInfo.branch,
            featureItem.owner,
          )}${path}`
          const code = await monkey({ url })
          const { before, after } = getHook(`user${lodash.startCase(type)}s.add`, code, url)
          await before()
          const { metadata, message } = await installerMap[type](code)
          await after(metadata)
          console.log(message)
        } else {
          console.log(`${newKey} 已经存在, 跳过安装`)
        }
      }
    const optionMap = (oldKey: string, newKey: string, mapFunction?: (value: any) => any) => () => {
      const oldValue = v1Settings[oldKey]
      const newValue = mapFunction?.(oldValue) ?? oldValue
      if (newValue !== undefined) {
        const [componentName, ...optionPath] = newKey.split('.')
        const { options } = getComponentSettings(componentName)
        lodash.set(options, optionPath, newValue)
      }
      console.log(`迁移了选项 ${oldKey} -> ${newKey}`)
    }
    const stylesMap = () => () => {
      const { customStyles } = v1Settings
      customStyles
        .filter((style: any) => style.enabled)
        .forEach((style: any) => {
          settings.userStyles[style.name] = lodash.omit(style, 'enabled') as Required<UserStyle>
        })
    }
    const getPlugin = (pluginName: string) =>
      // magic: guiSettings is always enabled
      featureMap('guiSettings', pluginName, 'plugin')
    const i18nMap = () => none
    // const { i18n, i18nLanguage } = v1Settings
    // if (!i18n) {
    //   return none
    // }
    // const languageMappings = {
    //   English: 'i18n.language.english',
    //   日本語: 'i18n.language.japanese',
    // }
    // return getPlugin(languageMappings[i18nLanguage])

    const navbarItemMappings = {
      category: 'home',
      activities: 'feeds',
      bangumi: 'subscriptions',
      watchlaterList: 'watchlater',
      favoritesList: 'favorites',
      historyList: 'history',
      rankingLink: 'ranking',
      drawingLink: 'drawing',
      bangumiLink: 'bangumi',
      musicLink: 'music',
      matchLink: 'match',
      shopLink: 'shop',
    }

    const migrateActions: Executable[] = [
      featureMap('useDarkStyle', 'darkMode', 'component'),
      featureMap('darkColorScheme', 'darkModeFollowSystem', 'component'),
      featureMap('hideBanner', 'hideBanner', 'component'),
      featureMap('expandDanmakuList', 'expandDanmakuList', 'component'),
      optionMap('expandDanmakuListIgnoreMediaList', 'expandDanmakuList.ignoreMediaList'),
      featureMap('expandDescription', 'fullVideoDescription', 'component'),
      featureMap('watchlaterRedirect', 'watchlaterRedirect', 'component'),
      optionMap('watchLaterRedirectNavbar', 'watchlaterRedirect.navbar'),
      optionMap('watchLaterRedirectPage', 'watchlaterRedirect.page'),
      featureMap('touchVideoPlayer', 'touchPlayerGestures', 'component'),
      featureMap('touchVideoPlayer', 'touchPlayerControl', 'component'),
      featureMap('customControlBackground', 'playerControlBackground', 'component'),
      optionMap(
        'customControlBackgroundOpacity',
        'playerControlBackground.opacity',
        (value: string) => {
          const opacity = parseFloat(value)
          return Math.round(opacity * 100)
        },
      ),
      featureMap('darkSchedule', 'darkModeSchedule', 'component'),
      optionMap('darkScheduleStart', 'darkModeSchedule.range.start'),
      optionMap('darkScheduleEnd', 'darkModeSchedule.range.end'),
      featureMap('fullTweetsTitle', 'fullFeedsTitle', 'component'),
      featureMap('fullPageTitle', 'fullEpisodeTitle', 'component'),
      featureMap('removeVideoTopMask', 'hideVideoTopMask', 'component'),
      featureMap('removeLiveWatermark', 'removeLiveWatermark', 'component'),
      featureMap('harunaScale', 'dpiLiveShowgirl', 'component'),
      featureMap('harunaScale', 'dpiLiveShowgirl', 'component'),
      featureMap('removeAds', 'removePromotions', 'component'),
      optionMap('showBlockedAdsTip', 'removePromotions.showPlaceholder'),
      optionMap('preserveEventBanner', 'removePromotions.preserveEventBanner'),
      featureMap('touchVideoPlayerDoubleTapControl', 'doubleClickControl', 'component'),
      optionMap('customStyleColor', 'settingsPanel.themeColor'),
      featureMap('useDefaultPlayerMode', 'defaultPlayerMode', 'component'),
      optionMap('applyPlayerModeOnPlay', 'defaultPlayerMode.applyOnPlay'),
      optionMap('defaultPlayerMode', 'defaultPlayerMode.mode'),
      // featureMap('useDefaultVideoQuality', 'defaultVideoQuality', 'component'),
      // optionMap('defaultVideoQuality', 'defaultVideoQuality.quality'),
      featureMap('skipChargeList', 'skipChargeList', 'component'),
      featureMap('comboLike', 'touchComboLike', 'component'),
      featureMap('autoLightOff', 'playerAutoLight', 'component'),
      featureMap('airborne', 'danmakuAirborne', 'component'),
      featureMap('useBiliplusRedirect', 'biliplusRedirect', 'component'),
      featureMap('biliplusRedirect', 'biliplusRedirect', 'component'),
      featureMap('framePlayback', 'seekByFrames', 'component'),
      featureMap('useCommentStyle', 'simplifyComments', 'component'),
      featureMap('imageResolution', 'imageResolution', 'component'),
      optionMap('imageResolutionScale', 'imageResolution.scale'),
      featureMap('playerFocus', 'playerFocus', 'component'),
      optionMap('playerFocusOffset', 'playerFocus.offset'),
      featureMap('simplifyLiveroom', 'simplifyLiveroom', 'component'),
      optionMap(
        'simplifyLiveroomSettings',
        'simplifyLiveroom',
        (switches: Record<string, number>) => {
          const { options } = getComponentSettings('simplifyLiveroom')
          Object.assign(
            options,
            Object.fromEntries(
              Object.entries(switches).map(([key, value]) => [`switch-${key}`, value]),
            ),
          )
        },
      ),
      featureMap('customNavbar', 'customNavbar', 'component'),
      getPlugin('customNavbar.items.darkMode'),
      optionMap('favoritesListCurrentSelect', 'customNavbar.lastFavoriteFolder'),
      optionMap('touchNavBar', 'customNavbar.touch'),
      optionMap('customNavbarFill', 'customNavbar.fill'),
      optionMap('customNavbarTransparent', 'customNavbar.transparent'),
      optionMap('customNavbarShadow', 'customNavbar.shadow'),
      optionMap('customNavbarBlur', 'customNavbar.blur'),
      optionMap('customNavbarOrder', 'customNavbar.order', (orders: Record<string, number>) => {
        Object.keys(orders).forEach(key => {
          if (key in navbarItemMappings) {
            orders[navbarItemMappings[key]] = orders[key]
            delete orders[key]
          }
        })
        delete orders.mangaLink
        return orders
      }),
      optionMap('customNavbarHidden', 'customNavbar.hidden', (hiddenItems: string[]) => {
        ;[...hiddenItems].forEach(item => {
          if (item in navbarItemMappings) {
            hiddenItems.push(navbarItemMappings[item])
            lodash.pull(hiddenItems, item)
          }
        })
        lodash.pull(hiddenItems, 'mangaLink')
        return hiddenItems
      }),
      optionMap('customNavbarBoundsPadding', 'customNavbar.padding', (it: string) =>
        parseFloat(it),
      ),
      optionMap('customNavbarGlobalFixed', 'customNavbar.globalFixed'),
      optionMap('customNavbarSeasonLogo', 'customNavbar.seasonLogo'),
      optionMap('customNavbarShowDeadVideos', 'customNavbar.showDeadVideos'),
      featureMap('playerShadow', 'playerShadow', 'component'),
      featureMap('narrowDanmaku', 'preserveDanmakuInput', 'component'),
      featureMap('outerWatchlater', 'outerWatchlater', 'component'),
      featureMap('videoScreenshot', 'videoScreenshot', 'component'),
      featureMap('hideBangumiReviews', 'hideBangumiReviews', 'component'),
      optionMap('filenameFormat', 'settingsPanel.filenameFormat'),
      optionMap('batchFilenameFormat', 'settingsPanel.batchFilenameFormat'),
      featureMap('sidebarOffset', 'sidebarOffset', 'component'),
      optionMap('sidebarOffset', 'sidebarOffset.offset'),
      featureMap('noLiveAutoplay', 'liveHomeMute', 'component'),
      featureMap('foldComment', 'rememberVideoSpeed', 'component'),
      optionMap('defaultVideoSpeed', 'rememberVideoSpeed.speed'),
      optionMap('rememberVideoSpeedList', 'rememberVideoSpeed.individualRememberList'),
      optionMap('rememberVideoSpeed', 'rememberVideoSpeed.individualRemember'),
      optionMap('extendVideoSpeed', 'rememberVideoSpeed.extend'),
      optionMap('extendVideoSpeedList', 'rememberVideoSpeed.extendList'),
      featureMap('foldComment', 'foldComments', 'component'),
      featureMap('autoDraw', 'liveAutoDraw', 'component'),
      featureMap('keymap', 'keymap', 'component'),
      optionMap('keymapPreset', 'keymap.preset'),
      optionMap('keymapJumpSeconds', 'keymap.longJumpSeconds'),
      optionMap('customKeyBindings', 'keymap.customKeyBindings'),
      featureMap('doubleClickFullscreen', 'doubleClickFullscreen', 'component'),
      optionMap(
        'doubleClickFullscreenPreventSingleClick',
        'doubleClickFullscreen.preventSingleClick',
      ),
      // TODO: simpleHome & minimalHome
      optionMap('scriptLoadingMode', 'settingsPanel.scriptLoadingMode', (value: string) =>
        value.replace(/\(自动\)$/, ''),
      ),
      optionMap('guiSettingsDockSide', 'settingsPanel.dockSide'),
      featureMap('fullActivityContent', 'fullFeedsContent', 'component'),
      featureMap('feedsFilter', 'feedsFilter', 'component'),
      optionMap('feedsFilterPatterns', 'feedsFilter.patterns'),
      optionMap('feedsSpecialFilterTypes', 'feedsFilter.types'),
      optionMap('feedsFilterSideCards', 'feedsFilter.sideCards'),
      featureMap('selectableColumnText', 'columnUnlock', 'component'),
      featureMap('miniPlayerTouchMove', 'touchMiniPlayer', 'component'),
      featureMap('hideBangumiSponsors', 'hideBangumiSponsors', 'component'),
      featureMap('hideRecommendLive', 'hideRecommendedLive', 'component'),
      featureMap('hideRelatedVideos', 'hideRelatedVideos', 'component'),
      featureMap('urlParamsClean', 'urlParamsClean', 'component'),
      featureMap('collapseLiveSideBar', 'collapseLiveSideBar', 'component'),
      // featureMap('feedsTranslate', 'feedsTranslate', 'component'),
      // optionMap('feedsTranslateProvider', 'i18n.translator'),
      // featureMap('commentsTranslate', 'commentsTranslate', 'component'),
      optionMap('foregroundColorMode', 'settingsPanel.textColor'),
      optionMap('updateCdn', 'settingsPanel.cdnRoot'),
      optionMap(
        'downloadPackageEmitMode',
        'settingsPanel.downloadPackageEmitMode',
        (value: string) => (value === '分别下载' ? '单独下载' : value),
      ),
      featureMap('bvidConvert', 'bvidConvert', 'component'),
      featureMap('fixedSidebars', 'fixedFeedsSidebars', 'component'),
      featureMap('autoHideSideBar', 'autoHideSidebar', 'component'),
      featureMap('livePip', 'livePip', 'component'),
      featureMap('extendFeedsLive', 'extendFeedsLive', 'component'),
      featureMap('playerOnTop', 'playerOnTop', 'component'),
      // featureMap('restoreFloors', 'restoreFloors', 'component'),
      featureMap('quickFavorite', 'quickFavorite', 'component'),
      optionMap('quickFavoriteID', 'quickFavorite.favoriteFolderID'),
      featureMap('disableFeedsDetails', 'disableFeedsDetails', 'component'),
      featureMap('elegantScrollbar', 'elegantScrollbar', 'component'),
      featureMap('danmakuSendBar', 'liveDanmakuSendbar', 'component'),
      featureMap('showCoverBeforePlay', 'showCoverBeforePlay', 'component'),
      // featureMap('volumeOverdrive', 'volumeOverdrive', 'component'),
      featureMap('seoJump', 'seoRedirect', 'component'),
      featureMap('copyFeedsLink', 'copyFeedsLink', 'component'),
      featureMap('copyCommentLink', 'copyCommentsLink', 'component'),
      featureMap('unfoldFeeds', 'unfoldFeeds', 'component'),
      featureMap('feedsImageExporter', 'imageExporter', 'component'),
      featureMap('columnImageExporter', 'imageExporter', 'component'),
      featureMap('preferAvUrl', 'avUrl', 'component'),
      featureMap('homeHidden', 'simplifyHome', 'component'),
      optionMap('homeHiddenItems', 'simplifyHome', (items: string[]) => {
        const { options } = getComponentSettings('simplifyHome')
        items.forEach(item => (options[`switch-${item}`] = true))
      }),
      featureMap('alwaysShowDuration', 'alwaysShowDuration', 'component'),
      featureMap('removeVideoPopup', 'removePlayerPopup', 'component'),
      featureMap('removeGuidePopup', 'removePlayerPopup', 'component'),
      featureMap('removeVotePopup', 'removePlayerPopup', 'component'),
      optionMap('removeVideoPopup', 'removePlayerPopup.relatedVideos'),
      optionMap('removeGuidePopup', 'removePlayerPopup.comboLikes'),
      optionMap('removeVotePopup', 'removePlayerPopup.votes'),
      featureMap('checkInCenter', 'checkInCenter', 'component'),
      featureMap('fullscreenGiftBox', 'liveGiftBox', 'component'),
      featureMap('autoPlayControl', 'legacyAutoPlay', 'component'),
      featureMap('scrollOutPlayer', 'playerIntersectionActions', 'component'),
      optionMap('scrollOutPlayerTriggerPlace', 'playerIntersectionActions.triggerLocation'),
      optionMap('scrollOutPlayerAutoPause', 'playerIntersectionActions.pause'),
      optionMap('scrollOutPlayerAutoLightOn', 'playerIntersectionActions.light'),
      featureMap('disableDanmakuHighlights', 'disableSpecialDanmaku', 'component'),
      featureMap('disableUpDanmakuStyle', 'disableSpecialDanmaku', 'component'),
      optionMap('disableDanmakuHighlights', 'disableSpecialDanmaku.highlight'),
      optionMap('disableUpDanmakuStyle', 'disableSpecialDanmaku.up'),
      featureMap('viewCover', 'viewCover', 'component'),
      featureMap('downloadVideo', 'downloadVideo', 'component'),
      getPlugin('downloadVideo.outputs.aria2'),
      getPlugin('downloadVideo.outputs.idm'),
      optionMap('downloadVideoQuality', 'downloadVideo.basicConfig.quality'),
      optionMap('downloadVideoFormat', 'downloadVideo.basicConfig.api', (format: string) => {
        const formatMappings = {
          flv: 'video.flv',
          dash: v1Settings.downloadVideoDashCodec.startsWith('HEVC')
            ? 'video.dash.hevc'
            : 'video.dash.avc',
        }
        return formatMappings[format]
      }),
      optionMap('downloadVideoDefaultDanmaku', 'downloadVideo.danmakuType'),
      optionMap('downloadVideoDefaultSubtitle', 'downloadVideo.subtitleType'),
      optionMap('aria2RpcOptionProfiles', 'downloadVideo.rpcProfiles'),
      featureMap('downloadDanmaku', 'downloadDanmaku', 'component'),
      featureMap('downloadSubtitle', 'downloadSubtitle', 'component'),
      featureMap('downloadAudio', 'downloadAudio', 'component'),
      featureMap('downloadLiveRecords', 'downloadLiveRecords', 'component'),
      featureMap('medalHelper', 'badgeHelper', 'component'),
      optionMap('defaultMedalID', 'badgeHelper.defaultMedalID'),
      optionMap('autoMatchMedal', 'badgeHelper.autoMatchMedal'),
      stylesMap(),
      i18nMap(),
    ]

    let completed = 0
    toast.message = `导入中... (${completed}/${migrateActions.length})`

    let success = 0
    let fail = 0
    for (const action of migrateActions) {
      try {
        await action()
        success++
      } catch (error) {
        console.log(error)
        fail++
      } finally {
        completed++
        toast.message = `导入中... (${completed}/${migrateActions.length})`
      }
    }
    toast.message = `导入完成. 成功 ${success} 个, 失败 ${fail} 个, 可在控制台查看详细日志.`
  } catch (error) {
    toast.close()
    logError(error)
  }
}
