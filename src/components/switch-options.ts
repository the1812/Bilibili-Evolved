/**
 * Switch Options
 * @module components/switch-options
 *
 * 通过包装原始的 ComponentMetadata 为组件提供一系列开关选项。
 * 如果组件未定义 Widget，还会提供一个默认的有相同效果的 Widget。
 *
 * 主要函数是 {@link newSwitchComponentBuilder}。
 */

import { getComponentSettings, addComponentListener } from '@/core/settings'
import {
  ComponentEntry,
  ComponentMetadata,
  OptionsMetadata,
  OptionsOfMetadata,
  UnknownOptions,
} from './component'
import { Widget } from './widget'

/**
 * 单个开关的设置
 */
export interface SwitchItemMetadata {
  displayName: string
  defaultValue: boolean
}

/**
 * 一个对象，键是开关的名称，用于生成 options；值是关于单个开关的设置
 */
export type SwitchItemsMetadata<S extends string> = {
  [key in S]: SwitchItemMetadata
}

/**
 * 从 SwitchItemsMetadata 中提取所有 SwitchItem 的名称
 */
export type SwitchItemNamesOfItemsMetadata<C extends SwitchItemsMetadata<string>> = keyof C

/**
 * 可用于单独定义 SwitchItemsMetadata
 */
export const defineSwitchItemsMetadata = <S extends string>(
  c: SwitchItemsMetadata<S>,
): SwitchItemsMetadata<S> => c

/**
 * 用于配置 API 的行为
 *
 * {@link SwitchItemsMetadata} 可用 {@link defineSwitchItemsMetadata} 单独定义
 */
export interface SwitchMetadata<N extends string, S extends string> {
  // 注入 options 时会使用
  name: N
  // 每个开关的单独配置，其键名会被用于生成注入 options 的名称，见 {@link SwitchItemNames}
  switches: SwitchItemsMetadata<S>
  // 是否单选 default: false
  radio?: undefined | boolean
  // default: 'checked'
  dimAt?: undefined | 'checked' | 'notChecked'
  // 配置每个开关的图标
  switchProps?: {
    checkedIcon?: string
    notCheckedIcon?: string
    iconPosition?: 'left' | 'right'
  }
}

/**
 * 从 SwitchMetadata 中提取 name 的字面量类型（如果可能）
 */
export type SwitchNameOfMetadata<C extends SwitchMetadata<string, string>> = C['name']

/**
 * 从 SwitchMetadata 中提取所有 SwitchItem 的名称
 */
export type SwitchItemNamesOfMetadata<C extends SwitchMetadata<string, string>> =
  keyof C['switches']

/**
 * 定义一个 {@link SwitchMetadata}
 */
export const defineSwitchMetadata = <N extends string, S extends string>(
  c: SwitchMetadata<N, S>,
): SwitchMetadata<N, S> => c

/**
 * 传递给 Widget 的选项。同时也是注入组件的 options 的一部分
 */
export interface SwitchWidgetOptions<N extends string, S extends string> {
  name: N
  switches: SwitchItemsMetadata<S>
  radio: boolean
  dimAt: 'checked' | 'notChecked'
  switchProps?: {
    checkedIcon?: string
    notCheckedIcon?: string
    iconPosition?: 'left' | 'right'
  }
  componentName: string
  optionDisplayName: string
}

/**
 * 创建一个 SwitchWidgetOptions
 */
const newSwitchWidgetOptions = <N extends string, S extends string>(
  metadata: SwitchMetadata<N, S>,
  componentName: string,
  optionDisplayName,
) => ({
    ...metadata,
    radio: metadata.radio === undefined ? false : metadata.radio,
    dimAt: metadata.dimAt === undefined ? 'checked' : metadata.dimAt,
    componentName,
    optionDisplayName,
  })

/**
 * 注入的 options 的名称集合。规则是 SwitchItemsMetadata 的所有键加上 'switch-' 前缀。
 */
export type SwitchItemNames<S extends string> = `switch-${S}`

/**
 * API 注入的 options 中的一部分
 */
export type SwitchItemOptions<S extends string> = Record<SwitchItemNames<S>, string>

/**
 * 在原始的 Options 类型中添加了该 API 所需的定义后形成的类型
 */
export type SwitchOptions<O extends UnknownOptions, N extends string, S extends string> = O & {
  N: SwitchWidgetOptions<N, S>
} & SwitchItemOptions<S>

/**
 * 提取 SwitchOptions 类型
 */
export type SwitchOptionsOfSwitchMetadata<
  O extends UnknownOptions,
  C extends SwitchMetadata<string, string>,
> = C extends SwitchMetadata<infer N, infer S> ? SwitchOptions<O, N, S> : never

/**
 * 提取 SwitchOptions 类型
 */
export type SwitchOptionsOfMetadata<
  M extends OptionsMetadata,
  C extends SwitchMetadata<string, string>,
> = SwitchOptionsOfSwitchMetadata<OptionsOfMetadata<M>, C>

/**
 * 在原始的 OptionsMetadata 中添加了该 API 所需的定义后形成的类型
 */
export type SwitchOptionsMetadata<
  O extends UnknownOptions,
  N extends string,
  S extends string,
> = OptionsMetadata<SwitchOptions<O, N, S>>

/**
 * 创建一个 extender。
 *
 * extender 是一个函数，其作用是为传入的 OptionsMetadata 添加新字段。
 *
 * 该函数会直接修改传入的 OptionsMetadata，并将其返回。
 */
