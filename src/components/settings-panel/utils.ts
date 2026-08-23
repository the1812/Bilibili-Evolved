import { getGeneralSettings } from '@/core/settings'
import { formatVariables, getTitleVariablesFromDate } from '@/core/utils/title'

type StringMap = Record<string, string>

/** 根据`导出设置文件命名格式`生成文件名, 支持脚本名/版本/日期时间等变量, 可用`extraVariables`覆盖内置变量 */
export const getExportSettingsFilename = async (extraVariables: StringMap = {}) => {
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
