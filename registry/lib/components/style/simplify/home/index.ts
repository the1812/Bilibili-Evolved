import { createSwitchOptions, SwitchOptions } from '@/components/switch-options'
import { ComponentMetadata } from '@/components/types'
import { addComponentListener, getComponentSettings } from '@/core/settings'
import { selectAll } from '@/core/spin-query'
import { addStyle } from '@/core/style'
import { mainSiteUrls } from '@/core/utils/urls'

const switchOptions: SwitchOptions = {
  name: 'simplifyOptions',
  dimAt: 'checked',
  switchProps: {
    checkedIcon: 'mdi-eye-off-outline',
    notCheckedIcon: 'mdi-eye-outline',
  },
  switches: {
    categories: {
      defaultValue: false,
      displayName: '分区栏',
    },
    trends: {
      defaultValue: false,
      displayName: '活动/热门视频',
    },
    online: {
      defaultValue: false,
      displayName: '在线列表',
    },
    'ext-box': {
      defaultValue: false,
      displayName: '电竞赛事',
    },
    special: {
      defaultValue: false,
      displayName: '特别推荐',
    },
    contact: {
      defaultValue: false,
      displayName: '联系方式',
    },
    elevator: {
      defaultValue: false,
      displayName: '右侧分区导航',
    },
  },
}
const metadata: ComponentMetadata = {
  name: 'simplifyHome',
  displayName: '简化首页',
  description: {
    'zh-CN': '隐藏原版首页不需要的元素/分区.',
  },
  instantStyles: [
    {
      name: 'simplifyHome',
      style: () => import('./home.scss'),
    },
  ],
  urlInclude: mainSiteUrls,
  tags: [componentsTags.style],
  entry: async () => {
    // 正好是首页时提供首页分区的简化选项
    if (document.URL !== 'https://www.bilibili.com/') {
      return
    }

    const { options } = getComponentSettings(metadata.name)
    const categoryElements = await selectAll('.proxy-box > div')
    const generatedOptions = Object.fromEntries(categoryElements.map(it => ([
      it.id.replace(/^bili_/, ''),
      {
        displayName: it.querySelector('header .name')?.textContent?.trim() ?? '未知分区',
        defaultValue: false,
      },
    ])))
    Object.entries(generatedOptions).forEach(([key, { displayName, defaultValue }]) => {
      const option = {
        defaultValue,
        displayName,
      }
      const optionKey = `switch-${key}`
      if (options[optionKey] === undefined) {
        options[optionKey] = defaultValue
      }
      const optionPath = `${metadata.name}.switch-${key}`
      addComponentListener(
        optionPath,
        (value: boolean) => {
          document.body.classList.toggle(optionPath, value)
        },
        true,
      )
      switchOptions.switches[key] = option
      options.simplifyOptions.switches[key] = option
    })
    const generatedStyles = Object.keys(generatedOptions).map(name => `
        body.simplifyHome-switch-${name} .storey-box .proxy-box #bili_${name} {
          display: none !important;
        }
      `.trim()).join('\n')
    addStyle(generatedStyles, 'simplify-home-generated')
  },
}

export const component = createSwitchOptions(switchOptions)(metadata)
