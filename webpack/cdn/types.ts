export interface CdnConfig {
  owner: string
  host: string
  stableClient: string
  previewClient: string
  library: {
    lodash: string
    protobuf: string
    jszip: string
    sortable: string
    mdi: string
  },
  smallLogo: string
  logo: string
  root: (branch: string, ownerOverride: string) => string
}
