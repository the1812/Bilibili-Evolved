type Auto = 'auto'

export type OutputType = Auto | 'mp4' | 'matroska'

export interface Format {
  extension: string
  mime: string
  muxArgs: (hasCover: boolean, hasMetadata: boolean, isFlac?: boolean) => string[]
}

export type OutputFormats = {
  [x in Exclude<OutputType, Auto>]: Format
}

export interface Options {
  muxWithMetadata: boolean
  attachCover: boolean
  outputType: OutputType
}
