export interface PayloadBase<Type extends string = string> {
  type: Type
}
export type StartPayload = PayloadBase<'start'> & {
  sessions: string[]
}
export type CoreUpdatePayload = PayloadBase<'coreUpdate'>
export type ItemUpdatePayload = PayloadBase<'itemUpdate'> & {
  path: string
  sessions: string[]
}
export type ItemStopPayload = PayloadBase<'itemStop'> & {
  path: string
}
export type QuerySessionsPayload = PayloadBase<'querySessions'>
export type QuerySessionsResponsePayload = PayloadBase<'querySessionsResponse'> & {
  sessions: string[]
}
export type StopPayload = PayloadBase<'stop'>

export type Payload =
  | StartPayload
  | CoreUpdatePayload
  | ItemUpdatePayload
  | StopPayload
  | ItemStopPayload
  | QuerySessionsPayload
  | QuerySessionsResponsePayload

export type MessageHandler<P extends Payload = Payload> = (payload: P) => void
