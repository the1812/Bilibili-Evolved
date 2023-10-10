export interface ExtraOptionsPanelInitData {
  header: {
    title: {
      /** 标题文字 */
      text: string
      /** 标题图标 */
      icon: string
    }
    actions: {
      /** 动作按钮序号，从 0 开始增长，重复将会导致渲染异常 */
      id: number
      /** 动作按钮标题 */
      title: string
      /** 动作按钮图标 */
      icon: string
      /** 动作按钮类名的后缀，直接写一个贴切的名字就好了 */
      iconClassNameSuffix: string
    }[]
  }
  content: {
    options: {
      /** 选项序号，从 0 开始增长，重复将会导致渲染异常。另外会在类似 eop-c-s-input-slot-0 的具名插槽用到 */
      id: number
      /** 选项标题 */
      title: string
      /** 选项介绍 */
      description: string
      /** 选项输入入口类名 */
      inputClassName: string
    }[]
  }
}

export const defaultInitData: ExtraOptionsPanelInitData = {
  header: {
    title: {
      text: '默认标题',
      icon: 'mdi-format-font',
    },
    actions: [
      {
        id: 0,
        title: '默认动作 0',
        icon: 'mdi-cog-sync-outline',
        iconClassNameSuffix: 'default-action-0',
      },
      {
        id: 1,
        title: '默认动作 1',
        icon: 'mdi-eye-outline',
        iconClassNameSuffix: 'default-action-1',
      },
    ],
  },
  content: {
    options: [
      {
        id: 0,
        title: '默认选项 0',
        description: '默认选项 0 的说明',
        inputClassName: 'default-option-0',
      },
      {
        id: 1,
        title: '默认选项 1',
        description: '默认选项 1 的说明',
        inputClassName: 'default-option-1',
      },
    ],
  },
}
