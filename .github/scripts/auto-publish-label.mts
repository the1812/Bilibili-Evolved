import { $ } from 'zx'
import { readFileSync } from 'node:fs'

interface PullRequestSnapshot {
  number: number
  head: { sha: string }
  base: { ref: string; sha: string }
}

interface PullRequest extends PullRequestSnapshot {
  state: string
  labels: { name: string }[]
}

const { pull_request: expected } = JSON.parse(
  readFileSync(process.env.GITHUB_EVENT_PATH as string, 'utf8'),
) as { pull_request: PullRequestSnapshot }
const repository = process.env.GITHUB_REPOSITORY
const pr = await $`gh api ${`repos/${repository}/pulls/${expected.number}`}`.json<PullRequest>()

const syncAutoPublishLabel = async () => {
  if (
    pr.state !== 'open' ||
    pr.head.sha !== expected.head.sha ||
    pr.base.sha !== expected.base.sha ||
    pr.base.ref !== expected.base.ref
  ) {
    console.log('Skipping outdated classification.')
    return
  }
  const label = 'auto-publishable'
  const hasLabel = pr.labels.some(item => item.name === label)
  const publishable = process.env.PUBLISHABLE === 'true'
  const endpoint = `repos/${repository}/issues/${pr.number}/labels`
  if (publishable && !hasLabel) {
    await $`gh api ${endpoint} --method POST -f ${`labels[]=${label}`}`
  } else if (!publishable && hasLabel) {
    await $`gh api ${`${endpoint}/${label}`} --method DELETE`
  }
}

await syncAutoPublishLabel()
