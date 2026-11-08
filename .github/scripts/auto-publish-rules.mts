const scriptBuildOutputPathPrefixes = ['dist/', 'src/', 'webpack/']
const scriptBuildOutputFiles = new Set([
  '.browserslistrc',
  'package.json',
  'pnpm-lock.yaml',
  'tsconfig.json',
])

const affectsScriptBuildOutput = (path: string) =>
  scriptBuildOutputFiles.has(path) ||
  scriptBuildOutputPathPrefixes.some(prefix => path.startsWith(prefix))

export const getComparisonRanges = (baseRef: string, candidateRef: string | undefined) => {
  switch (baseRef) {
    case 'preview-fixes':
      return [
        `origin/preview-features...${candidateRef}`,
        'origin/preview...origin/preview-features',
        `origin/master...${candidateRef}`,
        `origin/master-cdn...${candidateRef}`,
      ]
    case 'preview-features':
      return [`origin/preview...${candidateRef}`]
    default:
      return []
  }
}

export interface ClassificationResult {
  publishable: boolean
  safeCount: number
  scriptBuildOutputCount: number
  reason: string
}

export const classifyChangedFiles = (
  baseRef: string,
  diffEntries: ReadonlySet<string>,
): ClassificationResult => {
  const safeEntries = []
  const scriptBuildOutputEntries = []

  for (const entry of [...diffEntries].sort()) {
    const [status, first, second] = entry.split('\t')
    const paths = status.startsWith('R') || status.startsWith('C') ? [first, second] : [first]
    const displayEntry = `${status} ${paths.join(' ')}`
    if (paths.some(affectsScriptBuildOutput)) {
      scriptBuildOutputEntries.push(displayEntry)
    } else {
      safeEntries.push(displayEntry)
    }
  }

  const publishable = safeEntries.length > 0 && scriptBuildOutputEntries.length === 0
  let reasonEntries = safeEntries
  let reasonHeader = 'no safe changes'
  if (publishable) {
    reasonHeader = 'publishable branch diff'
  } else if (scriptBuildOutputEntries.length > 0) {
    reasonEntries = scriptBuildOutputEntries
    reasonHeader = 'script build output branch diff'
  }

  const visibleEntries = reasonEntries.slice(0, 20)
  const overflow = Math.max(0, reasonEntries.length - visibleEntries.length)
  const reasonLines = [
    `${reasonHeader}: ${baseRef}`,
    ...(visibleEntries.length > 0 ? visibleEntries : ['none']),
  ]
  if (overflow > 0) {
    reasonLines.push(`and ${overflow} more`)
  }

  return {
    publishable,
    safeCount: safeEntries.length,
    scriptBuildOutputCount: scriptBuildOutputEntries.length,
    reason: reasonLines.join('\n'),
  }
}
