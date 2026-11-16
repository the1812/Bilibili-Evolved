import { randomUUID } from 'node:crypto'
import { appendFileSync } from 'node:fs'
import type { ClassificationResult } from './auto-publish-rules.mts'

const appendOutput = (name: string, value: string) => {
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

interface AutoPublishReport extends ClassificationResult {
  baseRef: string
  candidateRef?: string
  prNumber?: string
}

export const writeAutoPublishReport = ({
  baseRef,
  candidateRef,
  prNumber,
  publishable,
  safeCount,
  scriptBuildOutputCount,
  reason,
}: AutoPublishReport) => {
  appendOutput('base_ref', baseRef)
  appendOutput('publishable', String(publishable))
  appendOutput('reason', reason)

  if (prNumber) {
    return
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `## Auto Publishable: ${publishable}

- Base: \`${baseRef}\`
- Candidate: \`${candidateRef || 'none'}\`
- Safe changes: \`${safeCount}\`
- Script build output changes: \`${scriptBuildOutputCount}\`

\`\`\`text
${reason}
\`\`\`
`,
    )
  }

  console.log(`auto-publish publishable=${publishable}`)
}
