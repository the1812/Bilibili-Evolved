import { computed, ref } from 'vue'
import { addComponentListener, getComponentSettings } from '@/core/settings'
import { getRandomId } from '@/core/utils'
import { type FeedsFilterOptions, type FeedsFilterPatternConfig } from './options'

export interface SideCardType {
  className: string
  displayName: string
}

type PatternConfigInput = FeedsFilterPatternConfig | string
type OptionKey = 'types' | 'specialTypes'

const normalizePatternConfigs = (patterns: PatternConfigInput[]): FeedsFilterPatternConfig[] =>
  patterns.map(pattern =>
    typeof pattern === 'string'
      ? {
          pattern,
          enabled: true,
          key: getRandomId(),
        }
      : pattern,
  )

const clonePatternConfigs = (patterns: PatternConfigInput[]) =>
  lodash.cloneDeep(normalizePatternConfigs(patterns))

const createSideCards = (): Record<number, SideCardType> => {
  const sideCards: Record<number, SideCardType> = {
    0: {
      className: 'profile',
      displayName: '个人资料',
    },
    2: {
      className: 'notice',
      displayName: '公告栏',
    },
    3: {
      className: 'live',
      displayName: '正在直播',
    },
    5: {
      className: 'most-viewed',
      displayName: '关注栏',
    },
    6: {
      className: 'compose',
      displayName: '发布动态',
    },
    7: {
      className: 'search-trendings',
      displayName: '热搜',
    },
  }
  if (getComponentSettings('extendFeedsLive').enabled) {
    delete sideCards[3]
  }
  return sideCards
}

const sideBlock = 'feeds-filter-side-block-'

const createFeedsFilterState = () => {
  const { options } = getComponentSettings<FeedsFilterOptions>('feedsFilter')

  if (Array.isArray(options.patterns) && options.patterns.every(p => typeof p === 'string')) {
    options.patterns = clonePatternConfigs(options.patterns as PatternConfigInput[])
  }

  const patterns = ref(clonePatternConfigs(options.patterns))
  const savedPatterns = ref(clonePatternConfigs(options.patterns))
  const blockSideCards = ref([...options.sideCards])
  const types = ref([...options.types])
  const specialTypes = ref([...options.specialTypes])
  const sideCards = createSideCards()

  let patternSaveTimer: number | undefined

  const validPatterns = computed(() =>
    lodash
      .uniqBy(savedPatterns.value, pattern => pattern.pattern)
      .filter(pattern => pattern.pattern.trim() !== '' && pattern.enabled),
  )

  const syncPatterns = (nextPatterns: PatternConfigInput[] = options.patterns) => {
    const next = clonePatternConfigs(nextPatterns)
    patterns.value = [...next]
    savedPatterns.value = [...next]
  }

  const syncNumberArray = (target: typeof blockSideCards, nextValues: number[] = []) => {
    target.value = [...nextValues]
  }

  const savePatternConfig = () => {
    savedPatterns.value = clonePatternConfigs(patterns.value)
    if (patternSaveTimer !== undefined) {
      window.clearTimeout(patternSaveTimer)
    }
    patternSaveTimer = window.setTimeout(() => {
      options.patterns = clonePatternConfigs(patterns.value)
    }, 100)
  }

  const deletePattern = (patternConfig: FeedsFilterPatternConfig) => {
    const index = patterns.value.findIndex(pattern => pattern.key === patternConfig.key)
    if (index === -1) {
      return
    }
    patterns.value = [...patterns.value.slice(0, index), ...patterns.value.slice(index + 1)]
    savePatternConfig()
  }

  const addPattern = (pattern: string) => {
    if (pattern.trim() === '') {
      return false
    }
    patterns.value = [
      ...patterns.value,
      {
        pattern: pattern.trim(),
        enabled: true,
        key: getRandomId(),
      },
    ]
    savePatternConfig()
    return true
  }

  const togglePattern = (patternConfig: FeedsFilterPatternConfig) => {
    patternConfig.enabled = !patternConfig.enabled
    savePatternConfig()
  }

  const getTypeState = (typeId: number) => {
    const key: OptionKey = typeId >= 0 ? 'types' : 'specialTypes'
    const valueRef = key === 'types' ? types : specialTypes
    return { key, valueRef }
  }

  const isTypeDisabled = (typeId: number) => getTypeState(typeId).valueRef.value.includes(typeId)

  const setTypeDisabled = (typeId: number, disabled: boolean) => {
    const { key, valueRef } = getTypeState(typeId)
    const index = valueRef.value.indexOf(typeId)
    if (disabled && index === -1) {
      valueRef.value = [...valueRef.value, typeId]
    } else if (!disabled && index !== -1) {
      valueRef.value = [...valueRef.value.slice(0, index), ...valueRef.value.slice(index + 1)]
    } else {
      return
    }
    options[key] = [...valueRef.value]
  }

  const updateBlockSide = () => {
    Object.entries(sideCards).forEach(([id, type]) => {
      const className = sideBlock + type.className
      if (blockSideCards.value.includes(parseInt(id))) {
        document.body.classList.add(className)
      } else {
        document.body.classList.remove(className)
      }
    })
  }

  const toggleBlockSide = (id: number) => {
    const index = blockSideCards.value.indexOf(id)
    if (index === -1) {
      blockSideCards.value = [...blockSideCards.value, id]
    } else {
      blockSideCards.value = [
        ...blockSideCards.value.slice(0, index),
        ...blockSideCards.value.slice(index + 1),
      ]
    }
    options.sideCards = [...blockSideCards.value]
    updateBlockSide()
  }

  addComponentListener<PatternConfigInput[]>('feedsFilter.patterns', value => {
    syncPatterns(value ?? [])
  })
  addComponentListener<number[]>('feedsFilter.sideCards', value => {
    syncNumberArray(blockSideCards, value ?? [])
  })
  addComponentListener<number[]>('feedsFilter.types', value => {
    syncNumberArray(types, value ?? [])
  })
  addComponentListener<number[]>('feedsFilter.specialTypes', value => {
    syncNumberArray(specialTypes, value ?? [])
  })

  return {
    patterns,
    validPatterns,
    blockSideCards,
    sideCards,
    savePatternConfig,
    deletePattern,
    addPattern,
    togglePattern,
    isTypeDisabled,
    setTypeDisabled,
    toggleBlockSide,
    updateBlockSide,
  }
}

let feedsFilterState: ReturnType<typeof createFeedsFilterState> | undefined

export const useFeedsFilterState = () => {
  if (!feedsFilterState) {
    feedsFilterState = createFeedsFilterState()
  }
  return feedsFilterState
}
