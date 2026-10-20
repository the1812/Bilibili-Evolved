import { defineComponentMetadata } from '@/components/define'
import { addComponentListener, removeComponentListener } from '@/core/settings'
import { select } from '@/core/spin-query'
import { videoUrls } from '@/core/utils/urls'
import { TagFilterController } from './card-filter'
import { COMPONENT_NAME, getBlockedTags, getBlockedTypes, getWhitelist, options } from './common'

// 注意: componentsTags 是本体注入的全局变量 (见 src/client/init.ts), 不要写成
// `import { componentsTags } from '@/components/types'`.
// 该模块会被外部化成 coreApis.componentApis.types, 而 componentApis 里没有 types,
// 装成自定义组件时会直接抛 TypeError, 表现为安装时提示「无效的组件代码」.

let controller: TagFilterController | null = null
/** 用户希望组件处于运行状态, 用于丢弃"启动过程中被卸载"的结果 */
let active = false

const optionNames = ['blockedTags', 'blockedTypes', 'whitelist']

const getRules = () => ({
  blockedTags: getBlockedTags(),
  blockedTypes: getBlockedTypes(),
  whitelist: getWhitelist(),
})

const onRulesChanged = () => {
  // 规则变化后, 用缓存里的标签重新判断一遍已经渲染的卡片
  controller?.refresh()
}

const startFilter = async () => {
  active = true
  if (controller !== null) {
    return
  }
  // 组件可能在 document-start 阶段被加载, 这里等 body 出现
  await select(() => document.body ?? null)
  if (!active || controller !== null) {
    return
  }
  controller = new TagFilterController(getRules)
  controller.start()
  optionNames.forEach(name => {
    addComponentListener(`${COMPONENT_NAME}.${name}`, onRulesChanged)
  })
}

const stopFilter = () => {
  active = false
  optionNames.forEach(name => {
    removeComponentListener(`${COMPONENT_NAME}.${name}`, onRulesChanged)
  })
  controller?.stop()
  controller = null
}

export const component = defineComponentMetadata({
  name: COMPONENT_NAME,
  displayName: '按标签屏蔽视频',
  tags: [componentsTags.utils],
  author: {
    name: 'caxwell',
    link: 'https://github.com/caxwell',
  },
  options,
  instantStyles: [
    {
      name: COMPONENT_NAME,
      style: () => import('./filter-by-tag.scss'),
    },
  ],
  extraOptions: () => import('./Settings.vue').then(m => m.default),
  entry: () => startFilter(),
  reload: () => startFilter(),
  unload: () => {
    stopFilter()
  },
  urlInclude: [
    // 首页推荐流
    /^https:\/\/www\.bilibili\.com\/(index\.html)?([?#].*)?$/,
    // 搜索页
    /^https:\/\/search\.bilibili\.com\//,
    // 视频页 (右侧相关推荐)
    ...videoUrls,
  ],
})
