import { VideoInfo } from '@/components/video/video-info'
import { getJson, monkey, postJson } from '@/core/ajax'
import { Toast } from '@/core/toast'
import { UserAgent } from '@/core/utils/constants'
import { formatFilename } from '@/core/utils/formatters'
import { logError } from '@/core/utils/log'
import {
  DownloadVideoAssets,
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
  message: string | Record<string, string>
}
const getOption = (profile: Aria2RpcProfile) => {
  const host = profile.host.match(/^http[s]?:\/\//) ? profile.host : `http://${profile.host}`
  return {
    option: profile,
    host,
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
const getRpc = async (profile: Aria2RpcProfile, rpcParam: RpcParam, methodName: string) => {
  const { option, host } = getOption(profile)
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
const postRpc = async (profile: Aria2RpcProfile, rpcParam: RpcParam, methodName: string) => {
  const { option, host } = getOption(profile)
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
export const sendRpc = async (
  profile: Aria2RpcProfile,
  params: RpcParam[],
  methodName = 'aria2.addUri',
) => {
  const results: RpcResult[] = []
  for (const param of params) {
    let result: RpcResult
    if (profile.method === 'get') {
      result = await getRpc(profile, param, methodName)
    } else {
      result = await postRpc(profile, param, methodName)
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
    const { secretKey, dir, other, createUpDirectory = false } = selectedRpcProfile
    const rpcOptions = { dir, ...parseRpcOptions(other) }
    const directories = new Map<string, string>()
    if (createUpDirectory) {
      if (!rpcOptions.dir) {
        const [result] = await sendRpc(
          selectedRpcProfile,
          [{ id: 'getGlobalOption', params: secretKey ? [`token:${secretKey}`] : [] }],
          'aria2.getGlobalOption',
        )
        if (typeof result.message === 'string' || !result.message.dir) {
          await logError(`获取 aria2 默认下载路径失败: ${JSON.stringify(result.message)}`)
          return
        }
        rpcOptions.dir = result.message.dir
      }
      const failures: string[] = []
      for (const aid of lodash.uniq(infos.map(info => info.input.aid))) {
        try {
          const { up } = await new VideoInfo(aid).fetchInfo()
          if (!up?.name) {
            failures.push(`av${aid}: 获取 UP 主名称失败`)
            continue
          }
          const upDirectory = formatFilename(up.name, '_').replace(/[. ]+$/, '')
          const safeUpDirectory = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i.test(
            upDirectory,
          )
            ? `_${upDirectory}`
            : upDirectory
          if (!safeUpDirectory) {
            failures.push(`av${aid}: UP 主名称无法用作目录名`)
            continue
          }
          directories.set(aid, `${rpcOptions.dir.replace(/[\\/]+$/, '')}/${safeUpDirectory}`)
        } catch (error) {
          failures.push(`av${aid}: ${String(error)}`)
        }
      }
      if (failures.length > 0) {
        await logError(`已跳过 ${failures.length} 个视频:\n${failures.join('\n')}`)
      }
    }
    const downloadInfos = createUpDirectory
      ? infos.filter(info => directories.has(info.input.aid))
      : infos
    const referer = document.URL.replace(window.location.search, '')
    const getAria2Params = (url: string, title: string, aid: string) => {
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
        dir: createUpDirectory ? directories.get(aid) : rpcOptions.dir || undefined,
      })
      const id = encodeURIComponent(title)
      return {
        params: singleInfoParams,
        id,
      }
    }

    const videoParams = downloadInfos
      .map(info =>
        info.titledFragments.map(fragment => {
          const { url, title } = fragment
          return getAria2Params(url, title, info.input.aid)
        }),
      )
      .flat()

    const isAriaAsset = (asset: DownloadVideoAssets) =>
      isPluginDownloadAssets && asset.getUrls !== undefined
    const assetsAriaParams = (
      await Promise.all(
        extraOnlineAssets
          .filter(it => isAriaAsset(it.asset))
          .map(async it => {
            const { asset, instance: assetInstance } = it
            if (createUpDirectory) {
              const results = await Promise.all(
                downloadInfos.map(async info => {
                  const urls = await asset.getUrls([info], assetInstance)
                  return urls.map(({ name, url }) => getAria2Params(url, name, info.input.aid))
                }),
              )
              return results.flat()
            }
            const results = await asset.getUrls(downloadInfos, assetInstance)
            return results.map(({ name, url }) => getAria2Params(url, name, undefined))
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
        logError(String(result.message))
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
