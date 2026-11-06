import { getComponentSettings, getGeneralSettings } from '@/core/settings'
import { formatVariables, getTitleVariablesFromDate } from '@/core/utils/title'
import type { AutoUpdateOptions, FeatureType } from '../auto-update'

const branchPatterns = [
  /raw\.githubusercontent\.com\/[^/]+\/Bilibili-Evolved\/([^/]+)\//,
  /jsdelivr\.net\/gh\/[^/]+\/Bilibili-Evolved@([^/]+)\//,
]

/** 获取功能的安装来源分支, 无法识别时为 undefined */
export const getFeatureBranch = (type: FeatureType, name: string) => {
  const { urls } = getComponentSettings<AutoUpdateOptions>('autoUpdate').options
  const url = urls?.[type]?.[name]?.url
  return branchPatterns.map(pattern => url?.match(pattern)?.[1]).find(it => it)
}

/** 根据`导出设置文件命名格式`生成文件名, 支持脚本名/版本/日期时间等变量, 可用`extraVariables`覆盖内置变量 */
export const getExportSettingsFilename = async (extraVariables: Record<string, string> = {}) => {
  const { meta } = await import('@/core/meta')
  const {
    year: y,
    month: M,
    day: d,
    hour: h,
    minute: m,
    second: s,
    millisecond: ms,
  } = getTitleVariablesFromDate()
  return formatVariables(getGeneralSettings().exportSettingsFormat, {
    n: meta.name,
    v: `v${meta.compilationInfo.version}`,
    V: meta.compilationInfo.versionWithTag,
    y,
    M,
    d,
    h,
    m,
    s,
    ms,
    ...extraVariables,
  })
}
