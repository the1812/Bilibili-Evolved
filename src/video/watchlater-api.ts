export const toggleWatchlater = async (aid: string, add: boolean) => {
  const api = add ? 'https://api.bilibili.com/x/v2/history/toview/add' : 'https://api.bilibili.com/x/v2/history/toview/del'
  const csrf = document.cookie.replace(/(?:(?:^|.*\s*)bili_jct\s*\=\s*([^]*).*$)|^.*$/, '$1')
  const responseText = await Ajax.postTextWithCredentials(api, `aid=${aid}&csrf=${csrf}`)
  const response = JSON.parse(responseText) as {
    code: number
    message: string
  }
  if (response.code !== 0) {
    throw new Error(`稍后再看操作失败: ${response.message}`)
  }
}
export const getWatchlaterList = async (raw = false) => {
  const api = `https://api.bilibili.com/x/v2/history/toview/web`
  const response = await Ajax.getJsonWithCredentials(api)
  if (response.code !== 0) {
    throw new Error(`获取稍后再看列表失败: ${response.message}`)
  }
  if (raw === true) {
    return response.data
  }
  if (!response.data.list) {
    return []
  }
  return response.data.list.map((item: any) => item.aid)
}
export default {
  export: {
    toggleWatchlater,
    getWatchlaterList,
  },
}
