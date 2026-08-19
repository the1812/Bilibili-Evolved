import { computed, ref } from 'vue'
import { addComponentListener, getComponentSettings } from '@/core/settings'
import { getRandomId } from '@/core/utils'
import { type FeedsFilterOptions, type FeedsFilterPatternConfig } from './options'
import { type FeedsFilterShareData, shareCodeVersion } from './share-code'

export interface SideCardType {
  className: string
  displayName: string
}

type PatternConfigInput = FeedsFilterPatternConfig | string
type OptionKey = 'types' | 'specialTypes'
type ArrayOptionKey = OptionKey | 'sideCards'

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

  const validPatterns = computed(() =>
    lodash
      .uniqBy(savedPatterns.value, pattern => pattern.pattern)
      .filter(pattern => pattern.pattern.trim() !== '' && pattern.enabled),
  )

  const syncPatterns = (nextPatterns: PatternConfigInput[] = options.patterns) => {
    patterns.value = clonePatternConfigs(nextPatterns)
    savedPatterns.value = clonePatternConfigs(nextPatterns)
  }

  const syncNumberArray = (target: typeof blockSideCards, nextValues: number[] = []) => {
    target.value = [...nextValues]
  }

  const debounceSavePatterns = lodash.debounce(() => {
    options.patterns = clonePatternConfigs(patterns.value)
  }, 100)

  const savePatternConfig = () => {
    savedPatterns.value = clonePatternConfigs(patterns.value)
    debounceSavePatterns()
  }

  const deletePattern = (patternConfig: FeedsFilterPatternConfig) => {
    patterns.value = patterns.value.filter(pattern => pattern.key !== patternConfig.key)
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
    if (disabled === valueRef.value.includes(typeId)) {
      return
    }
    valueRef.value = disabled
      ? [...valueRef.value, typeId]
      : valueRef.value.filter(id => id !== typeId)
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
    blockSideCards.value = blockSideCards.value.includes(id)
      ? blockSideCards.value.filter(cardId => cardId !== id)
      : [...blockSideCards.value, id]
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

  const toNumberArray = (values: unknown[]) =>
    values.map(value => Number(value)).filter((value): value is number => Number.isFinite(value))

  const getShareData = (): FeedsFilterShareData => ({
    version: shareCodeVersion,
    types: toNumberArray(types.value),
    specialTypes: toNumberArray(specialTypes.value),
    sideCards: toNumberArray(blockSideCards.value),
    patterns: patterns.value
      .filter(({ pattern }) => pattern.trim() !== '')
      .map(({ pattern, enabled }) => ({ pattern, enabled })),
  })

  const applyNumberArray = (key: ArrayOptionKey, values: number[]) => {
    options[key] = [...values]
  }

  const applyShareData = (data: FeedsFilterShareData) => {
    debounceSavePatterns.cancel()
    const nextPatterns = data.patterns
      .map(({ pattern, enabled }) => ({
        pattern: pattern.trim(),
        enabled,
        key: getRandomId(),
      }))
      .filter(({ pattern }) => pattern !== '')
    const validSideCardIds = Object.keys(sideCards).map(Number)
    options.patterns = nextPatterns
    applyNumberArray(
      'types',
      data.types.filter(id => id > 0 && id <= 2048),
    )
    applyNumberArray(
      'specialTypes',
      data.specialTypes.filter(id => id < 0),
    )
    applyNumberArray(
      'sideCards',
      data.sideCards.filter(id => validSideCardIds.includes(id)),
    )
    updateBlockSide()
  }

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
    getShareData,
    applyShareData,
  }
}

let feedsFilterState: ReturnType<typeof createFeedsFilterState> | undefined

export const useFeedsFilterState = () => {
  if (!feedsFilterState) {
    feedsFilterState = createFeedsFilterState()
  }
  return feedsFilterState
}
