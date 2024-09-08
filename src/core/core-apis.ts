import * as ajax from '@/core/ajax'
import * as cdnTypes from '@/core/cdn-types'
import * as containerQuery from '@/core/container-query'
import * as download from '@/core/download'
import * as dialog from '@/core/dialog'
import * as externalInput from '@/core/external-input'
import * as filePicker from '@/core/file-picker'
import * as installFeature from '@/core/install-feature'
import * as horizontalScroll from '@/core/horizontal-scroll'
import * as lifeCycle from '@/core/life-cycle'
import * as loadingMode from '@/core/loading-mode'
import * as localStorage from '@/core/local-storage'
import * as meta from '@/core/meta'
import * as observer from '@/core/observer'
import * as reorder from '@/core/reorder'
import * as runtimeLibrary from '@/core/runtime-library'
import * as spinQuery from '@/core/spin-query'
import * as style from '@/core/style'
import * as textColor from '@/core/text-color'
import * as settings from '@/core/settings'
import * as shadowRoot from '@/core/shadow-root'
import * as userInfo from '@/core/user-info'
import * as version from '@/core/version'
import * as commonUtils from '@/core/utils'
import * as constants from '@/core/utils/constants'
import * as formatters from '@/core/utils/formatters'
import * as title from '@/core/utils/title'
import * as i18n from '@/core/utils/i18n'
import * as lazyPanel from '@/core/utils/lazy-panel'
import * as log from '@/core/utils/log'
import * as sort from '@/core/utils/sort'
import * as urls from '@/core/utils/urls'
import * as toast from '@/core/toast'
import * as themeColor from '@/core/theme-color'
import * as ui from '@/ui'
import { componentApis } from '@/components/api'
import { pluginApis } from '@/plugins/api'

/**
 * 核心API
 */
export const coreApis = {
  ajax,
  cdnTypes,
  containerQuery,
  download,
  dialog,
  externalInput,
  filePicker,
  installFeature,
  horizontalScroll,
  lifeCycle,
  loadingMode,
  localStorage,
  meta,
  observer,
  reorder,
  runtimeLibrary,
  spinQuery,
  style,
  textColor,
  userInfo,
  version,
  settings,
  shadowRoot,
  toast,
  themeColor,
  utils: {
    ...commonUtils,
    constants,
    formatters,
    title,
    i18n,
    lazyPanel,
    log,
    sort,
    urls,
  },
  ui,
  componentApis,
  pluginApis,
}
export type CoreApis = typeof coreApis
/** 可供外部使用的核心API */
export const externalApis = {
  ajax,
  ...cdnTypes,
  ...containerQuery,
  ...download,
  ...dialog,
  ...externalInput,
  ...filePicker,
  ...installFeature,
  ...horizontalScroll,
  lifeCycle,
  ...loadingMode,
  ...localStorage,
  ...meta,
  observer,
  ...reorder,
  runtimeLibrary,
  spinQuery,
  ...style,
  ...textColor,
  ...userInfo,
  ...version,
  ...shadowRoot,
  settingsApis: settings,
  get settings() {
    return settings.settings
  },
  ...toast,
  utils: {
    ...commonUtils,
    ...constants,
    ...formatters,
    ...title,
    ...i18n,
    ...lazyPanel,
    ...log,
    ...sort,
    ...urls,
  },
  ui,
  componentApis: {
    ...componentApis.component,
    ...componentApis.userComponent,
    ...componentApis.styledComponent,
    ...componentApis.launchBar,
    ...lodash.omit(componentApis, 'component', 'userComponent', 'styledComponent', 'launchBar'),
  },
  pluginApis: {
    ...pluginApis.style,
    ...pluginApis.plugin,
    ...pluginApis.data,
    ...pluginApis.hook,
  },
  monkeyApis: {
    GM_setValue,
    GM_getValue,
    GM_deleteValue,
    GM_xmlhttpRequest,
    GM_info,
  },
  lodash,
  Vue,
  sandboxWindow: window,
  theWorld: (time: number) => {
    setTimeout(() => {
      // eslint-disable-next-line no-debugger
      debugger
    }, time)
  },
}
export type ExternalApis = typeof externalApis
