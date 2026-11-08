import { meta } from './meta'

/** 热更新使用的更新源 */
export enum CdnTypes {
  /** @deprecated */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  jsDelivr = 'jsDelivr',
  AltCdn = 'AltCdn',
  GitHub = 'GitHub',
}
export const defaultOwner = 'the1812'
export const getCdnConfig = (type: CdnTypes) => {
  const { allCdns, altCdn } = meta.compilationInfo
  return {
    [CdnTypes.jsDelivr]: allCdns.jsDelivr,
    [CdnTypes.AltCdn]: altCdn,
    [CdnTypes.GitHub]: allCdns.github,
  }[type]
}
/** 根据分支名和仓库 owner 检索 CDN 链接 */
export const cdnRoots = Object.fromEntries(
  Object.values(CdnTypes).map(type => [
    type,
    (branch: string, owner?: string) => {
      const cdn = getCdnConfig(type)
      const { repo } = cdn
      return cdn.root(branch, owner ? `${owner}/${repo.split('/')[1]}` : repo)
    },
  ]),
) as Record<CdnTypes, (branch: string, owner?: string) => string>
