import {
  ComponentMetadata,
  OptionMetadata,
  OptionsMetadata,
  UnknownOptions,
} from './types'

export function defineOptionMetadata<T>(
  m: OptionMetadata<T>,
): OptionMetadata<T> {
  return m
}

export function defineOptionsMetadata<
  O extends UnknownOptions
>(m: OptionsMetadata<O>): OptionsMetadata<O> {
  return m
}

export function definePartialComponentMetadata<
  O extends UnknownOptions,
  C extends Partial<ComponentMetadata<O>>
>(m: C): C {
  return m
}

export function defineComponentMetadata<
  O extends UnknownOptions
>(m: ComponentMetadata<O>): ComponentMetadata<O> {
  return m
}

export type OptionsOfMeta<M extends OptionsMetadata<any>> = (
  M extends OptionsMetadata<infer O> ? O : never
)
