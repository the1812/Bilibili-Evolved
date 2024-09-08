/**
 * Switch Options API
 * @module src/components/switch-options
 *
 * 通过包装原始的 {@link ComponentMetadata} 为组件提供一系列开关选项。
 * 如果组件未定义 Widget，还会提供一个默认的有相同效果的 Widget。
 *
 * 包装器使用 {@link newSwitchComponentWrapper} 创建。
 *
 * 可以通过 {@link SwitchOptionsOfMetadata} 或 {@link SwitchOptionsOfSwitchMetadata} 从包装器的设置中，获取被包装后的组件的 options 类型
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
export type SwitchItemMetadata = {
  /** 开关的显示名称 */
  displayName: string
  /** 开关的默认开启状态 */
  defaultValue: boolean
}

/**
 * 用于配置所有开关。
 *
 * 该定义中的每个属性都会被用于生成一个组件 option。
 * 其中 option 的键为属性加上前缀 'switch-'，值为一个 `boolean`，表示开关状态。
 */
export type SwitchItemsMetadata<S extends string> = {
  [key in S]: SwitchItemMetadata
}

/**
 * 可用于单独定义 {@link SwitchItemsMetadata}
 */
export const defineSwitchItemsMetadata = <S extends string>(
  c: SwitchItemsMetadata<S>,
): SwitchItemsMetadata<S> => c

/**
 * 用于配置 API 的行为。可以使用 {@link defineSwitchMetadata} 辅助定义。
 */
export interface SwitchMetadata<N extends string, S extends string> {
  /**
   * 作为键名注入到组件 `options` 中
   *
   * @see {@link SwitchOptions}
   */
  name: N
  /** 每个开关的单独配置。可用 {@link defineSwitchItemsMetadata} 单独定义  */
  switches: SwitchItemsMetadata<S>
  /**
   * 是否单选。值为 `undefined` 时取默认值。
   *
   * @default false
   */
  radio?: undefined | boolean
  /**
   * 控制开关变暗的时机
   *
   * `false`: 始终不变暗
   * `'checked'`: 当开关开启时变暗
   * `'notChecked'`: 当开关关闭时变暗
   *
   * @default 'checked'
   */
  dimAt?: false | 'checked' | 'notChecked'
  /** 配置每个开关的图标 */
  switchProps?: {
    checkedIcon?: string
    notCheckedIcon?: string
    iconPosition?: 'left' | 'right'
  }
}

/**
 * 辅助定义 {@link SwitchMetadata}
 */
export const defineSwitchMetadata = <N extends string, S extends string>(
  c: SwitchMetadata<N, S>,
): SwitchMetadata<N, S> => c

/**
 * 注入组件的 options 的一部分。
 *
 * 接口中的属性值大部分来自于 {@link SwitchMetadata} 中的定义。
 * 用户在 `SwitchMetadata` 中未定义的，为其默认值。
 *
 * @see {@link SwitchOptions}
 */
export interface SwitchMetadataOption<N extends string, S extends string> {
  name: N
  switches: SwitchItemsMetadata<S>
  radio: boolean
  dimAt: false | 'checked' | 'notChecked'
  switchProps?: {
    checkedIcon?: string
    notCheckedIcon?: string
    iconPosition?: 'left' | 'right'
  }
  /** 组件名称 */
  componentName: string
  /** 组件的 Widget 显示名称 */
  optionDisplayName: string
}

/**
 * 创建一个 {@link SwitchMetadataOption}
 */
const newSwitchMetadataOption = <N extends string, S extends string>(
  metadata: SwitchMetadata<N, S>,
  componentName: string,
  optionDisplayName,
) => ({
  ...metadata,
  radio: metadata.radio === undefined ? false : metadata.radio,
  dimAt: metadata.dimAt,
  componentName,
  optionDisplayName,
})

/**
 * 为类型参数 `S` 加上 'switch-' 前缀。
 */
export type SwitchItemNames<S extends string> = `switch-${S}`

/**
 * API 注入的 options 中的一部分
 */
export type SwitchItemOptions<S extends string> = Record<SwitchItemNames<S>, boolean>

/**
 * 包装完成后的组件元数据中的 options 类型
 *
 * 由三部分组成：
 * 1. 组件元数据被包装前的所有 options
 * 2. 一个键值对：键为 {@link SwitchMetadata} 定义时的 `name` 属性，值为 {@link SwitchMetadataOption} 类型
 * 3. 对应 {@link SwitchItemsMetadata} 的定义内容
 * （来自于 `SwitchMetadata` 的 `switches`）。详情见该类型描述
 */
export type SwitchOptions<O extends UnknownOptions, N extends string, S extends string> = O & {
  N: SwitchMetadataOption<N, S>
} & SwitchItemOptions<S>

/**
 * 提取 {@link SwitchOptions} 类型
 */
export type SwitchOptionsOfSwitchMetadata<
  O extends UnknownOptions,
  C extends SwitchMetadata<string, string>,
> = C extends SwitchMetadata<infer N, infer S> ? SwitchOptions<O, N, S> : never

