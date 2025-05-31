import { wrapSwitchOptions } from '@/components/switch-options'

const name = 'simplifyComments'
export const component = wrapSwitchOptions({
  name: 'simplifyOptions',
  switchProps: {
    checkedIcon: 'mdi-checkbox-marked-circle',
    notCheckedIcon: 'mdi-checkbox-blank-circle-outline',
  },
  dimAt: false,
  switches: {
    userLevel: {
      defaultValue: true,
      displayName: '用户等级',
    },
    decorateAndTime: {
      defaultValue: true,
      displayName: '装扮 & 时间',
    },
    subReplyNewLine: {
      defaultValue: true,
      displayName: '回复换行',
    },
    replyEditor: {
      defaultValue: true,
      displayName: '编辑框',
    },
    fansMedal: {
      defaultValue: false,
      displayName: '粉丝勋章',
    },
    eventBanner: {
      defaultValue: true,
      displayName: '小喇叭横幅',
    },
  },
})({
  name,
  displayName: '简化评论区',
  entry: async ({ metadata, settings }) => {
    const { addStyle, getDefaultStyleID } = await import('@/core/style')
    const { isContainerStyleQuerySupported } = await import('@/core/container-query')
    const { addComponentListener } = await import('@/core/settings')
    addComponentListener(
      metadata.name,
      (value: boolean) => {
        document.body.classList.toggle('simplify-comment', value)
      },
      true,
    )

    // 等 Firefox 支持 [Container Style Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_size_and_style_queries#container_style_queries_2) 可去除此判断
    if (isContainerStyleQuerySupported()) {
      const { shadowRootStyles } = await import('@/core/shadow-root')
      const v3Style = await import('./comments-v3.scss').then(m => m.default)
      shadowRootStyles.toggleWithComponent(metadata.name, { id: name, style: v3Style })
    } else {
      const { shadowRootStyles } = await import('@/core/shadow-root')
      const firefoxStyles = require.context('./comments-v3-firefox', false, /\.scss$/)

      Object.keys(settings.options).forEach(key => {
        if (!key.startsWith('switch-')) {
          return
        }
        const id = `${component.name}.${key}`
        const styleName = lodash.kebabCase(key.replace(/^switch-/, ''))
        const path = `./${styleName}.scss`
        if (!firefoxStyles.keys().includes(path)) {
          return
        }

        addComponentListener(
          id,
          (value: boolean) => {
            if (value) {
              const style = firefoxStyles(path) as string
              addStyle(style, styleName)
              shadowRootStyles.addStyle({
                id,
                style,
              })
            } else {
              document.getElementById(getDefaultStyleID(styleName))?.remove()
              shadowRootStyles.removeStyle(id)
            }
          },
          true,
        )
      })
    }
  },
  instantStyles: [
    {
      name: `${name}v1`,
      style: () => import('./comments.scss'),
    },
    {
      name: `${name}v2`,
      style: () => import('./comments-v2.scss'),
    },
  ],
  tags: [componentsTags.style],
})
