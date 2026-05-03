import { componentsMap } from '@/components/component'
import { getComponentSettings } from '@/core/settings'
import { MAX_BROWSER_SPEED_VALUE, MIN_BROWSER_SPEED_VALUE } from '../common/speed'
import type { Options } from './component'

const clampSpeed = (speed: number) =>
  lodash.clamp(Number(speed) || 1, MIN_BROWSER_SPEED_VALUE, MAX_BROWSER_SPEED_VALUE)

const getRememberSpeedSettings = () => getComponentSettings<Options>('rememberVideoSpeed')

const getAid = (aid = unsafeWindow.aid) => {
  if (!aid) {
    throw new Error('aid is unknown')
  }
  return aid.toString()
}

const aidComparator = (a: string | number, b: string | number) => a.toString() === b.toString()

export const isRememberSpeedUsingRbvp = () => {
  const settings = getRememberSpeedSettings()
  return settings.enabled && settings.options.useRbvp && Boolean(componentsMap.rbvp)
}

export const readRememberSpeedGlobal = () => {
  const {
    options: { globalSpeed },
  } = getRememberSpeedSettings()
  return clampSpeed(globalSpeed)
}

export const readRememberSpeedLocal = (aid?: string) => {
  const {
    options: { individualRememberRecord },
  } = getRememberSpeedSettings()
  const currentAid = getAid(aid)
  for (const [speed, aids] of Object.entries(individualRememberRecord)) {
    if (aids.some(item => aidComparator(item, currentAid))) {
      return clampSpeed(parseFloat(speed))
    }
  }
  return null
}

export const rememberGlobalSpeed = (speed: number) => {
  const settings = getRememberSpeedSettings()
  settings.options.globalSpeed = clampSpeed(speed)
}

export const forgetLocalSpeed = (aid?: string | string[]) => {
  const settings = getRememberSpeedSettings()
  const aidList = lodash.castArray(lodash.isNil(aid) ? getAid() : aid).map(it => it.toString())
  settings.options.individualRememberRecord = lodash(settings.options.individualRememberRecord)
    .mapValues(aids =>
      lodash(aids).pullAllWith(aidList, aidComparator).uniqWith(aidComparator).value(),
    )
    .pickBy((items: (string | number)[]) => items.length)
    .value()
}

export const rememberLocalSpeed = (speed: number, aid?: string | string[]) => {
  const settings = getRememberSpeedSettings()
  const aidList = lodash.castArray(lodash.isNil(aid) ? getAid() : aid).map(it => it.toString())
  forgetLocalSpeed(aidList)
  const normalizedSpeed = clampSpeed(speed)
  settings.options.individualRememberRecord = {
    ...settings.options.individualRememberRecord,
    [normalizedSpeed]: lodash.unionWith(
      settings.options.individualRememberRecord[normalizedSpeed],
      aidList,
      aidComparator,
    ),
  }
}

export const getRememberSpeedRbvpApi = () => {
  if (!isRememberSpeedUsingRbvp()) {
    return null
  }
  return {
    readGlobalSpeed: readRememberSpeedGlobal,
    readLocalSpeed: readRememberSpeedLocal,
    rememberGlobalSpeed,
    rememberLocalSpeed,
    forgetLocalSpeed,
  }
}
