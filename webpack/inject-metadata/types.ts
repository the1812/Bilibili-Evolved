import {
  ObjectExpression,
  ObjectProperty,
} from '@babel/types'

export type InjectMetadataAction = ((expression: ObjectExpression) => ObjectProperty[])
