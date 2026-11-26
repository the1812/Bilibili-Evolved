import { getJson, monkey, postJson } from '@/core/ajax'
import { Toast } from '@/core/toast'
import { UserAgent } from '@/core/utils/constants'
import { logError } from '@/core/utils/log'
import { formatVariables } from '@/core/utils/title'
import {
  DownloadVideoAssets,
  DownloadVideoInputItem,
  DownloadVideoOutput,
} from '../../../../components/video/download/types'
import { Aria2RpcProfile } from './rpc-profiles'

interface RpcParam {
  params: (string | string[] | Record<string, string>)[]
  id: string
}
interface RpcResult {
  success: boolean
  param: RpcParam
  message: string
}
const getOption = (profile: Aria2RpcProfile) => {
  const host = profile.host.match(/^http[s]?:\/\//) ? profile.host : `http://${profile.host}`
  return {
    option: profile,
    host,
    methodName: 'aria2.addUri',
  }
}
const handleRpcResponse = async (
  param: RpcParam,
  getResponse: () => Promise<any>,
): Promise<RpcResult> => {
  try {
    let response = await getResponse()
    if (typeof response === 'string') {
      response = JSON.parse(response)
    }
    if (response.error !== undefined) {
      if (response.error.code === 1) {
        return {
          param,
          success: false,
          message: '请求遭到拒绝, 请检查您的密钥相关设置.',
        }
      }
      return {
        param,
        success: false,
        message: `请求发生错误, code = ${response.error.code}, message = ${response.error.message}`,
      }
    }
    return {
      param,
      success: true,
      message: response.result,
    }
  } catch (error) {
    // Host or port is invalid
    return {
      param,
      success: false,
      message: `无法连接到RPC主机, error = ${error.toString()}`,
    }
  }
}
const getRpc = async (profile: Aria2RpcProfile, rpcParam: RpcParam) => {
  const { option, host, methodName } = getOption(profile)
  return handleRpcResponse(rpcParam, async () => {
    const base64Params = window.btoa(unescape(encodeURIComponent(JSON.stringify(rpcParam.params))))
    const url = `${host}:${option.port}/jsonrpc?method=${methodName}&id=${rpcParam.id}&params=${base64Params}`
    console.log(`RPC request: ${url}`)
    if (url.startsWith('http:')) {
      return monkey({
        method: 'GET',
        url,
        responseType: 'json',
      })
    }
    return getJson(url)
  })
}
const postRpc = async (profile: Aria2RpcProfile, rpcParam: RpcParam) => {
  const { option, host, methodName } = getOption(profile)
  return handleRpcResponse(rpcParam, async () => {
    const url = `${host}:${option.port}/jsonrpc`
    const data = {
      method: methodName,
      id: rpcParam.id,
      params: rpcParam.params,
    }
    if (url.startsWith('http:')) {
      return monkey({
        method: 'POST',
        url,
        responseType: 'json',
        data: JSON.stringify(data),
      })
    }
    return postJson(url, data)
  })
}
export const sendRpc = async (profile: Aria2RpcProfile, params: RpcParam[]) => {
  const results: RpcResult[] = []
  for (const param of params) {
    let result: RpcResult
    if (profile.method === 'get') {
      result = await getRpc(profile, param)
    } else {
      result = await postRpc(profile, param)
    }
    results.push(result)
  }
  return results
}
const parseRpcOptions = (option: string): Record<string, string> => {
  if (!option) {
    return {}
  }
  const pairs = option
    .split('\n')
    .map(line => {
      // 实际上就是按第一个 = 号分割出 key / value, 其他后面的 = 还是算进 value 里
      const [key, ...values] = line.trim().split('=')
      return [key.trim(), values.join('=').trim()]
    })
    .filter(it => Boolean(it[1])) // 过滤掉没有 = 的行 (value 为空)
  return Object.fromEntries(pairs)
}
export const aria2Rpc: DownloadVideoOutput = {
  name: 'aria2Rpc',
  displayName: 'aria2 RPC',
  description: '使用 aria2 RPC 功能发送下载请求.',
  runAction: async (
    action,
    instance: Vue & {
      selectedRpcProfile: Aria2RpcProfile
      isPluginDownloadAssets?: boolean
    },
  ) => {
    const { infos, extraOnlineAssets } = action
    const { selectedRpcProfile, isPluginDownloadAssets } = instance
    const { secretKey, dir, other } = selectedRpcProfile
    const rpcOptions = { dir, ...parseRpcOptions(other) }
    const directory = rpcOptions.dir || undefined
    const hasVariables = directory?.includes('[')
    const formatDirectory = (input: DownloadVideoInputItem) => {
      if (!hasVariables) {
        return directory
      }
      const variables = input.variables ?? {
        aid: String(input.aid),
        cid: String(input.cid),
        bvid: input.bvid,
        title: input.title,
      }
      const formatted = directory
        .split(/([\\/])/)
        .map(part => {
          if (!part.includes('[')) {
            return part
          }
          const value = formatVariables(part, variables).replace(/[. ]+$/, '')
          return /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i.test(value) ? `_${value}` : value
        })
        .join('')
      return formatted || undefined
    }
    const videoDirectories = infos.map(info => formatDirectory(info.input))
    const referer = document.URL.replace(window.location.search, '')
    const getAria2Params = (url: string, title: string, path: string | undefined) => {
      const singleInfoParams = []
      if (secretKey) {
        singleInfoParams.push(`token:${secretKey}`)
      }
      singleInfoParams.push([url])
      singleInfoParams.push({
        referer,
        'user-agent': UserAgent,
        out: title,
        ...rpcOptions,
        dir: path,
      })
      const id = encodeURIComponent(title)
      return {
        params: singleInfoParams,
        id,
      }
    }

    const videoParams = infos.flatMap((info, index) =>
      info.titledFragments.map(({ url, title }) =>
        getAria2Params(url, title, videoDirectories[index]),
      ),
    )

    const isAriaAsset = (asset: DownloadVideoAssets) =>
      isPluginDownloadAssets && asset.getUrls !== undefined
    const assetsAriaParams = (
      await Promise.all(
        extraOnlineAssets
          .filter(it => isAriaAsset(it.asset))
          .map(async it => {
            const { asset, instance: assetInstance } = it
            if (hasVariables) {
              const results = await Promise.all(
                infos.map(async (info, index) => {
                  const urls = await asset.getUrls([info], assetInstance)
                  return urls.map(({ name, url }) =>
                    getAria2Params(url, name, videoDirectories[index]),
                  )
                }),
              )
              return results.flat()
            }
            const results = await asset.getUrls(infos, assetInstance)
            return results.map(({ name, url }) => getAria2Params(url, name, directory))
          }),
      )
    ).flat()
    action.extraOnlineAssets = extraOnlineAssets.filter(it => !isAriaAsset(it.asset))

    const totalParams = [...videoParams, ...assetsAriaParams]
    if (totalParams.length === 0) {
      return
    }
    const results = await sendRpc(selectedRpcProfile, totalParams)
    console.table(results)
    if (results.length === 1) {
      const result = results[0]
      if (result.success) {
        Toast.success(`成功发送了请求, GID = ${result.message}`, 'aria2 RPC', 5000)
      } else {
        logError(result.message)
      }
    } else {
      const successCount = results.filter(r => r.success).length
      const failCount = results.length - successCount
      Toast.info(
        `发送了 ${results.length} 个请求, 成功 ${successCount} 个, 失败 ${failCount} 个.`,
        'aria2 RPC',
        5000,
      )
    }
  },
  component: () => import('./RpcConfig.vue').then(m => m.default),
}
