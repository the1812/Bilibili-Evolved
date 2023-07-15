import commonMeta from '@/client/common.meta.json'
import { cdnRoots } from './cdn-types'

commonMeta.copyright = commonMeta.copyright.replace(
  /\[year\]/g,
  new Date().getFullYear().toString(),
)
/** 分支表 */
export const branches = {
  stable: 'master',
  stableCdn: 'master-cdn',
  preview: 'preview',
}
const compilationInfo = webpackCompilationInfo
/**
 * 脚本元数据
 */
export const meta = {
  /** 编译时数据 */
  compilationInfo,
  /** 名称 */
  name: GM_info.script.name,
  /** 描述 */
  description: GM_info.script.description,
  /** 原文件名 */
  get originalFilename(): string {
    const { branch } = compilationInfo
    if (branch === branches.preview) {
      return `bilibili-evolved.${branches.preview}.user.js`
    }
    return 'bilibili-evolved.user.js'
  },
  /** 检查更新的链接 */
  get updateURL(): string {
    return `${cdnRoots.AltCdn(compilationInfo.branch)}dist/${this.originalFilename}`
  },
  /** 下载更新的链接 */
  get downloadURL(): string {
    return this.updateURL
  },
  ...commonMeta,
}
