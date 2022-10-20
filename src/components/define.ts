import {
  ComponentMetadata,
  EmptyOptions,
  OptionMetadata,
  OptionsMetadata,
  UnknownOptions,
} from './types'

/** 从 OptionsMetadata 中获取 Options（即 OptionsMetadata 的类型参数） */
export type OptionsOfMetadata<M extends OptionsMetadata> = M extends OptionsMetadata<infer O>
  ? O
  : never

/** 定义单个 OptionMetadata */
export const defineOptionMetadata = <T>(m: OptionMetadata<T>): OptionMetadata<T> => m

/** 单独定义 OptionsMetadata */
export const defineOptionsMetadata = <O extends UnknownOptions>(
  m: OptionsMetadata<O>,
): OptionsMetadata<O> => m

/** 定义组件 */
export const defineComponentMetadata = <O extends UnknownOptions = EmptyOptions>(
  m: ComponentMetadata<O>,
): ComponentMetadata<O> => m
