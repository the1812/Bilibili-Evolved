export interface ExtraOptionsPanelInitData {
  header: {
    title: {
      /** 标题文字 */
      text: string
      /** 标题图标 */
      icon: string
    }
    actions: {
      /** 动作按钮序号，从 0 开始增长，不可重复 */
      id: number
      /** 动作按钮标题 */
      title: string
      /** 动作按钮图标 */
      icon: string
      /** 动作按钮类名的后缀，直接写一个贴切的名字就好了 */
      classNameSuffix: string
    }[]
  }
  content: {
    sections: {
      /** 选项序号，从 0 开始增长，不可重复 */
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
