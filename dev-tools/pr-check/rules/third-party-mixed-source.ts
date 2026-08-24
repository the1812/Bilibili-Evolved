import { CheckRule } from '../types'

const isSourceFeaturePath = (filePath: string) =>
  filePath.startsWith('registry/lib/components/') || filePath.startsWith('registry/lib/plugins/')

export const thirdPartyMixedSourceRule: CheckRule = {
  name: 'third-party-mixed-source',
  check: ({ changedPaths }) => {
    const touchedThirdPartyDocs = changedPaths.includes('registry/lib/docs/third-party.ts')
    const touchedRegistrySource = changedPaths.some(isSourceFeaturePath)
    if (!touchedThirdPartyDocs || !touchedRegistrySource) {
      return {}
    }
    return {
      errors: [
        'Do not mix third-party component registration with in-repository component or plugin source changes.',
      ],
    }
  },
}
