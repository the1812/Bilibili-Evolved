import { getJsonWithCredentials } from '@/core/ajax'
import { addComponentListener, getComponentSettings } from '@/core/settings'
import { getUID } from '@/core/utils'

import {
  RBVPEngineContext,
  RBVPNamespaceProvider,
  RBVPResolvedAction,
  RBVPRuntime,
} from '../player/rbvp/types'
import { Options } from './options'

export const componentName = 'quickFavorite'
export const displayName = '快速收藏'
const guard = `${componentName}:execute`

const getOption = () => getComponentSettings<Options>(componentName).options

async function parseFavFolder(rawValue: string) {
  const id = parseInt(rawValue)
  if (isNaN(id) || id < 0 || String(id) !== rawValue) {
    throw new Error(`无效的收藏夹ID: ${rawValue}`)
  }
  const { code, message, data } = await getJsonWithCredentials(
    `https://api.bilibili.com/x/v3/fav/folder/info?media_id=${id}`,
  )
  if (code !== 0 || !data) {
    throw new Error(`获取收藏夹失败: ${message}`)
  }
  if (data.mid !== parseInt(getUID())) {
    throw new Error(`只能设置自己创建的收藏夹：${data.title}, ${id}`)
  }
  return { id: data.id, title: data.title }
}

export const rbvpNamespaceProvider: RBVPNamespaceProvider = {
  displayName,
  primaryName: componentName,
  description: `设置「${displayName}」组件的目标收藏夹。值为收藏夹的ID（可在收藏夹页面的URL中查看）`,
  getTakeoverState: () => getOption().useRbvp,
  setTakeoverState: (value: boolean) => {
    getOption().useRbvp = value
  },
  isComponentEnabled: () => getComponentSettings(componentName).enabled,
  setup: async (runtime: RBVPRuntime) => {
    addComponentListener(`${componentName}.useRbvp`, () => {
      runtime.requestApplyRules()
    })
  },
  validateAction: rawValue => {
    parseFavFolder(rawValue)
  },
  resolveAction: async rawValue => {
    const favFolder = await parseFavFolder(rawValue)
    return {
      namespace: componentName,
      displayValue: favFolder.title,
      value: favFolder.id,
    }
  },
  execute: async (action: RBVPResolvedAction, context: RBVPEngineContext) => {
    if (context.runtime.hasGuard(guard)) {
      return undefined
    }
    context.runtime.enterGuard(guard)
    try {
      getOption().favoriteFolderID = action.value as number
      return `${displayName}: ${action.displayValue}`
    } finally {
      window.setTimeout(() => {
        context.runtime.leaveGuard(guard)
      }, 300)
    }
  },
}
