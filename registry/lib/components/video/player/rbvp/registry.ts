import { registerAndGetData } from '@/plugins/data'
import type { RBVPNamespaceProvider } from './types'

export const [rbvpNamespaces] = registerAndGetData(
  'rbvp.namespaces',
  {} as Record<string, RBVPNamespaceProvider>,
)

const normalizeNamespaceName = (value: string) => value.trim().replace(/[-_]/g, '').toLowerCase()

const getProviderNamespaceNames = (providerName: string, provider: RBVPNamespaceProvider) =>
  lodash
    .uniq([provider.primaryName ?? providerName, providerName, ...(provider.aliases ?? [])])
    .filter(name => name.trim() !== '')

export const matchRbvpNamespace = (providerName: string, actionNamespace: string) => {
  const provider = rbvpNamespaces[providerName]
  if (!provider) {
    return false
  }
  const normalizedActionNamespace = normalizeNamespaceName(actionNamespace)
  return getProviderNamespaceNames(providerName, provider).some(
    name => normalizeNamespaceName(name) === normalizedActionNamespace,
  )
}
