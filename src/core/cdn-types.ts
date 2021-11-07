/** 热更新使用的更新源 */
export enum CdnTypes {
  jsDelivr = 'jsDelivr',
  GitHub = 'GitHub',
}
const defaultOwner = 'the1812'
/** 根据分支名和仓库 owner 检索 CDN 链接 */
export const cdnRoots: Record<CdnTypes, (branch: string, owner?: string) => string> = {
  jsDelivr: (branch, owner) => `https://cdn.jsdelivr.net/gh/${owner || defaultOwner}/Bilibili-Evolved@${branch}/`,
  GitHub: (branch, owner) => `https://raw.githubusercontent.com/${owner || defaultOwner}/Bilibili-Evolved/${branch}/`,
}
