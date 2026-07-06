import { CheckRule } from '../types'

const allowedBaseRefs = ['preview-features', 'preview-fixes']

export const baseBranchRule: CheckRule = {
  name: 'base-branch',
  check: ({ baseRef }) => {
    if (!baseRef || allowedBaseRefs.includes(baseRef)) {
      return {}
    }
    return {
      errors: [
        `pull request base branch must be preview-features or preview-fixes, got ${baseRef}.`,
      ],
    }
  },
}
