export interface ExtraOptionsPanelInitData {
  header: {
    title: {
      /** 标题文字 */
      text: string
      /** 标题图标 */
      icon: string
    }
    actions: {
      /** 动作序号，从 0 开始增长，重复将会导致渲染异常 */
      id: number
      /** 动作标题 */
      title: string
      /** 动作图标 */
      icon: string
      /** 动作类名的后缀，前缀是 action- */
      actionClassNameSuffix: string
    }[]
  }
  content: {
    options: {
      /** 选项序号，从 0 开始增长，重复将会导致渲染异常 */
      id: number
      /** 选项标题 */
      title: string
      /** 选项介绍 */
      description: string
      /** 选项输入入口类名的后缀，前缀是 input- */
      inputClassNameSuffix: string
    }[]
  }
}

// 当使用 ExtraOptionsPanel 组件时，如果不传入 initData 所使用的默认数据
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
        actionClassNameSuffix: 'default-action-0',
      },
      {
        id: 1,
        title: '默认动作 1',
        icon: 'mdi-eye-outline',
        actionClassNameSuffix: 'default-action-1',
      },
    ],
  },
  content: {
    options: [
      {
        id: 0,
        title: '默认选项 0',
        description: '默认选项 0 的说明',
        inputClassNameSuffix: 'default-option-0',
      },
      {
        id: 1,
        title: '默认选项 1',
        description: '默认选项 1 的说明',
        inputClassNameSuffix: 'default-option-1',
      },
    ],
  },
}
