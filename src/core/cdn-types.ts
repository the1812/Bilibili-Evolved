/** 热更新使用的更新源 */
export enum CdnTypes {
  jsDelivr = 'jsDelivr',
  GitHub = 'GitHub',
}
export const cdnRoots: Record<CdnTypes, (branch: string) => string> = {
  jsDelivr: branch => `https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@${branch}/`,
  GitHub: branch => `https://github.com/the1812/Bilibili-Evolved/raw/${branch}/`,
}
