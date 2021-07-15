import commonMeta from '@/client/common.meta.json'

commonMeta.copyright = commonMeta.copyright.replace(/\[year\]/g, new Date().getFullYear().toString())
/** 默认分支 */
export const defaultBranch = 'master'
export const branch = (() => {
  const match = GM_info.script.name.match(/\(.+\)$/)
  if (match) {
    return match[0].toLowerCase()
  }
  return defaultBranch
})()
/** 元数据 CDN 根目录 URL */
export const metaCdnRoot = `https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@${branch}/`
/**
 * 脚本元数据
 */
export const meta = {
  /** 编译时数据 */
  compilationInfo: webpackCompilationInfo,
  /** 名称 */
  name: GM_info.script.name,
  /** 描述 */
  description: GM_info.script.description,
  /** 分支 */
  branch,
  /** 原文件名 */
  get originalFilename(): string {
    if (branch === defaultBranch) {
      return 'bilibili-evolved.user.js'
    }
    return `bilibili-evolved.${branch}.user.js`
  },
  /** 检查更新的链接 */
  get updateURL(): string {
    return `${metaCdnRoot}dist/${this.originalFilename}`
  },
  /** 下载更新的链接 */
  get downloadURL(): string {
    return this.updateURL
  },
  /** 图标 */
  get icon() {
    return `${metaCdnRoot}images/logo-small.png`
  },
  /** 在 Tampermonkey 中进入编辑模式时显示的大图标 */
  get icon64() {
    return `${metaCdnRoot}images/logo.png`
  },
  ...lodash.omit(commonMeta, 'icon', 'icon64'),
}
