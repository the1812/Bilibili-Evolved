export type RadioItem = {
  /**
   * 选项名称
   *
   * isOption为false时直接显示文本
   * isOption为true时显示对应选项的displayName
   */
  name: string

  /** 是否为脚本设置选项 */
  isOption?: boolean

  /** 下拉面板中包含的选项名称，可以是名称数组或正则表达式 */
  optionsIncluded?: string[] | RegExp

  /**
   * 是否选中
   *
   * isOption为true时将忽略设置，自动绑定为选项状态
   */
  checked?: boolean

  /** 选项变化时的回调 */
  onChange?: (checked: boolean) => void
}
