import { execFileSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { ChangedFile, CheckContext, PullRequestEvent } from './types'

const normalizePath = (filePath: string) => filePath.replace(/\\/g, '/')

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

export const createContext = (): CheckContext => {
  const event = getEvent()
  const changedFiles = getChangedFiles(getDiffRange(event))
  return {
    baseRef: process.env.GITHUB_BASE_REF || event.pull_request?.base?.ref,
    changedFiles,
    changedPaths: changedFiles.map(file => file.path),
  }
}
