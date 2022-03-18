import {
  ComponentMetadata,
  OptionalOptionsMetadata,
  OptionMetadata,
  OptionsMetadata,
  UnknownOptions,
} from './types'

/** 从 OptionsMetadata 中获取 Options（即 OptionsMetadata 的类型参数） */
export type OptionsOfMetadata<M extends OptionsMetadata> = (
  M extends OptionsMetadata<infer O> ? O : never
)

export const defineOptionMetadata = <T>(
  m: OptionMetadata<T>,
): OptionMetadata<T> => m

export const defineOptionsMetadata = <
  O extends UnknownOptions
>(m: OptionsMetadata<O>): OptionsMetadata<O> => m

export const defineComponentMetadata = <
  Om extends OptionalOptionsMetadata
>(m: ComponentMetadata<Om>): ComponentMetadata<Om> => m