const newSwitchOptionsMetadataExtender = <S extends string>(
  itemsMetadata: SwitchItemsMetadata<S>,
): (<O extends UnknownOptions, N extends string>(
  options: OptionsMetadata<O>,
  widgetOptions: SwitchWidgetOptions<N, S>,
) => SwitchOptionsMetadata<O, N, S>) => {
  const optionsToExtend = {}
  const entries = Object.entries<SwitchItemMetadata>(itemsMetadata)
  for (const [key, { displayName, defaultValue }] of entries) {
    optionsToExtend[`switch-${key}`] = {
      defaultValue,
      displayName,
      hidden: true,
    }
  }
  return <O extends UnknownOptions, N extends string>(
    options: OptionsMetadata<O>,
    widgetOptions: SwitchWidgetOptions<N, S>,
  ) => {
    optionsToExtend[widgetOptions.name as string] = {
      defaultValue: options,
      displayName: widgetOptions.optionDisplayName,
    }
    Object.assign(options, optionsToExtend)
    return options as SwitchOptionsMetadata<O, N, S>
  }
}

/**
 * 创建默认 Widget
 */
const newWidget = <N extends string, S extends string>(
  options: SwitchWidgetOptions<N, S>,
): Omit<Widget, 'name'> => ({
    component: () => import('./SwitchOptions.vue').then(m => m.default),
    options,
  })

/**
 * 包装后的 entry 函数，函数参数类型中包含 API 注入的 `options`
 */
export type SwitchEntry<
  O extends UnknownOptions,
  N extends string,
  S extends string,
> = ComponentEntry<SwitchOptions<O, N, S>>

/**
 * 类似于 `ComponentMetadata`。
 *
 * 定义该类型时，请使用 {@link defineIncompleteSwitchComponentMetadata}
 *
 * 不同之处在于，该类型在定义时，可在此 API 的相关 `options` 注入前，
 * 让 `entry` 函数获取到完整类型提示。
 */
export type IncompleteSwitchComponentMetadata<
  O extends UnknownOptions,
  N extends string,
  S extends string,
> = {
  [K in keyof ComponentMetadata<O>]: K extends 'entry'
    ? SwitchEntry<O, N, S>
    : ComponentMetadata<O>[K]
}

/**
 * 辅助定义一个 {@link IncompleteSwitchComponentMetadata}，
 * 类似 {@link ./define.ts defineComponentMetadata}。
 */
export const defineIncompleteSwitchComponentMetadata = <
  O extends UnknownOptions,
  N extends string,
  S extends string,
>(
    m: IncompleteSwitchComponentMetadata<O, N, S>,
  ): IncompleteSwitchComponentMetadata<O, N, S> => m

/**
 * 包装原始 entry 函数并返回
 */
const newSwitchEntry = <O extends UnknownOptions, N extends string, S extends string>(
  component: ComponentMetadata<O> | IncompleteSwitchComponentMetadata<O, N, S>,
): SwitchEntry<O, N, S> => (...args) => {
    const result = component.entry(...args)
    const componentOptions = getComponentSettings(component.name).options
    Object.keys(componentOptions).forEach(key => {
      if (key.startsWith('switch-')) {
        addComponentListener(
          `${component.name}.${key}`,
          (value: boolean) => {
            document.body.classList.toggle(`${component.name}-${key}`, value)
          },
          true,
        )
      }
    })
    return result
  }

/**
 * 被包装后的 `ComponentMetadata`
 */
export type SwitchComponentMetadata<
  O extends UnknownOptions,
  N extends string,
  S extends string,
> = ComponentMetadata<SwitchOptions<O, N, S>>

/**
 * 创建一个 builder
 *
 * builder 是一个函数，该函数接收一个 `ComponentMetadata`，为其添加 `options`。
 * 如果组件为未定义 Widget，还会提供一个默认的有相同效果的 Widget。
 *
 * 定义 {@link SwitchMetadata} 请使用 {@link defineSwitchMetadata}
 *
 * 所注入的 options 参考 {@link SwitchOptions}。
 * Widget 的选项见 {@link SwitchWidgetOptions}。
 *
 * 如果想在定义原始 `ComponentMetadata` 时提前获得被注入的 `options` 的类型提示，
 * 可以使用 {@link defineIncompleteSwitchComponentMetadata} 函数辅助定义
 *
 * 为了实现效果，builder 还会对 `entry` 进行包装，
 * 因此包装后的 `entry` 与之前的不再是同一个函数。
 *
 * 该函数会直接修改传入的 `ComponentMetadata` 并将其返回。
 *
 */
export const newSwitchComponentBuilder = <N extends string, S extends string>(
  metadata: SwitchMetadata<N, S>,
): (<O extends UnknownOptions>(
  component: ComponentMetadata<O> | IncompleteSwitchComponentMetadata<O, N, S>,
) => SwitchComponentMetadata<O, N, S>) => {
  const extendOptions = newSwitchOptionsMetadataExtender(metadata.switches)
  // 返回的 builder
  return <O extends UnknownOptions>(
    component: ComponentMetadata<O> | IncompleteSwitchComponentMetadata<O, N, S>,
  ) => {
    const widgetOptions = newSwitchWidgetOptions(
      metadata,
      component.name,
      `${component.displayName}选项`,
    )

    // 若没有 Widget，则注入一个
    if (!component.widget) {
      component.widget = newWidget(widgetOptions)
    }
    // 扩展组件 options
    extendOptions(component.options, widgetOptions)
    // 包装 entry 函数
    component.entry = newSwitchEntry(component)

    return component as SwitchComponentMetadata<O, N, S>
  }
}
