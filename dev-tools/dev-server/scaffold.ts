import { existsSync, mkdirSync, writeFileSync } from 'fs'
import path from 'path'
import lodash from 'lodash'
import { CreateFeaturePayload, FeatureKind } from './payload'

const assertValidId = (id: string) => {
  if (!id || id.startsWith('/') || id.includes('..') || path.isAbsolute(id)) {
    throw new Error(`无效功能 ID: ${id}`)
  }
}

const escapeText = (text: string) => text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")

const createIndexContent = (payload: CreateFeaturePayload) => {
  const name = payload.id.split('/').pop()
  const category = payload.id.split('/')[0]
  const metadataName =
    payload.name ?? (payload.id.includes('/') ? lodash.camelCase(name) : payload.id)
  const authorLink = payload.authorLink ?? ''
  if (payload.kind === 'component') {
    return `import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: '${escapeText(metadataName)}',
  displayName: '${escapeText(payload.displayName)}',
  tags: [componentsTags.${lodash.camelCase(category)}],
  author: {
    name: '${escapeText(payload.authorName)}',
    link: '${escapeText(authorLink)}',
  },
})
`
  }
  return `import type { PluginMetadata } from '@/plugins/plugin'

export const plugin: PluginMetadata = {
  name: '${escapeText(metadataName)}',
  displayName: '${escapeText(payload.displayName)}',
  author: {
    name: '${escapeText(payload.authorName)}',
    link: '${escapeText(authorLink)}',
  },
  setup: () => undefined,
}
`
}

export const createFeature = (payload: CreateFeaturePayload) => {
  assertValidId(payload.id)
  const { kind }: { kind: FeatureKind } = payload
  const featureDirectory = path.resolve(`registry/lib/${kind}s`, payload.id)
  if (existsSync(featureDirectory)) {
    throw new Error(`功能目录已存在: ${featureDirectory}`)
  }
  mkdirSync(featureDirectory, { recursive: true })
  writeFileSync(path.join(featureDirectory, 'index.ts'), createIndexContent(payload))
  writeFileSync(path.join(featureDirectory, 'index.md'), `${payload.description.trim()}\n`)
  return featureDirectory
}
