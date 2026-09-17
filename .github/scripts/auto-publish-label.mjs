import { $ } from 'zx'
import { readFileSync } from 'node:fs'

const { pull_request: expected } = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'))
const repository = process.env.GITHUB_REPOSITORY
const pr = await $`gh api ${`repos/${repository}/pulls/${expected.number}`}`.json()

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
