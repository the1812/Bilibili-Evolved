import { DocSourceItem, PackItem } from './types'

const branches = {
  stable: 'master',
  preview: 'preview',
}
const defaultOwner = 'the1812'

const getJsDelivrRoot = (branch: string, owner = defaultOwner) =>
  `https://cdn.jsdelivr.net/gh/${owner}/Bilibili-Evolved@${branch}/`

const getGitHubRoot = (branch: string, owner = defaultOwner) =>
  `https://raw.githubusercontent.com/${owner}/Bilibili-Evolved/${branch}/`

export const getFeatureMarkdown = (title: string, items: DocSourceItem[]) => {
  const docText = items.map(item => {
    const { name, displayName, description, fullAbsolutePath, fullRelativePath, owner } = item
    return `
### [${displayName}](${fullRelativePath})
\`${name}\`

**jsDelivr:** [\`Stable\`](${getJsDelivrRoot(
      branches.stable,
      owner,
    )}${fullAbsolutePath}) / [\`Preview\`](${getJsDelivrRoot(
      branches.preview,
      owner,
    )}${fullAbsolutePath})

**GitHub:** [\`Stable\`](${getGitHubRoot(
      branches.stable,
      owner,
    )}${fullAbsolutePath}) / [\`Preview\`](${getGitHubRoot(
      branches.preview,
      owner,
    )}${fullAbsolutePath})

${description || ''}
    `.trim()
  })
  return `
## ${title}

${docText.join('\n\n')}
  `.trim()
}

export const getPackageMarkdown = (packages: PackItem[]) => {
  const packagesTexts = packages.map(item => {
    const itemText = `
### ${item.displayName}
${item.description || ''}

<details>
<summary><strong>jsDelivr Stable</strong></summary>

\`\`\`
${item.items
  .map(feature => getGitHubRoot(branches.stable, feature.owner) + feature.fullAbsolutePath)
  .join('\n')}
\`\`\`

</details>
<details>
<summary><strong>jsDelivr Preview</strong></summary>

\`\`\`
${item.items
  .map(feature => getGitHubRoot(branches.preview, feature.owner) + feature.fullAbsolutePath)
  .join('\n')}
\`\`\`

</details>
<details>
<summary><strong>GitHub Stable</strong></summary>

\`\`\`
${item.items
  .map(feature => getGitHubRoot(branches.stable, feature.owner) + feature.fullAbsolutePath)
  .join('\n')}
\`\`\`

</details>
<details>
<summary><strong>GitHub Preview</strong></summary>

\`\`\`
${item.items
  .map(feature => getGitHubRoot(branches.preview, feature.owner) + feature.fullAbsolutePath)
  .join('\n')}
\`\`\`

</details>
    `.trim()
    return itemText
  })
  return `
# 合集包
合集包提供了批量的功能安装链接, 方便一次性安装大量功能.

${packagesTexts.join('\n\n')}

`.trim()
}
