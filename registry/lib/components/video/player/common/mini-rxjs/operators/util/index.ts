import { TeardownLogic } from '../../subject'

export const withTeardownLogic = (
  cb: (
    addTeardownLogic: (teardownLogicList: TeardownLogic | TeardownLogic[] | any) => void,
  ) => void,
) => {
  const teardownLogicSet = new Set<TeardownLogic>()

  cb(teardownLogicList => {
    lodash.castArray(teardownLogicList).forEach(teardownLogic => {
      teardownLogicSet.add(teardownLogic)
    })
  })

  return () => {
    teardownLogicSet.forEach(teardownLogic => {
      teardownLogic()
    })
  }
}
