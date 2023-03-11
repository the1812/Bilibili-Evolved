export class LoadFeatureCodeError extends Error {}

/**
 * feature 代码运行沙箱
 */
type CodeSandbox = {
  /**
   * 在沙箱中执行代码
   *
   * @remarks
   * 代码执行时的相关注意事项见 {@link loadFeatureCode}
   *
   * @returns 一个二元组：`[导出值, 返回值]`
   * @throws {@link LoadFeatureCodeError}
   * 代码包含语法错误或代码执行时产生了异常
   */
  run(code: string): [unknown, unknown]
}

/**
 * 创建 feature 代码的运行沙箱
 *
 * @returns 一个 `CodeSandbox`。
 */
const createCodeSandbox = (): CodeSandbox => {
  // 需要被注入到 `sandbox` 中的键值对
  const injection = new Map([
    // 加固，防止逃逸
    [Symbol.unscopables, undefined],
    ['unsafeWindow', unsafeWindow],
  ] as [keyof any, unknown][])
  // 目标代码执行时的全局对象代理
  const sandbox = new Proxy(Object.create(null), {
    has: () => true,
    get: (_, p) => (injection.has(p) ? injection.get(p) : window[p as string]),
    set: (_, p, v) => !injection.has(p) && (window[p as string] = v),
  })
  const codeKey = 'BILIBILI_EVOLVED_LOAD_FEATURE_CODE_CODE_KEY_3B63D912__'
  // eslint-disable-next-line no-new-func
  const fn = Function(
    'window',
    `with (window) {
       return eval(${codeKey}) 
     }`,
  ).bind(undefined, sandbox)
  return {
    run(code) {
      injection.set('exports', {})
      injection.set(codeKey, code)
      let returned
      try {
        returned = fn()
      } catch (e) {
        throw new LoadFeatureCodeError(undefined, { cause: e })
      }
      const exportsValues = Object.values(injection.get('exports'))
      const exported = exportsValues.length > 0 ? exportsValues[0] : undefined
      return [exported, returned]
    },
  }
}

let staticCodeSandbox: CodeSandbox | undefined
/**
 * 执行 feature (component, plugin, style) 的代码，并尝试获取其导出元数据
 *
 * @remarks
 * feature 代码支持两种导出方式：
 * 1. 以 UMD 方式打包的库
 * 2. 若代码整体为一个表达式，则导出表达式的返回值
 *
 * 该函数线程不安全
 *
 * 代码默认以非严格模式执行，启用需自行添加 `use strict`。（从本项目中打包的 feature 自带严格模式）
 *
 * 代码执行时的全局对象为脚本管理器提供的 `window`。代码中支持访问 `unsafeWindow`。
 *
 * @param code - 被执行的代码
 * @returns 导出的元数据（不检测是否为正确的 feature）
 * @throws {@link LoadFeatureCodeError}
 * 代码包含语法错误或代码执行时产生了异常
 */
export const loadFeatureCode = (code: string): unknown => {
  staticCodeSandbox || (staticCodeSandbox = createCodeSandbox())
  const [exported, returned] = staticCodeSandbox.run(code)
  return exported || returned
}
