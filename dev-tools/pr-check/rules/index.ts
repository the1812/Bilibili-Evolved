import { CheckRule } from '../types'
import { baseBranchRule } from './base-branch'
import { buildOutputsRule } from './build-outputs'
import { descMarkdownRule } from './desc-md'
import { featureMetadataRule } from './feature-metadata'
import { generatedDocsRule } from './generated-docs'
import { thirdPartyMixedSourceRule } from './third-party-mixed-source'

export const rules: CheckRule[] = [
  baseBranchRule,
  buildOutputsRule,
  generatedDocsRule,
  thirdPartyMixedSourceRule,
  descMarkdownRule,
  featureMetadataRule,
]
