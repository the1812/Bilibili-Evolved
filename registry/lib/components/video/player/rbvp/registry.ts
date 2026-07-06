import { registerAndGetData } from '@/plugins/data'
import type { RBVPNamespaceProvider } from './types'

export const [rbvpNamespaces] = registerAndGetData(
  'rbvp.namespaces',
  {} as Record<string, RBVPNamespaceProvider>,
)

const normalizeNamespaceName = (value: string) => value.trim().replace(/[-_]/g, '').toLowerCase()

export const getCanonicalNamespaceName = (providerName: string, provider: RBVPNamespaceProvider) =>
  provider.primaryName ?? providerName

export const getProviderNamespaceNames = (providerName: string, provider: RBVPNamespaceProvider) =>
  lodash
    .uniq([getCanonicalNamespaceName(providerName, provider), providerName])
    .filter(name => name.trim() !== '')

const resolveActionNamespace = (actionNamespace: string, aliases?: Record<string, string>) => {
  if (!aliases) {
    return actionNamespace
  }
  const normalizedActionNamespace = normalizeNamespaceName(actionNamespace)
  const matchedAlias = Object.keys(aliases).find(
    alias => normalizeNamespaceName(alias) === normalizedActionNamespace,
  )
  return matchedAlias ? aliases[matchedAlias] : actionNamespace
}

export const matchRbvpNamespace = (
  providerName: string,
  actionNamespace: string,
  aliases?: Record<string, string>,
) => {
  const provider = rbvpNamespaces[providerName]
  if (!provider) {
    return false
  }
  const canonical = resolveActionNamespace(actionNamespace, aliases)
  const normalizedCanonical = normalizeNamespaceName(canonical)
  return getProviderNamespaceNames(providerName, provider).some(
    name => normalizeNamespaceName(name) === normalizedCanonical,
  )
}
