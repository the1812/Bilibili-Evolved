export interface PayloadBase<Type extends string = string> {
  type: Type
}

export type FeatureKind = 'component' | 'plugin'

export interface FeaturePayload {
  kind: FeatureKind
  id: string
}

export type ServerReadyPayload = PayloadBase<'serverReady'> & {
  clientId: string
  featureSessions: string[]
}

export type CoreUpdatePayload = PayloadBase<'coreUpdate'>

export type ItemUpdatePayload = PayloadBase<'itemUpdate'> & {
  path: string
  featureSessions: string[]
}

export type StartDebugFeaturePayload = PayloadBase<'startDebugFeature'> &
  FeaturePayload & {
    targetClientId?: string
    path?: string
    url?: string
    requestId?: string
  }

export type StopFeatureSessionPayload = PayloadBase<'stopFeatureSession'> & {
  path: string
  requestId?: string
}

export type StartDebugFeatureResultPayload = PayloadBase<'startDebugFeatureResult'> & {
  requestId?: string
  ok: boolean
  message?: string
  error?: string
}

export type QueryFeatureSessionsPayload = PayloadBase<'queryFeatureSessions'>

export type QueryFeatureSessionsResponsePayload = PayloadBase<'queryFeatureSessionsResponse'> & {
  featureSessions: string[]
}

export type FeatureSessionsChangedPayload = PayloadBase<'featureSessionsChanged'> & {
  featureSessions: string[]
}

export type ServerStopPayload = PayloadBase<'serverStop'>

export type CommandResultPayload = PayloadBase<'commandResult'> & {
  requestId?: string
  ok: boolean
  message?: string
  error?: string
  featureSessions?: string[]
}

export type Payload =
  | ServerReadyPayload
  | CoreUpdatePayload
  | ItemUpdatePayload
  | ServerStopPayload
  | StartDebugFeaturePayload
  | StopFeatureSessionPayload
  | StartDebugFeatureResultPayload
  | QueryFeatureSessionsPayload
  | QueryFeatureSessionsResponsePayload
  | FeatureSessionsChangedPayload
  | CommandResultPayload
