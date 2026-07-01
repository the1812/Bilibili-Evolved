export interface ChangedFile {
  status: string
  path: string
}

export interface PullRequestEvent {
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

export interface FeatureMetadata {
  kind: 'component' | 'plugin'
  properties: Set<string>
  name?: string
}

export interface CheckContext {
  baseRef?: string
  changedFiles: ChangedFile[]
  changedPaths: string[]
}

export interface CheckResult {
  errors?: string[]
  warnings?: string[]
}

export interface CheckRule {
  name: string
  check: (context: CheckContext) => CheckResult
}
