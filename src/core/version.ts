import { FeatureBase } from '@/components/types'
import { loadFeatureCode } from './external-input'
import { meta } from './meta'
import { useScopedConsole } from './utils/log'

export enum CompareResult {
  Less = -1,
  Equal = 0,
  Greater = 1,
  Incomparable = NaN,
}
export class Version {
  parts: number[]
  constructor(public versionString: string) {
    if (!/^[\d\.]+$/.test(versionString)) {
      throw new Error('Invalid version string')
    }
    this.parts = versionString.split('.').map(it => parseInt(it))
  }
  compareTo(other: Version) {
    for (let i = 0; i < this.parts.length; ++i) {
      if (other.parts.length === i) {
        return CompareResult.Greater
      }
      if (this.parts[i] === other.parts[i]) {
        continue
      }
      if (this.parts[i] > other.parts[i]) {
        return CompareResult.Greater
      }
      return CompareResult.Less
    }
    if (this.parts.length !== other.parts.length) {
      return CompareResult.Less
    }
    return CompareResult.Equal
  }
  greaterThan(other: Version) {
    return this.compareTo(other) === CompareResult.Greater
  }
  lessThan(other: Version) {
    return this.compareTo(other) === CompareResult.Less
  }
  equals(other: Version) {
    return this.compareTo(other) === CompareResult.Equal
  }
}
/**
 * 检测功能版本是否能够在当前本体运行
 * @param feature 功能的 Metadata 对象
 */
export const isFeatureAcceptable = async (feature: FeatureBase | string) => {
  try {
    const console = useScopedConsole('isFeatureAcceptable')
    if (typeof feature === 'string') {
      feature = loadFeatureCode(feature) as FeatureBase
    }
    // 无效代码
    if (feature === null || feature === undefined) {
      return false
    }
    const { version: currentVersionText } = meta.compilationInfo
    const { coreVersion: requiredVersionText } = feature
    console.log('currentVersion =', currentVersionText, ', requiredVersion =', requiredVersionText)
    // 没有版本信息, 按旧版行为默认通过检测
    if (!requiredVersionText || !currentVersionText) {
      return true
    }
    const currentVersion = new Version(currentVersionText)
    const requiredVersion = new Version(requiredVersionText)
    return currentVersion.equals(requiredVersion) || currentVersion.greaterThan(requiredVersion)
  } catch (error) {
    console.warn('check failed, feature =', feature)
    // 版本号异常, 跳过检测
    return true
  }
}