/**
 * 提取 {@link SwitchOptions} 类型
 */
export type SwitchOptionsOfMetadata<
  M extends OptionsMetadata,
  C extends SwitchMetadata<string, string>,
> = SwitchOptionsOfSwitchMetadata<OptionsOfMetadata<M>, C>

/**
 * 在原始的 OptionsMetadata 中添加了该 API 注入的 options 后形成的类型
 */
export type SwitchOptionsMetadata<
  O extends UnknownOptions,
  N extends string,
  S extends string,
> = OptionsMetadata<SwitchOptions<O, N, S>>

/**
 * 向传入的 `options` 注入 API 所需的内容
 *
 * 该函数会返回注入后新 `options` 对象。
 */
type SwitchOptionsMetadataExtender<S extends string> = <O extends UnknownOptions, N extends string>(
  options: OptionsMetadata<O>,
  switchMetadataOption: SwitchMetadataOption<N, S>,
) => SwitchOptionsMetadata<O, N, S>

/**
 * 创建一个 {@link SwitchOptionsMetadataExtender}
 */
const newSwitchOptionsMetadataExtender = <S extends string>(
  itemsMetadata: SwitchItemsMetadata<S>,
): SwitchOptionsMetadataExtender<S> => {
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
    switchMetadataOption: SwitchMetadataOption<N, S>,
  ) => {
    optionsToExtend[switchMetadataOption.name as string] = {
      defaultValue: switchMetadataOption,
      displayName: switchMetadataOption.optionDisplayName,
    }
    return { ...options, ...optionsToExtend } as SwitchOptionsMetadata<O, N, S>
  }
}

/**
 * 创建默认 Widget
 */
const newWidget = <N extends string, S extends string>(
  options: SwitchMetadataOption<N, S>,
): Omit<Widget, 'name'> => ({
  component: () => import('./SwitchOptions.vue').then(m => m.default),
  options,
})

/**
 * 携带 API 注入的 `options` 的 `entry` 函数类型
 */
export type SwitchEntry<
  O extends UnknownOptions,
  N extends string,
  S extends string,
  T = unknown,
> = ComponentEntry<SwitchOptions<O, N, S>, T>

/**
 * 包装原始 `entry` 函数并返回
 */
const newSwitchEntry = <O extends UnknownOptions, N extends string, S extends string>(
  component: ComponentMetadata<O>,
): SwitchEntry<O, N, S> => {
  const originalEntry = component.entry
  return (...args) => {
    const result = originalEntry(...args)
    const componentOptions = getComponentSettings(component.name).options
    Object.keys(componentOptions).forEach(key => {
      if (key.startsWith('switch-')) {
        addComponentListener(
          `${component.name}.${key}`,
          (value: boolean) => {
            const id = `${component.name}-${key}`
            document.body.classList.toggle(id, value)
            document.documentElement.style.setProperty(`--${id}`, value.toString())
          },
          true,
        )
      }
    })
    return result
  }
}

/**
 * 被包装后的 {@link ComponentMetadata}
 */
export type SwitchComponentMetadata<
  O extends UnknownOptions,
  N extends string,
  S extends string,
> = ComponentMetadata<SwitchOptions<O, N, S>>

/**
 * 用于包装组件元数据，根据配置生成一系列开关
 *
 * 修改内容包括
 * - 注入一系列 options，具体细节参考 {@link SwitchOptions}
 * - 若传入组件未定义 Widget，则会注入一个用于控制各开关的 Widget。此 Widget 的功能与注入组件的 options 功能相同
 * - 包装 `entry`，用于实现相关功能
 *
 * 该函数会直接修改传入参数自身，并将其返回。
 *
 * @param component - 被包装的组件元数据
 * @returns 包装完成的组件元数据
 */
export type SwitchComponentWrapper<N extends string, S extends string> = <O extends UnknownOptions>(
  component: ComponentMetadata<O>,
) => SwitchComponentMetadata<O, N, S>

/**
 * 创建一个 {@link SwitchComponentWrapper}
 *
 * @param metadata - 相关配置元数据。可使用 {@link defineSwitchMetadata} 在外部定义
 * @returns 组件包装器
 */
export const wrapSwitchOptions = <N extends string, S extends string>(
  metadata: SwitchMetadata<N, S>,
): SwitchComponentWrapper<N, S> => {
  const extendOptions = newSwitchOptionsMetadataExtender(metadata.switches)
  // 返回的 wrapper
  return <O extends UnknownOptions>(component: ComponentMetadata<O>) => {
    const switchMetadataOption = newSwitchMetadataOption(
      metadata,
      component.name,
      `${component.displayName}选项`,
    )
    // 若没有 Widget，则注入一个
    if (!component.widget) {
      component.widget = newWidget(switchMetadataOption)
    }
    // 扩展组件 options
    component.options = extendOptions(component.options, switchMetadataOption)
    // 包装 entry 函数
    component.entry = newSwitchEntry(component)
    return component as SwitchComponentMetadata<O, N, S>
  }
}
export const newSwitchComponentWrapper = wrapSwitchOptions

export { createSwitchOptions } from './switch-options-old'
