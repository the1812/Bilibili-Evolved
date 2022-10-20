import { objectProperty, identifier, stringLiteral } from '@babel/types'
import { runtimeInfo } from '../compilation-info/runtime'
import { commitHash } from '../compilation-info/git'
import { InjectMetadataAction } from './types'

export const injectCoreInfo: InjectMetadataAction = () => [
  objectProperty(identifier('commitHash'), stringLiteral(commitHash)),
  objectProperty(identifier('coreVersion'), stringLiteral(runtimeInfo.version)),
]
