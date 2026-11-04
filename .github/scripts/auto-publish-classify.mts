import { $ } from 'zx'
import { writeAutoPublishReport } from './auto-publish-report.mts'
import { classifyChangedFiles, getComparisonRanges } from './auto-publish-rules.mts'

const baseRef = process.env.BASE_REF
const prNumber = process.env.AUTO_PUBLISH_PR_NUMBER

if (!baseRef) {
  throw new Error('BASE_REF is required')
}

await $`git fetch origin preview-fixes preview-features preview master master-cdn`

let candidateRef = process.env.AUTO_PUBLISH_CANDIDATE_REF
if (prNumber) {
  candidateRef = 'pr-merge'
  const mergeRef = await $`git fetch origin ${`pull/${prNumber}/merge:${candidateRef}`}`.nothrow()
  if (mergeRef.exitCode !== 0) {
    writeAutoPublishReport({
      baseRef,
      candidateRef,
      prNumber,
      publishable: false,
      safeCount: 0,
      scriptBuildOutputCount: 0,
      reason: 'PR merge ref is unavailable, so auto publish cannot be verified.',
    })
    process.exit(0)
  }
}

if (!candidateRef && (baseRef === 'preview-fixes' || baseRef === 'preview-features')) {
  candidateRef = `origin/${baseRef}`
}

const diffEntries = new Set<string>()
for (const range of getComparisonRanges(baseRef, candidateRef)) {
  const lines = await $`git diff --name-status ${range}`.lines()
  lines
    .map(line => line.trim())
    .filter(Boolean)
    .forEach(line => diffEntries.add(line))
}

writeAutoPublishReport({
  baseRef,
  candidateRef,
  prNumber,
  ...classifyChangedFiles(baseRef, diffEntries),
})
