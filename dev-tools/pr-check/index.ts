import { execFileSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import * as path from 'path'

interface ChangedFile {
  status: string
  path: string
}

interface PullRequestEvent {
  pull_request?: {
    base?: {
      ref?: string
      sha?: string
    }
    head?: {
      sha?: string
    }
  }
}

const normalizePath = (filePath: string) => filePath.replace(/\\/g, '/')
const isRegistryFeatureIndex = (filePath: string) =>
  /^registry\/lib\/(components|plugins)\/.+\/index\.ts$/.test(filePath)
const isSourceFeaturePath = (filePath: string) =>
  filePath.startsWith('registry/lib/components/') || filePath.startsWith('registry/lib/plugins/')
const runGit = (args: string[]) =>
  execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()

const getEvent = (): PullRequestEvent => {
  const eventPath = process.env.GITHUB_EVENT_PATH
  if (!eventPath || !existsSync(eventPath)) {
    return {}
  }
  return JSON.parse(readFileSync(eventPath, 'utf8')) as PullRequestEvent
}

const getDiffRange = (event: PullRequestEvent) => {
  const [range] = process.argv.slice(2)
  if (range) {
    return range
  }
  const baseSha = event.pull_request?.base?.sha
  const headSha = event.pull_request?.head?.sha
  if (baseSha && headSha) {
    return `${baseSha}...${headSha}`
  }
  const baseRef = process.env.GITHUB_BASE_REF
  if (baseRef) {
    return `origin/${baseRef}...HEAD`
  }
  return 'HEAD~1...HEAD'
}

const getChangedFiles = (range: string): ChangedFile[] => {
  const output = runGit(['diff', '--name-status', range])
  if (!output) {
    return []
  }
  return output.split(/\r?\n/).map(line => {
    const [status, firstPath, secondPath] = line.split(/\t+/)
    return {
      status,
      path: normalizePath(secondPath || firstPath),
    }
  })
}

const hasIndexMarkdown = (indexPath: string) => {
  const directory = path.dirname(indexPath)
  return existsSync(path.join(directory, 'index.md'))
}

const errors: string[] = []
const warnings: string[] = []
const event = getEvent()
const baseRef = process.env.GITHUB_BASE_REF || event.pull_request?.base?.ref

if (baseRef && !['preview-features', 'preview-fixes'].includes(baseRef)) {
  errors.push(`pull request base branch must be preview-features or preview-fixes, got ${baseRef}.`)
}

const changedFiles = getChangedFiles(getDiffRange(event))
const changedPaths = changedFiles.map(file => file.path)
const touchedThirdPartyDocs = changedPaths.includes('registry/lib/docs/third-party.ts')
const touchedRegistrySource = changedPaths.some(isSourceFeaturePath)

for (const changedFile of changedFiles) {
  const { status, path: filePath } = changedFile
  const isAdded = status.startsWith('A')

  if (filePath.startsWith('dist/') || filePath.startsWith('registry/dist/')) {
    errors.push(`${filePath}: build outputs must not be submitted in pull requests.`)
  }

  if (filePath.startsWith('doc/features/')) {
    errors.push(`${filePath}: generated feature docs must not be edited in ordinary pull requests.`)
  }

  if (isAdded && path.basename(filePath) === 'desc.md') {
    errors.push(`${filePath}: use index.md for component or plugin descriptions.`)
  }

  if (!isAdded || !isRegistryFeatureIndex(filePath)) {
    continue
  }

  if (!hasIndexMarkdown(filePath)) {
    errors.push(
      `${filePath}: new components and plugins must include an index.md description file.`,
    )
  }

  const content = readFileSync(filePath, 'utf8')
  if (/^ {2}description\s*:/m.test(content)) {
    errors.push(`${filePath}: do not hand-write metadata description; use index.md instead.`)
  }
  if (!/^ {2}author\s*:/m.test(content)) {
    warnings.push(`${filePath}: new components and plugins should include author metadata.`)
  }
}

if (touchedThirdPartyDocs && touchedRegistrySource) {
  errors.push(
    'Do not mix third-party component registration with in-repository component or plugin source changes.',
  )
}

if (warnings.length > 0) {
  console.warn(['PR file check warnings:', ...warnings.map(message => `- ${message}`)].join('\n'))
}

if (errors.length > 0) {
  console.error(['PR file check failed:', ...errors.map(message => `- ${message}`)].join('\n'))
  process.exit(1)
}

console.log('PR file check passed.')
