import { formatVariables, getTitleVariablesFromDate } from '@/core/utils/title'

type StringMap = Record<string, string>

/** 将命名格式字符串转换为文件名, 支持脚本名/版本/日期时间等变量, 可用`extraVariables`传入自定义变量 */
export const getExportSettingsFilename = async (format: string, extraVariables: StringMap = {}) => {
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
  return formatVariables(format, {
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
