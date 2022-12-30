import { ObjectExpression, ObjectProperty } from '@babel/types'

export interface InjectMetadataContext {
  expression: ObjectExpression
  filename: string
}
export type InjectMetadataAction = (context: InjectMetadataContext) => ObjectProperty[]
