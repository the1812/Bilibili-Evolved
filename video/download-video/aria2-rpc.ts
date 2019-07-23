import { getFriendlyTitle } from '../title'
function getOption() {
  const option = settings.aria2RpcOption
  const host = option.host.match(/^http[s]?:\/\//) ? option.host : 'http://' + option.host
  const methodName = 'aria2.addUri'
  return {
    option,
    host,
    methodName
  }
}
interface RpcParam {
  id: string
  params: any[]
}
async function rpc(getResponse: () => Promise<any>) {
  try {
    let response = await getResponse()
    if (typeof response === 'string') {
      response = JSON.parse(response)
    }
    if (response.error !== undefined) {
      if (response.error.code === 1) {
        logError(`请求遭到拒绝, 请检查您的密钥相关设置.`)
      } else {
        logError(`请求发生错误, code = ${response.error.code}, message = ${response.error.message}`)
      }
      return
    }
    Toast.success(`成功发送了请求, GID = ${response.result}`, 'aria2 RPC', 5000)
  } catch (error) { // Host or port is invalid
    logError(`无法连接到RPC主机, error = ${error}`)
    return
  }
}
async function getRpc(rpcParam: RpcParam) {
  const { option, host, methodName } = getOption()
  await rpc(async () => {
    const base64Params = window.btoa(unescape(encodeURIComponent(JSON.stringify(rpcParam.params))))
    const url = `${host}:${option.port}/jsonrpc?method=${methodName}&id=${rpcParam.id}&params=${base64Params}`
    console.log(`RPC request:`, url)
    return await Ajax.getJson(url)
  })
}
async function postRpc(rpcParam: RpcParam) {
  const { option, host, methodName } = getOption()
  await rpc(async () => {
    const url = `${host}:${option.port}/jsonrpc`
    return await Ajax.postJson(url, {
      method: methodName,
      id: rpcParam.id,
      params: rpcParam.params,
    })
  })
}
export async function sendRpc(params: RpcParam[]) {
  const option = settings.aria2RpcOption
  for (const param of params) {
    if (option.method === 'get') {
      await getRpc(param)
    } else {
      await postRpc(param)
    }
  }
}
export default {
  export: {
    sendRpc,
  },
}