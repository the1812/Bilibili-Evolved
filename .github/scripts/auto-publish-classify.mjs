import { execFileSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'

const baseRef = process.env.BASE_REF
const prNumber = process.env.AUTO_PUBLISH_PR_NUMBER

if (!baseRef) {
  throw new Error('BASE_REF is required')
}

const runGit = (args, options = {}) => {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
  })
}

const appendOutput = (name, value) => {
  if (!process.env.GITHUB_OUTPUT) {
    return
  }
  if (value.includes('\n')) {
    const delimiter = `EOF_${randomUUID()}`
    appendFileSync(process.env.GITHUB_OUTPUT, `${name}<<${delimiter}\n${value}\n${delimiter}\n`)
    return
  }
  appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`)
}

const appendSummary = value => {
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, value)
  }
}

const scriptBuildOutputPathPrefixes = ['dist/', 'src/', 'webpack/']
const scriptBuildOutputFiles = new Set([
  '.browserslistrc',
  'package.json',
  'pnpm-lock.yaml',
  'tsconfig.json',
  'tsconfig.type-check.json',
])

const affectsScriptBuildOutput = path => {
  return (
    scriptBuildOutputFiles.has(path) ||
    scriptBuildOutputPathPrefixes.some(prefix => path.startsWith(prefix))
  )
}

const report = ({
  publishable,
  candidateRef,
  safeCount = 0,
  scriptBuildOutputCount = 0,
  reason,
}) => {
  appendOutput('base_ref', baseRef)
  appendOutput('publishable', String(publishable))
  appendOutput('reason', reason)

  appendSummary(`## Auto Publishable: ${publishable}

- Base: \`${baseRef}\`
- Candidate: \`${candidateRef || 'none'}\`
- Safe changes: \`${safeCount}\`
- Script build output changes: \`${scriptBuildOutputCount}\`

\`\`\`text
${reason}
\`\`\`
`)

  console.log(`auto-publish publishable=${publishable}`)
}

runGit(
  ['fetch', 'origin', 'preview-fixes', 'preview-features', 'preview', 'master', 'master-cdn'],
  {
    stdio: 'inherit',
  },
)

let candidateRef = process.env.AUTO_PUBLISH_CANDIDATE_REF
if (prNumber) {
  candidateRef = 'pr-merge'
  try {
    runGit(['fetch', 'origin', `pull/${prNumber}/merge:${candidateRef}`], { stdio: 'inherit' })
  } catch {
    report({
      publishable: false,
      candidateRef,
      reason: 'PR merge ref is unavailable, so auto publish cannot be verified.',
    })
    process.exit(0)
  }
}

if (!candidateRef) {
  if (baseRef === 'preview-fixes' || baseRef === 'preview-features') {
    candidateRef = `origin/${baseRef}`
  }
}

const rangesByBaseRef = {
  'preview-fixes': [
    `origin/preview-features...${candidateRef}`,
    'origin/preview...origin/preview-features',
    `origin/master...${candidateRef}`,
    `origin/master-cdn...${candidateRef}`,
  ],
  'preview-features': [`origin/preview...${candidateRef}`],
}

const diffEntries = new Set()
for (const range of rangesByBaseRef[baseRef] ?? []) {
  const output = runGit(['diff', '--name-status', range])
  output
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .forEach(line => diffEntries.add(line))
}

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

report({
  publishable,
  candidateRef,
  safeCount: safeEntries.length,
  scriptBuildOutputCount: scriptBuildOutputEntries.length,
  reason: reasonLines.join('\n'),
})
