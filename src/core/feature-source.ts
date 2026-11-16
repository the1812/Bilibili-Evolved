import { CdnTypes, getCdnConfig } from './cdn-types'

export type FeatureSource =
  | { kind: 'raw'; url: string }
  | { kind: 'github'; repo: string; ref: string; path: string; cdn?: CdnTypes }

export const getFeatureSource = (url?: string): FeatureSource | undefined => {
  if (!url) {
    return undefined
  }
  const github =
    /^https:\/\/(?:raw\.githubusercontent\.com\/([\w.-]+\/[\w.-]+)\/|github\.com\/([\w.-]+\/[\w.-]+)\/raw\/)([^?#%]+?)\/(registry\/dist\/[^?#%]+)$/.exec(
      url,
    )
  if (github) {
    const [, rawRepo, githubRepo, ref, path] = github
    return { kind: 'github', repo: rawRepo || githubRepo, ref, path }
  }
  const jsDelivr =
    /^https:\/\/cdn\.jsdelivr\.net\/gh\/([\w.-]+\/[\w.-]+)@([^?#%]+?)\/(registry\/dist\/[^?#%]+)$/.exec(
      url,
    )
  if (jsDelivr) {
    const [, repo, ref, path] = jsDelivr
    return { kind: 'github', repo, ref, path, cdn: CdnTypes.jsDelivr }
  }
  return { kind: 'raw', url }
}

export const getFeatureUrl = (source?: FeatureSource) => {
  if (!source) {
    return ''
  }
  if (source.kind === 'raw') {
    return source.url
  }
  const { repo, ref, path, cdn = CdnTypes.GitHub } = source
  const encodedRef = ref.split('/').map(encodeURIComponent).join('/')
  return `${getCdnConfig(cdn).root(encodedRef, repo)}${path}`
}

export const switchGithubBranch = (source: FeatureSource | undefined, ref: string) =>
  source?.kind === 'github' && source.ref !== ref ? { ...source, ref } : source

export const isLocalFeatureUrl = (url?: string) => /^http:\/\/localhost(?=[:/]|$)/.test(url ?? '')
