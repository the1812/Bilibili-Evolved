import { wrapSwitchOptions, defineSwitchMetadata } from '@/components/switch-options'

import { addComponentListener, getComponentSettings } from '@/core/settings'
import { sq } from '@/core/spin-query'
import { addStyle } from '@/core/style'
import { getCookieValue, matchUrlPattern } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'
import { mainSiteUrls } from '@/core/utils/urls'

const switchMetadata = defineSwitchMetadata({
  name: 'simplifyOptions',
  switches: {
    carousel: {
      defaultValue: false,
      displayName: '轮播图',
    },
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
      displayName: '在线列表(旧)',
    },
    'ext-box': {
      defaultValue: false,
      displayName: '电竞赛事(旧)',
    },
    special: {
      defaultValue: false,
      displayName: '特别推荐(旧)',
    },
    contact: {
      defaultValue: false,
      displayName: '联系方式',
    },
    elevator: {
      defaultValue: false,
      displayName: '右侧分区导航(旧)',
    },
  },
})
const console = useScopedConsole('简化首页')

export const component = wrapSwitchOptions(switchMetadata)({
  name: 'simplifyHome',
  displayName: '简化首页',
  description: '隐藏原版首页不需要的元素 / 分区.',
  instantStyles: [
    {
      name: 'simplifyHome',
      style: () => import('./home.scss'),
    },
  ],
  urlInclude: mainSiteUrls,
  tags: [componentsTags.style],
  entry: async ({ metadata }) => {
    // 正好是首页时提供首页分区的简化选项
    const isHome = matchUrlPattern('https://www.bilibili.com/')
    if (!isHome) {
      return
    }

    console.log('isHome', isHome)
    const { options } = getComponentSettings(metadata.name)
    const isNewHome = getCookieValue('i-wanna-go-back') === '-1'
    type SimplifyHomeOption = {
      displayName: string
      defaultValue: boolean
    }
    const generatedOptions: Record<string, SimplifyHomeOption> = await (async () => {
      if (!isNewHome) {
        const categoryElements = await sq(
          () => dqa('.proxy-box > div'),
          elements => elements.length > 0 || !isHome,
        )
        return categoryElements
          ? Object.fromEntries(
              categoryElements.map(it => [
                it.id.replace(/^bili_/, ''),
                {
                  displayName: it.querySelector('header .name')?.textContent?.trim() ?? '未知分区',
                  defaultValue: false,
                },
              ]),
            )
          : {}
      }

      const skipIds = ['推广']
      const headers = await sq(
        () => dqa('.bili-grid .the-world'),
        elements => elements.length > 3 || !isHome,
      )
      console.log(headers)
      const getContainer = (header: Element) => {
        let currentElement = header
        while (currentElement.parentElement) {
          if (currentElement.classList.contains('bili-grid')) {
            return currentElement
          }
          currentElement = currentElement.parentElement
        }
        return null
      }
      const entries =
        headers
          ?.filter(element => !skipIds.includes(element.id))
          .map(element => {
            const container = getContainer(element) as HTMLElement
            const name = element.id
            if (container) {
              container.dataset.area = name
              return [
                name,
                {
                  displayName: name,
                  defaultValue: false,
                },
              ]
            }
            return null
          })
          .filter((it): it is [string, SimplifyHomeOption] => it !== null) ?? []
      return Object.fromEntries(entries)
    })()
    const generatedSwitches: Record<string, unknown> = {}
    Object.entries(generatedOptions).forEach(([key, { displayName, defaultValue }]) => {
      const option = {
        defaultValue,
        displayName,
      }
      const optionKey = `switch-${key}`
      if (options[optionKey] === undefined) {
        options[optionKey] = defaultValue
      }
      const switchKey = `switch-${key}`
      addComponentListener(
        `${metadata.name}.${switchKey}`,
        (value: boolean) => {
          document.body.classList.toggle(`${metadata.name}-${switchKey}`, value)
        },
        true,
      )
      switchMetadata.switches[key] = option
      generatedSwitches[key] = option
    })
    ;(options.simplifyOptions as any).switches = generatedSwitches
    const generatedStyles = Object.keys(generatedOptions)
      .map(name =>
        `
        body.simplifyHome-switch-${name} .bili-layout .bili-grid[data-area="${name}"],
        body.simplifyHome-switch-${name} .storey-box .proxy-box #bili_${name} {
          display: none !important;
        }
      `.trim(),
      )
      .join('\n')
    addStyle(generatedStyles, 'simplify-home-generated')
  },
})
