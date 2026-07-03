export interface PayloadBase<Type extends string = string> {
  type: Type
}
export type FeatureKind = 'component' | 'plugin'

export interface FeaturePayload {
  kind: FeatureKind
  id: string
}
export type ServerReadyPayload = PayloadBase<'serverReady'> & {
  featureSessions: string[]
}
export type CoreUpdatePayload = PayloadBase<'coreUpdate'>
export type ItemUpdatePayload = PayloadBase<'itemUpdate'> & {
  path: string
  featureSessions: string[]
}
export type StartFeatureSessionPayload = PayloadBase<'startFeatureSession'> &
  FeaturePayload & {
    requestId?: string
  }
export type StopFeatureSessionPayload = PayloadBase<'stopFeatureSession'> &
  Partial<FeaturePayload> & {
    path?: string
    requestId?: string
  }
export type BuildFeaturePayload = PayloadBase<'buildFeature'> &
  FeaturePayload & {
    mode?: 'development' | 'production'
    requestId?: string
  }
export type CreateFeaturePayload = PayloadBase<'createFeature'> &
  FeaturePayload & {
    name?: string
    displayName: string
    authorName: string
    authorLink?: string
    description: string
    requestId?: string
  }
export type QueryFeatureSessionsPayload = PayloadBase<'queryFeatureSessions'>
export type QueryFeatureSessionsResponsePayload = PayloadBase<'queryFeatureSessionsResponse'> & {
  featureSessions: string[]
}
export type FeatureSessionsChangedPayload = PayloadBase<'featureSessionsChanged'> & {
  featureSessions: string[]
}
export type FeatureBuiltPayload = PayloadBase<'featureBuilt'> &
  FeaturePayload & {
    path: string
    hash?: string
    featureSessions: string[]
  }
export type FeatureBuildFailedPayload = PayloadBase<'featureBuildFailed'> &
  FeaturePayload & {
    message: string
  }
export type CommandResultPayload = PayloadBase<'commandResult'> & {
  requestId?: string
  ok: boolean
  message?: string
  error?: string
  featureSessions?: string[]
}
export type ServerStopPayload = PayloadBase<'serverStop'>

export type Payload =
  | ServerReadyPayload
  | CoreUpdatePayload
  | ItemUpdatePayload
  | ServerStopPayload
  | StartFeatureSessionPayload
  | StopFeatureSessionPayload
  | BuildFeaturePayload
  | CreateFeaturePayload
  | QueryFeatureSessionsPayload
  | QueryFeatureSessionsResponsePayload
  | FeatureSessionsChangedPayload
  | FeatureBuiltPayload
  | FeatureBuildFailedPayload
  | CommandResultPayload

export type MessageHandler<P extends Payload = Payload> = (payload: P) => void
