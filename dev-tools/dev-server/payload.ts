export interface PayloadBase<Type extends string = string> {
  type: Type
}
export type StartPayload = PayloadBase<'start'>
export type CoreUpdatePayload = PayloadBase<'coreUpdate'>
export type ItemUpdatePayload = PayloadBase<'itemUpdate'> & {
  name: string
  displayName: string
  itemType: string
  path: string
}
export type StopPayload = PayloadBase<'stop'>

export type Payload = (
  StartPayload |
  CoreUpdatePayload |
  ItemUpdatePayload |
  StopPayload
)

export type MessageHandler<P extends Payload = Payload> = (payload: P) => void
