export type ExternalLibrary = { url: string; sha256: string }
export interface CdnConfig {
  name: string
  owner: string
  host: string
  stableClient: string
  previewClient: string
  library: {
    lodash: ExternalLibrary
    protobuf: ExternalLibrary
    jszip: ExternalLibrary
    sortable: ExternalLibrary
    streamsaver: ExternalLibrary
    ffmpeg: {
      worker: ExternalLibrary
      core: ExternalLibrary
      wasm: ExternalLibrary
    }
  }
  smallLogo: string
  logo: string
  root: (branch: string, ownerOverride: string) => string
}
