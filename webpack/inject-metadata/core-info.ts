import { identifier, objectProperty, stringLiteral } from '@babel/types'

import { commitHash } from '../compilation-info/git'
import { runtimeInfo } from '../compilation-info/runtime'
import type { InjectMetadataAction } from './types'

export const injectCoreInfo: InjectMetadataAction = () => [
  objectProperty(identifier('commitHash'), stringLiteral(commitHash)),
  objectProperty(identifier('coreVersion'), stringLiteral(runtimeInfo.version)),
]
