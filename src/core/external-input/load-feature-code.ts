import { ComponentMetadata } from '@/components/types'
import { PluginMetadata } from '@/plugins/plugin'
import { UserStyle } from '@/plugins/style'

export class LoadFeatureError extends Error {}

/**
 * 执行 feature (component, plugin, style) 的代码，并尝试获取其导出元数据
 *
 * @remarks
 * feature 代码支持两种导出格式：
 * 1. 在本项目中打包 feature 所使用的导出格式
 * 2. 若代码整体为一个表达式，则导出表达式的返回值
 *
 * @param code - 被执行的代码
 * @returns 导出的元数据
 * @throws {@link LoadFeatureError} 代码抛出了一个值或代码存在语法错误
 */
export const loadFeatureCode = (code: string): ComponentMetadata | PluginMetadata | UserStyle => {
  // 将 `key` 和 `val` 临时赋值到 `target` 上并返回
  // 调用返回值中的 restore 函数，可以恢复 `target` 中该属性的原始情况（包括属性不存在的情况）
  const temporarilySet = <O extends object, K extends keyof any, V>(
    target: O,
    key: K,
    val: V,
  ): { target: O & Record<K, V>; restore(): void } => {
    const target0 = target as { [K0 in K]?: V }
    let restore
    if (key in target0) {
      const org = target0[key]
      target0[key] = val
      restore = () => {
        target0[key] = org
      }
    } else {
      target0[key] = val
      restore = () => {
        delete target0[key]
      }
    }
    return {
      target: target0 as O & Record<K, V>,
      restore,
    }
  }

  // to save what the code exports
  const exports = {}
  // value to return.
  let result: unknown
  const { restore } = temporarilySet(window, 'exports', exports)
  const gEval = eval
  // eval code
  try {
    result = gEval(code)
  } catch {
    throw new LoadFeatureError()
  } finally {
    // restore window.exports
    restore()
  }

  // set the value code exported to variable `result` if it exists
  const values = Object.values(exports)
  if (values.length !== 0) {
    result = values[0]
  }

  return result as ComponentMetadata | PluginMetadata | UserStyle
}
