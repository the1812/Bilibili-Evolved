import {
  LoadFeatureCodeError,
  LoadFeatureCodeResultNoExport,
  LoadFeatureCodeResultOk,
} from '@/core/external-input/load-feature-code'
import { Toast } from '@/core/toast'
import { useScopedConsole } from '@/core/utils/log'
import { ComponentMetadata } from '@/components/types'
import { PluginMetadata } from '@/plugins/plugin'
import { loadFeatureCodeAllSettled } from '@/core/external-input/load-feature-code-all-settled'

const curConsole = useScopedConsole('@/core/external-input/load-features-from-codes.ts')

export enum FeatureKind {
  Component = 'Component',
  Plugin = 'Plugin',
}

const logError = (kind: FeatureKind): (featureName: string, err: LoadFeatureCodeError) => void => {
  const prefix = kind === FeatureKind.Component ? 'component' : 'plugin'
  return (featureName, err) => {
    if (err instanceof LoadFeatureCodeResultNoExport) {
      curConsole.error(`${prefix} '${featureName}' exports no value, failed to load`)
    } else {
      curConsole.error(`${prefix} '${featureName}' throws something when importing, failed to load`, { thrown: err.thrown })
    }
  }
}

const reportErrToUser = (featureKind: FeatureKind, errNames: string[]): void => {
  type ErrInfo = number | string[]

  const emptyErrInfo: () => string[] = () => []

  const accErrInfo = (acc: ErrInfo, featureName: string): ErrInfo => {
    if (Array.isArray(acc)) {
      if (acc.length < 3) {
        acc.push(featureName)
        return acc
      } else {
        return 4
      }
    } else {
      return acc + 1
    }
  }

  const reportErrInfo = (featureKind: FeatureKind, info: ErrInfo): void => {
    const kindName = featureKind === FeatureKind.Component ? '组件' : '插件'
    if (Array.isArray(info)) {
      Toast.error(
        `${kindName} "${info.join('", "')}" 加载失败。请向我们反馈，以解决此问题。`,
        `${kindName}加载失败`,
      )
    } else {
      Toast.error(
        `有 ${info} 个${kindName}加载失败，请向我们反馈，以解决此问题。`,
        `${kindName}加载失败`,
      )
    }
  }

  const errInfo = errNames.reduce(accErrInfo, emptyErrInfo())
  reportErrInfo(featureKind, errInfo)
}

type KindToType<K extends FeatureKind> =
  K extends FeatureKind.Component ? ComponentMetadata : PluginMetadata

/**
 * 批量加载组件或插件代码
 *
 * 如果遇到错误会向 console 和用户输出错误信息
 *
 * `names` 和 `codes` 应该是一一对应的
 *
 * @param kind 组件或插件类型
 * @param names 组件或插件名称
 * @param codes 组件或插件代码
 * @return 返回加载成功的组件或插件
 */
export async function loadFeaturesFromCodes(
  kind: FeatureKind.Component,
  names: string[],
  codes: string[],
): Promise<ComponentMetadata[]>
export async function loadFeaturesFromCodes(
  kind: FeatureKind.Plugin,
  names: string[],
  codes: string[],
): Promise<PluginMetadata[]>
export async function loadFeaturesFromCodes(
  kind: FeatureKind,
  names: string[],
  codes: string[],
): Promise<(ComponentMetadata | PluginMetadata)[]> {
  const results = await loadFeatureCodeAllSettled<KindToType<typeof kind>>(codes)
  const [namedOk, namedErr] = lodash(results)
    .map((r, i) => [names[i], r] as const)
    .partition(([, r]) => r.isOk())
    .value()

  // 输出日志
  lodash.forEach(namedErr, lodash.spread(logError(kind)))

  // 向用户输出错误报告
  if (namedErr.length > 0) {
    const errNames = namedErr.map(([name]) => name)
    reportErrToUser(kind, errNames)
  }

  return lodash.map(
    namedOk,
    ([, r]) => (r as LoadFeatureCodeResultOk<KindToType<typeof kind>>).feature,
  )
}
