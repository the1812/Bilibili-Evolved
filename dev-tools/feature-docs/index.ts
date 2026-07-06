import { mkdirSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import { readFeatureDocs } from './feature'
import { getFeatureMarkdown } from './markdown'
import { generatePackageDocs } from './packages'
import { readThirdPartyDocs } from './third-party'

const writeTextFile = (file: string, text: string) => {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, `${text.trimEnd()}\n`, 'utf8')
}

const main = () => {
  const thirdPartyDocs = readThirdPartyDocs()
  const components = readFeatureDocs('component').concat(thirdPartyDocs.component)
  const plugins = readFeatureDocs('plugin').concat(thirdPartyDocs.plugin)
  const allItems = components.concat(plugins)
  const featuresMarkdown = `
# 可安装功能

${getFeatureMarkdown('组件', components)}
${getFeatureMarkdown('插件', plugins)}

`.trim()
  const packData = generatePackageDocs(allItems)

  writeTextFile('doc/features/features.md', featuresMarkdown)
  writeTextFile('doc/features/features.json', JSON.stringify(allItems, undefined, 2))
  writeTextFile('doc/features/pack/pack.md', packData.markdown)
  writeTextFile('doc/features/pack/pack.json', packData.json)
  console.log(`Generated docs for ${components.length} components, ${plugins.length} plugins.`)
}

main()
